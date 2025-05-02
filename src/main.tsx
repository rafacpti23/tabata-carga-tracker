
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Aplicação do tema dark/light antes da renderização
const initTheme = () => {
  // Verifique se o tema está salvo no localStorage
  const savedTheme = localStorage.getItem('theme');
  // Verifique a preferência do sistema
  const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Aplique o tema com base na preferência salva ou do sistema
  if (savedTheme === 'dark' || (!savedTheme && systemPreference)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Inicialize o tema
initTheme();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
