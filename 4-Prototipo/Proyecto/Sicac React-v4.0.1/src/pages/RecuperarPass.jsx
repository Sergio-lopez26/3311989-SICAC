import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../assets/logo.png';
//import '../styles/stylesPreIngreso.css'; -> No hace falta, con la clase toma sus estilos
import * as bootstrap from 'bootstrap';

function RecuperarP(){

    const navegar = useNavigate();

    const emailRef = useRef();
    const codValRef = useRef();

    const [mostrarValida, setMostrarValida] = useState(false)
    const [emailBloq, setEmailBloq] = useState(false);

    const correoValida = (e) =>{
        e.preventDefault();
        setEmailBloq(true);

        const modalElemento = document.getElementById('validar');
        const modalBootstrap = new bootstrap.Modal(modalElemento);
        modalBootstrap.show();
    };

    const modalExito = () =>{
        const modalElemento = document.getElementById('validar');
        const modalExiste = bootstrap.Modal.getInstance(modalElemento);

        if (modalExiste){
            modalExiste.hide();
        }

        setMostrarValida(true);
    };

    const modalAdvertencia = () =>{
        const modalAdvertir = document.getElementById('advertir');
        const modalExiste = bootstrap.Modal.getInstance(modalAdvertir);

        if (modalExiste){
            modalExiste.hide();
        }

    };

    const modalIngresa = () =>{
        const modalIngresar = document.getElementById('ingresar');
        const modalExiste = bootstrap.Modal.getInstance(modalIngresar);

        if (modalExiste){
            modalExiste.hide();
            navegar('/CambiarPass');
        }
    };

    const validaCod = () =>{
        if(!codValRef.current.value.trim()){
            const modalAdvertir = document.getElementById('advertir');
            const modalBootstrap = new bootstrap.Modal(modalAdvertir);
            modalBootstrap.show()
            codValRef.current.style.border = "2px solid yellow";
            return;
        }

        const modalIngresar = document.getElementById('ingresar');
        const modalBootstrap = new bootstrap.Modal(modalIngresar);
        modalBootstrap.show()
    };

    const cancelar = () =>{
        setMostrarValida(false);
        setEmailBloq(false);
        if (emailRef.current) emailRef.current.value = "";
        if (codValRef.current) codValRef.current.value = "";
    };

    return(
        <>
        <div className="cambio-page">
            <header>
                <img id="logo" src={logo} alt="Logo"/>
                <h1>Recuperación de Contraseña</h1>
            </header>
            
            <form id="formCorreo" onSubmit={correoValida}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label d-block mb-3">Digite su Correo/Email</label>
                    <input type="email" name="email" id="email" ref={emailRef} className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} 
                    readOnly={emailBloq} required />
                </div>

                <div className="d-flex justify-content-end mt-3">
                    <button id="btnEnviar" type="submit" className="btn btn-primary" style={{ borderRadius: "12px", padding: "8px 20px" }} 
                    disabled={emailBloq}>{emailBloq ? "Código Enviado" : "Enviar Código"}</button>
                </div>
            </form>

            {mostrarValida && (
            <form id="formValida" onSubmit={(e) => e.preventDefault()}>
                <div id="Validacion" className="mb-3" >
                    <p>
                    Al correo ingresado le será entregado un código de validación, el cual deberá digitar a continuación
                    </p>

                    <label htmlFor="cod" className="form-label d-block mb-3">Código de Validación</label>
                    <input type="number" name="cod" id="cod" ref={codValRef} className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} required/>

                    <div className="d-flex w-100 gap-3 mt-4">
                        <button id="btnValidar" type="button" className="btn btn-success flex-fill py-2" onClick={validaCod}>Validar Código</button>
                        <button id="btnCancelar" type="button" className="btn btn-secondary flex-fill py-2" onClick={cancelar}>Cancelar</button>
                    </div>
                </div>
            </form>
            )}

            <div className="modal fade" id="validar" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                                        
                        <h4 className="text-success fw-bold mb-3">¡Código Enviado!</h4>
                        
                        <p className="text-muted mb-4">Estimado Usuario. Por favor revisar su bandeja de entrada. Hemos enviado un código de validación.</p>
                        
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarV" style={{borderRadius: "12px"}} 
                        onClick={modalExito}>
                            Aceptar
                        </button>

                    </div>
                </div>
            </div>
            <div className="modal fade" id="advertir" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                                        
                        <h4 className="text-warning fw-bold mb-3">¡Advertencia!</h4>
                        
                        <p className="text-muted mb-4">Estimado Usuario. Por favor digitar el código de validación.</p>
                        
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarV" style={{borderRadius: "12px"}} 
                        onClick={modalAdvertencia}>
                            Aceptar
                        </button>

                    </div>
                </div>
            </div>
            <div className="modal fade" id="ingresar" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                                        
                        <h4 className="text-success fw-bold mb-3">!Validado!</h4>
                        
                        <p className="text-muted mb-4">Estimado Usuario. El Código ha sido validado correctamente.</p>
                        
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarV" style={{borderRadius: "12px"}} 
                        onClick={modalIngresa}>
                            Continuar
                        </button>

                    </div>
                </div>
            </div>
        </div>
    </>
    );
}

export default RecuperarP