import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from '../assets/logo.png';
import * as bootstrap from 'bootstrap';

function Nav(){
    //Se inicializa el hook de navegación
    const navegar = useNavigate();

    const [menuPacientes, setMenuPacientes] = useState(false);
    const [menuOdontologos, setMenuOdontologos] = useState(false);

    const togglePacientes = (e) => {
        e.preventDefault();
        setMenuPacientes(!menuPacientes);
        setMenuOdontologos(false);
    };
    const toggleOdontologos = (e) => {
        e.preventDefault();
        setMenuOdontologos(!menuOdontologos);
        setMenuPacientes(false);
    };

    const Hamburguesa = () =>{
        const menu= document.getElementById('plegable');
        let menuBootstrap = bootstrap.Collapse.getInstance(menu);
        
        if(!menuBootstrap){
            menuBootstrap = new bootstrap.Collapse(menu, {toggle: false});
        }
        menuBootstrap.toggle();
        setMenuPacientes(false);
        setMenuOdontologos(false);
    };

    const confirmar = (e) =>{
        e.preventDefault();
        const modalCerrar = document.getElementById('cSesion');
        const modalBootstrap = new bootstrap.Modal(modalCerrar);
        modalBootstrap.show();
    };

    //const => funcion adaptada a React
    const modalSalir = () =>{
        const modalCerrar = document.getElementById('cSesion');
        const modalExiste = bootstrap.Modal.getInstance(modalCerrar);

        if(modalExiste){
            modalExiste.hide();
        }

        setTimeout(() =>{ // Espera 300ms para que cierre el modal y se navegue a Login
            navegar('/Login')
        }, 300);
    }

    const modalNo = () =>{
        const modalCerrar = document.getElementById('cSesion');
        const modalExiste = bootstrap.Modal.getInstance(modalCerrar);

        if(modalExiste){
            modalExiste.hide();
        }
    };

    const cerrarMenus = () => {
        setMenuPacientes(false);
        setMenuOdontologos(false);
    };

    return(
        <>
        <nav className="navbar navbar-expand-lg bg-primary navbar-dark h-lg-60" style={{ minHeight: "60px" }}>
            <div className="container-fluid h-100">
                
                <div className="navbar-brand d-flex align-items-center m-8">
                    <img id="logo" src={logo} alt="logo" style={{ maxHeight: "50px", marginRight: "10px" }}/>
                    <span className="fw-bold">SICAC</span>
                </div>

                {/*Botón Hamburguesa*/}
                <button className="navbar-toggler" type="button" aria-controls="plegable" aria-expanded="false" aria-label="Toggle navigation" 
                onClick={Hamburguesa}>
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse text-center" id="plegable">

                    <ul className="navbar-nav me-lg-auto mb-3 mb-lg-0 w-100 w-lg-auto">
                        <li className="nav-item">
                            <Link to='/Usuarios' className="nav-link" onClick={cerrarMenus}>Usuarios</Link>
                        </li>

                        <li className="nav-item dropdown">
                            <a className={`nav-link dropdown-toggle ${menuPacientes ? 'active show' : ''}`} href="#" onClick={togglePacientes}>
                                Pacientes
                            </a>
                            <ul className={`dropdown-menu text-center text-lg-start z-3 ${menuPacientes ? 'show' : ''}`}> 
                                <li>
                                    <Link to='/Pacientes' className="dropdown-item" onClick={cerrarMenus}>Gestionar Pacientes</Link>
                                </li>
                                <li>
                                    <Link to='/RegistrarPaciente' className="dropdown-item" onClick={cerrarMenus}>Registrar Paciente</Link>
                                </li>
                            </ul>
                        </li>

                        <li className="nav-item dropdown">
                            <a className={`nav-link dropdown-toggle ${menuOdontologos ? 'active show' : ''}`} href="#" onClick={toggleOdontologos}>
                                Odontologos
                            </a>
                            <ul className={`dropdown-menu text-center text-lg-start z-3 ${menuOdontologos ? 'show' : ''}`}> 
                                <li>
                                    <Link to='/Odontologos' className="dropdown-item" onClick={cerrarMenus}>Gestionar Odontólogos</Link>
                                </li>
                                <li>
                                    <Link to='/RegistrarOdontologo' className="dropdown-item" onClick={cerrarMenus}>Registrar Odontólogo</Link>
                                </li>
                            </ul>
                        </li>

                        <li className="nav-item">
                            <Link to='/GestionarAcceso' className="nav-link" onClick={cerrarMenus}>Gestionar Acceso</Link>
                        </li>
                    </ul>
                
                {/*<form className="d-flex mb-3 mb-lg-0 justify-content-center align-items-center">
                    <input className="form-control me-2" type="search" placeholder="Buscar" style={{ backgroundColor: "rgb(248, 248, 250)", height: "38px", width: "180px" }} readOnly/>
                    <button className="btn btn-secondary text-nowrap" type="button" style={{ height: "38px", display: "flex", alignItems: "center" }}>Buscar</button>
                </form> -> Por ahora no está en uso*/}

                <button className="btn btn-primary my-2 mx-2 text-nowrap border-light" style={{ height: "38px", display: "inline-flex", alignItems: "center" }} 
                onClick={confirmar}>
                    Cerrar Sesión
                </button>

                </div>
            </div>
        </nav>

        <div className="modal fade" id="cSesion" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                
                    <h4 className="text-danger fw-bold mb-3">¡Cerrar Sesión!</h4>
                    
                    <p className="text-muted mb-4">Estimado Usuario. ¿Desea cerrar sesión?</p>
                    
                    <div className="d-flex w-100 gap-3 mt-4">
                        <button type="button" className="btn btn-danger w-50 py-2" id="btnSalir" style={{borderRadius: "12px"}} 
                        onClick={modalSalir}>
                            Sí
                        </button>
                        <button type="button" className="btn btn-primary w-50 py-2" id="btnCerrar" style={{borderRadius: "12px"}} 
                        onClick={modalNo}>
                            No
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default Nav