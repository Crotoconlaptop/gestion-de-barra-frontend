import React, { useEffect, useState } from "react";
import { useNotification } from "../hooks/useNotification";
import {
  fetchProductos86,
  fetchPremixes,
  fetchPedidos,
  addProducto86,
  deleteProducto86,
} from "../services/api";

const HomePage = () => {
  const [productosFaltantes, setProductosFaltantes] = useState([]);
  const [premixesPendientes, setPremixesPendientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState("");
  const { message, type, notify } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productosResponse = await fetchProductos86();
        setProductosFaltantes(productosResponse.data);

        const premixesResponse = await fetchPremixes();
        setPremixesPendientes(
          premixesResponse.data.filter((premix) => premix.pendiente)
        );

        const pedidosResponse = await fetchPedidos();
        setPedidos(
          pedidosResponse.data.map((pedido) => ({
            ...pedido,
            descripcion: new Date(pedido.fecha).toLocaleString(),
          }))
        );
      } catch (error) {
        console.error("Error fetching data: ", error.message);
        notify("Error loading initial data.", "error");
      }
    };

    fetchData();
  }, [notify]);

  const handleAgregarProducto86 = async () => {
    if (!nuevoProducto.trim()) {
      notify("The product name cannot be empty.", "error");
      return;
    }

    try {
      const { data } = await addProducto86({
        nombre: nuevoProducto,
        cantidad: 1,
        tipo: "unidad",
      });
      setProductosFaltantes([...productosFaltantes, data]);
      setNuevoProducto("");
      notify("Product added to missing list.", "success");
    } catch (error) {
      notify("Error adding missing product.", "error");
      console.error(error.message);
    }
  };

  const handleEliminarProducto86 = async (id) => {
    try {
      await deleteProducto86(id);
      setProductosFaltantes(
        productosFaltantes.filter((producto) => producto._id !== id)
      );
      notify("Product removed from missing list.", "success");
    } catch (error) {
      notify("Error removing missing product.", "error");
      console.error(error.message);
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-gray-200 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-cyan-400">Bar Management</h1>

      {/* Missing Products */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-2 text-yellow-400">Missing Products</h2>
        <ul>
          {productosFaltantes.length > 0 ? (
            productosFaltantes.map((producto) => (
              <li
                key={producto._id}
                className="flex justify-between items-center text-gray-200"
              >
                {producto.nombre}
                <button
                  onClick={() => handleEliminarProducto86(producto._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))
          ) : (
            <p className="text-gray-400">All products are available</p>
          )}
        </ul>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Add missing product"
            value={nuevoProducto}
            onChange={(e) => setNuevoProducto(e.target.value)}
            className="bg-gray-700 text-gray-200 border p-2 w-full mb-2 rounded-lg"
          />
          <button
            onClick={handleAgregarProducto86}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Pending Premixes */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-2 text-green-400">Pending Premixes</h2>
        <ul>
          {premixesPendientes.length > 0 ? (
            premixesPendientes.map((premix) => (
              <li key={premix._id} className="text-gray-200">
                {premix.nombre}
              </li>
            ))
          ) : (
            <p className="text-gray-400">No pending premixes</p>
          )}
        </ul>
      </div>

      {/* Orders */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2 text-blue-400">Orders</h2>
        <ul>
          {pedidos.length > 0 ? (
            pedidos.map((pedido) => (
              <li key={pedido._id} className="text-gray-200">
                <strong>{pedido.descripcion}</strong> - {pedido.estado === "Recibido" ? "Received" : pedido.estado}
                {pedido.estado === "Recibido" && (
                  <>
                    {pedido.comentarios && (
                      <p className="mt-1 italic text-gray-400">Comment: {pedido.comentarios}</p>
                    )}
                    {pedido.recibidoPor && (
                      <p className="italic text-gray-400">Received by: {pedido.recibidoPor}</p>
                    )}
                  </>
                )}
              </li>
            ))
          ) : (
            <p className="text-gray-400">No orders registered</p>
          )}
        </ul>
      </div>

      {/* Notifications */}
      {message && (
        <div
          className={`fixed bottom-4 right-4 p-3 rounded text-white ${
            type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default HomePage;
