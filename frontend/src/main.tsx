import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { UserProvider } from "./UserContext";
import "./index.css";
import { PrimeReactProvider } from "primereact/api";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <PrimeReactProvider>
    <UserProvider>
      <App />
      <Toaster />
    </UserProvider>
  </PrimeReactProvider>
  // </StrictMode>
);
