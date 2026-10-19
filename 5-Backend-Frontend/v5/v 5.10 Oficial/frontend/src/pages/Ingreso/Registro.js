import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import '../../styles/stylesRegistro.css';
import logo from '../../assets/Logo.png';
import * as bootstrap from 'bootstrap';

const API_URL_T_DOC = "http://localhost:5000/api/tipo_documento";
const API_URL = "http://localhost:5000/api/usuario";

function Registro(){

    const navegar = useNavigate();
    const [menor, setMenor] = useState(false);
    const [tiposDoc, setTiposDoc] = useState([]); //Estado para cargar los tipos de documento desde la BBDD

    const passwordRef = useRef();
    const validaPassRef = useRef();

    //Para cargar los tipos de documento registrados en la BBDD
    useEffect(() => {
        const obtenerTiposDoc = async () => {
            try {
                const res = await fetch(API_URL_T_DOC);
                
                const data = await res.json();
                setTiposDoc(data);

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
            navegar('/Registro');
        }
    };

    const procesarRegistro = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
      
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

        if(pass !== valida){
            const modalNC = document.getElementById('noCoincide');
            const modalBootstrap = new bootstrap.Modal(modalNC);
            modalBootstrap.show();

            passwordRef.current.value = "";
            validaPassRef.current.value = "";
            passwordRef.current.style.border = "2px solid yellow";
            validaPassRef.current.style.border = "2px solid yellow";
            return; 
        }

        try{
            const formData = new FormData(form); //Empaqueta los campos con name que estan el form
            const datosUsuario = Object.fromEntries(formData.entries());

            //Con esto se envia al banckend los datos de los campos que son null en nuestra BBDD
            const datosLimpios = {
                ...datosUsuario,
                segundo_nombre: datosUsuario.segundo_nombre || "",
                segundo_apellido: datosUsuario.segundo_apellido || "",
                nombre_documento: datosUsuario.nombre_documento || null,
                documento_acudiente: datosUsuario.documento_acudiente || null,
            }

            //Cuando se va a agregar un nuevo registro
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosLimpios) //Con esta línea, se envian los datos capturados
            });

            const data = await res.json(); //Acá se lee la respuesta desde el express

            if(res.ok){
                const modalReg = document.getElementById('registro');
                const modalBootstrap = new bootstrap.Modal(modalReg);
                modalBootstrap.show();
            }else{
                alert(`Error: ${data.error}`); //Este mensaje nos muestra el error exacto que nos envie el backend
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
                <label htmlFor="id_tipo_documento" >Tipo de Documento
                {/* El select ahora se renderiza dinámicamente usando el id como value y dpendiendo de la tabla Tipo de Documento*/}
                <select id="id_tipo_documento" name="id_tipo_documento" className="form-control" defaultValue="" required >
                    <option value="" disabled>Seleccione el tipo de documento</option>
                    {tiposDoc && tiposDoc.map((tipoDoc) => (
                        <option key={tipoDoc.id} value={tipoDoc.id}>
                            {tipoDoc.sigla} - {tipoDoc.nombre_documento}
                        </option>
                    ))}
                </select>
                </label>

                <label htmlFor="numero_documento">Número de Documento 
                <input type="text" id="numero_documento" name="numero_documento" pattern="[0-9]{7,10}" maxLength="10" className="form-control" required />
                </label>
               
                <label htmlFor="email">Email
                <input type="email" name="email" id="email" className="form-control" required />
                </label>

                <label htmlFor="fecha_nacimiento">Fecha de Nacimiento
                <input id="fecha_nacimiento" name="fecha_nacimiento" type="date" className="form-control" onChange={mostrarAcudiente} required />
                </label>

                <label htmlFor="primer_nombre">Primer Nombre 
                <input id="primer_nombre" name="primer_nombre" type="text" className="form-control" required />
                </label>

                <label htmlFor="segundo_nombre">Segundo Nombre 
                <input id="segundo_nombre" name="segundo_nombre" type="text" className="form-control"/>
                </label>

                <label htmlFor="primer_apellido">Primer Apellido 
                <input id="primer_apellido" name="primer_apellido" type="text" className="form-control" required />
                </label>

                <label htmlFor="segundo_apellido">Segundo Apellido 
                <input id="segundo_apellido" name="segundo_apellido" className="form-control" type="text"/>
                </label>

                <label htmlFor="numero_celular">Número de Celular 
                <input id="numero_celular" name="numero_celular" type="tel" placeholder="xxxxxxxxxx" className="form-control" required /> {/*pattern="3[0-9]{9}"*/}
                </label>

                <label htmlFor="tipo_sangre">Tipo de Sangre (RH)
                <select id="tipo_sangre" name="tipo_sangre" className="form-control" defaultValue="O+" required >
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
                    <label htmlFor="nombre_acudiente">Nombre del Acudiente
                    <input type="text" name="nombre_acudiente" id="nombre_acudiente" className="form-control" required={menor} />
                    </label>

                    <label htmlFor="documento_acudiente">Documento del Acudiente
                    <input type="text" name="documento_acudiente" id="documento_acudiente" className="form-control" required={menor}/>
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
                    <Link to='/'>¿Ya tienes cuenta?</Link>
                </div>
            </form>

            {/* Modales con Bootstrap */}
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