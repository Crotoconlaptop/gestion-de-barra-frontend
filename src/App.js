import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PedidosPage from "./pages/PedidosPage";
import TragosPage from "./pages/TragosPage";
import PremixesPage from "./pages/PremixesPage";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <div className="min-h-screen pb-16">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tragos" element={<TragosPage />} />
          <Route path="/premixes" element={<PremixesPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
        </Routes>
        <Navbar />
      </Router>
    </div>
  );
};

export default App;
