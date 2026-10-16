import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useVideos } from "../hooks/useVideos";
import VideoGrid from "../components/VideoGrid";

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const { videos, loading, error, search } = useVideos();
  const [input, setInput] = useState(q);

  useEffect(() => {
    setInput(q);
    if (q) {
      search(q, { limit: 24 });
    }
  }, [q, search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    search(input.trim(), { limit: 24 });
  };

  return (
    <div className="page">
      <h1 className="page-title">Buscar</h1>

      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Busca artistas, canciones o videos..."
          className="search-input"
        />
        <button type="submit" className="search-btn">
          Buscar
        </button>
      </form>

      {q && <p className="search-results-count">Resultados para "{q}"</p>}

      <VideoGrid videos={videos} loading={loading} error={error} />
    </div>
  );
}
