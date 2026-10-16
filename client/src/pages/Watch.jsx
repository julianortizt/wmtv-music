import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import VideoPlayer from "../components/VideoPlayer";
import { formatViews } from "../utils/format";

const fmtDuration = (s) => {
  if (!s || isNaN(s)) return null;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function Watch() {
  const { id } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [related, setRelated] = useState([]);

  const fetchVideo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/videos/${id}`);
      setVideo(res.data.data);

      const likesRes = await api.get(`/videos/${id}/likes`);
      setLikes(likesRes.data.likes);

      const commentsRes = await api.get(`/comments/video/${id}`);
      setComments(commentsRes.data.data);

      api.post(`/videos/${id}/views`).catch(() => {});
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar el video");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/videos/feed", { params: { limit: 12 } })
      .then((res) => {
        if (!cancelled) setRelated(res.data.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleLike = async (value) => {
    if (!user) return;
    try {
      const res = await api.post(`/videos/${id}/like`, { value });
      setLikes(res.data.likes);
      setLiked(res.data.userValue === 1 ? 1 : null);
    } catch (_) {}
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      setCommentError("Debes iniciar sesión para comentar");
      return;
    }
    if (!commentText.trim()) return;
    setCommentError("");
    try {
      const res = await api.post(`/comments/video/${id}`, {
        content: commentText.trim(),
      });
      setComments((prev) => [...prev, res.data.data]);
      setCommentText("");
    } catch (err) {
      setCommentError(err.response?.data?.message || "Error al comentar");
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="video-grid-loading">
          <div className="spinner" />
          <p>Cargando video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="video-grid-error">{error}</div>
        <Link to="/" className="btn">Volver al inicio</Link>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="page watch-page">
      <div className="watch-main">
        <VideoPlayer src={video.videoUrl} poster={video.thumbnailUrl} />

        <h1 className="watch-title">{video.title}</h1>

        <div className="watch-meta">
          <div className="watch-channel">
            <div className="video-card-avatar">
              {(video.uploader?.username || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <Link
                to={`/channel/${video.uploader?.username}`}
                className="watch-channel-name"
              >
                {video.uploader?.username}
              </Link>
              <p className="watch-stats">
                {formatViews(video.views)} visualizaciones
                {video.createdAt && (
                  <> &middot; {new Date(video.createdAt).toLocaleDateString()}</>
                )}
              </p>
            </div>
          </div>

          <div className="watch-actions">
            <button
              className={`btn btn-like${liked === 1 ? " active" : ""}`}
              onClick={() => handleLike(liked === 1 ? 0 : 1)}
            >
              👍 {likes}
            </button>
          </div>
        </div>

        {video.description && (
          <div className="watch-description">
            <p>{video.description}</p>
          </div>
        )}

        <div className="watch-comments">
          <h2>{comments.length} Comentarios</h2>

          {user ? (
            <form className="comment-form" onSubmit={handleComment}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Añade un comentario..."
                rows={3}
                className="comment-input"
              />
              {commentError && <p className="comment-error">{commentError}</p>}
              <button type="submit" className="btn btn-primary">
                Comentar
              </button>
            </form>
          ) : (
            <p className="comment-login-hint">
              <Link to="/login">Inicia sesión</Link> para comentar.
            </p>
          )}

          <div className="comment-list">
            {comments.map((c) => (
              <div key={c.id} className="comment">
                <div className="video-card-avatar">
                  {(c.username || "U").charAt(0).toUpperCase()}
                </div>
                <div className="comment-body">
                  <p className="comment-author">
                    {c.username}
                    <span className="comment-date">
                      {c.createdAt && new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="comment-text">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="watch-sidebar">
        <h3>Más videos</h3>
        {related.filter((v) => String(v.id) !== String(id)).length === 0 ? (
          <p className="sidebar-empty">
            Todavía no hay más videos. ¡Sé el primero en publicar!
          </p>
        ) : (
          <div className="mini-list">
            {related
              .filter((v) => String(v.id) !== String(id))
              .map((v) => (
                <Link key={v.id} to={`/watch/${v.id}`} className="mini-video">
                  <div className="mini-thumb">
                    {v.thumbnailUrl ? (
                      <img src={v.thumbnailUrl} alt="" loading="lazy" />
                    ) : (
                      <div className="mini-placeholder">🎬</div>
                    )}
                    {fmtDuration(v.duration) && (
                      <span className="mini-duration">{fmtDuration(v.duration)}</span>
                    )}
                  </div>
                  <div className="mini-meta">
                    <p className="mini-title">{v.title}</p>
                    <p className="mini-channel">{v.uploader?.username}</p>
                    <p className="mini-stats">
                      {formatViews(v.views)} visualizaciones
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </aside>
    </div>
  );
}
