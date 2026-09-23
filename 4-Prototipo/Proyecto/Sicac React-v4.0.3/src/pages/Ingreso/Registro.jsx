import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import '../../styles/stylesRegistro.css';
import logo from '../../assets/logo.png';
import * as bootstrap from 'bootstrap';
import api from "../../services/api";

function Registro(){

    const navegar = useNavigate();
    const [menor, setMenor] = useState(false);
    const [tiposDoc, setTiposDoc] = useState([]); // NUEVO: Estado para cargar los tipos de documento desde la base de datos

    const passwordRef = useRef();
    const validaPassRef = useRef();

    // NUEVO: Cargar los tipos de documento al montar el componente de Registro
    useEffect(() => {
        const obtenerTiposDoc = async () => {
            try {
                const res = await api.get("/tipo_documento");
                setTiposDoc(res.data);
            } catch (error) {
                console.error("Error al obtener tipos de documento:", error);
            }
        };
        obtenerTiposDoc();
    }, []);

    const mostrarAcudiente = (e) => {
        const fechaSelect = new Date(e.target.value);
        const hoy = new Date();
        
        let edad = hoy.getFullYear() - fechaSelect.getFullYear();
        const diferenciaMes = hoy.getMonth() - fechaSelect.getMonth();

        if(diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < fechaSelect.getDate())){
            edad--;
        }
        setMenor(edad < 18);
    };

    const modalPrecaucion = () => {
        const modalPrec = document.getElementById('precaucion');
        const modalExiste = bootstrap.Modal.getInstance(modalPrec);
        if(modalExiste) modalExiste.hide();
    };

    const modalNoCoincide = () => {
        const modalNC = document.getElementById('noCoincide');
        const modalExiste = bootstrap.Modal.getInstance(modalNC);
        if(modalExiste) modalExiste.hide();
    };

    const modalRegistro = () => {
        const modalReg = document.getElementById('registro');
        const modalExiste = bootstrap.Modal.getInstance(modalReg);

        if(modalExiste){
            modalExiste.hide();
            navegar('/Login');
        }
    };

    const procesarRegistro = async (e) => {
        e.preventDefault();
        
        const pass = passwordRef.current.value;
        const valida = validaPassRef.current.value;
        
        passwordRef.current.style.border = "";
        validaPassRef.current.style.border = "";
                
        if(pass.length < 8){
            const modalPrec = document.getElementById('precaucion');
            const modalBootstrap = new bootstrap.Modal(modalPrec);
            modalBootstrap.show();

            passwordRef.current.style.border = "2px solid red";
            return; 
        }

        if (pass !== valida){
            const modalNC = document.getElementById('noCoincide');
            const modalBootstrap = new bootstrap.Modal(modalNC);
            modalBootstrap.show();

            passwordRef.current.value = "";
            validaPassRef.current.value = "";
            passwordRef.current.style.border = "2px solid yellow";
            validaPassRef.current.style.border = "2px solid yellow";
            return; 
        }

        const formData = new FormData(e.target);

        try {
            await api.post("/users", {
                email: formData.get("correo"),
                password: formData.get("password"),
                id_rol: 1, 
                // CORRECCIÓN: Convierte el ID seleccionado a número antes de enviarlo a la base de datos
                id_tipo_documento: Number(formData.get("tipoDocumento")),
                numero_documento: formData.get("numDocumento"),
                primer_nombre: formData.get("primerNombre"),
                segundo_nombre: formData.get("segundoNombre"),
                primer_apellido: formData.get("primerApellido"),
                segundo_apellido: formData.get("segundoApellido"),
                fecha_nacimiento: formData.get("fechaNto"),
                numero_celular: formData.get("numCel"),
                tipo_sangre: formData.get("RH"),
                nombre_acudiente: formData.get("nombreAcudiente") || "",
                documento_acudiente: formData.get("documentoAcudiente") || ""
            });

            const modalReg = document.getElementById('registro');
            const modalBootstrap = new bootstrap.Modal(modalReg);
            modalBootstrap.show();

        } catch (error) {
            console.error("Error al registrar el usuario:", error);
            alert("Hubo un error en el servidor al procesar el registro. Verifica que el correo no esté registrado.");
        }
    };

    const cancelar = () => {
        document.getElementById('formRegistro').reset();
        passwordRef.current.style.border = "";
        validaPassRef.current.style.border = "";
        setMenor(false);
    };

    return(
        <>
        <div className="registro-page">
            <header>
                <img id="logo" src={logo} alt="Logo"/>
                <h1>Registro de Usuarios</h1>
                <h6>Por favor completar los campos con sus respectivos datos</h6>
            </header>

            <form id="formRegistro" onSubmit={procesarRegistro}>
                <label htmlFor="tipoDocumento" >Tipo de Documento
                {/* CORRECCIÓN: El select ahora se renderiza dinámicamente usando el id como value */}
                <select id="tipoDocumento" name="tipoDocumento" className="form-control" defaultValue="" required >
                    <option value="" disabled>Seleccione el tipo de documento</option>
                    {tiposDoc.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                            {doc.sigla} - {doc.nombre_documento}
                        </option>
                    ))}
                </select>
                </label>

                <label htmlFor="numDocumento">Número de Documento 
                <input id="numDocumento" name="numDocumento" type="text" className="form-control" required />
                </label>
               
                <label htmlFor="correo">Email
                <input type="email" name="correo" id="correo" className="form-control" required />
                </label>

                <label htmlFor="fechaNto">Fecha de Nacimiento
                <input id="fechaNto" name="fechaNto" type="date" className="form-control" onChange={mostrarAcudiente} required />
                </label>

                <label htmlFor="primerNombre">Primer Nombre 
                <input id="primerNombre" name="primerNombre" type="text" className="form-control" required />
                </label>

                <label htmlFor="segundoNombre">Segundo Nombre 
                <input id="segundoNombre" name="segundoNombre" type="text" className="form-control"/>
                </label>

                <label htmlFor="primerApellido">Primer Apellido 
                <input id="primerApellido" name="primerApellido" type="text" className="form-control" required />
                </label>

                <label htmlFor="segundoApellido">Segundo Apellido 
                <input id="segundoApellido" name="segundoApellido" className="form-control" type="text"/>
                </label>

                <label htmlFor="numCel">Número de Celular 
                <input id="numCel" name="numCel" type="tel" pattern="3[0-9]{9}" placeholder="3xxxxxxxxx" className="form-control" required />
                </label>

                <label htmlFor="RH">Tipo de Sangre (RH)
                <select id="RH" name="RH" className="form-control" defaultValue="O+" required >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                </select>
                </label>

                {menor && (
                    <>
                    <label htmlFor="nombreAcudiente">Nombre del Acudiente
                    <input type="text" name="nombreAcudiente" id="nombreAcudiente" className="form-control" required={menor} />
                    </label>

                    <label htmlFor="documentoAcudiente">Documento del Acudiente
                    <input type="text" name="documentoAcudiente" id="documentoAcudiente" className="form-control" required={menor}/>
                    </label>
                    </>
                )}

                <label htmlFor="password">Contraseña
                <input id="password" ref={passwordRef} name="password" type="password" placeholder="********" className="form-control" required />
                </label>

                <label htmlFor="confirmarPassword">Confirmar Contraseña 
                <input id="confirmarPassword" ref={validaPassRef} name="confirmarPassword" type="password" placeholder="********" className="form-control" required />
                </label>

                <div className="d-flex w-100 gap-3 mt-4">
                    <button className="btn btn-primary flex-fill py-2" type="submit" >Registrarse</button>
                    <button className="btn btn-secondary flex-fill py-2" type="button" onClick={cancelar}>Cancelar</button>
                </div>
                <div className="enlace">
                    <Link to='/Login'>¿Ya tienes cuenta?</Link>
                </div>
            </form>

            {/* MODALES BOOTSTRAP */}
            <div className="modal fade" id="precaucion" tabIndex="-1" aria-hidden="true">
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

            <div className="modal fade" id="noCoincide" tabIndex="-1" aria-hidden="true">
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

            <div className="modal fade" id="registro" tabIndex="-1" aria-hidden="true">
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
        </div>
        </>
    );
}

export default Registro;