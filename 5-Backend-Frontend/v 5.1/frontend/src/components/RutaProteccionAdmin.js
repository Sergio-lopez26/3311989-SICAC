import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const RutaProteccionAdmin = () => {
    const sesion = localStorage.getItem("usuario");
    const usuario = sesion ? JSON.parse(sesion) : null;

    //Si no se está logueado o no se es admin, se redirecciona al login automáticamente
    if (!usuario || (usuario.rol !== 'administrador')) {
        return <Navigate to="/" replace />;
    }

    //Si todo está bien, "Outlet" permite que se cargue la página interna solicitada
    return <Outlet />;
}

export default RutaProteccionAdmin;