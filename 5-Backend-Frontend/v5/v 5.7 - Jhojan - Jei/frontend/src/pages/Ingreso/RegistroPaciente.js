import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import '../../styles/stylesRegistro.css';
import logo from '../../assets/Logo.png';
import * as bootstrap from 'bootstrap';

const API_URL_T_DOC = "http://localhost:5000/api/tipo_documento";
const API_URL = "http://localhost:5000/api/paciente";

function RegistroPaciente(){

    const location = useLocation();
    const navegar = useNavigate();
    const [menor, setMenor] = useState(false);
    const [tiposDoc, setTiposDoc] = useState([]); //Estado para cargar los tipos de documento desde la BBDD

    const id_usuario = location.state?.id_usuario; //Con lo cual se recupera el id de usuario guardado en RegistroInicial.js
    const email_usuario = location.state?.email;
    const password_usuario = location.state?.password;

    //Para cargar los tipos de documento registrados en la BBDD -> Ademas este es un hook, debe ir arriba
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

    //Esta es una validación de seguridad por si se intenta entrar a la URL directo sin registrarse previamente como usuario
    if (!id_usuario) {
        return (
            <div className="container text-center mt-5">
                <h3 className="text-danger">Acceso no autorizado</h3>
                <p>Por favor, complete primero el registro de usuario.</p>
                <button className="btn btn-primary" onClick={() => navegar('/Registro_Inicial')}>
                    Ir a Registro
                </button>
            </div>
        );
    }

    const mostrarAcudiente = (e) => {
        const fechaSelect = new Date(e.target.value);
        const hoy = new Date();
        
        //Con esto se hace el calculo para establecer en tiempo real la edad del paciente, conforme a su fecha de nacimiento
        let edad = hoy.getFullYear() - fechaSelect.getFullYear();
        const diferenciaMes = hoy.getMonth() - fechaSelect.getMonth();

        if(diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < fechaSelect.getDate())){
            edad--;
        }
        setMenor(edad < 18);
    };

    const modalCancela = () =>{
        const modalCerrar = document.getElementById('cancela');
        const modalExiste = bootstrap.Modal.getInstance(modalCerrar);

        if(modalExiste){
            modalExiste.hide();
        }

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = ''; //Borra el fondo negro si se queda pegado o se bloquea la pagina

        document.getElementById('formRegistro').reset();
        setMenor(false);

        navegar('/Registro_Inicial');
    }

    const modalPermanece = () =>{
        const modalCerrar = document.getElementById('cancela');
        const modalExiste = bootstrap.Modal.getInstance(modalCerrar);

        if(modalExiste){
            modalExiste.hide();
        }

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = ''; //Borra el fondo negro si se queda pegado o se bloquea la pagina
    };

    const modalRegistro = () => {
        const modalReg = document.getElementById('registro');
        const modalExiste = bootstrap.Modal.getInstance(modalReg);
        
        if(modalExiste){
            modalExiste.hide();

            document.querySelector('.modal-backdrop')?.remove();
            document.body.style.overflow = ''; //Borra el fondo negro si se queda pegado o se bloquea la pagina

            navegar('/');
        }
    };

    const procesarRegistro = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        try{
            const formData = new FormData(form); //Empaqueta los campos con name que estan el form
            const datosUsuario = Object.fromEntries(formData.entries());

            //Con esto se envia al banckend los datos de los campos que son null en nuestra BBDD
            const datosLimpios = {
                ...datosUsuario,
                id_usuario: id_usuario, //Aqúi se agrega el id_ususario (FK de la tabla) a partir de lo recuperado previamente
                email: email_usuario, //Esto como respaldo para que tome el valor guardado
                password: password_usuario, //Esto como respaldo para que tome el valor guardado
                segundo_nombre: datosUsuario.segundo_nombre || "",
                segundo_apellido: datosUsuario.segundo_apellido || "",
                nombre_acudiente: menor ? (datosUsuario.nombre_acudiente || null) : null, // En teoria se podria dejar como "", osea vacio
                documento_acudiente: menor ? (datosUsuario.documento_acudiente || null) : null, // Si es menor de edad guarda el dato; si es mayor, fuerza a que sea NULL en la BD
                estado_paciente: datosUsuario.estado_paciente || "Activo" //Por efecto será Activo, ya que el paciente no lo puede visualizar
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
        const modalC = document.getElementById('cancela');
        const modalBootstrap = new bootstrap.Modal(modalC);
        modalBootstrap.show();
    };

    return(
        <>
        <div className="registro-page">
            <header>
                <img id="logo" src={logo} alt="Logo"/>
                <h1>Registro de Usuarios</h1>
                <h6>Por favor completar los campos con sus respectivos datos</h6>
                <h6>Los campos con un * al final son requeridos completamente</h6>
            </header>

            <form id="formRegistro" onSubmit={procesarRegistro}>
                <label htmlFor="id_tipo_documento" >Tipo de Documento*
                {/* El select ahora se renderiza dinámicamente usando el id como value y dependiendo de la tabla Tipo de Documento*/}
                <select id="id_tipo_documento" name="id_tipo_documento" className="form-select" defaultValue="" required >
                    <option value="" disabled>Seleccione el tipo de documento</option>
                    {tiposDoc && tiposDoc.map((tipoDoc) => (
                        <option key={tipoDoc.id} value={tipoDoc.id}>
                            {tipoDoc.sigla} - {tipoDoc.nombre_documento}
                        </option>
                    ))}
                </select>
                </label>

                <label htmlFor="numero_documento">Número de Documento*
                <input id="numero_documento" name="numero_documento" type="text" className="form-control" required />
               </label>

                <label htmlFor="email">Email*
                <input type="email" name="email" id="email" className="form-control bg-light" value={email_usuario} readOnly required /> {/* value={email_usuario} -> se visualiza lo recuperado con location.state */}
                </label>

                <label htmlFor="password">Contraseña
                <input id="password" name="password" type="password" placeholder="********" className="form-control bg-light" value={password_usuario} readOnly required />
                </label>

                <label htmlFor="fecha_nacimiento">Fecha de Nacimiento*
                <input id="fecha_nacimiento" name="fecha_nacimiento" type="date" className="form-control" onChange={mostrarAcudiente} required />
                </label>

                <label htmlFor="primer_nombre">Primer Nombre*
                <input id="primer_nombre" name="primer_nombre" type="text" className="form-control" required />
                </label>

                <label htmlFor="segundo_nombre">Segundo Nombre
                <input id="segundo_nombre" name="segundo_nombre" type="text" className="form-control"/>
                </label>

                <label htmlFor="primer_apellido">Primer Apellido*
                <input id="primer_apellido" name="primer_apellido" type="text" className="form-control" required />
                </label>

                <label htmlFor="segundo_apellido">Segundo Apellido
                <input id="segundo_apellido" name="segundo_apellido" className="form-control" type="text"/>
                </label>

                <label htmlFor="numero_celular">Número de Celular*
                <input id="numero_celular" name="numero_celular" type="tel" placeholder="xxxxxxxxxx" className="form-control" required /> {/*pattern="3[0-9]{9}"*/}
                </label>

                <label htmlFor="tipo_sangre">Tipo de Sangre (RH)*
                <select id="tipo_sangre" name="tipo_sangre" className="form-select" defaultValue="O+" required >
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

                <label htmlFor="genero">Género*
                <select id="genero" name="genero" className="form-select" required >
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
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

                {/* Falta estado_paciente, no obstante este campo será Activo, y solo el admin lo puede cambiar, por ende no será visible en el registro */}

                <div className="d-flex w-100 gap-3 mt-4" style={{marginBottom: "20px"}}>
                    <button className="btn btn-primary flex-fill py-2" type="submit" >Registrarse</button>
                    <button className="btn btn-secondary flex-fill py-2" type="button" onClick={cancelar}>Cancelar</button>
                </div>
            </form>

            {/* Modales con Bootstrap */}
            <div className="modal fade" id="registro" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                        <h4 className="text-success fw-bold mb-3">¡Registro Exitoso!</h4>
                        <p className="text-muted mb-4">Estimado Usuario. <br /> Usted ha sido registrado en el sistema exitosamente.</p>
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnExito" style={{borderRadius: "12px"}} onClick={modalRegistro}>
                            Continuar Registro
                        </button>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="cancela" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                    
                        <h4 className="text-danger fw-bold mb-3">¡Atención!</h4>
                        
                        <h6>Estimado Usuario. ¿Desea cancelar el registro?</h6>
                        <p>Su cuenta de usuario ya fue creada, pero no se completaron los datos del paciente.</p>
                        
                        <div className="d-flex w-100 gap-3 mt-4">
                            <button type="button" className="btn btn-danger w-50 py-2" id="btnCancelar" style={{borderRadius: "12px"}} 
                            onClick={modalCancela}>
                                Sí
                            </button>
                            <button type="button" className="btn btn-primary w-50 py-2" id="btnCerrar" style={{borderRadius: "12px"}} 
                            onClick={modalPermanece}>
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

export default RegistroPaciente;