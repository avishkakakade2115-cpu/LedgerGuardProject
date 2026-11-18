
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import Topbar from "../components/Topbar";
import "../styles/dashboard.css";

const stats = [
  {
    label: "Total Organizations",
    value: "248",
    detail: "Across all plans",
    icon: "▣",
    accent: "blue",
  },
  {
    label: "Total Users",
    value: "12,840",
    detail: "Platform-wide users",
    icon: "♙",
    accent: "green",
  },
  {
    label: "Active Organizations",
    value: "231",
    detail: "Currently operating",
    icon: "✓",
    accent: "blue",
  },
  {
    label: "Suspended Organizations",
    value: "17",
    detail: "Require attention",
    icon: "!",
    accent: "amber",
  },
] as const;

const recentActivity = [
  {
    title: "Northstar Capital completed onboarding",
    category: "Organization",
    time: "12 minutes ago",
    icon: "＋",
  },
  {
    title: "An administrator invited 8 new users",
    category: "User management",
    time: "1 hour ago",
    icon: "♙",
  },
  {
    title: "BluePeak Finance was suspended",
    category: "Organization status",
    time: "3 hours ago",
    icon: "!",
  },
];

const organizations = [
  {
    name: "Northstar Capital",
    plan: "Enterprise",
    users: "1,248",
    status: "Active",
  },
  {
    name: "Meridian Financial",
    plan: "Growth",
    users: "684",
    status: "Active",
  },
  {
    name: "BluePeak Finance",
    plan: "Starter",
    users: "92",
    status: "Suspended",
  },
  {
    name: "Harborstone Group",
    plan: "Enterprise",
    users: "2,106",
    status: "Active",
  },
];

const CompanyDashboard = () => {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard");

  useEffect(() => {
    if (!navigationOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNavigationOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigationOpen]);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="dashboard-layout">

      {/* Sidebar */}
      <div
        id="primary-sidebar"
        className={`dashboard-sidebar${
          navigationOpen ? " is-open" : ""
        }`}
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
        />
      </div>

      {/* Mobile backdrop */}
      {navigationOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setNavigationOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="dashboard-content">

        <Topbar
          activeSection={activeSection}
          navigationOpen={navigationOpen}
          onMenuToggle={() =>
            setNavigationOpen((isOpen) => !isOpen)
          }
        />

        <section className="dashboard-main">

          {activeSection === "Dashboard" ? (

            <>
              {/* Dashboard Welcome */}
              <div className="dashboard-welcome">
                <div>
                  <p className="dashboard-eyebrow">
                    Platform overview
                  </p>

                  <h1>Welcome back, Super Admin</h1>

                  <p>
                    Monitor organizations, users, and platform
                    activity from one place.
                  </p>
                </div>

                <span className="sample-data-badge">
                  Sample data
                </span>
              </div>

              {/* Statistics */}
              <div className="dashboard-stat-grid">
                {stats.map((stat) => (
                  <StatCard
                    key={stat.label}
                    {...stat}
                  />
                ))}
              </div>

              {/* Dashboard Panels */}
              <div className="dashboard-panels">

                {/* Recent Activity */}
                <section className="dashboard-panel">
                  <h2>Recent Activity</h2>

                  <div className="activity-list">
                    {recentActivity.map((activity) => (
                      <div
                        className="activity-item"
                        key={activity.title}
                      >
                        <span className="activity-icon">
                          {activity.icon}
                        </span>

                        <div className="activity-info">
                          <h3>{activity.title}</h3>
                          <p>{activity.category}</p>
                        </div>

                        <span className="activity-time">
                          {activity.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Organization Overview */}
                <section className="dashboard-panel organization-panel">
                  <h2>Organization Overview</h2>

                  <div className="organization-table-wrapper">
                    <table className="organization-table">
                      <thead>
                        <tr>
                          <th>Organization</th>
                          <th>Plan</th>
                          <th>Users</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {organizations.map((organization) => (
                          <tr key={organization.name}>
                            <td>{organization.name}</td>
                            <td>{organization.plan}</td>
                            <td>{organization.users}</td>
                            <td>
                              <span
                                className={`status-pill ${
                                  organization.status.toLowerCase()
                                }`}
                              >
                                {organization.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

              </div>
            </>

          ) : (

            /* Other Navigation Sections */
            <div className="dashboard-panel">
              <p className="dashboard-eyebrow">
                Platform management
              </p>

              <h2>{activeSection}</h2>

              <p>
                The {activeSection} section is ready for its
                dedicated interface.
              </p>

              <p>
                Its UI and functionality will be developed
                separately.
              </p>
            </div>

          )}

        </section>
      </main>
    </div>
  );
};

export default CompanyDashboard;

