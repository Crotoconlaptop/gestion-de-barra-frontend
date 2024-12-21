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
    const loadDrinks = async () => {
      try {
        const { data } = await fetchTragos();
        setTragos(data);
      } catch (error) {
        console.error("Error fetching drinks:", error.message);
        notify("Error loading drinks.", "error");
      }
    };

    loadDrinks();
  }, [notify]);

  const handleAddDrink = async () => {
    if (!nuevoTrago.nombre || !nuevoTrago.preparacion || !nuevoTrago.ingredientes || !imagenArchivo) {
      notify("All fields, including the image, are required.", "error");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;

        const ingredientsArray = nuevoTrago.ingredientes
          .split(",")
          .map((ing) => ing.trim())
          .filter((ing) => ing.length > 0);

        if (ingredientsArray.length === 0) {
          notify("You must enter at least one valid ingredient.", "error");
          return;
        }

        const drinkData = {
          nombre: nuevoTrago.nombre,
          preparacion: nuevoTrago.preparacion,
          ingredientes: ingredientsArray,
          imagen: base64Image,
        };

        const { data } = await createTrago(drinkData);
        setTragos((prevTragos) => [...prevTragos, data]);
        setNuevoTrago({ nombre: "", ingredientes: "", preparacion: "" });
        setImagenArchivo(null);
        notify("Drink added successfully.", "success");
      };

      reader.readAsDataURL(imagenArchivo);
    } catch (error) {
      console.error("Error adding drink:", error.message);
      notify("Error adding the drink.", "error");
    }
  };

  const handleDeleteDrink = async (id) => {
    if (!window.confirm("Are you sure you want to delete this drink?")) return;

    try {
      await deleteTrago(id);
      setTragos((prevTragos) => prevTragos.filter((drink) => drink._id !== id));
      notify("Drink deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting drink:", error.message);
      notify("Error deleting the drink.", "error");
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-gray-200">
      <h1 className="text-3xl font-bold text-center mb-6 text-cyan-400">Drink Management</h1>

      <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-bold text-cyan-400 mb-4">Add New Drink</h2>
        <input
          type="text"
          placeholder="Drink name"
          value={nuevoTrago.nombre}
          onChange={(e) => setNuevoTrago({ ...nuevoTrago, nombre: e.target.value })}
          className="w-full bg-gray-700 text-gray-200 p-2 rounded mb-2"
        />
        <textarea
          placeholder="Preparation"
          value={nuevoTrago.preparacion}
          onChange={(e) => setNuevoTrago({ ...nuevoTrago, preparacion: e.target.value })}
          className="w-full bg-gray-700 text-gray-200 p-2 rounded mb-2"
        />
        <input
          type="text"
          placeholder="Ingredients (comma separated)"
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
          onClick={handleAddDrink}
          className="w-full bg-cyan-500 text-white p-2 rounded hover:bg-cyan-600 transition"
        >
          Add Drink
        </button>
      </div>

      <ul className="space-y-4">
        {tragos.map((drink) => (
          <li key={drink._id} className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-green-400">{drink.nombre}</h2>
            <p className="text-gray-400">{drink.preparacion}</p>
            <img src={drink.imagen} alt={drink.nombre} className="w-32 h-32 object-cover rounded-lg my-2" />
            <h3 className="text-lg font-semibold text-yellow-400">Ingredients:</h3>
            <ul className="list-disc ml-5 text-gray-300">
              {drink.ingredientes.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
            <button
              onClick={() => handleDeleteDrink(drink._id)}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TragosPage;
