import { useEffect, useState } from "react";
import "../styles/entryPortal.css";
import Login from "./Login";
import OrganizationRegistration from "./OrganizationRegistration";
import CompanyDashboard from "./CompanyDashboard";
import { getCurrentUser, logoutUser } from "../services/api";

type PortalChoice =
  | "company-existing"
  | "company-new"
  | "employee-existing"
  | "employee-new";

function EntryPortal() {
  const [choice, setChoice] = useState<PortalChoice | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const token = sessionStorage.getItem("ledgerguard_token");

    if (!token) {
      setIsVerifyingAuth(false);
      return;
    }

    const verifyExistingToken = async () => {
      try {
        await getCurrentUser();
        if (isMounted) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        if (isMounted) {
          logoutUser();
          setIsAuthenticated(false);
          setAuthError(
            error instanceof Error
              ? error.message
              : "Session expired. Please log in again."
          );
        }
      } finally {
        if (isMounted) {
          setIsVerifyingAuth(false);
        }
      }
    };

    verifyExistingToken();

    return () => {
      isMounted = false;
    };
  }, []);

  const goBack = () => {
    setChoice(null);
    setAuthError("");
  };

  if (isVerifyingAuth) {
    return (
      <div className="entry-page">
        <div
          className="entry-container"
          style={{ textAlign: "center", padding: "80px 20px" }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#173b72",
              marginBottom: "12px",
            }}
          >
            LedgerGuard
          </div>
          <p style={{ color: "#7b8494", fontSize: "16px" }}>
            Verifying your session...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <CompanyDashboard
        onLogout={() => {
          logoutUser();
          setIsAuthenticated(false);
          setChoice(null);
        }}
      />
    );
  }

  if (
    choice === "company-existing" ||
    choice === "employee-existing"
  ) {
    return (
      <Login
        onBack={goBack}
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          setAuthError("");
        }}
        onNavigateToRegister={() => setChoice("company-new")}
      />
    );
  }

  if (choice === "company-new") {
    return (
      <div className="entry-page">
        <div className="entry-container">
          <OrganizationRegistration
            onBack={goBack}
            onSuccess={() => setChoice("company-existing")}
          />
          <footer className="entry-footer">
            © 2026 LedgerGuard. All rights reserved.
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="entry-page">
      <div className="entry-container">
        <header className="entry-header">
          <h1>LedgerGuard</h1>
          <p>Secure Organization Management Platform</p>
        </header>

        {authError && (
          <div
            style={{
              maxWidth: "500px",
              margin: "0 auto 20px",
              padding: "12px 16px",
              background: "#fef2f2",
              border: "1px solid #f87171",
              borderRadius: "8px",
              color: "#b91c1c",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            {authError}
          </div>
        )}

        {!choice ? (
          <>
            <div className="entry-heading">
              <h2>Welcome to LedgerGuard</h2>
              <p>Choose how you want to continue.</p>
            </div>

            <div className="entry-options">
              <div className="entry-card">
                <div className="entry-icon">🏢</div>
                <h3>Company</h3>
                <p>Register a new company or access an existing company.</p>
                <button
                  className="entry-button"
                  onClick={() => setChoice("company-existing")}
                >
                  Existing Company
                </button>
                <button
                  className="entry-button secondary"
                  onClick={() => setChoice("company-new")}
                >
                  Register New Company
                </button>
              </div>

              <div className="entry-card">
                <div className="entry-icon">👥</div>
                <h3>Employee / Admin</h3>
                <p>Access your company account or activate a new account.</p>
                <button
                  className="entry-button"
                  onClick={() => setChoice("employee-existing")}
                >
                  Existing Account
                </button>
                <button
                  className="entry-button secondary"
                  onClick={() => setChoice("employee-new")}
                >
                  New Account
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="entry-next-screen">
            <button className="back-button" onClick={goBack}>
              ← Back
            </button>
            <h2>New Employee / Admin Account</h2>
            <p>
              New accounts are created by your organization's
              authorized administrator.
            </p>
            <div className="info-message">
              Please contact your Organization Admin
              and request an account invitation.
            </div>
          </div>
        )}

        <footer className="entry-footer">
          © 2026 LedgerGuard. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default EntryPortal;
