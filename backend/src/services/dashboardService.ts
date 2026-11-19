
import Organization from "../models/Organization.js";
import User from "../models/User.js";

interface DashboardOverviewInput {
  organizationId: string;
  userId: string;
}

export const getOrganizationDashboardOverview = async ({
  organizationId,
  userId,
}: DashboardOverviewInput) => {
  // Fetch organization and current user
  const [organization, currentUser] = await Promise.all([
    Organization.findById(organizationId).select(
      "name slug status createdAt"
    ),
    User.findOne({
      _id: userId,
      organizationId,
      isActive: true,
    }).select("name email role"),
  ]);

  if (!organization) {
    throw new Error("Organization not found");
  }

  if (!currentUser) {
    throw new Error("User not found or inactive");
  }

  // Count users belonging only to this organization
  const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
    User.countDocuments({ organizationId }),
    User.countDocuments({ organizationId, isActive: true }),
    User.countDocuments({ organizationId, isActive: false }),
  ]);

  return {
    organization: {
      id: organization._id.toString(),
      name: organization.name,
      slug: organization.slug,
      status: organization.status,
      createdAt: organization.createdAt,
    },

    currentUser: {
      id: currentUser._id.toString(),
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
    },

    statistics: {
      totalUsers,
      activeUsers,
      inactiveUsers,
    },
  };
};
