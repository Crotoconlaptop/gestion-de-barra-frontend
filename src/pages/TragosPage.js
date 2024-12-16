import React, { useState, useEffect } from "react";
import { useNotification } from "../hooks/useNotification";
import { fetchTragos, createTrago, updateTrago, deleteTrago } from "../services/api";

const TragosPage = () => {
  const [tragos, setTragos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tragoSeleccionado, setTragoSeleccionado] = useState(null);
  const [nuevoTrago, setNuevoTrago] = useState({
    nombre: "",
    descripcion: "",
    imagen: "",
    ingredientes: [],
    preparacion: "",
  });

  const { message, type, notify } = useNotification();

  useEffect(() => {
    const cargarTragos = async () => {
      try {
        const { data } = await fetchTragos();
        setTragos(data);
      } catch (error) {
        notify("Error al cargar los tragos del servidor.", "error");
      }
    };

    cargarTragos();
  }, [notify]);

  const handleAgregarTrago = async () => {
    if (!nuevoTrago.nombre || !nuevoTrago.descripcion || !nuevoTrago.imagen) {
      notify("Todos los campos son obligatorios.", "error");
      return;
    }

    try {
      const { data } = await createTrago(nuevoTrago);
      setTragos([...tragos, data]);
      setNuevoTrago({ nombre: "", descripcion: "", imagen: "", ingredientes: [], preparacion: "" });
      notify("Trago agregado con éxito.", "success");
    } catch (error) {
      notify("Error al agregar el trago.", "error");
    }
  };

  const handleEditarTrago = async () => {
    if (!tragoSeleccionado || !nuevoTrago.nombre || !nuevoTrago.descripcion || !nuevoTrago.imagen) {
      notify("Todos los campos son obligatorios.", "error");
      return;
    }

    try {
      const { data } = await updateTrago(tragoSeleccionado._id, nuevoTrago);
      setTragos(tragos.map((trago) => (trago._id === tragoSeleccionado._id ? data : trago)));
      setNuevoTrago({ nombre: "", descripcion: "", imagen: "", ingredientes: [], preparacion: "" });
      setMostrarModal(false);
      notify("Trago actualizado con éxito.", "success");
    } catch (error) {
      notify("Error al actualizar el trago.", "error");
    }
  };

  const handleEliminarTrago = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este trago?")) return;

    try {
      await deleteTrago(id);
      setTragos(tragos.filter((trago) => trago._id !== id));
      notify("Trago eliminado con éxito.", "success");
    } catch (error) {
      notify("Error al eliminar el trago.", "error");
    }
  };

  const handleAbrirModal = (trago) => {
    setTragoSeleccionado(trago);
    setNuevoTrago(trago);
    setMostrarModal(true);
  };

  const handleCerrarModal = () => {
    setTragoSeleccionado(null);
    setNuevoTrago({ nombre: "", descripcion: "", imagen: "", ingredientes: [], preparacion: "" });
    setMostrarModal(false);
  };

  const handleAgregarIngrediente = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      setNuevoTrago({
        ...nuevoTrago,
        ingredientes: [...nuevoTrago.ingredientes, e.target.value.trim()],
      });
      e.target.value = "";
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center">Lista de Tragos</h1>
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
        {tragos.map((trago) => (
          <li key={trago._id} className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold">{trago.nombre}</h2>
            <p className="text-gray-700">{trago.descripcion}</p>
            <button
              onClick={() => handleAbrirModal(trago)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mt-2"
            >
              Ver Detalles
            </button>
            <button
              onClick={() => handleEliminarTrago(trago._id)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 mt-2 ml-2"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-bold mt-8">{tragoSeleccionado ? "Editar Trago" : "Agregar Nuevo Trago"}</h2>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Nombre"
          value={nuevoTrago.nombre}
          onChange={(e) => setNuevoTrago({ ...nuevoTrago, nombre: e.target.value })}
          className="border p-2 w-full mb-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Descripción"
          value={nuevoTrago.descripcion}
          onChange={(e) => setNuevoTrago({ ...nuevoTrago, descripcion: e.target.value })}
          className="border p-2 w-full mb-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="URL de la Imagen"
          value={nuevoTrago.imagen}
          onChange={(e) => setNuevoTrago({ ...nuevoTrago, imagen: e.target.value })}
          className="border p-2 w-full mb-2 rounded-lg"
        />
        <textarea
          placeholder="Preparación"
          value={nuevoTrago.preparacion}
          onChange={(e) => setNuevoTrago({ ...nuevoTrago, preparacion: e.target.value })}
          className="border p-2 w-full mb-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Ingrediente (presiona Enter para agregar)"
          className="border p-2 w-full mb-2 rounded-lg"
          onKeyDown={handleAgregarIngrediente}
        />
        <ul className="list-disc ml-5">
          {nuevoTrago.ingredientes.map((ing, idx) => (
            <li key={idx}>{ing}</li>
          ))}
        </ul>
        <button
          onClick={tragoSeleccionado ? handleEditarTrago : handleAgregarTrago}
          className={`${
            tragoSeleccionado ? "bg-yellow-500" : "bg-green-500"
          } text-white px-4 py-2 rounded-lg hover:$
            {tragoSeleccionado ? "bg-yellow-600" : "bg-green-600"}`}
        >
          {tragoSeleccionado ? "Actualizar Trago" : "Agregar Trago"}
        </button>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold">{tragoSeleccionado.nombre}</h2>
            <img
              src={tragoSeleccionado.imagen}
              alt={tragoSeleccionado.nombre}
              className="w-full h-auto rounded-lg my-2"
            />
            <p className="text-gray-700">{tragoSeleccionado.descripcion}</p>
            <h3 className="mt-2 font-semibold">Ingredientes:</h3>
            <ul className="list-disc ml-5">
              {tragoSeleccionado.ingredientes.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
            <h3 className="mt-2 font-semibold">Preparación:</h3>
            <p className="text-gray-700">{tragoSeleccionado.preparacion}</p>
            <button
              onClick={handleCerrarModal}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 mt-4"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TragosPage;
