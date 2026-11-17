import { useEffect, useRef, useState } from "react";

type OpenDropdown = "notifications" | "profile" | null;

type TopbarProps = {
  navigationOpen: boolean;
  onMenuToggle: () => void;
};

const Topbar = ({ navigationOpen, onMenuToggle }: TopbarProps) => {
  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const topbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!openDropdown) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !topbarRef.current?.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openDropdown]);

  const toggleDropdown = (dropdown: Exclude<OpenDropdown, null>) => {
    setOpenDropdown((currentDropdown) =>
      currentDropdown === dropdown ? null : dropdown,
    );
  };

  return (
    <header className="topbar" ref={topbarRef}>
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-menu-btn"
          onClick={onMenuToggle}
          aria-label={navigationOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={navigationOpen}
          aria-controls="primary-sidebar"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1>Dashboard</h1>
          <nav className="topbar-breadcrumb" aria-label="Breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-separator" aria-hidden="true">
              /
            </span>
            <span aria-current="page">Dashboard</span>
          </nav>
        </div>
      </div>

      <div className="topbar-right">
        <label className="topbar-search">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="topbar-search-icon"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            type="search"
            placeholder="Search anything..."
            aria-label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <div className="topbar-dropdown-wrapper">
          <button
            type="button"
            className="topbar-icon-btn"
            onClick={() => toggleDropdown("notifications")}
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={openDropdown === "notifications"}
            aria-controls="topbar-notifications"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="topbar-bell-icon"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
            <span className="notification-dot" aria-hidden="true" />
          </button>

          {openDropdown === "notifications" && (
            <section
              id="topbar-notifications"
              className="topbar-dropdown notification-dropdown"
              aria-label="Notifications"
            >
              <h2>Notifications</h2>
              <p>No new notifications</p>
            </section>
          )}
        </div>

        <div className="topbar-dropdown-wrapper">
          <button
            type="button"
            className="admin-profile"
            onClick={() => toggleDropdown("profile")}
            aria-haspopup="true"
            aria-expanded={openDropdown === "profile"}
            aria-controls="topbar-profile-menu"
          >
            <span className="admin-avatar" aria-hidden="true">
              A
            </span>
            <span className="admin-details">
              <span className="admin-name">Super Admin</span>
              <span className="admin-role">Platform Administrator</span>
            </span>
            <span className="dropdown-icon" aria-hidden="true">
              ⌄
            </span>
          </button>

          {openDropdown === "profile" && (
            <div
              id="topbar-profile-menu"
              className="topbar-dropdown profile-dropdown"
              role="menu"
              aria-label="Admin account"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => setOpenDropdown(null)}
              >
                Profile
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => setOpenDropdown(null)}
              >
                Account Settings
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => setOpenDropdown(null)}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
