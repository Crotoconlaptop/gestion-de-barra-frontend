import React, { useState, useEffect, useCallback } from "react";
import { useNotification } from "../hooks/useNotification";
import { fetchPedidos, createPedido, updatePedidoStatus, deletePedido } from "../services/api";

const PedidosPage = () => {
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [pedidosRecibidos, setPedidosRecibidos] = useState([]);
  const [nuevoPedido, setNuevoPedido] = useState({ productos: [] });
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: "", cantidad: "", tipo: "" });
  const [comentarios, setComentarios] = useState("");
  const [recibidoPor, setRecibidoPor] = useState("");
  const { notify } = useNotification();

  // Fetch pedidos
  const cargarPedidos = useCallback(async () => {
    try {
      const { data } = await fetchPedidos();
      setPedidosPendientes(data.filter((pedido) => pedido.estado === "Pendiente"));
      setPedidosRecibidos(data.filter((pedido) => pedido.estado === "Recibido"));
    } catch (error) {
      notify("Error al cargar pedidos del backend.", "error");
    }
  }, [notify]);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  const handleAgregarProducto = () => {
    if (!nuevoProducto.nombre || !nuevoProducto.cantidad || !nuevoProducto.tipo) {
      notify("Todos los campos del producto son obligatorios.", "error");
      return;
    }

    setNuevoPedido((prev) => ({
      ...prev,
      productos: [...prev.productos, { ...nuevoProducto }],
    }));

    setNuevoProducto({ nombre: "", cantidad: "", tipo: "" });
    notify("Producto agregado al pedido.", "success");
  };

  const handleCrearPedido = async () => {
    if (nuevoPedido.productos.length === 0) {
      notify("Debes agregar al menos un producto al pedido.", "error");
      return;
    }

    try {
      const { data } = await createPedido(nuevoPedido);
      setPedidosPendientes((prev) => [...prev, data]);
      setNuevoPedido({ productos: [] });
      notify("Pedido creado con éxito.", "success");
    } catch (error) {
      notify("Error al crear el pedido.", "error");
    }
  };

  const handleEliminarPedido = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este pedido?")) return;

    try {
      await deletePedido(id);
      setPedidosPendientes((prev) => prev.filter((pedido) => pedido._id !== id));
      setPedidosRecibidos((prev) => prev.filter((pedido) => pedido._id !== id));
      notify("Pedido eliminado con éxito.", "success");
    } catch (error) {
      notify("Error al eliminar el pedido.", "error");
    }
  };

  const handleMarcarPedidoRecibido = async (id) => {
    if (!comentarios.trim() || !recibidoPor.trim()) {
      notify("Por favor, completa los campos de comentarios y recibido por.", "error");
      return;
    }

    try {
      const updatedPedido = { estado: "Recibido", comentarios, recibidoPor };
      const { data } = await updatePedidoStatus(id, updatedPedido);

      setPedidosPendientes((prev) => prev.filter((pedido) => pedido._id !== id));
      setPedidosRecibidos((prev) => [...prev, data]);

      notify("Pedido marcado como recibido.", "success");
      setComentarios("");
      setRecibidoPor("");
    } catch (error) {
      notify("Error al marcar el pedido como recibido.", "error");
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center">Gestión de Pedidos</h1>

      <section>
        <h2 className="text-xl font-bold mt-8">Pedidos Pendientes</h2>
        {pedidosPendientes.length === 0 ? (
          <p className="text-gray-600 text-center">No hay pedidos pendientes.</p>
        ) : (
          <ul className="space-y-4">
            {pedidosPendientes.map((pedido) => (
              <li key={pedido._id} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-bold">ID: {new Date(pedido.fecha).toLocaleString()}</h3>
                <h4 className="mt-2 font-semibold">Productos:</h4>
                <ul className="list-disc ml-5">
                  {pedido.productos.map((prod, idx) => (
                    <li key={idx}>
                      {prod.nombre} - {prod.cantidad} ({prod.tipo})
                    </li>
                  ))}
                </ul>
                <textarea
                  placeholder="Agregar comentarios"
                  className="border p-2 w-full mt-2 rounded-lg"
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Recibido por"
                  className="border p-2 w-full mt-2 rounded-lg"
                  value={recibidoPor}
                  onChange={(e) => setRecibidoPor(e.target.value)}
                />
                <button
                  onClick={() => handleMarcarPedidoRecibido(pedido._id)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mt-2"
                >
                  Marcar como Recibido
                </button>
                <button
                  onClick={() => handleEliminarPedido(pedido._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 mt-2 ml-2"
                >
                  Eliminar Pedido
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mt-8">Pedidos Recibidos</h2>
        {pedidosRecibidos.length === 0 ? (
          <p className="text-gray-600 text-center">No hay pedidos recibidos.</p>
        ) : (
          <ul className="space-y-4">
            {pedidosRecibidos.map((pedido) => (
              <li key={pedido._id} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-bold">ID: {new Date(pedido.fecha).toLocaleString()}</h3>
                <p className="italic text-gray-600">Comentarios: {pedido.comentarios || "Ninguno"}</p>
                <p className="italic text-gray-600">Recibido por: {pedido.recibidoPor || "No especificado"}</p>
                <h4 className="mt-2 font-semibold">Productos:</h4>
                <ul className="list-disc ml-5">
                  {pedido.productos.map((prod, idx) => (
                    <li key={idx}>
                      {prod.nombre} - {prod.cantidad} ({prod.tipo})
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleEliminarPedido(pedido._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 mt-2"
                >
                  Eliminar Pedido
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mt-8">Crear Nuevo Pedido</h2>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold">Agregar Producto</h3>
          <input
            type="text"
            placeholder="Nombre del Producto"
            value={nuevoProducto.nombre}
            onChange={(e) => setNuevoProducto((prev) => ({ ...prev, nombre: e.target.value }))}
            className="border p-2 w-full mb-2 rounded-lg"
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={nuevoProducto.cantidad}
            onChange={(e) => setNuevoProducto((prev) => ({ ...prev, cantidad: e.target.value }))}
            className="border p-2 w-full mb-2 rounded-lg"
          />
          <input
            type="text"
            placeholder="Tipo (unidad, pack, kilo)"
            value={nuevoProducto.tipo}
            onChange={(e) => setNuevoProducto((prev) => ({ ...prev, tipo: e.target.value }))}
            className="border p-2 w-full mb-2 rounded-lg"
          />
          <button
            onClick={handleAgregarProducto}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Agregar Producto
          </button>

          <h3 className="font-bold mt-4">Productos Agregados:</h3>
          <ul className="list-disc ml-5">
            {nuevoPedido.productos.map((prod, idx) => (
              <li key={idx}>
                {prod.nombre} - {prod.cantidad} ({prod.tipo})
              </li>
            ))}
          </ul>
          <button
            onClick={handleCrearPedido}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mt-4"
          >
            Crear Pedido
          </button>
        </div>
      </section>
    </div>
  );
};

export default PedidosPage;
