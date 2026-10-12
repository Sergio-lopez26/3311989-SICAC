import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import '../../styles/stylesPreIngreso.css';
import logo from '../../assets/Logo.png';
import * as bootstrap from 'bootstrap';

const API_URL = "http://localhost:5000/api/usuario";

function RegistroInicial(){

    const navegar = useNavigate();
    const passwordRef = useRef();
    const validaPassRef = useRef();

    //Referencia oculta para guardar el id que nos devuelva el Backend respecto a esta tabla usuario
    const idUsuarioRef = useRef(null);

    const modalPrecaucion = () => {
        const modalPrec = document.getElementById('precaucion');
        const modalExiste = bootstrap.Modal.getInstance(modalPrec);
        if(modalExiste) modalExiste.hide();

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';  //Borra el fondo negro si se queda pegado o se bloquea la pagina
    };

    const modalNoCoincide = () => {
        const modalNC = document.getElementById('noCoincide');
        const modalExiste = bootstrap.Modal.getInstance(modalNC);
        if(modalExiste) modalExiste.hide();

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = ''; 
    };

    const modalRegistro = () => {
        const modalReg = document.getElementById('registro');
        const modalExiste = bootstrap.Modal.getInstance(modalReg);

        if(modalExiste){
            modalExiste.hide();

            document.querySelector('.modal-backdrop')?.remove();
            document.body.style.overflow = ''; 

            const emailCapturado = document.getElementById('email').value;
            const passwordCapturado = passwordRef.current.value;

            navegar('/Registro_Paciente', {
                //Con lo siguiente, el id que guardamos lo pasamos a través del state quedando en posición [1]
                state: {
                    id_usuario: idUsuarioRef.current,
                    email: emailCapturado,
                    password: passwordCapturado
                }
            });
        }
    };

    const modalContinua = () => {
        const ModalCont = document.getElementById('registroIncompleto');
        const modalExiste = bootstrap.Modal.getInstance(ModalCont);
        if (modalExiste) modalExiste.hide();

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';

        const emailCapturado = document.getElementById('email').value;

        //Nos dirigimos al formulario de RegistroPaciente heredando los datos rescatados
        navegar('/Registro_Paciente', {
            state: {
                id_usuario: idUsuarioRef.current,
                email: emailCapturado,
                password: "********" // Para no mostrar el pass, ya que estará encriptado
            }
        });
    };

    const modalRechaza = () => {
        const ModalRechaza = document.getElementById('registroIncompleto');
        const modalExiste = bootstrap.Modal.getInstance(ModalRechaza);
        if (modalExiste) modalExiste.hide();

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';

        document.getElementById('formRegistro').reset();
        idUsuarioRef.current = null;
    };

    const Registrarse = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        const formData = new FormData(form); //Empaqueta los campos con name que estan en el form
        const datosCompletos = Object.fromEntries(formData.entries());
        
        const pass = passwordRef.current.value;
        const valida = validaPassRef.current.value;
        
        passwordRef.current.style.border = "";
        validaPassRef.current.style.border = "";

        //Validaciones respecto a password
        if(pass.length < 8){
            const modalPrec = document.getElementById('precaucion');
            let modalBootstrap = bootstrap.Modal.getInstance(modalPrec) || new bootstrap.Modal(modalPrec);
            modalBootstrap.show();

            passwordRef.current.style.border = "2px solid red";
            return; 
        }

        if(pass !== valida){
            const modalNC = document.getElementById('noCoincide');
            let modalBootstrap = bootstrap.Modal.getInstance(modalNC) || new bootstrap.Modal(modalNC);
            modalBootstrap.show();

            passwordRef.current.value = "";
            validaPassRef.current.value = "";
            passwordRef.current.style.border = "2px solid yellow";
            validaPassRef.current.style.border = "2px solid yellow";
            return; 
        }
        //
        //Con esto se evita enviar la confirmación de password al backend
        const datosUsuario = {
            email: datosCompletos.email,
            password: datosCompletos.password
        };
                
        try{
            //Cuando se va a agregar un nuevo registro
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosUsuario) //Con esta línea, se envian los datos capturados
            });

            const data = await res.json(); //Acá se lee la respuesta desde el express

            //Si el usuario ya existe, con enfasis en el email
            if (data && data.registroIncompleto) {
                idUsuarioRef.current = data.usuario.id;
                document.getElementById('email').value = data.usuario.email; 

                const modalRecupera = document.getElementById('registroIncompleto');
                let modalBootstrap = bootstrap.Modal.getInstance(modalRecupera) || new bootstrap.Modal(modalRecupera);
                modalBootstrap.show();
                return; //Rompe el flujo
            }

            //Si esta bien todo, es decir no existe un usuario con ese email registrado
            if(res.ok){
                //Guardamos el id que nos devolvió el backend
                idUsuarioRef.current = data.usuario.id;

                const modalReg = document.getElementById('registro');
                let modalBootstrap = bootstrap.Modal.getInstance(modalReg) || new bootstrap.Modal(modalReg);
                modalBootstrap.show();

            }else{
                alert(`Error: ${data.error}`); //Este mensaje nos muestra el error exacto que nos envie el backend
                document.getElementById('formRegistro').reset();
                passwordRef.current.style.border = "";
                validaPassRef.current.style.border = "";
                idUsuarioRef.current = null;
            }
        } catch (error) {
            console.error("Error al registrar el usuario:", error);
            alert("Hubo un error de conexión con el servidor.");
        }
    };

    const cancelar = () => {
        document.getElementById('formRegistro').reset();
        passwordRef.current.style.border = "";
        validaPassRef.current.style.border = "";
        idUsuarioRef.current = null;
    };

    return(
        <>
        <div className="cambio-page">
            <header>
                <img id="logo" src={logo} alt="Logo"/>
                <h1>Registro de Usuarios</h1>
                <h6>Por favor completar los campos con sus respectivos datos</h6>
            </header>

            <form id="formRegistro" onSubmit={Registrarse}>           
                <label htmlFor="email">Email</label>
                <input type="email" name="email" id="email" className="form-control" required />

                <label htmlFor="password">Contraseña</label>
                <input id="password" ref={passwordRef} name="password" type="password" placeholder="********" className="form-control" required />

                <label htmlFor="confirmarPassword">Confirmar Contraseña</label>
                <input id="confirmarPassword" ref={validaPassRef} name="confirmarPassword" type="password" placeholder="********" className="form-control" required />

                <div className="d-flex w-100 gap-3 mt-4">
                    <button className="btn btn-primary flex-fill py-2" type="submit" >Registrarse</button>
                    <button className="btn btn-secondary flex-fill py-2" type="button" onClick={cancelar}>Cancelar</button>
                </div>
                <div className="enlace">
                    <Link to='/'>¿Ya tienes cuenta?</Link>
                </div>
            </form>

            {/* Modales con Bootstrap */}
            <div className="modal fade" id="precaucion" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static"> {/*data-bs-backdrop="static" -> Con esto se evita que al hacer clic fuera, se cierre el modal */}
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                        <h4 className="text-danger fw-bold mb-3">¡Precaución!</h4>
                        <p className="text-muted mb-4">Estimado Usuario. La contraseña debe tener mínimo 8 caracteres</p>
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarP" style={{borderRadius: "12px"}} onClick={modalPrecaucion}>
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="noCoincide" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                        <h4 className="text-warning fw-bold mb-3">¡Precaución!</h4>
                        <p className="text-muted mb-4">Estimado Usuario. La confirmación de la contraseña no coincide</p>
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarNC" style={{borderRadius: "12px"}} onClick={modalNoCoincide}>
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="registro" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                        <h4 className="text-success fw-bold mb-3">¡Registro Exitoso!</h4>
                        <p className="text-muted mb-4">Estimado Usuario. <br /> Usted ha sido registrado en el sistema exitosamente.</p>
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnExito" style={{borderRadius: "12px"}} onClick={modalRegistro}>
                            Ir a Login
                        </button>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="registroIncompleto" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                    
                        <h4 className="text-danger fw-bold mb-3">Cuenta Existente!</h4>
                        
                        <h6>Detectamos que ya tiene una cuenta de usuario creada, pero aún no ha completado sus datos personales.</h6>
                        <p>¿Desea continuar con el registro de sus datos de paciente ahora?.</p>
                        
                        <div className="d-flex w-100 gap-3 mt-4">
                            <button type="button" className="btn btn-primary w-50 py-2" id="btnCancelar" style={{borderRadius: "12px"}} 
                            onClick={modalContinua}>
                                Sí
                            </button>
                            <button type="button" className="btn btn-danger w-50 py-2" id="btnCerrar" style={{borderRadius: "12px"}} 
                            onClick={modalRechaza}>
                                No
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default RegistroInicial;