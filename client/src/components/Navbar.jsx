import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo" aria-label="WMTV — inicio">
          <svg
            className="logo-mark"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <rect className="bar b1" x="3" y="8" width="3.5" height="8" rx="1.5" />
            <rect className="bar b2" x="8.5" y="4" width="3.5" height="16" rx="1.5" />
            <rect className="bar b3" x="14" y="7" width="3.5" height="10" rx="1.5" />
            <rect className="bar b4" x="19.5" y="9" width="3.5" height="6" rx="1.5" />
          </svg>
          <span className="logo-word">WMTV</span>
          <span className="logo-tag">music</span>
        </Link>
      </div>

      <form className="navbar-search" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca artistas, canciones o videos..."
          className="navbar-search-input"
        />
        <button type="submit" className="navbar-search-btn">
          Buscar
        </button>
      </form>

      <div className="navbar-right">
        <Link to="/upload" className="navbar-link">
          Subir video
        </Link>
        {user ? (
          <>
            <Link to={`/channel/${user.username}`} className="navbar-user">
              {user.username}
            </Link>
            <button onClick={logout} className="navbar-btn">
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">
              Entrar
            </Link>
            <Link to="/register" className="navbar-btn navbar-btn-primary">
              Registrarse
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
