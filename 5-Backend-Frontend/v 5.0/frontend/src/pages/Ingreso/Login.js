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

    const modalNoValido = () => {
        const modalNV = document.getElementById('noValido');
        const modalExiste = bootstrap.Modal.getInstance(modalNV);
        if(modalExiste) modalExiste.hide();
    };
    

    const modalIngreso = () => {
        const modalIng = document.getElementById('ingreso');
        const modalExiste = bootstrap.Modal.getInstance(modalIng);

        if(modalExiste){
            modalExiste.hide();
            
            if (emailRef.current) emailRef.current.value = "";
            if (passwordRef.current) passwordRef.current.value = "";
            
            const sesion = JSON.parse(localStorage.getItem("usuario"));
            
            //Aca se establecen parametros de acceso
            if (sesion && sesion.id_rol === 1) {
                navegar('/Usuario');
            } else {
                navegar('/Usuario'); 
            }
        }
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
            const modalBootstrap = new bootstrap.Modal(modalNV);
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
                localStorage.setItem("usuario", JSON.stringify(data.usuario)); //Con esto se guarda los datos del usuario en el navegador

                const modalIng = document.getElementById('ingreso');
                const modalBootstrap = new bootstrap.Modal(modalIng);
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
                <label htmlFor="email">Email 
                    <input id="email" ref={emailRef} name="email" type="email" className="form-control" required />
                </label>
                
                <label htmlFor="password">Contraseña
                    <input id="password" ref={passwordRef} name="password" type="password" placeholder="********" className="form-control" required />
                </label>

                <div className="d-flex w-100 gap-3 mt-4">
                    <button className="btn btn-primary flex-fill py-2" type="submit">Ingresar</button>
                    <button className="btn btn-light flex-fill py-2" type="button" onClick={() => navegar("/Registro")}>Registrarse</button>
                </div>

                <div className="enlace">
                    <Link to='/Recuperar_Password'>¿Olvidó su contraseña?</Link>
                </div>
            </form>

            {/* MODAL ERROR */}
            <div className="modal fade" id="noValido" tabIndex="-1" aria-hidden="true">
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
            <div className="modal fade" id="ingreso" tabIndex="-1" aria-hidden="true">
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
        </div>
    );
}

export default Login;