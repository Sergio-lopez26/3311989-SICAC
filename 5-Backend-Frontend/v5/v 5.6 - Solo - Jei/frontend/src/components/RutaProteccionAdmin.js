import React from "react";
import { useNavigate, Outlet } from "react-router-dom";

const RutaProteccionAdmin = () => {

    const navegar = useNavigate();

    const sesion = localStorage.getItem("usuario");
    const usuario = sesion ? JSON.parse(sesion) : null;

    //Si no se está logueado o no se es admin, saldra este apartado
    if (!usuario || (usuario.rol !== 'Administrador')) {
        return(
            <div className="container text-center mt-5">
                <h3 className="text-danger fw-bold">Acceso no autorizado</h3>
                <p className="text-muted">No cuenta con permisos para visualizar esta pagina.</p>
                <button className="btn btn-primary px-4 py-2 mt-2" style={{ borderRadius: "12px" }} onClick={() => navegar('/')}>
                    Ir al Login
                </button>
            </div>
        )
    }

    //Si todo está bien, "Outlet" permite que se cargue la página interna solicitada
    return <Outlet />;
}

export default RutaProteccionAdmin;