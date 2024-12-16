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
        // Obtener productos faltantes
        const productosResponse = await fetchProductos86();
        setProductosFaltantes(productosResponse.data);

        // Obtener premixes pendientes
        const premixesResponse = await fetchPremixes();
        setPremixesPendientes(
          premixesResponse.data.filter((premix) => premix.pendiente)
        );

        // Obtener todos los pedidos
        const pedidosResponse = await fetchPedidos();
        setPedidos(
          pedidosResponse.data.map((pedido) => ({
            ...pedido,
            descripcion: new Date(pedido.fecha).toLocaleString(),
          }))
        );
      } catch (error) {
        console.error("Error al obtener datos: ", error.message);
        notify("Error al cargar datos iniciales.", "error");
      }
    };

    fetchData();
  }, [notify]);

  const handleAgregarProducto86 = async () => {
    if (!nuevoProducto.trim()) {
      notify("El nombre del producto no puede estar vacío.", "error");
      return;
    }
  
    try {
      const { data } = await addProducto86({ nombre: nuevoProducto, cantidad: 1, tipo: "unidad" });
      setProductosFaltantes([...productosFaltantes, data]);
      setNuevoProducto(""); // Limpiar el campo de entrada
      notify("Producto agregado a la lista de faltantes.", "success");
    } catch (error) {
      notify("Error al agregar producto faltante.", "error");
      console.error(error.message);
    }
  };
  
  const handleEliminarProducto86 = async (id) => {
    try {
      await deleteProducto86(id);
      setProductosFaltantes(productosFaltantes.filter((producto) => producto._id !== id));
      notify("Producto eliminado de la lista de faltantes.", "success");
    } catch (error) {
      notify("Error al eliminar producto faltante.", "error");
      console.error(error.message);
    }
  };
  

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Gestión de la Barra</h1>

      {/* Productos Faltantes */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-2">Productos Faltantes</h2>
        <ul>
          {productosFaltantes.length > 0 ? (
            productosFaltantes.map((producto) => (
              <li
                key={producto._id}
                className="flex justify-between items-center text-gray-700"
              >
                {producto.nombre}
                <button
                  onClick={() => handleEliminarProducto86(producto._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
                >
                  Eliminar
                </button>
              </li>
            ))
          ) : (
            <p className="text-gray-500">Todos los productos están disponibles</p>
          )}
        </ul>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Agregar producto faltante"
            value={nuevoProducto}
            onChange={(e) => setNuevoProducto(e.target.value)}
            className="border p-2 w-full mb-2 rounded-lg"
          />
          <button
            onClick={handleAgregarProducto86}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Agregar Producto
          </button>
        </div>
      </div>

      {/* Premixes Pendientes */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-2">Premixes Pendientes</h2>
        <ul>
          {premixesPendientes.length > 0 ? (
            premixesPendientes.map((premix) => (
              <li key={premix._id} className="text-gray-700">
                {premix.nombre}
              </li>
            ))
          ) : (
            <p className="text-gray-500">No hay premixes pendientes</p>
          )}
        </ul>
      </div>

      {/* Pedidos */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2">Pedidos</h2>
        <ul>
          {pedidos.length > 0 ? (
            pedidos.map((pedido) => (
              <li key={pedido._id} className="text-gray-700">
                <strong>{pedido.descripcion}</strong> - {pedido.estado}
                {pedido.estado === "Recibido" && (
                  <>
                    {pedido.comentarios && (
                      <p className="mt-1 italic text-gray-600">
                        Comentario: {pedido.comentarios}
                      </p>
                    )}
                    {pedido.recibidoPor && (
                      <p className="italic text-gray-600">
                        Recibido por: {pedido.recibidoPor}
                      </p>
                    )}
                  </>
                )}
              </li>
            ))
          ) : (
            <p className="text-gray-500">No hay pedidos registrados</p>
          )}
        </ul>
      </div>

      {/* Notificaciones */}
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