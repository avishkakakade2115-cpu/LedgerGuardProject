
import { Request, Response } from "express";
import { loginUser, AuthServiceError } from "../services/authService.js";
import User from "../models/User.js";

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await loginUser({
      email: req.body.email,
      password: req.body.password,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof AuthServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Unable to login at this time",
    });
  }
};

export const getMe = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const user = await User.findOne({
      _id: req.user.userId,
      organizationId: req.user.organizationId,
      isActive: true,
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User account is unavailable",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        organizationId: user.organizationId.toString(),
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile",
    });
  }
};
