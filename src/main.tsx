import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Pass the main content (your routes) as children to the App component */}
      <App>
        {/* All your routes will go here, inside the App component */}
        {/* e.g., <Routes>...</Routes> */}
      </App>
    </BrowserRouter>
  </React.StrictMode>
);
