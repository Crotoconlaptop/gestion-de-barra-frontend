import React, { useState, useEffect } from "react";
import { useNotification } from "../hooks/useNotification";
import { fetchPremixes, createPremix, updatePremix, deletePremix } from "../services/api";

const PremixesPage = () => {
  const [premixes, setPremixes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [premixSeleccionado, setPremixSeleccionado] = useState(null);
  const [nuevoPremix, setNuevoPremix] = useState({
    nombre: "",
    descripcion: "",
    imagen: "",
    ingredientes: [],
    preparacion: "",
    pendiente: false,
  });

  const { message, type, notify } = useNotification();

  // Cargar datos iniciales desde el backend
  useEffect(() => {
    const cargarPremixes = async () => {
      try {
        const { data } = await fetchPremixes();
        setPremixes(data);
      } catch (error) {
        notify("Error al cargar premixes del servidor.", "error");
      }
    };

    cargarPremixes();
  }, [notify]);

  const handleAgregarPremix = async () => {
    if (!nuevoPremix.nombre || !nuevoPremix.descripcion || !nuevoPremix.imagen) {
      notify("Todos los campos son obligatorios.", "error");
      return;
    }

    try {
      const { data } = await createPremix(nuevoPremix);
      setPremixes([...premixes, data]);
      setNuevoPremix({ nombre: "", descripcion: "", imagen: "", ingredientes: [], preparacion: "", pendiente: false });
      notify("Premix agregado con éxito.", "success");
    } catch (error) {
      notify("Error al agregar el premix.", "error");
    }
  };

  const handleEditarPremix = async () => {
    if (!premixSeleccionado || !nuevoPremix.nombre || !nuevoPremix.descripcion || !nuevoPremix.imagen) {
      notify("Todos los campos son obligatorios.", "error");
      return;
    }

    try {
      const { data } = await updatePremix(premixSeleccionado._id, nuevoPremix);
      setPremixes(
        premixes.map((premix) => (premix._id === premixSeleccionado._id ? data : premix))
      );
      setNuevoPremix({ nombre: "", descripcion: "", imagen: "", ingredientes: [], preparacion: "", pendiente: false });
      setMostrarModal(false);
      notify("Premix actualizado con éxito.", "success");
    } catch (error) {
      notify("Error al actualizar el premix.", "error");
    }
  };

  const handleEliminarPremix = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este premix?")) return;

    try {
      await deletePremix(id);
      setPremixes(premixes.filter((premix) => premix._id !== id));
      notify("Premix eliminado con éxito.", "success");
    } catch (error) {
      notify("Error al eliminar el premix.", "error");
    }
  };

  const handleMarcarPendiente = async (id) => {
    try {
      const premix = premixes.find((p) => p._id === id);
      const actualizado = { ...premix, pendiente: !premix.pendiente };
      const { data } = await updatePremix(id, actualizado);
      setPremixes(premixes.map((p) => (p._id === id ? data : p)));
      notify("Estado del premix actualizado.", "success");
    } catch (error) {
      notify("Error al actualizar el estado del premix.", "error");
    }
  };

  const handleCargarParaEditar = (premix) => {
    setNuevoPremix(premix);
    setMostrarModal(true);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center">Lista de Premixes</h1>
      {message && (
        <div
          className={`p-2 rounded text-white ${
            type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {message}
        </div>
      )}

      <ul className="space-y-4">
        {premixes.map((premix) => (
          <li key={premix._id} className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold">{premix.nombre}</h2>
            <p className="text-gray-700">{premix.descripcion}</p>
            <p className={`text-sm ${premix.pendiente ? "text-red-500" : "text-green-500"}`}>
              {premix.pendiente ? "Pendiente" : "Listo"}
            </p>
            <button
              onClick={() => handleCargarParaEditar(premix)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 mt-2"
            >
              Editar
            </button>
            <button
              onClick={() => handleEliminarPremix(premix._id)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 mt-2 ml-2"
            >
              Eliminar
            </button>
            <button
              onClick={() => handleMarcarPendiente(premix._id)}
              className={`${
                premix.pendiente ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"
              } text-white px-4 py-2 rounded-lg mt-2 ml-2`}
            >
              {premix.pendiente ? "Marcar como Listo" : "Marcar como Pendiente"}
            </button>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-bold mt-8">{nuevoPremix._id ? "Editar Premix" : "Agregar Nuevo Premix"}</h2>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Nombre"
          value={nuevoPremix.nombre}
          onChange={(e) => setNuevoPremix({ ...nuevoPremix, nombre: e.target.value })}
          className="border p-2 w-full mb-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Descripción"
          value={nuevoPremix.descripcion}
          onChange={(e) => setNuevoPremix({ ...nuevoPremix, descripcion: e.target.value })}
          className="border p-2 w-full mb-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="URL de la Imagen"
          value={nuevoPremix.imagen}
          onChange={(e) => setNuevoPremix({ ...nuevoPremix, imagen: e.target.value })}
          className="border p-2 w-full mb-2 rounded-lg"
        />
        <textarea
          placeholder="Preparación"
          value={nuevoPremix.preparacion}
          onChange={(e) => setNuevoPremix({ ...nuevoPremix, preparacion: e.target.value })}
          className="border p-2 w-full mb-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Ingrediente (presiona Enter para agregar)"
          className="border p-2 w-full mb-2 rounded-lg"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value) {
              setNuevoPremix({
                ...nuevoPremix,
                ingredientes: [...nuevoPremix.ingredientes, e.target.value],
              });
              e.target.value = "";
            }
          }}
        />
        <ul className="list-disc ml-5">
          {nuevoPremix.ingredientes.map((ing, idx) => (
            <li key={idx}>{ing}</li>
          ))}
        </ul>
        <button
          onClick={nuevoPremix._id ? handleEditarPremix : handleAgregarPremix}
          className={`${
            nuevoPremix._id ? "bg-yellow-500" : "bg-green-500"
          } text-white px-4 py-2 rounded-lg hover:$
            {nuevoPremix._id ? "bg-yellow-600" : "bg-green-600"}`}
        >
          {nuevoPremix._id ? "Actualizar Premix" : "Agregar Premix"}
        </button>
      </div>
    </div>
  );
};

export default PremixesPage;
