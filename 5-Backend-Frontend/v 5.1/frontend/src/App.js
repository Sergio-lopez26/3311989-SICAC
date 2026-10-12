import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//
import RegistroInicial from "./pages/Ingreso/RegistroInicial";
import RegistroPaciente from "./pages/Ingreso/RegistroPaciente";
import Login from "./pages/Ingreso/Login";
import RecuperarPassword from "./pages/Ingreso/RecuperarPassword";
import CambiarPassword from "./pages/Ingreso/CambiarPassword";
//
import RutaProteccionAdmin from "./components/RutaProteccionAdmin";
import MenuAdmin from "./pages/Menus/MenuAdmin";
import Paciente from "./pages/Pacientes/Pacientes";
import RegistroMedico from "./pages/Medicos/RegistroMedico";

function App() {
    return (
        <Router>
                <Routes>
                    <Route path="/Registro_Inicial" element={<RegistroInicial />} />
                    <Route path="/Registro_Paciente" element={<RegistroPaciente />} />
                    <Route path="/" element={<Login />} />
                    <Route path="/Recuperar_Password" element={<RecuperarPassword />} />
                    <Route path="/Cambiar_Password" element={<CambiarPassword />} />

                    {/* Ruta Protegida para el Administrador */}
                    <Route element={<RutaProteccionAdmin />}>
                        <Route path="/Menu_Administrador" element={<MenuAdmin />} />
                        <Route path="/Paciente" element={<Paciente />} />
                        <Route path="/Registro_Medico" element={<RegistroMedico />} />
                    </Route>
                </Routes>
        </Router>
    );
}

export default App;
