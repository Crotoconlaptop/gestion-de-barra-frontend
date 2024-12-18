import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });
//const API = axios.create({ baseURL: "https://gestion-de-barra-backend.onrender.com/api" });


export const fetchPedidos = () => API.get("/pedidos");
export const createPedido = (pedido) => API.post("/pedidos", pedido);
export const updatePedidoStatus = (id, status) => API.patch(`/pedidos/${id}`, status);
export const deletePedido = (id) => API.delete(`/pedidos/${id}`);

// Premixes
export const fetchPremixes = () => API.get("/premixes");
export const createPremix = (premix) => API.post("/premixes", premix);
export const cambiarEstadoPremix = (id, pendiente) =>
  API.patch(`/premixes/${id}/estado`, { pendiente });
export const deletePremix = (id) => API.delete(`/premixes/${id}`);

// Tragos
export const fetchTragos = () => API.get("/tragos");
export const createTrago = (trago) => API.post("/tragos", trago);
export const updateTrago = (id, trago) => API.patch(`/tragos/${id}`, trago);
export const deleteTrago = (id) => API.delete(`/tragos/${id}`);

// Productos Faltantes (86)
export const fetchProductos86 = () => API.get("/productos86");
export const addProducto86 = (producto) => API.post("/productos86", producto);
export const deleteProducto86 = (id) => API.delete(`/productos86/${id}`);
