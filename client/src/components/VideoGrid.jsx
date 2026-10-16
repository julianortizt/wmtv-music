import VideoCard from "./VideoCard";

export default function VideoGrid({ videos = [], loading = false, error = null }) {
  if (loading) {
    return (
      <div className="video-grid" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-thumb" />
            <div className="skeleton-info">
              <div className="skeleton-avatar" />
              <div className="skeleton-lines">
                <span className="skeleton-line w90" />
                <span className="skeleton-line w60" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="video-grid-error">{error}</div>;
  }

  if (videos.length === 0) {
    return (
      <div className="video-grid-empty">
        <p>No hay videos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
