// src/index.js - Punto di ingresso React
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Crea il root di React e monta l'app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Se vuoi iniziare a misurare le performance nella tua app, passa una funzione
// per loggare i risultati (per esempio: reportWebVitals(console.log))
// o invia a un endpoint di analytics. Scopri di più: https://bit.ly/CRA-vitals
