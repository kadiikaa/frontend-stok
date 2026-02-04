import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import "../styles/Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSidebar, setOpenSidebar] = useState(false);
  const [openLaporan, setOpenLaporan] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Master Barang", path: "/barang" },
    { name: "Transaksi", path: "/transaksi" },
  ];

  // Sinkronisasi dropdown Laporan dengan route
  useEffect(() => {
    if (location.pathname.includes("/laporan")) {
      setOpenLaporan(true);
    } else {
      setOpenLaporan(false);
    }
  }, [location]);

  return (
    <>
      {/* Hamburger icon */}
      <div className="hamburger" onClick={() => setOpenSidebar(!openSidebar)}>
        &#9776;
      </div>

      <aside className={`sidebar ${openSidebar ? "open" : ""}`}>
        <h2 className="sidebar-title">📦 Stok App</h2>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
              onClick={() => setOpenSidebar(false)}
            >
              {item.name}
            </NavLink>
          ))}

          {/* Dropdown Laporan */}
          <div
            className={`sidebar-link sidebar-dropdown ${
              location.pathname.includes("/laporan") ? "active" : ""
            }`}
            onClick={() => setOpenLaporan(!openLaporan)}
          >
            <span>📑 Laporan</span>
            <span className="arrow">{openLaporan ? "▾" : "▸"}</span>
          </div>

          {openLaporan && (
            <div className="sidebar-submenu">
              <NavLink
                to="/laporan/harian"
                className={({ isActive }) =>
                  isActive ? "submenu-item active" : "submenu-item"
                }
                onClick={() => setOpenSidebar(false)}
              >
                Laporan Harian
              </NavLink>
              <NavLink
                to="/laporan/bulanan"
                className={({ isActive }) =>
                  isActive ? "submenu-item active" : "submenu-item"
                }
                onClick={() => setOpenSidebar(false)}
              >
                Laporan Bulanan
              </NavLink>
            </div>
          )}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* Overlay mobile */}
      {openSidebar && (
        <div className="overlay" onClick={() => setOpenSidebar(false)}></div>
      )}
    </>
  );
}
