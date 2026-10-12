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
import GestionarPacientes from "./pages/Pacientes/GestionarPacientes";
import RegistroMedico from "./pages/Medicos/RegistroMedico";
import GestionarMedicos from "./pages/Medicos/GestionarMedicos";
import GestionarTiposDocumento from "./pages/Usuarios/TipoDocumento";
import GestionarRoles from "./pages/Usuarios/Rol";
import GestionarRolUsuario from "./pages/Usuarios/RolUsuario";
// Imports para Administrador - Odontología
import GestionarMapaDental from "./pages/Administrador/GestionarMapaDental";
import OdontogramaAdmin from "./pages/Administrador/Odontograma";
import GestionarServicios from "./pages/Administrador/GestionarServicios";
import GestionarTipoServicio from "./pages/Administrador/GestionarTipoServicio"
//
import RutaProteccionMed from "./components/RutaProteccionMed";
import MenuMedico from "./pages/Menus/MenuMedico";
import PerfilMedico from "./pages/Medicos/PerfilMedico";
// Imports para Medico - Odontología
import GestionarMapaDentalMed from "./pages/Medicos/GestionarMapaDental";
import OdontogramaMedico from "./pages/Medicos/Odontograma";
import GestionarServiciosMed from "./pages/Medicos/GestionarServicios"
//
import RutaProteccionPacien from "./components/RutaProteccionPacien";
import MenuPaciente from "./pages/Menus/MenuPaciente";
import PerfilPaciente from "./pages/Pacientes/PerfilPaciente";
//El resto de pages para paciente

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
                        <Route path="/Gestionar_MapaDental" element={<GestionarMapaDental />} />
                        <Route path="/Administrador/Odontograma/:idMapa" element={<OdontogramaAdmin />} />
                        <Route path="/Gestionar_Servicios" element={<GestionarServicios />} />
                        <Route path="/Gestionar_TipoServicio" element={<GestionarTipoServicio />} />
                    </Route>

                    {/* Ruta Protegida para el Medico */}
                    <Route element={<RutaProteccionMed />}>
                        <Route path="/Menu_Medico" element={<MenuMedico />} />
                        <Route path="/Perfil_Medico" element={<PerfilMedico />} />
                        <Route path="/Medico_MapaDental" element={<GestionarMapaDentalMed />} />
                        <Route path="/Medico/Odontograma/:idMapa" element={<OdontogramaMedico />} />
                        <Route path="/Medico_Servicios" element={<GestionarServiciosMed />} />
                    </Route>

                    {/* Ruta Protegida para el Paciente */}
                    <Route element={<RutaProteccionPacien />}>
                        <Route path="/Menu_Paciente" element={<MenuPaciente />} />
                        <Route path="/Perfil_Paciente" element={<PerfilPaciente />} />
                    </Route>
                </Routes>
        </Router>
    );
}

export default App;
