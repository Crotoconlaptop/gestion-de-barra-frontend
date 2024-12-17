import React, { useState, useEffect } from "react";
import { useNotification } from "../hooks/useNotification";
import { fetchTragos, createTrago, deleteTrago } from "../services/api";

const TragosPage = () => {
  const [tragos, setTragos] = useState([]);
  const [nuevoTrago, setNuevoTrago] = useState({
    nombre: "",
    ingredientes: "",
    preparacion: "",
    imagen: "",
  });
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const { notify } = useNotification();

  useEffect(() => {
    const cargarTragos = async () => {
      try {
        const { data } = await fetchTragos();
        setTragos(data);
      } catch (error) {
        notify("Error al cargar los tragos.", "error");
      }
    };

    cargarTragos();
  }, [notify]);

  const handleAgregarTrago = async () => {
    if (!nuevoTrago.nombre || !nuevoTrago.preparacion || !nuevoTrago.ingredientes || !imagenArchivo) {
      notify("Todos los campos son obligatorios, incluida la imagen.", "error");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Imagen = reader.result;

        const ingredientesArray = nuevoTrago.ingredientes
          .split(",")
          .map((ing) => ing.trim())
          .filter((ing) => ing.length > 0);

        if (ingredientesArray.length === 0) {
          notify("Debe ingresar al menos un ingrediente válido.", "error");
          return;
        }

        const tragoData = {
          nombre: nuevoTrago.nombre,
          preparacion: nuevoTrago.preparacion,
          ingredientes: ingredientesArray,
          imagen: base64Imagen,
        };

        const { data } = await createTrago(tragoData);
        setTragos([...tragos, data]);
        setNuevoTrago({ nombre: "", ingredientes: "", preparacion: "" });
        setImagenArchivo(null);
        notify("Trago agregado con éxito.", "success");
      };

      reader.readAsDataURL(imagenArchivo);
    } catch (error) {
      notify("Error al agregar el trago.", "error");
    }
  };

  const handleEliminarTrago = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este trago?")) return;

    try {
      await deleteTrago(id);
      setTragos(tragos.filter((trago) => trago._id !== id));
      notify("Trago eliminado correctamente.", "success");
    } catch (error) {
      notify("Error al eliminar el trago.", "error");
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-gray-200">
      <h1 className="text-3xl font-bold text-center mb-6 text-cyan-400">Gestión de Tragos</h1>

      <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-bold text-cyan-400 mb-4">Agregar Nuevo Trago</h2>
        <input
          type="text"
          placeholder="Nombre del trago"
          value={nuevoTrago.nombre}
          onChange={(e) => setNuevoTrago({ ...nuevoTrago, nombre: e.target.value })}
          className="w-full bg-gray-700 text-gray-200 p-2 rounded mb-2"
        />
        <textarea
          placeholder="Preparación"
          value={nuevoTrago.preparacion}
          onChange={(e) => setNuevoTrago({ ...nuevoTrago, preparacion: e.target.value })}
          className="w-full bg-gray-700 text-gray-200 p-2 rounded mb-2"
        />
        <input
          type="text"
          placeholder="Ingredientes (separados por comas)"
          value={nuevoTrago.ingredientes}
          onChange={(e) => setNuevoTrago({ ...nuevoTrago, ingredientes: e.target.value })}
          className="w-full bg-gray-700 text-gray-200 p-2 rounded mb-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagenArchivo(e.target.files[0])}
          className="w-full text-gray-200 mb-4"
        />
        <button
          onClick={handleAgregarTrago}
          className="w-full bg-cyan-500 text-white p-2 rounded hover:bg-cyan-600 transition"
        >
          Agregar Trago
        </button>
      </div>

      <ul className="space-y-4">
        {tragos.map((trago) => (
          <li key={trago._id} className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-green-400">{trago.nombre}</h2>
            <p className="text-gray-400">{trago.preparacion}</p>
            <img src={trago.imagen} alt={trago.nombre} className="w-32 h-32 object-cover rounded-lg my-2" />
            <h3 className="text-lg font-semibold text-yellow-400">Ingredientes:</h3>
            <ul className="list-disc ml-5 text-gray-300">
              {trago.ingredientes.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
            <button
              onClick={() => handleEliminarTrago(trago._id)}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TragosPage;
