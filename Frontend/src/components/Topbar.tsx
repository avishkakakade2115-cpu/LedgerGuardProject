
import { useEffect, useRef, useState } from "react";

type OpenDropdown = "notifications" | "profile" | null;

type TopbarProps = {
  activeSection: string;
  navigationOpen: boolean;
  onMenuToggle: () => void;
  userName: string;
  userRole: string;
  onLogout: () => void;
};

const Topbar = ({
  activeSection,
  navigationOpen,
  onMenuToggle,
  userName,
  userRole,
  onLogout,
}: TopbarProps) => {
  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const topbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!openDropdown) return;

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

  const toggleDropdown = (
    dropdown: Exclude<OpenDropdown, null>
  ) => {
    setOpenDropdown((current) =>
      current === dropdown ? null : dropdown
    );
  };

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
          <h1>{activeSection}</h1>
          <nav className="topbar-breadcrumb" aria-label="Breadcrumb">
            <span>Home</span>
            <span className="breadcrumb-separator" aria-hidden="true">/</span>
            <span aria-current="page">{activeSection}</span>
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
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
              <path d="M10 21h4" />
            </svg>
          </button>

          {openDropdown === "notifications" && (
            <section
              id="topbar-notifications"
              className="topbar-dropdown notification-dropdown"
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
          >
            <span className="admin-avatar">{initials || "U"}</span>
            <span className="admin-details">
              <span className="admin-name">{userName}</span>
              <span className="admin-role">{userRole}</span>
            </span>
            <span className="dropdown-icon">⌄</span>
          </button>

          {openDropdown === "profile" && (
            <div className="topbar-dropdown profile-dropdown">
              <button type="button" onClick={() => setOpenDropdown(null)}>
                Profile
              </button>
              <button type="button" onClick={() => setOpenDropdown(null)}>
                Account Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenDropdown(null);
                  onLogout();
                }}
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


