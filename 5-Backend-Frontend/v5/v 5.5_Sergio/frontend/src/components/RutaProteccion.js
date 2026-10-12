import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Componente genérico de protección de rutas: recibe la lista de roles permitidos
// Ejemplo de uso: <RutaProteccion rolesPermitidos={['paciente']} />
const RutaProteccion = ({ rolesPermitidos }) => {
    const sesion = localStorage.getItem("usuario");
    const usuario = sesion ? JSON.parse(sesion) : null;

    if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RutaProteccion;
