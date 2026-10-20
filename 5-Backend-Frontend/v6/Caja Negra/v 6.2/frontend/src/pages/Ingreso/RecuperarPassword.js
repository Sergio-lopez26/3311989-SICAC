import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../../assets/Logo.png';
import * as bootstrap from 'bootstrap';

const API_URL = "http://localhost:5000/api/usuario/verifica_email";
const API_URL_VALIDAR = "http://localhost:5000/api/usuario/validar_codigo";

function RecuperarPassword(){

    const navegar = useNavigate();

    const emailRef = useRef();
    const codValRef = useRef();

    const [mostrarValida, setMostrarValida] = useState(false)
    const [emailBloq, setEmailBloq] = useState(false);
    const [emailGuardado, setEmailGuardado] = useState(""); //Guarda el email ya confirmado, para usarlo al validar el código y al navegar
    const [mensajeAdvertencia, setMensajeAdvertencia] = useState("Estimado Usuario. Por favor digitar el código de validación.");

    const correoValida = async (e) =>{
        e.preventDefault();

        const emailCapturado = emailRef.current.value;

        try{
            //Hacemos una petición para ver si el email existe en la BD (y de paso el backend genera y envía el código)
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: emailCapturado })
            });

            const data = await res.json();

             if (res.ok) {
                //Si el email existe, se bloque el input y mostramos el modal de validar
                setEmailGuardado(emailCapturado);
                setEmailBloq(true);
                const modalValida = document.getElementById('validar');
                let modalBootstrap = bootstrap.Modal.getInstance(modalValida) || new bootstrap.Modal(modalValida);
                modalBootstrap.show();
            }else {
                alert(`Error: ${data.error}`);
                if (emailRef.current) emailRef.current.value = "";
            }
        }catch (error) {
            console.error("Error al validar el correo:", error);
            alert("Hubo un error de conexión con el servidor.");
        }
    };

    const modalExito = () =>{
        const modalExito = document.getElementById('validar');
        const modalExiste = bootstrap.Modal.getInstance(modalExito);

        if (modalExiste){
            modalExiste.hide();
        }
        
        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';

        setMostrarValida(true);
    };

    const modalAdvertencia = () =>{
        const modalAdvertir = document.getElementById('advertir');
        const modalExiste = bootstrap.Modal.getInstance(modalAdvertir);

        if (modalExiste){
            modalExiste.hide();
        }

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';

    };

    const modalIngresa = () =>{
        const modalIngresar = document.getElementById('ingresar');
        const modalExiste = bootstrap.Modal.getInstance(modalIngresar);

        if (modalExiste){
            modalExiste.hide();
        }

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';

        //Se navega a Cambiar_Password llevando el email en el estado de la ruta, para poder identificar al usuario allá
        navegar('/Cambiar_Password', { state: { email: emailGuardado } });
    };

    const mostrarAdvertencia = (mensaje) =>{
        setMensajeAdvertencia(mensaje);
        const modalAdvertir = document.getElementById('advertir');
        let modalBootstrap = bootstrap.Modal.getInstance(modalAdvertir) || new bootstrap.Modal(modalAdvertir);
        modalBootstrap.show();
    };

    const validaCod = async () =>{
        const codigoCapturado = codValRef.current.value.trim(); //.trim() -> Sirve para eliminar los espacios vacios al inicio y al final

        if(!codigoCapturado){
            mostrarAdvertencia("Estimado Usuario. Por favor digitar el código de validación.");
            codValRef.current.style.border = "2px solid yellow";
            return;
        }

        try{
            //Se valida el código contra el backend (que compara con el que se guardó encriptado)
            const res = await fetch(API_URL_VALIDAR, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: emailGuardado, codigo: codigoCapturado })
            });

            const data = await res.json();

            if (res.ok) {
                const modalIngresar = document.getElementById('ingresar');
                let modalBootstrap = bootstrap.Modal.getInstance(modalIngresar) || new bootstrap.Modal(modalIngresar);
                modalBootstrap.show();
            } else {
                mostrarAdvertencia(data.error || "El código ingresado no es válido.");
                codValRef.current.style.border = "2px solid red";
                codValRef.current.value = "";
            }
        }catch(error){
            console.error("Error al validar el código:", error);
            mostrarAdvertencia("Hubo un error de conexión con el servidor.");
        }
    };

    const cancelar = () =>{
        setMostrarValida(false);
        setEmailBloq(false);
        if (emailRef.current) emailRef.current.value = "";
        if (codValRef.current) codValRef.current.value = "";
    };

    const regresar = () =>{
        cancelar();
        navegar("/");
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
                    <button className="btn btn-light" type="button" onClick={regresar}>Regresar</button>
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

            <div className="modal fade" id="validar" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
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
            <div className="modal fade" id="advertir" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                                        
                        <h4 className="text-warning fw-bold mb-3">¡Advertencia!</h4>
                        
                        <p className="text-muted mb-4">{mensajeAdvertencia}</p>
                        
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarV" style={{borderRadius: "12px"}} 
                        onClick={modalAdvertencia}>
                            Aceptar
                        </button>

                    </div>
                </div>
            </div>
            <div className="modal fade" id="ingresar" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
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

export default RecuperarPassword