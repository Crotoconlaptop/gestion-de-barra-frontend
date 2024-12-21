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

  useEffect(() => {
    const loadPremixes = async () => {
      try {
        const { data } = await fetchPremixes();
        setPremixes(data);
      } catch (error) {
        notify("Error loading premixes.", "error");
      }
    };
    loadPremixes();
  }, [notify]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoPremix((prev) => ({ ...prev, [name]: value }));
  };

  const validatePremixData = () => {
    const { nombre, descripcion, ingredientes, preparacion } = nuevoPremix;
    if (!nombre || !descripcion || !preparacion || !ingredientes || !imagenArchivo) {
      notify("All fields, including the image, are required.", "error");
      return false;
    }
    return true;
  };

  const handleAddPremix = async () => {
    if (!validatePremixData()) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        const ingredientsArray = nuevoPremix.ingredientes
          .split(",")
          .map((ing) => ing.trim())
          .filter((ing) => ing);

        const premixData = {
          ...nuevoPremix,
          ingredientes: ingredientsArray,
          imagen: base64Image,
          pendiente: false,
        };

        const { data } = await createPremix(premixData);
        setPremixes((prev) => [...prev, data]);
        setNuevoPremix({ nombre: "", descripcion: "", ingredientes: "", preparacion: "", imagen: "" });
        setImagenArchivo(null);
        notify("Premix added successfully.", "success");
      };
      reader.readAsDataURL(imagenArchivo);
    } catch (error) {
      notify("Error adding the premix.", "error");
    }
  };

  const handleTogglePending = async (id, isPending) => {
    try {
      const newState = !isPending;
      const { data } = await cambiarEstadoPremix(id, newState);
      setPremixes((prev) => prev.map((premix) => (premix._id === id ? data : premix)));
      notify(`Premix marked as ${newState ? "pending" : "ready"}.`, "success");
    } catch (error) {
      notify("Error changing the premix state.", "error");
    }
  };

  const handleDeletePremix = async (id) => {
    if (!window.confirm("Are you sure you want to delete this premix?")) return;

    try {
      await deletePremix(id);
      setPremixes((prev) => prev.filter((premix) => premix._id !== id));
      notify("Premix deleted successfully.", "success");
    } catch (error) {
      notify("Error deleting the premix.", "error");
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-gray-200">
      <h1 className="text-3xl font-bold text-center mb-6 text-cyan-400">Premix Management</h1>

      <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-bold text-cyan-400 mb-4">Add New Premix</h2>
        <input
          type="text"
          name="nombre"
          placeholder="Premix name"
          value={nuevoPremix.nombre}
          onChange={handleInputChange}
          className="w-full bg-gray-700 text-gray-200 p-2 rounded mb-2"
        />
        <textarea
          name="descripcion"
          placeholder="Description"
          value={nuevoPremix.descripcion}
          onChange={handleInputChange}
          className="w-full bg-gray-700 text-gray-200 p-2 rounded mb-2"
        />
        <textarea
          name="preparacion"
          placeholder="Preparation"
          value={nuevoPremix.preparacion}
          onChange={handleInputChange}
          className="w-full bg-gray-700 text-gray-200 p-2 rounded mb-2"
        />
        <input
          type="text"
          name="ingredientes"
          placeholder="Ingredients (comma separated)"
          value={nuevoPremix.ingredientes}
          onChange={handleInputChange}
          className="w-full bg-gray-700 text-gray-200 p-2 rounded mb-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagenArchivo(e.target.files[0])}
          className="w-full text-gray-200 mb-4"
        />
        <button
          onClick={handleAddPremix}
          className="w-full bg-cyan-500 text-white p-2 rounded hover:bg-cyan-600 transition"
        >
          Add Premix
        </button>
      </div>

      <ul className="space-y-4">
        {premixes.map((premix) => (
          <li key={premix._id} className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-green-400">{premix.nombre}</h2>
            <p className="text-gray-400">{premix.descripcion}</p>
            <p className="text-gray-400">{premix.preparacion}</p>
            <img src={premix.imagen} alt={premix.nombre} className="w-32 h-32 object-cover rounded-lg my-2" />
            <h3 className="text-lg font-semibold text-yellow-400">Ingredients:</h3>
            <ul className="list-disc ml-5 text-gray-300">
              {premix.ingredientes.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
            <p className={`text-sm font-bold ${premix.pendiente ? "text-red-400" : "text-green-400"}`}>
              {premix.pendiente ? "Pending" : "Ready"}
            </p>
            <button
              onClick={() => handleTogglePending(premix._id, premix.pendiente)}
              className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2"
            >
              {premix.pendiente ? "Mark as Ready" : "Mark as Pending"}
            </button>
            <button
              onClick={() => handleDeletePremix(premix._id)}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PremixesPage;
