import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import GuestApp from "./GuestApp.jsx";
import WorkerApp from "./WorkerApp.jsx";

const path = window.location.pathname;
const isGuest = path.startsWith("/guest");
const isWorker = path.startsWith("/worker");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {isGuest ? <GuestApp /> : isWorker ? <WorkerApp /> : <App />}
  </StrictMode>
);
