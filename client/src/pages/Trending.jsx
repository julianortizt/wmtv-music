import { useEffect } from "react";
import { useVideos } from "../hooks/useVideos";
import VideoGrid from "../components/VideoGrid";

export default function Trending() {
  const { videos, loading, error, fetchTrending } = useVideos();

  useEffect(() => {
    fetchTrending({ limit: 24 });
  }, [fetchTrending]);

  return (
    <div className="page">
      <h1 className="page-title">
        Tendencias <span className="trending-flame">🔥</span>
      </h1>
      <p className="search-results-count">
        Los videos musicales más vistos de la plataforma.
      </p>
      <VideoGrid videos={videos} loading={loading} error={error} />
    </div>
  );
}
