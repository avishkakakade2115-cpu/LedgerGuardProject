import { useState } from "react";
import "../styles/entryPortal.css";
import Login from "./Login";
import OrganizationRegistration from "./OrganizationRegistration";
import CompanyDashboard from "./CompanyDashboard";

type PortalChoice =
  | "company-existing"
  | "company-new"
  | "employee-existing"
  | "employee-new";

function EntryPortal() {
  const [choice, setChoice] = useState<PortalChoice | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(sessionStorage.getItem("ledgerguard_token"))
  );

  const goBack = () => setChoice(null);

  if (isAuthenticated) {
  return (
    <CompanyDashboard
      onLogout={() => setIsAuthenticated(false)}
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
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  if (choice === "company-new") {
    return (
      <div className="entry-page">
        <div className="entry-container">
          <button className="back-button" onClick={goBack}>
            ← Back to Portal
          </button>
          <OrganizationRegistration />
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
