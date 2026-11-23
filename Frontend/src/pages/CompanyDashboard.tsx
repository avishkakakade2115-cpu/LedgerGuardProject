
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import Topbar from "../components/Topbar";
import {
  getDashboardOverview,
  logoutUser,
  type DashboardResponse,
} from "../services/api";
import "../styles/dashboard.css";

type CompanyDashboardProps = {
  onLogout: () => void;
};

const CompanyDashboard = ({ onLogout }: CompanyDashboardProps) => {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const response = await getDashboardOverview();

        if (isMounted) {
          setDashboard(response.data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load dashboard."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!navigationOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNavigationOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigationOpen]);

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section);
  };

  if (loading) {
    return <div className="dashboard-layout"><main className="dashboard-content"><p>Loading your organization dashboard...</p></main></div>;
  }

  if (errorMessage || !dashboard) {
    return (
      <div className="dashboard-layout">
        <main className="dashboard-content">
          <section className="dashboard-panel">
            <h2>Unable to load dashboard</h2>
            <p>{errorMessage || "Dashboard data is unavailable."}</p>
            <button type="button" onClick={handleLogout}>
              Return to Login
            </button>
          </section>
        </main>
      </div>
    );
  }

  const { organization, currentUser, statistics } = dashboard;

  const stats = [
    {
      label: "Total Users",
      value: String(statistics.totalUsers),
      detail: "Organization users",
      icon: "♙",
      accent: "blue" as const,
    },
    {
      label: "Active Users",
      value: String(statistics.activeUsers),
      detail: "Currently active",
      icon: "✓",
      accent: "green" as const,
    },
    {
      label: "Inactive Users",
      value: String(statistics.inactiveUsers),
      detail: "Currently inactive",
      icon: "!",
      accent: "amber" as const,
    },
  ];

  return (
    <div className="dashboard-layout">
      <div
        id="primary-sidebar"
        className={`dashboard-sidebar${navigationOpen ? " is-open" : ""}`}
        onClick={(event) => {
          if (
            event.target instanceof Element &&
            event.target.closest(".sidebar-link")
          ) {
            setNavigationOpen(false);
          }
        }}
      >
        <Sidebar
          activeItem={activeSection}
          onNavigate={handleNavigate}
          userName={currentUser.name}
          userRole={currentUser.role}
        />
      </div>

      {navigationOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setNavigationOpen(false)}
        />
      )}

      <main className="dashboard-content">
        <Topbar
          activeSection={activeSection}
          navigationOpen={navigationOpen}
          onMenuToggle={() => setNavigationOpen((open) => !open)}
          userName={currentUser.name}
          userRole={currentUser.role}
          onLogout={handleLogout}
        />

        <section className="dashboard-main">
          {activeSection === "Dashboard" ? (
            <>
              <div className="dashboard-welcome">
                <div>
                  <p className="dashboard-eyebrow">
                    Organization overview
                  </p>
                  <h1>Welcome back, {currentUser.name}</h1>
                  <p>
                    Here's an overview of {organization.name}.
                  </p>
                </div>

                <span className="sample-data-badge">
                  {organization.status}
                </span>
              </div>

              <div className="dashboard-stat-grid">
                {stats.map((stat) => (
                  <StatCard key={stat.label} {...stat} />
                ))}
              </div>

              <div className="dashboard-panels">
                <section className="dashboard-panel">
                  <h2>Organization Details</h2>
                  <p><strong>Name:</strong> {organization.name}</p>
                  <p><strong>Official Email:</strong> {organization.companyEmail || "Not specified"}</p>
                  <p><strong>Domain:</strong> {organization.companyDomain || "Not specified"}</p>
                  <p><strong>Contact:</strong> {organization.contactNumber || "Not specified"}</p>
                  <p><strong>Size:</strong> {organization.companySize ? `${organization.companySize} employees` : "Not specified"}</p>
                  <p><strong>Address:</strong> {organization.companyAddress || "Not specified"}</p>
                  <p><strong>Slug:</strong> {organization.slug}</p>
                  <p><strong>Status:</strong> {organization.status}</p>
                </section>

                <section className="dashboard-panel">
                  <h2>Account Details</h2>
                  <p><strong>Name:</strong> {currentUser.name}</p>
                  <p><strong>Email:</strong> {currentUser.email}</p>
                  <p><strong>Role:</strong> {currentUser.role}</p>
                </section>
              </div>
            </>
          ) : (
            <div className="dashboard-panel">
              <p className="dashboard-eyebrow">Organization management</p>
              <h2>{activeSection}</h2>
              <p>
                The {activeSection} interface will be developed separately.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CompanyDashboard;


