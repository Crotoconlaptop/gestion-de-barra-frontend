export const fetchPedidos = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            { _id: "1", productos: ["Producto A", "Producto B"], recibido: false },
            { _id: "2", productos: ["Producto C"], recibido: true },
          ],
        });
      }, 500); // Simula un retraso en la respuesta
    });
  };
  
  export const createPedido = async (pedido) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: { _id: Date.now().toString(), ...pedido },
        });
      }, 500);
    });
  };
  