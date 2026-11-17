
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
  { name: "Northstar Capital", plan: "Enterprise", users: "1,248", status: "Active" },
  { name: "Meridian Financial", plan: "Growth", users: "684", status: "Active" },
  { name: "BluePeak Finance", plan: "Starter", users: "92", status: "Suspended" },
  { name: "Harborstone Group", plan: "Enterprise", users: "2,106", status: "Active" },
];

const CompanyDashboard = () => {
  const [navigationOpen, setNavigationOpen] = useState(false);

  useEffect(() => {
    if (!navigationOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNavigationOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigationOpen]);

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
        <Sidebar />
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
          navigationOpen={navigationOpen}
          onMenuToggle={() => setNavigationOpen((isOpen) => !isOpen)}
        />

        <section className="dashboard-main" aria-labelledby="dashboard-welcome">
          <div className="dashboard-welcome">
            <div>
              <p className="dashboard-eyebrow">Platform overview</p>
              <h1 id="dashboard-welcome">Welcome back, Super Admin</h1>
              <p className="dashboard-description">
                Monitor organizations, users, and platform activity from one
                place.
              </p>
            </div>
            <span className="sample-data-badge">Sample data</span>
          </div>

          <div className="dashboard-stat-grid">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="dashboard-panels">
            <section className="dashboard-panel" aria-labelledby="activity-title">
              <div className="dashboard-panel-heading">
                <h2 id="activity-title">Recent Activity</h2>
                <span>Latest platform updates</span>
              </div>
              <ul className="activity-list">
                {recentActivity.map((activity) => (
                  <li className="activity-item" key={activity.title}>
                    <span className="activity-icon" aria-hidden="true">
                      {activity.icon}
                    </span>
                    <div className="activity-copy">
                      <p>{activity.title}</p>
                      <span>{activity.category}</span>
                    </div>
                    <time>{activity.time}</time>
                  </li>
                ))}
              </ul>
            </section>

            <section
              className="dashboard-panel organization-panel"
              aria-labelledby="organizations-title"
            >
              <div className="dashboard-panel-heading">
                <h2 id="organizations-title">Organization Overview</h2>
                <span>Recently updated</span>
              </div>
              <div className="organization-table-scroll">
                <table className="organization-table">
                  <thead>
                    <tr>
                      <th scope="col">Organization</th>
                      <th scope="col">Plan</th>
                      <th scope="col">Users</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.map((organization) => (
                      <tr key={organization.name}>
                        <th scope="row">{organization.name}</th>
                        <td>{organization.plan}</td>
                        <td>{organization.users}</td>
                        <td>
                          <span
                            className={`organization-status status-${organization.status.toLowerCase()}`}
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
        </section>
      </main>
    </div>
  );
};

export default CompanyDashboard;
