import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Trending from "./pages/Trending";
import ComingSoon from "./pages/ComingSoon";
import Watch from "./pages/Watch";
import Channel from "./pages/Channel";
import Upload from "./pages/Upload";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/trending" element={<Trending />} />
          <Route
            path="/subscriptions"
            element={
              <ComingSoon
                title="Suscripciones"
                description="Sigue a tus artistas favoritos y recibe sus nuevos videos en un feed personalizado."
              />
            }
          />
          <Route
            path="/history"
            element={
              <ComingSoon
                title="Historial"
                description="Tu actividad de reproducción, ordenada y sincronizada con tu cuenta."
              />
            }
          />
          <Route
            path="/liked"
            element={
              <ComingSoon
                title="Videos que me gustan"
                description="Tu biblioteca de videos favoritos, siempre a mano."
              />
            }
          />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/channel/:username" element={<Channel />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;
