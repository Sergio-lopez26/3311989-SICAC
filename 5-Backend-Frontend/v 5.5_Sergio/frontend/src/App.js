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
import RutaProteccion from "./components/RutaProteccion";
import MenuAdmin from "./pages/Menus/MenuAdmin";
import MenuPaciente from "./pages/Menus/MenuPaciente";
import MenuOdontologo from "./pages/Menus/MenuOdontologo";
import GestionarPacientes from "./pages/Pacientes/GestionarPacientes";
import RegistroMedico from "./pages/Medicos/RegistroMedico";
import GestionarMedicos from "./pages/Medicos/GestionarMedicos";
import GestionarTiposDocumento from "./pages/Usuarios/TipoDocumento";
import GestionarRoles from "./pages/Usuarios/Rol";
import GestionarRolUsuario from "./pages/Usuarios/RolUsuario"
import GestionarCitas from "./pages/Citas/GestionarCitas";
import GestionarTiposCita from "./pages/Citas/TipoCita";
import GestionarMetodosPago from "./pages/Citas/MetodoPago";
import AgendarCita from "./pages/Citas/AgendarCita";
import AgendaMedico from "./pages/Citas/AgendaMedico";

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
                        <Route path="/Gestionar_Pacientes" element={<GestionarPacientes />} />
                        <Route path="/Registro_Medico" element={<RegistroMedico />} />
                        <Route path="/Gestionar_Medicos" element={<GestionarMedicos />} />
                        <Route path="/Gestionar_TiposDocumento" element={<GestionarTiposDocumento />} />
                        <Route path="/Gestionar_Roles" element={<GestionarRoles />} />
                        <Route path="/Gestionar_RolUsuario" element={<GestionarRolUsuario />} />
                        <Route path="/Gestionar_Citas" element={<GestionarCitas />} />
                        <Route path="/Gestionar_TiposCita" element={<GestionarTiposCita />} />
                        <Route path="/Gestionar_MetodosPago" element={<GestionarMetodosPago />} />
                    </Route>

                    {/* Ruta Protegida para el Paciente */}
                    <Route element={<RutaProteccion rolesPermitidos={['paciente']} />}>
                        <Route path="/Menu_Paciente" element={<MenuPaciente />} />
                        <Route path="/Mis_Citas" element={<AgendarCita />} />
                    </Route>

                    {/* Ruta Protegida para el Médico/Odontólogo */}
                    <Route element={<RutaProteccion rolesPermitidos={['medico']} />}>
                        <Route path="/Menu_Odontologo" element={<MenuOdontologo />} />
                        <Route path="/Mi_Agenda" element={<AgendaMedico />} />
                    </Route>
                </Routes>
        </Router>
    );
}

export default App;
