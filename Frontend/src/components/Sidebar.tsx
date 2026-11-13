
import { useState } from "react";
import "../styles/dashboard.css";

const menuItems = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Organizations", icon: "▣" },
  { name: "All Users", icon: "♙" },
  { name: "Tenants", icon: "▤" },
  { name: "Analytics", icon: "▥" },
  { name: "Activity Logs", icon: "◷" },
  { name: "Reports", icon: "▧" },
];

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("Dashboard");

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">L</div>
        <div>
          <h2>LedgerGuard</h2>
          <span>Platform Console</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-section">
        <p className="sidebar-heading">MAIN MENU</p>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`sidebar-link ${
                activeItem === item.name ? "active" : ""
              }`}
              onClick={() => setActiveItem(item.name)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Menu */}
      <div className="sidebar-bottom">
        <button
          className={`sidebar-link ${
            activeItem === "Settings" ? "active" : ""
          }`}
          onClick={() => setActiveItem("Settings")}
        >
          <span className="sidebar-icon">⚙</span>
          <span>Settings</span>
        </button>

        <div className="sidebar-profile">
          <div className="profile-avatar">A</div>
          <div className="profile-info">
            <h4>Super Admin</h4>
            <span>Platform Administrator</span>
          </div>
          <span className="profile-menu">⋮</span>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
