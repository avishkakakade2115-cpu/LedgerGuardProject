

import "../styles/dashboard.css";

type SidebarProps = {
  activeItem: string;
  onNavigate: (item: string) => void;
  userName?: string;
  userRole?: string;
};

const menuItems = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Organizations", icon: "▣" },
  { name: "All Users", icon: "♙" },
  { name: "Tenants", icon: "▤" },
  { name: "Analytics", icon: "▥" },
  { name: "Activity Logs", icon: "◷" },
  { name: "Reports", icon: "▧" },
];

const Sidebar = ({
  activeItem,
  onNavigate,
  userName,
  userRole,
}: SidebarProps) => {
  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">L</div>
        <div>
          <h2>LedgerGuard</h2>
          <span>Organization Dashboard</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-section">
        <p className="sidebar-heading">MAIN MENU</p>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`sidebar-link ${
                activeItem === item.name ? "active" : ""
              }`}
              aria-current={
                activeItem === item.name ? "page" : undefined
              }
              onClick={() => onNavigate(item.name)}
            >
              <span className="sidebar-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Menu */}
      <div className="sidebar-bottom">
        <button
          type="button"
          className={`sidebar-link ${
            activeItem === "Settings" ? "active" : ""
          }`}
          aria-current={
            activeItem === "Settings" ? "page" : undefined
          }
          onClick={() => onNavigate("Settings")}
        >
          <span className="sidebar-icon" aria-hidden="true">⚙</span>
          <span>Settings</span>
        </button>

        <div className="sidebar-profile">
          <div className="profile-avatar">
            {(userName ? userName[0] : "O")?.toUpperCase()}
          </div>
          <div className="profile-info">
            <h4>{userName || "Organization User"}</h4>
            <span style={{ textTransform: "capitalize" }}>
              {userRole ? `${userRole} Access` : "Active Member"}
            </span>
          </div>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
