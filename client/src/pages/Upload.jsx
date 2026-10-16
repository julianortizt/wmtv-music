import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Upload() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "" });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (loading) {
    return (
      <div className="page">
        <div className="video-grid-loading">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Selecciona un archivo de video");
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append("video", file);
      data.append("title", form.title);
      data.append("description", form.description);

      const res = await api.post("/videos/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Video subido correctamente. Se procesará en unos momentos.");
      setForm({ title: "", description: "" });
      setFile(null);
      e.target.reset();

      setTimeout(() => {
        navigate(`/watch/${res.data.data.id}`);
      }, 2000);
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(
        errs ? errs.join(", ") : err.response?.data?.message || "Error al subir el video"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Subir video musical</h1>

      <form className="upload-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-group">
          <label htmlFor="videoFile">Archivo de video</label>
          <input
            id="videoFile"
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className="form-input"
          />
          {file && (
            <p className="form-hint">
              {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="title">Título</label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Título del video"
            required
            maxLength={255}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descripción (opcional)"
            rows={4}
            maxLength={4000}
            className="form-input form-textarea"
          />
        </div>

        <button type="submit" disabled={uploading} className="btn btn-primary btn-lg">
          {uploading ? "Subiendo..." : "Subir video"}
        </button>
      </form>
    </div>
  );
}
