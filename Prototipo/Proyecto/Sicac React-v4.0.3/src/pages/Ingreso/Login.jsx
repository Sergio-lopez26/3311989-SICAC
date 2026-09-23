import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from '../../assets/logo.png';
import * as bootstrap from 'bootstrap';
import api from "../../services/api";

function Login(){

    const navegar = useNavigate();

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
            
  
            const sesion = JSON.parse(localStorage.getItem("user"));
            

            if (sesion && sesion.id_rol === 1) {
                navegar('/Usuarios');
            } else {
                navegar('/Usuarios'); 
            }
        }
    };

    const procesarLogin = async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get("email");
        const password = formData.get("password");
        

        document.getElementById("password").style.border = "";

        if(password.length < 8){
            const modalNV = document.getElementById('noValido');
            const modalBootstrap = new bootstrap.Modal(modalNV);
            modalBootstrap.show();
            
            document.getElementById("password").style.border = "2px solid yellow";
            return; 
        }

        try {
 
            const res = await api.post("/login", { email, password });

            const { user, accessToken } = res.data;

            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", accessToken);

            const modalIng = document.getElementById('ingreso');
            const modalBootstrap = new bootstrap.Modal(modalIng);
            modalBootstrap.show();
      
            e.target.reset();

        } catch (error) {
            console.error(error);
            alert("Credenciales incorrectas o error en el servidor");
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

            <form id="formLogin" onSubmit={procesarLogin}> 
                <label htmlFor="email">Email 
                    <input id="email" name="email" type="email" className="form-control" required />
                </label>
                
                <label htmlFor="password">Contraseña
                    <input id="password" name="password" type="password" placeholder="********" className="form-control" required />
                </label>

                <div className="d-flex w-100 gap-3 mt-4">
                    <button className="btn btn-primary flex-fill py-2" type="submit">Ingresar</button>
                    <button className="btn btn-light flex-fill py-2" type="button" onClick={() => navegar("/Registro")}>Registrarse</button>
                </div>

                <div className="enlace">
                    <Link to='/RecuperarPass'>¿Olvidó su contraseña?</Link>
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
        </>
    );
}

export default Login;