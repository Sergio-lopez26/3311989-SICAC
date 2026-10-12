import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import Navbar from "./components/Navbar";
import Registro from "./pages/Ingreso/Registro";
import Login from "./pages/Ingreso/Login";
import RecuperarPassword from "./pages/Ingreso/RecuperarPassword";
import CambiarPassword from "./pages/Ingreso/CambiarPassword";
import Usuario from "./pages/Usuarios/Usuario";

function App() {
    return (
        <Router>
            {/*<Navbar />*/}
                <Routes>
                    <Route path="/Registro" element={<Registro />} />
                    <Route path="/" element={<Login />} />
                    <Route path="/Recuperar_Password" element={<RecuperarPassword />} />
                    <Route path="/Cambiar_Password" element={<CambiarPassword />} />
                    <Route path="/Usuario" element={<Usuario />} />
                </Routes>
        </Router>
    );
}

export default App;
