import { useState, useCallback } from "react";
import api from "../services/api";

export const useVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeed = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/videos/feed", { params });
      setVideos(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al obtener el feed");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrending = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/videos/trending", { params });
      setVideos(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al obtener tendencias");
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (q, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/videos/search", { params: { q, ...params } });
      setVideos(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al buscar");
    } finally {
      setLoading(false);
    }
  }, []);

  const findByUser = useCallback(async (username, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/videos/user/${username}`, { params });
      setVideos(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al obtener videos del usuario");
    } finally {
      setLoading(false);
    }
  }, []);

  return { videos, loading, error, fetchFeed, fetchTrending, search, findByUser };
};
