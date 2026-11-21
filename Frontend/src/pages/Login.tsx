
import { useState, type FormEvent } from "react";
import { loginUser } from "../services/api";
import "../styles/login.css";

type LoginProps = {
  onBack: () => void;
  onLoginSuccess?: () => void;
};

const Login = ({ onBack, onLoginSuccess }: LoginProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      await loginUser(email.trim(), password);
      setSuccessMessage("Login successful!");
      onLoginSuccess?.();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
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
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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

            {errorMessage && (
              <p role="alert" className="login-error">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p role="status" className="login-success">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
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
