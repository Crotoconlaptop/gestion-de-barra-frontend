import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4 fixed bottom-0 inset-x-0 flex justify-around text-gray-200 shadow-lg">
      <Link to="/" className="text-center hover:text-cyan-400 transition duration-300">
        <p>🏠</p>
        <span>Inicio</span>
      </Link>
      <Link to="/tragos" className="text-center hover:text-green-400 transition duration-300">
        <p>🍹</p>
        <span>Tragos</span>
      </Link>
      <Link to="/premixes" className="text-center hover:text-yellow-400 transition duration-300">
        <p>🧪</p>
        <span>Premixes</span>
      </Link>
      <Link to="/pedidos" className="text-center hover:text-red-400 transition duration-300">
        <p>📋</p>
        <span>Pedidos</span>
      </Link>
    </nav>
  );
};

export default Navbar;
