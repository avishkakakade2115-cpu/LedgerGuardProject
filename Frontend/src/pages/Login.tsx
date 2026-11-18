
import { useState } from "react";
import "../styles/login.css";

type LoginProps = {
  onBack: () => void;
};

const Login = ({ onBack }: LoginProps) => {
  const [showPassword, setShowPassword] = useState(false);

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

          <form className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
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

            <button type="submit" className="login-submit">
              Sign In
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
