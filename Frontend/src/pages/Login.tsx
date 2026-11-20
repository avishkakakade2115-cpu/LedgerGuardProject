
import { useState, type FormEvent } from "react";
import { apiRequest } from "../services/api";
import "../styles/login.css";

type LoginProps = {
  onBack: () => void;
  onLogin: () => void;
};

type LoginResponse = {
  data: {
    accessToken: string;
  };
};

const Login = ({ onBack, onLogin }: LoginProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      sessionStorage.setItem("accessToken", response.data.accessToken);
      onLogin();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign in"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT SIDE - LOGIN FORM */}
      <div className="login-left">
        <div className="login-container">

          <button
            type="button"
            className="login-back-button"
            onClick={onBack}
          >
            ← Back to Portal
          </button>

          <div className="login-logo">
            <div className="logo-symbol">L</div>
            <h2>LedgerGuard</h2>
          </div>

          <div className="login-header">
            <h1>Welcome Back!</h1>
            <p>Enter your credentials to access your account.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="show-password"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label>
                <input type="checkbox" />
                Remember me
              </label>

              <a href="/forgot-password">Forgot Password?</a>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
            {errorMessage && (
              <p className="login-error" role="alert">
                {errorMessage}
              </p>
            )}
          </form>

          <div className="register-link">
            Don't have an account?
            <a href="/register"> Create Account</a>
          </div>

          <div className="login-copyright">
            © 2026 LedgerGuard. All rights reserved.
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - BRANDING */}
      <div className="login-right">
        <div className="branding-content">

          <div className="branding-symbol">◆</div>

          <h1>
            Your Business.
            <br />
            Your Finances.
            <br />
            <span>Your Control.</span>
          </h1>

          <p>
            Simplify financial management, monitor transactions,
            and keep your organization secure with LedgerGuard.
          </p>

          <div className="branding-features">
            <p>✓ Secure Financial Management</p>
            <p>✓ Real-time Financial Insights</p>
            <p>✓ Complete Business Visibility</p>
          </div>
        </div>

        <div className="branding-footer">
          SMARTER FINANCES. STRONGER CONTROL.
        </div>
      </div>

    </div>
  );
};

export default Login;
