import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import GuestApp from "./GuestApp.jsx";

const isGuest = window.location.pathname.startsWith("/guest");

createRoot(document.getElementById("root")).render(
  <StrictMode>{isGuest ? <GuestApp /> : <App />}</StrictMode>
);
