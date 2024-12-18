import React, { useState, useEffect } from "react";
import { useNotification } from "../hooks/useNotification";
import { fetchPremixes, createPremix, deletePremix, cambiarEstadoPremix } from "../services/api";

const PremixesPage = () => {
  const [premixes, setPremixes] = useState([]);
  const [nuevoPremix, setNuevoPremix] = useState({
    nombre: "",
    descripcion: "",
    ingredientes: "",
    preparacion: "",
    imagen: "",
  });
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const { notify } = useNotification();

  // Cargar premixes al iniciar
  useEffect(() => {
    const cargarPremixes = async () => {
      try {
        const { data } = await fetchPremixes();
        setPremixes(data);
      } catch (error) {
        notify("Error al cargar los premixes.", "error");
      }
    };

    cargarPremixes();
  }, [notify]);

  // Handle para agregar un nuevo premix
  const handleAgregarPremix = async () => {
    if (!nuevoPremix.nombre || !nuevoPremix.descripcion || !nuevoPremix.preparacion || !nuevoPremix.ingredientes || !imagenArchivo) {
      notify("Todos los campos son obligatorios, incluida la imagen.", "error");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Imagen = reader.result;

        const ingredientesArray = nuevoPremix.ingredientes
          .split(",")
          .map((ing) => ing.trim())
          .filter((ing) => ing.length > 0);

        const premixData = {
          nombre: nuevoPremix.nombre,
          descripcion: nuevoPremix.descripcion,
          ingredientes: ingredientesArray,
          preparacion: nuevoPremix.preparacion,
          imagen: base64Imagen,
          pendiente: false,
        };

        console.log("Datos enviados al backend:", premixData);

        const { data } = await createPremix(premixData);
        setPremixes([...premixes, data]);
        setNuevoPremix({ nombre: "", descripcion: "", ingredientes: "", preparacion: "", imagen: "" });
        setImagenArchivo(null);
        notify("Premix agregado con éxito.", "success");
      };

      reader.readAsDataURL(imagenArchivo);
    } catch (error) {
      console.error("Error al agregar el premix:", error.message);
      notify("Error al agregar el premix.", "error");
    }
  };

  // Handle para cambiar el estado de pendiente
  const handleMarcarPendiente = async (id, pendienteActual) => {
    try {
      const nuevoEstado = !pendienteActual;
      const { data } = await cambiarEstadoPremix(id, nuevoEstado); // Enviar el nuevo estado al backend
      setPremixes(premixes.map((premix) => (premix._id === id ? data : premix)));
      notify(`Premix marcado como ${nuevoEstado ? "pendiente" : "listo"}.`, "success");
    } catch (error) {
      console.error("Error al cambiar el estado del premix:", error.message);
      notify("Error al cambiar el estado del premix.", "error");
    }
  };
  

  // Handle para eliminar un premix
  const handleEliminarPremix = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este premix?")) return;

    try {
      await deletePremix(id);
      setPremixes(premixes.filter((premix) => premix._id !== id));
      notify("Premix eliminado correctamente.", "success");
    } catch (error) {
      console.error("Error al eliminar el premix:", error.message);
      notify("Error al eliminar el premix.", "error");
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-gray-200">
      <h1 className="text-3xl font-bold text-center mb-6 text-cyan-400">Gestión de Premixes</h1>

      {/* Formulario para agregar un nuevo premix */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-bold text-cyan-400 mb-4">Agregar Nuevo Premix</h2>
        <input
          type="text"
          placeholder="Nombre del premix"
          value={nuevoPremix.nombre}
          onChange={(e) => setNuevoPremix({ ...nuevoPremix, nombre: e.target.value })}
          className="w-full bg-gray-700 text-gray-200 p-2 rounded mb-2"
        />
        <textarea
          placeholder="Descripción"
          value={nuevoPremix.descripcion}
          onChange={(e) => setNuevoPremix({ ...nuevoPremix, descripcion: e.target.value })}
          className="w-full bg-gray-700 text-gray-200 p-2 rounded mb-2"
        />
        <textarea
          placeholder="Preparación"
          value={nuevoPremix.preparacion}
          onChange={(e) => setNuevoPremix({ ...nuevoPremix, preparacion: e.target.value })}
          className="w-full bg-gray-700 text-gray-200 p-2 rounded mb-2"
        />
        <input
          type="text"
          placeholder="Ingredientes (separados por comas)"
          value={nuevoPremix.ingredientes}
          onChange={(e) => setNuevoPremix({ ...nuevoPremix, ingredientes: e.target.value })}
          className="w-full bg-gray-700 text-gray-200 p-2 rounded mb-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagenArchivo(e.target.files[0])}
          className="w-full text-gray-200 mb-4"
        />
        <button
          onClick={handleAgregarPremix}
          className="w-full bg-cyan-500 text-white p-2 rounded hover:bg-cyan-600 transition"
        >
          Agregar Premix
        </button>
      </div>

      {/* Lista de premixes */}
      <ul className="space-y-4">
        {premixes.map((premix) => (
          <li key={premix._id} className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-green-400">{premix.nombre}</h2>
            <p className="text-gray-400">{premix.descripcion}</p>
            <p className="text-gray-400">{premix.preparacion}</p>
            <img src={premix.imagen} alt={premix.nombre} className="w-32 h-32 object-cover rounded-lg my-2" />
            <h3 className="text-lg font-semibold text-yellow-400">Ingredientes:</h3>
            <ul className="list-disc ml-5 text-gray-300">
              {premix.ingredientes.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
            <p className={`text-sm font-bold ${premix.pendiente ? "text-red-400" : "text-green-400"}`}>
              {premix.pendiente ? "Pendiente" : "Listo"}
            </p>
            <button
              onClick={() => handleMarcarPendiente(premix._id, premix.pendiente)}
              className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2"
            >
              {premix.pendiente ? "Marcar como Listo" : "Marcar como Pendiente"}
            </button>
            <button
              onClick={() => handleEliminarPremix(premix._id)}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PremixesPage;
