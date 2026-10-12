import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useRef } from "react";
import '../../styles/stylesPreIngreso.css';
import logo from '../../assets/Logo.png';
import * as bootstrap from 'bootstrap';

const API_URL = "http://localhost:5000/api/usuario/login";

const Login = () =>{

    const navegar = useNavigate();
    const emailRef = useRef();
    const passwordRef = useRef();
    const datosCapturados = useRef(null); //Con esto capturaremos datos del backend mas adelante, para su uso en el modal

    const modalNoValido = () => {
        const modalNV = document.getElementById('noValido');
        const modalExiste = bootstrap.Modal.getInstance(modalNV);
        if(modalExiste) modalExiste.hide();

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = ''; //Borra el fondo negro si se queda pegado o se bloquea la pagina
    };

    const modalIngreso = () => {
        const modalIng = document.getElementById('ingreso');
        const modalExiste = bootstrap.Modal.getInstance(modalIng);

        if(modalExiste){
            modalExiste.hide();
        }

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';

        if (emailRef.current) emailRef.current.value = "";
        if (passwordRef.current) passwordRef.current.value = "";
        
        //localStorage -> Herramienta de los navegadores web que permite guardar datos en la computadora o celular del usuario de forma fija
        const sesion = JSON.parse(localStorage.getItem("usuario")); 
        
        //Aca se establecen parametros de acceso conforme al rol que nos envia el backend
        //Primero establecemos el de admin por ahora
        if (sesion && (sesion.rol === "administrador")) {
            navegar('/Menu_Administrador');
        } else {
            navegar('/'); //Acá toca poner la ruta de la vista del paciente y del medico (que es lo que faltaria) 
        }
    };

    const modalContinua = () => {
        const ModalCont = document.getElementById('registroIncompleto');
        const modalExiste = bootstrap.Modal.getInstance(ModalCont);
        if (modalExiste) modalExiste.hide();

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';

        const idCapturado = datosCapturados.current?.id; //se guarda lo capturado en el login
        const emailCapturado = datosCapturados.current?.email;

        //Nos dirigimos al formulario de RegistroPaciente heredando los datos rescatados
        navegar('/Registro_Paciente', {
            state: {
                id_usuario: idCapturado, 
                email: emailCapturado,
                password: "********" // Para no mostrar el pass, ya que estará encriptado
            }
        });

        datosCapturados.current = null;
    };

    const modalRechaza = () => {
        const ModalRechaza = document.getElementById('registroIncompleto');
        const modalExiste = bootstrap.Modal.getInstance(ModalRechaza);
        if (modalExiste) modalExiste.hide();

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';

        datosCapturados.current = null;
        if (emailRef.current) emailRef.current.value = "";
        if (passwordRef.current) passwordRef.current.value = "";
    };

    const procesarLogin = async (e) => {
        e.preventDefault();

        const datosLogin ={
            email: emailRef.current.value,
            password: passwordRef.current.value    
        }

        document.getElementById("password").style.border = "";

        if(passwordRef.current.value.length < 8){
            const modalNV = document.getElementById('noValido');
            let modalBootstrap = bootstrap.Modal.getInstance(modalNV) || new bootstrap.Modal(modalNV);
            modalBootstrap.show();
            
            document.getElementById("password").style.border = "2px solid yellow";
            return; 
        }

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosLogin)
            });

            const data = await res.json();

            if(res.ok){
                //Se trae el registroIncompleto que pusimos en el backend, en caso no se tenga registro en paciente pero si en usuario
                if(data.registroIncompleto){
                    datosCapturados.current = {
                        id: data.usuario.id,
                        email: data.usuario.email
                    }
                
                    const modalRecupera = document.getElementById('registroIncompleto');
                    let modalBootstrap = bootstrap.Modal.getInstance(modalRecupera) || new bootstrap.Modal(modalRecupera);
                    modalBootstrap.show();
                    return;
                }

                localStorage.setItem("usuario", JSON.stringify(data.usuario)); //Con esto se guarda los datos del usuario en el navegador

                const modalIng = document.getElementById('ingreso');
                let modalBootstrap = bootstrap.Modal.getInstance(modalIng) || new bootstrap.Modal(modalIng);
                modalBootstrap.show();

                e.target.reset();
            }else{
                alert(`Error: ${data.error}`);
            }
        }catch(error){
            console.error("Error en la conexión de login:", error);
            alert("Hubo un error de conexión con el servidor.");
        }
    };

    return(
        <div className="cambio-page">
            <header>
                <img id="logo" src={logo} alt="Logo"/>
                <h1>Iniciar Sesión</h1>
                <h6>Por favor completar los campos con sus respectivos datos</h6>
            </header>

            <form id="formLogin" onSubmit={procesarLogin}> 
                <label htmlFor="email">Email</label>
                <input id="email" ref={emailRef} name="email" type="email" className="form-control" required />
                
                <label htmlFor="password">Contraseña</label>
                <input id="password" ref={passwordRef} name="password" type="password" placeholder="********" className="form-control" required />


                <div className="d-flex w-100 gap-3 mt-4">
                    <button className="btn btn-primary flex-fill py-2" type="submit">Ingresar</button>
                    <button className="btn btn-light flex-fill py-2" type="button" onClick={() => navegar("/Registro_Inicial")}>Registrarse</button>
                </div>

                <div className="enlace">
                    <Link to='/Recuperar_Password'>¿Olvidó su contraseña?</Link>
                </div>
            </form>

            {/* MODAL ERROR */}
            <div className="modal fade" id="noValido" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                        <h4 className="text-warning fw-bold mb-3">¡Precaución!</h4>
                        <p className="text-muted mb-4">Estimado Usuario. La contraseña debe tener mínimo 8 caracteres</p>
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarNC" style={{borderRadius: "12px"}} onClick={modalNoValido}>
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL ÉXITO */}
            <div className="modal fade" id="ingreso" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                        <h4 className="text-success fw-bold mb-3">¡Ingreso Exitoso!</h4>
                        <p className="text-muted mb-4">¡Credenciales Validadas! <br /> Estimado Usuario. Usted ha ingresado al sistema exitosamente.</p>
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarV" style={{borderRadius: "12px"}} onClick={modalIngreso}>
                            Continuar
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
    );
}

export default Login;