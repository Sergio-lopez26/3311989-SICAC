import { useRef } from "react"; //capturar datos de forma limpia
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from '../assets/logo.png';
//import '../styles/stylesPreIngreso.css'; -> ya no hace falta, con el nombre de la clase, toma sus estilos
import * as bootstrap from 'bootstrap';

function Login(){

    const navegar = useNavigate();

    const emailRef = useRef();
    const passwordRef = useRef();

    const modalNoValido = () =>{
        const modalNV = document.getElementById('noValido');
        const modalExiste = bootstrap.Modal.getInstance(modalNV); // bootstrap=> En referencia al import (* as...)

        if(modalExiste){
            modalExiste.hide();
        }
    }
    
    const modalIngreso = () =>{
            const modalIng = document.getElementById('ingreso');
            const modalExiste = bootstrap.Modal.getInstance(modalIng);
    
            if(modalExiste){
                modalExiste.hide();
                navegar('/Usuarios');
            }
    
        }

    const validaContraseña = (e) =>{ //e => reemplaza a event
        e.preventDefault();
        const pass = passwordRef.current.value;
                
        if(pass.length < 8){
            const modalNV = document.getElementById('noValido');
            const modalBootstrap = new bootstrap.Modal(modalNV);
            modalBootstrap.show();
            
            passwordRef.current.style.border = "2px solid red";
            return;
        }
        else{
            const modalIng = document.getElementById('ingreso');
            const modalBootstrap = new bootstrap.Modal(modalIng);
            modalBootstrap.show();

            emailRef.current.value = "";
            passwordRef.current.value = "";
        }
    };

    return(
        <>
        <div className="cambio-page">
            <header>
                <img id="logo" src={logo} alt="Logo"/>
                <h1>Iniciar Sesión</h1>
                <h6>Por favor completar los campos con sus respectivos datos</h6>
            </header>

            <form id="formLogin" onSubmit={validaContraseña}> {/*en vez de action="" method="" */}
                <label htmlFor="email">Email 
                <input id="email" ref={emailRef} name="email" type="email" required />
                </label>
                <label htmlFor="password">Contraseña
                <input id="password" ref={passwordRef} name="password" type="password" placeholder="********" required />
                </label>

                <div className="d-flex w-100 gap-3 mt-4">
                    <button className="btn btn-primary flex-fill py-2" type="submit">Ingresar</button>
                    <button className="btn btn-light flex-fill py-2" type="button" onClick={() => navegar("/Registro")}>Registrarse</button>
                </div>

                <div className="enlace">
                    <Link to='/RecuperarPass'>¿Olvidó su contraseña?</Link>
                </div>
            </form>

            <div className="modal fade" id="noValido" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                    
                    <h4 className="text-warning fw-bold mb-3">¡Precaución!</h4>
                    
                    <p className="text-muted mb-4">Estimado Usuario. La contraseña debe tener mínimo 8 caractéres</p>
                    
                    <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarNC" style={{borderRadius: "12px"}} 
                    onClick={modalNoValido}>
                        Aceptar
                    </button>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="ingreso" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                                        
                        <h4 className="text-success fw-bold mb-3">¡Código Enviado!</h4>
                        
                        <p className="text-muted mb-4">¡Credenciales Validadas! <br /> Estimado Usuario. Usted ha ingresado al sistema exitosamente.</p>
                        
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarV" style={{borderRadius: "12px"}} 
                        onClick={modalIngreso}>
                            Continuar
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default Login