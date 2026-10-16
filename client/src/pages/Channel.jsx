import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useVideos } from "../hooks/useVideos";
import VideoGrid from "../components/VideoGrid";

export default function Channel() {
  const { username } = useParams();
  const { videos, loading, error, findByUser } = useVideos();

  useEffect(() => {
    if (username) {
      findByUser(username, { limit: 24 });
    }
  }, [username, findByUser]);

  return (
    <div className="page">
      <div className="channel-header">
        <div className="channel-avatar">
          {(username || "U").charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="page-title">{username}</h1>
          <p className="channel-subtitle">Canal de {username}</p>
        </div>
      </div>

      <VideoGrid videos={videos} loading={loading} error={error} />
    </div>
  );
}
