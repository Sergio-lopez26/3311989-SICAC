import { useRef } from "react";
// CAMBIO 1: Importamos useLocation además de useNavigate
import { useNavigate, useLocation } from "react-router-dom";
import logo from '../../assets/Logo.png';
import * as bootstrap from 'bootstrap';

function CambiarPassword(){

    const navegar = useNavigate();
    
    // CAMBIO 2: Inicializamos useLocation para capturar los datos enviados en la navegación
    const location = useLocation();
    
    // Capturamos el email que viene en el state. 
    // Usamos el encadenamiento opcional (?.) por si el usuario entra directo a la ruta sin pasar por la validación
    const emailRecibido = location.state?.email;

    const passRef = useRef();
    const npassRef = useRef();

    const modalPrecaucion = () =>{
        const modalPrec = document.getElementById('precaucion');
        const modalExiste = bootstrap.Modal.getInstance(modalPrec);

        if(modalExiste){
            modalExiste.hide();
        }
    };

    const modalNoCoincide = () =>{
        const modalNC = document.getElementById('noCoincide');
        const modalExiste = bootstrap.Modal.getInstance(modalNC);

        if(modalExiste){
            modalExiste.hide();
        }
    };

    const modalExito = () =>{
        const modalExi = document.getElementById('exito');
        const modalExiste = bootstrap.Modal.getInstance(modalExi);

        if(modalExiste){
            modalExiste.hide();
            navegar('/'); // Te redirige al login tras el éxito
        }

    };

    const validaCambioPass = async (e) =>{
        e.preventDefault();

        const pass = passRef.current.value;
        const npass = npassRef.current.value;

        // Validaciones visuales del Frontend
        if(pass.length < 8){
            const modalPrec = document.getElementById('precaucion');
            const modalBootstrap = new bootstrap.Modal(modalPrec);
            modalBootstrap.show();

            passRef.current.style.border = "2px solid red";
            return;
        }

        if (pass !== npass){
            const modalNC = document.getElementById('noCoincide');
            const modalBootstrap = new bootstrap.Modal(modalNC);
            modalBootstrap.show();

            passRef.current.style.border = "2px solid yellow";
            npassRef.current.style.border = "2px solid yellow";

            passRef.current.value = "";
            npassRef.current.value = "";
            return; 
        }
        
        // Petición HTTP al Backend
        try {
            // CAMBIO 3: Verificamos si existe el email capturado por useLocation
            if (!emailRecibido) {
                alert('No se encontró el correo. Por favor inicie el proceso de recuperación nuevamente.');
                navegar('/ruta-de-ingresar-correo'); // Cambia esto por tu ruta real de recuperación
                return;
            }

            // Petición al endpoint /api/usuario/reset_password en el puerto 5000
            const response = await fetch('http://localhost:5000/api/usuario/reset_password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailRecibido, // Usamos la variable capturada por useLocation
                    password: pass
                })
            });

            const data = await response.json();

            // Si el backend responde con un error (400, 401, 404, etc.)
            if (!response.ok) {
                alert(`Error: ${data.error}`);
                return;
            }

            // Si todo sale bien (200), mostramos el modal de éxito
            const modalEx = document.getElementById('exito');
            const modalBootstrap = new bootstrap.Modal(modalEx);
            modalBootstrap.show();

        } catch (error) {
            console.error('Error al comunicarse con el servidor:', error);
            alert('Error al intentar cambiar la contraseña. Verifique su conexión.');
        }
    };

    const cancelar = () =>{
        document.getElementById('cambiarPass').reset();
        passRef.current.style.border = "";
        npassRef.current.style.border = "";
    };

    return(
        <>
        <div className="cambio-page">
            <header>
                <img id="logo" src={logo} alt="Logo"/>
                <h1>Cambiar Contraseña</h1>
                <h6>Estimado Usuario, por sus seguridad, le solicitamos reallizar el cambio de su contraseña</h6>
            </header>

            <form id="cambiarPass" onSubmit={validaCambioPass}>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label d-block mb-3">Digite su nueva contraseña
                    <input type="password" name="password" id="password" ref={passRef} placeholder="********" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} required/>
                    </label>

                    <label htmlFor="nPassword" className="form-label d-block mb-3">Confirme su nueva contraseña
                    <input type="password" name="nPassword" id="nPassword" ref={npassRef} placeholder="********" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} required/>
                    </label>
                </div>

                <div className="d-flex w-100 gap-3 mt-4">
                    <button id="btnConfirmar" type="submit" className="btn btn-success flex-fill py-2">Confirmar</button>
                    <button id="btnCancelar" type="button" className="btn btn-secondary flex-fill py-2" onClick={cancelar}>Cancelar</button>
                </div>
            </form>

            <div className="modal fade" id="precaucion" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                    
                        <h4 className="text-danger fw-bold mb-3">¡Precaución!</h4>
                        
                        <p className="text-muted mb-4">Estimado Usuario. La contraseña debe tener mínimo 8 caractéres</p>
                        
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarP" style={{borderRadius: "12px"}} 
                        onClick={modalPrecaucion}>
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="noCoincide" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                    
                        <h4 className="text-warning fw-bold mb-3">¡Precaución!</h4>
                        
                        <p className="text-muted mb-4">Estimado Usuario. La confirmación de la contraseña no coincide</p>
                        
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarNC" style={{borderRadius: "12px"}} 
                        onClick={modalNoCoincide}>
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="exito" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                        <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                        
                        <h4 className="text-success fw-bold mb-3">¡Cambio Exitoso!</h4>
                        
                        <p className="text-muted mb-4">Estimado Usuario. Su contraseña ha sido actualizada en el sistema</p>
                        
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnExito" style={{borderRadius: "12px"}} 
                        onClick={modalExito}>
                            Ir a Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default CambiarPassword;