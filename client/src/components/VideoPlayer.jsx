import { useRef, useState, useEffect } from "react";

export default function VideoPlayer({ src, poster, onEnded }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const handleProgress = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const time = (e.target.value / 100) * video.duration;
    video.currentTime = time;
    setProgress(e.target.value);
  };

  const handleVolume = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const vol = Number(e.target.value);
    video.volume = vol;
    setVolume(vol);
    setMuted(vol === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="video-player">
      <div className="video-player-frame" onClick={togglePlay}>
        <video ref={videoRef} poster={poster} onEnded={onEnded} preload="metadata">
          {src && <source src={src} />}
          Tu navegador no soporta el elemento de video.
        </video>

        {!playing && (
          <button className="video-player-play-btn" onClick={togglePlay}>
            ▶
          </button>
        )}
      </div>

      <div className="video-player-controls">
        <button className="video-player-btn" onClick={togglePlay}>
          {playing ? "⏸" : "▶"}
        </button>

        <span className="video-player-time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <input
          type="range"
          className="video-player-progress"
          min="0"
          max="100"
          value={progress}
          onChange={handleProgress}
        />

        <button className="video-player-btn" onClick={toggleMute}>
          {muted ? "🔇" : "🔊"}
        </button>

        <button
          className="video-player-btn"
          title="Pantalla completa"
          onClick={() => {
            const frame = videoRef.current?.parentElement;
            if (document.fullscreenElement) {
              document.exitFullscreen?.();
            } else {
              frame?.requestFullscreen?.();
            }
          }}
        >
          ⛶
        </button>

        <input
          type="range"
          className="video-player-volume"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolume}
        />
      </div>
    </div>
  );
}
