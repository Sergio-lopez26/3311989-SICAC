import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from '../assets/Logo.png';
import * as bootstrap from 'bootstrap';

function NavbarAdmin(){
    //Se inicializa el hook de navegación
    const navegar = useNavigate();

    //Este estado es para controlar todo el Navbar, sin usar un estado para cada menu que tengamos
    const [menuActivo, setMenuActivo] = useState({
        pacientes: false,
        medicos: false,
        usuarios: false,
        servicios: false,
        citasPagos: false
    });

    //El unico toggle
    const toggleMenu = (e, nombreMenu) => {
        e.preventDefault();
        setMenuActivo(estadoAnterior => ({
            pacientes: false,
            medicos: false,
            usuarios: false,
            servicios: false,
            citasPagos: false,
            [nombreMenu]: !estadoAnterior[nombreMenu] //Con esto se invierte el estado a true del menu seleccionado
        }));
    };

    //Para cerrar los dropdowns
    const cerrarMenus = () => {
        setMenuActivo({
            pacientes: false,
            medicos: false,
            usuarios: false,
            servicios: false,
            citasPagos: false
        });
    };

    /*
    const togglePacientes = (e) => {
        e.preventDefault();
        setMenuPacientes(!menuPacientes);
        setMenuMedicos(false);
        setMenuTipoDocumento(false);
        setMenuRol(false);
    };

    const toggleMedicos = (e) => {
        e.preventDefault();
        setMenuMedicos(!menuMedicos);
        setMenuPacientes(false);
        setMenuTipoDocumento(false);
        setMenuRol(false);
    };

    const toggleTipoDocumento = (e) => {
        e.preventDefault();
        setMenuTipoDocumento(!menuTipoDocumento);
        setMenuPacientes(false);
        setMenuMedicos(false);
        setMenuRol(false);
    };

    const toggleRol = (e) => {
        e.preventDefault();
        setMenuRol(!menuTipoDocumento);
        setMenuPacientes(false);
        setMenuMedicos(false);
        setMenuTipoDocumento(false);
    };
    */

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
                            <a className={`nav-link dropdown-toggle ${menuActivo.pacientes ? 'active show' : ''}`} href="#" onClick={(e) => toggleMenu(e, 'pacientes')}>
                                Pacientes
                            </a>
                            <ul className={`dropdown-menu text-center text-lg-start z-3 ${menuActivo.pacientes ? 'show' : ''}`}> 
                                <li>
                                    <Link to='/Gestionar_Pacientes' className="dropdown-item" onClick={cerrarMenus}>Gestionar Pacientes</Link>
                                </li>
                            </ul>
                        </li>

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
                            <a className={`nav-link dropdown-toggle ${menuActivo.usuarios ? 'active show' : ''}`} href="#" onClick={(e) => toggleMenu(e, 'usuarios')}>
                                Usuarios
                            </a>
                            <ul className={`dropdown-menu text-center text-lg-start z-3 ${menuActivo.usuarios ? 'show' : ''}`}> 
                                <li>
                                    <Link to='/Gestionar_TiposDocumento' className="dropdown-item" onClick={cerrarMenus}>Gestionar Tipos de Documento</Link>
                                </li>
                                <li>
                                    <Link to='/Gestionar_Roles' className="dropdown-item" onClick={cerrarMenus}>Gestionar Roles</Link>
                                </li>
                                <li>
                                    <Link to='/Gestionar_RolUsuario' className="dropdown-item" onClick={cerrarMenus}>Gestionar Rol de Usuario</Link>
                                </li>
                            </ul>
                        </li>

                        <li className="nav-item dropdown">
                            <a className={`nav-link dropdown-toggle ${menuActivo.servicios ? 'active show' : ''}`} href="#" onClick={(e) => toggleMenu(e, 'servicios')}>
                                Odontología y Servicios
                            </a>
                            <ul className={`dropdown-menu text-center text-lg-start z-3 ${menuActivo.servicios ? 'show' : ''}`}>
                                <li><Link to='/Gestionar_MapaDental' className="dropdown-item" onClick={cerrarMenus}>Gestionar Mapas Dentales</Link></li>
                                <li><Link to='/Gestionar_Servicios' className="dropdown-item" onClick={cerrarMenus}>Gestionar Servicios</Link></li>
                                <li><Link to='/Gestionar_TipoServicio' className="dropdown-item" onClick={cerrarMenus}>Gestionar Tipos de Servicio</Link></li>
                            </ul>
                        </li>
                        <li className="nav-item dropdown">
                            <a className={`nav-link dropdown-toggle ${menuActivo.citasPagos ? 'active show' : ''}`} href="#" onClick={(e) => toggleMenu(e, 'citasPagos')}>
                                Citas y Pagos
                            </a>
                            <ul className={`dropdown-menu text-center text-lg-start z-3 ${menuActivo.citasPagos ? 'show' : ''}`}> 
                                <li>
                                    <Link to='/Gestionar_Citas' className="dropdown-item" onClick={cerrarMenus}>Gestionar Citas y pagos</Link>
                                </li>
                                <li>
                                    <Link to='/Tipo_Cita' className="dropdown-item" onClick={cerrarMenus}>Gestionar Tipos de Cita</Link>
                                </li>
                                <li>
                                    <Link to='/Metodo_Pago' className="dropdown-item" onClick={cerrarMenus}>Gestionar Métodos de pago</Link>
                                </li>
                            </ul>
                        </li>
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

export default NavbarAdmin