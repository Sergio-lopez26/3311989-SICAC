import { Link, useNavigate } from "react-router-dom";
import logo from '../assets/Logo.png';
import * as bootstrap from 'bootstrap';

function NavbarMedico(){
    const navegar = useNavigate();

    const confirmar = (e) => {
        e.preventDefault();
        const modalCerrar = document.getElementById('cSesion');
        const modalBootstrap = new bootstrap.Modal(modalCerrar);
        modalBootstrap.show();
    };

    const modalSalir = () => {
        const modalCerrar = document.getElementById('cSesion');
        const modalExiste = bootstrap.Modal.getInstance(modalCerrar);
        if (modalExiste) modalExiste.hide();

        setTimeout(() => {
            document.querySelector('.modal-backdrop')?.remove();
            document.body.style.overflow = '';
            localStorage.removeItem("usuario");
            navegar('/');
        }, 300);
    };

    const modalPermanece = () => {
        const modalCerrar = document.getElementById('cSesion');
        const modalExiste = bootstrap.Modal.getInstance(modalCerrar);
        if (modalExiste) modalExiste.hide();
    };

    return(
        <>
        <nav className="navbar navbar-expand-lg bg-primary navbar-dark h-lg-60" style={{ minHeight: "60px" }}>
            <div className="container-fluid h-100">
                <div className="navbar-brand d-flex align-items-center m-8">
                    <img id="logo" src={logo} alt="logo" style={{ maxHeight: "50px", marginRight: "10px" }}/>
                    <span className="fw-bold">SICAC</span>
                </div>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#plegableMedico" aria-controls="plegableMedico" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse text-center" id="plegableMedico">
                    <ul className="navbar-nav me-lg-auto mb-3 mb-lg-0 w-100 w-lg-auto">
                        <li className="nav-item">
                            <Link to='/Menu_Odontologo' className="nav-link">Inicio</Link>
                        </li>
                        <li className="nav-item">
                            <Link to='/Mi_Agenda' className="nav-link">Mi Agenda</Link>
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
                        <button type="button" className="btn btn-danger w-50 py-2" style={{borderRadius: "12px"}} onClick={modalSalir}>Sí</button>
                        <button type="button" className="btn btn-primary w-50 py-2" style={{borderRadius: "12px"}} onClick={modalPermanece}>No</button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default NavbarMedico;
