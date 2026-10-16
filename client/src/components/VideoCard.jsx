import { Link } from "react-router-dom";
import { formatViews } from "../utils/format";

export default function VideoCard({ video }) {
  if (!video) return null;

  const duration = video.duration
    ? new Date(video.duration * 1000).toISOString().substr(11, 8)
    : null;

  const views = typeof video.views === "number" ? video.views : 0;
  const processing = video.status && video.status !== "published";

  return (
    <Link to={`/watch/${video.id}`} className="video-card">
      <div className="video-card-thumb">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} loading="lazy" />
        ) : (
          <div className="video-card-placeholder">🎬</div>
        )}
        {duration && <span className="video-card-duration">{duration}</span>}
        {processing && (
          <span className="video-card-status">⏳ Procesando</span>
        )}
      </div>

      <div className="video-card-info">
        <div className="video-card-avatar">
          {(video.uploader?.username || "U").charAt(0).toUpperCase()}
        </div>
        <div className="video-card-meta">
          <h3 className="video-card-title">{video.title}</h3>
          <p className="video-card-channel">{video.uploader?.username}</p>
          <p className="video-card-stats">
            {formatViews(views)} visualizaciones
            {video.createdAt && (
              <> &middot; {new Date(video.createdAt).toLocaleDateString()}</>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}
