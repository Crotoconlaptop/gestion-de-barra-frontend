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

  // Load premixes on page load
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

  // Handle adding a new premix
  const handleAddPremix = async () => {
    if (!nuevoPremix.nombre || !nuevoPremix.descripcion || !nuevoPremix.preparacion || !nuevoPremix.ingredientes || !imagenArchivo) {
      notify("All fields, including the image, are required.", "error");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;

        const ingredientsArray = nuevoPremix.ingredientes
          .split(",")
          .map((ing) => ing.trim())
          .filter((ing) => ing.length > 0);

        const premixData = {
          nombre: nuevoPremix.nombre,
          descripcion: nuevoPremix.descripcion,
          ingredientes: ingredientsArray,
          preparacion: nuevoPremix.preparacion,
          imagen: base64Image,
          pendiente: false,
        };

        console.log("Data sent to the backend:", premixData);

        const { data } = await createPremix(premixData);
        setPremixes([...premixes, data]);
        setNuevoPremix({ nombre: "", descripcion: "", ingredientes: "", preparacion: "", imagen: "" });
        setImagenArchivo(null);
        notify("Premix added successfully.", "success");
      };

      reader.readAsDataURL(imagenArchivo);
    } catch (error) {
      console.error("Error adding the premix:", error.message);
      notify("Error adding the premix.", "error");
    }
  };

  // Handle marking pending or done
  const handleTogglePending = async (id, isPending) => {
    try {
      const newState = !isPending;
      const { data } = await cambiarEstadoPremix(id, newState); // Send the new state to the backend
      setPremixes(premixes.map((premix) => (premix._id === id ? data : premix)));
      notify(`Premix marked as ${newState ? "pending" : "ready"}.`, "success");
    } catch (error) {
      console.error("Error changing the premix state:", error.message);
      notify("Error changing the premix state.", "error");
    }
  };

  // Handle deleting a premix
  const handleDeletePremix = async (id) => {
    if (!window.confirm("Are you sure you want to delete this premix?")) return;

    try {
      await deletePremix(id);
      setPremixes(premixes.filter((premix) => premix._id !== id));
      notify("Premix deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting the premix:", error.message);
      notify("Error deleting the premix.", "error");
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-gray-200">
      <h1 className="text-3xl font-bold text-center mb-6 text-cyan-400">Premix Management</h1>

      {/* Form to add a new premix */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-bold text-cyan-400 mb-4">Add New Premix</h2>
        <input
          type="text"
          placeholder="Premix name"
          value={nuevoPremix.nombre}
          onChange={(e) => setNuevoPremix({ ...nuevoPremix, nombre: e.target.value })}
          className="w-full bg-gray-700 text-gray-200 p-2 rounded mb-2"
        />
        <textarea
          placeholder="Description"
          value={nuevoPremix.descripcion}
          onChange={(e) => setNuevoPremix({ ...nuevoPremix, descripcion: e.target.value })}
          className="w-full bg-gray-700 text-gray-200 p-2 rounded mb-2"
        />
        <textarea
          placeholder="Preparation"
          value={nuevoPremix.preparacion}
          onChange={(e) => setNuevoPremix({ ...nuevoPremix, preparacion: e.target.value })}
          className="w-full bg-gray-700 text-gray-200 p-2 rounded mb-2"
        />
        <input
          type="text"
          placeholder="Ingredients (comma separated)"
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
          onClick={handleAddPremix}
          className="w-full bg-cyan-500 text-white p-2 rounded hover:bg-cyan-600 transition"
        >
          Add Premix
        </button>
      </div>

      {/* List of premixes */}
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
