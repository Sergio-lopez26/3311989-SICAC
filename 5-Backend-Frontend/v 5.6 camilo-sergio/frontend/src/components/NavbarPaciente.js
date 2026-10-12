import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from '../assets/Logo.png';
import * as bootstrap from 'bootstrap';

function NavbarPaciente(){
    //Se inicializa el hook de navegación
    const navegar = useNavigate();

    //Este estado es para controlar todo el Navbar, sin usar un estado para cada menu que tengamos
    const [menuActivo, setMenuActivo] = useState({
        perfil: false
        //Acá colocan mas en ese formato, pero poniendole "," despues de cada false, salvo el último
    });

    //El unico toggle
    const toggleMenu = (e, nombreMenu) => {
        e.preventDefault();
        setMenuActivo(estadoAnterior => ({
            perfil: false,
            historial: false,
            //Acá colocan mas en ese formato, pero poniendole "," despues de cada false
            [nombreMenu]: !estadoAnterior[nombreMenu] //Con esto se invierte el estado a true del menu seleccionado
        }));
    };

    //Para cerrar los dropdowns
    const cerrarMenus = () => {
        setMenuActivo({
            perfil: false,
            historial: false
        //Acá colocan mas en ese formato, pero poniendole "," despues de cada false, salvo el último
        });
    };

    const Hamburguesa = () =>{
        const menu= document.getElementById('plegable');
        let menuBootstrap = bootstrap.Collapse.getInstance(menu);
        
        if(!menuBootstrap){
            menuBootstrap = new bootstrap.Collapse(menu, {toggle: false});
        }

        menuBootstrap.toggle();
        cerrarMenus();
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
            document.querySelector('.modal-backdrop')?.remove();
            document.body.style.overflow = ''; //Se evitan posibles bloqueos por el modal

            localStorage.removeItem("usuario"); //Con esto se borra los datos del logueo en el navegador (localstorage)

            navegar('/')
        }, 300);
    }

    const modalPermanece = () =>{
        const modalCerrar = document.getElementById('cSesion');
        const modalExiste = bootstrap.Modal.getInstance(modalCerrar);

        if(modalExiste){
            modalExiste.hide();
        }
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
                        <li className="nav-item dropdown">
                            <a className={`nav-link dropdown-toggle ${menuActivo.perfil ? 'active show' : ''}`} href="#" onClick={(e) => toggleMenu(e, 'perfil')}>
                                Perfil
                            </a>
                            <ul className={`dropdown-menu text-center text-lg-start z-3 ${menuActivo.perfil ? 'show' : ''}`}> 
                                <li>
                                    <Link to='/Perfil_Paciente' className="dropdown-item" onClick={cerrarMenus}>Gestionar Mi Perfil</Link>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item dropdown">
                            <a className={`nav-link dropdown-toggle ${menuActivo.historial ? 'active show' : ''}`} href="#" onClick={(e) => toggleMenu(e, 'historial')}>
                                Historial
                            </a>
                            <ul className={`dropdown-menu text-center text-lg-start z-3 ${menuActivo.historial ? 'show' : ''}`}> 
                                <li>
                                    <Link to='/Ver_Historial' className="dropdown-item" onClick={cerrarMenus}>Ver Historial</Link>
                                </li>
                            </ul>
                        </li>
                        {/* Seguir estructura
                        <li className="nav-item dropdown">
                            <a className={`nav-link dropdown-toggle ${menuActivo.medicos ? 'active show' : ''}`} href="#" onClick={(e) => toggleMenu(e, 'medicos')}>
                                Médicos
                            </a>
                            <ul className={`dropdown-menu text-center text-lg-start z-3 ${menuActivo.medicos ? 'show' : ''}`}> 
                                <li>
                                    <Link to='/Registro_Medico' className="dropdown-item" onClick={cerrarMenus}>Registrar Médico</Link>
                                </li>
                                <li>
                                    <Link to='/Gestionar_Medicos' className="dropdown-item" onClick={cerrarMenus}>Gestionar Médicos</Link>
                                </li>
                            </ul>
                        </li>

                        <li className="nav-item dropdown">
                            <a className={`nav-link dropdown-toggle ${menuActivo.tiposDocumento ? 'active show' : ''}`} href="#" onClick={(e) => toggleMenu(e, 'tiposDocumento')}>
                                Tipos de Documento
                            </a>
                            <ul className={`dropdown-menu text-center text-lg-start z-3 ${menuActivo.tiposDocumento ? 'show' : ''}`}> 
                                <li>
                                    <Link to='/Gestionar_TiposDocumento' className="dropdown-item" onClick={cerrarMenus}>Gestionar Tipo de Documento</Link>
                                </li>
                            </ul>
                        </li>

                        <li className="nav-item dropdown">
                            <a className={`nav-link dropdown-toggle ${menuActivo.roles ? 'active show' : ''}`} href="#" onClick={(e) => toggleMenu(e, 'roles')}>
                                Roles
                            </a>
                            <ul className={`dropdown-menu text-center text-lg-start z-3 ${menuActivo.roles ? 'show' : ''}`}> 
                                <li>
                                    <Link to='/Gestionar_Roles' className="dropdown-item" onClick={cerrarMenus}>Gestionar Roles</Link>
                                </li>
                            </ul>
                        </li>

                        <li className="nav-item dropdown">
                            <a className={`nav-link dropdown-toggle ${menuActivo.rolUsuario ? 'active show' : ''}`} href="#" onClick={(e) => toggleMenu(e, 'rolUsuario')}>
                                Rol de Usuario
                            </a>
                            <ul className={`dropdown-menu text-center text-lg-start z-3 ${menuActivo.rolUsuario ? 'show' : ''}`}> 
                                <li>
                                    <Link to='/Gestionar_RolUsuario' className="dropdown-item" onClick={cerrarMenus}>Gestionar Rol de Usuario</Link>
                                </li>
                            </ul>
                        </li>*/}
                    </ul>

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
                        onClick={modalPermanece}>
                            No
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default NavbarPaciente