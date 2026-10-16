import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useVideos } from "../hooks/useVideos";
import VideoGrid from "../components/VideoGrid";

export default function Home() {
  const { videos, loading, error, fetchFeed } = useVideos();

  useEffect(() => {
    fetchFeed({ limit: 24 });
  }, [fetchFeed]);

  return (
    <div className="page">
      <section className="hero">
        <span className="hero-badge">Plataforma de video musical</span>
        <h1 className="hero-title">
          El escenario digital <span className="grad-text">para músicos</span>
        </h1>
        <p className="hero-sub">
          Publica tus videos, conecta con tu audiencia y haz crecer tu carrera
          con procesamiento automático de thumbnails, métricas en tiempo real y
          una experiencia de reproducción de nivel profesional.
        </p>
        <div className="hero-actions">
          <Link to="/upload" className="btn btn-primary btn-lg">
            Subir mi video
          </Link>
          <Link to="/search" className="btn btn-ghost btn-lg">
            Explorar artistas
          </Link>
        </div>
      </section>

      <h1 className="page-title">Descubre</h1>
      <VideoGrid videos={videos} loading={loading} error={error} />
    </div>
  );
}
