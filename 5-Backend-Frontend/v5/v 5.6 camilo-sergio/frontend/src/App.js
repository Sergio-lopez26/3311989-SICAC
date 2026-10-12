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
import GestionarRolUsuario from "./pages/Usuarios/RolUsuario"
import GestionarCitas from "./pages/Citas/GestionarCitas";
import MetodoPago from "./pages/Citas/MetodoPago";
import AgendarCitas from "./pages/Citas/AgendarCita";
import AgendaMedico from "./pages/Citas/AgendaMedico";
import TipoCita from "./pages/Citas/TipoCita";
//
import RutaProteccionMed from "./components/RutaProteccionMed";
import MenuMedico from "./pages/Menus/MenuMedico";
import PerfilMedico from "./pages/Medicos/PerfilMedico";
import HistorialMedico from "./pages/Medicos/HistorialMedico";
import GestionarAntecendentes from "./pages/Medicos/GestionarAntecendentes";
//El resto de pages para medico
//
import RutaProteccionPacien from "./components/RutaProteccionPacien";
import MenuPaciente from "./pages/Menus/MenuPaciente";
import PerfilPaciente from "./pages/Pacientes/PerfilPaciente";
import VerHistorial from "./pages/Pacientes/VerHistorial";
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
                        <Route path="/Gestionar_Citas" element={<GestionarCitas />} />
                        <Route path="/Metodo_Pago" element={<MetodoPago />} />
                        <Route path="/Agendar_Citas" element={<AgendarCitas />} />
                        <Route path="/Agenda_Medico" element={<AgendaMedico />} />
                        <Route path="/Tipo_Cita" element={<TipoCita />} />
                    </Route>

                    {/* Ruta Protegida para el Medico */}
                    <Route element={<RutaProteccionMed />}>
                        <Route path="/Menu_Medico" element={<MenuMedico />} />
                        <Route path="/Perfil_Medico" element={<PerfilMedico />} />
                        <Route path="/Historial_Medico" element={<HistorialMedico />} />
                        <Route path="/Gestionar_Antecedentes" element={<GestionarAntecendentes />} />
                    </Route>

                    {/* Ruta Protegida para el Paciente */}
                    <Route element={<RutaProteccionPacien />}>
                        <Route path="/Menu_Paciente" element={<MenuPaciente />} />
                        <Route path="/Perfil_Paciente" element={<PerfilPaciente />} />
                        <Route path="/Ver_Historial" element={<VerHistorial />} />
                    </Route>
                </Routes>
        </Router>
    );
}

export default App;
