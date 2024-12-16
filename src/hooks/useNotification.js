import { useState } from "react";

export const useNotification = () => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState(""); // success, error

  const notify = (msg, type = "success") => {
    setMessage(msg);
    setType(type);
    setTimeout(() => setMessage(""), 3000); // Borra el mensaje después de 3 segundos
  };

  return { message, type, notify };
};
