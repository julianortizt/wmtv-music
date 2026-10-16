import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Inicio", icon: "🏠" },
  { to: "/search", label: "Explorar", icon: "🔍" },
  { to: "/upload", label: "Subir video", icon: "📤" },
  { to: "/trending", label: "Tendencias", icon: "🔥" },
  { to: "/subscriptions", label: "Suscripciones", icon: "📺" },
  { to: "/history", label: "Historial", icon: "🕘" },
  { to: "/liked", label: "Videos que me gustan", icon: "👍" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-section">
        <h3 className="sidebar-heading">Suscripciones</h3>
        <p className="sidebar-empty">Inicia sesión para ver tus suscripciones</p>
      </div>

      <div className="sidebar-footer">
        <p><strong>WMTV</strong> · El escenario digital para músicos</p>
        <p>&copy; 2026 WMTV Music. Todos los derechos reservados.</p>
      </div>
    </aside>
  );
}
