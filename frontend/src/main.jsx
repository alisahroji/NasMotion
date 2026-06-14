import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App";
import "./index.css";

// StrictMode dihapus — mencegah double render effect di development
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111520",
            border: "1px solid #1A2035",
            color: "#CDD5E4",
            fontFamily: "Barlow Semi Condensed, sans-serif",
            fontSize: "14px",
          },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);