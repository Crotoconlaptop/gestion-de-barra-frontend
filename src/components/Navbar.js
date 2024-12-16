import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-500 p-4 fixed bottom-0 inset-x-0 flex justify-around text-white">
      <Link to="/" className="text-center">
        <p>🏠</p>
        <span>Inicio</span>
      </Link>
      <Link to="/tragos" className="text-center">
        <p>🍹</p>
        <span>Tragos</span>
      </Link>
      <Link to="/premixes" className="text-center">
        <p>🧪</p>
        <span>Premixes</span>
      </Link>
      <Link to="/pedidos" className="text-center">
        <p>📋</p>
        <span>Pedidos</span>
      </Link>
    </nav>
  );
};

export default Navbar;
