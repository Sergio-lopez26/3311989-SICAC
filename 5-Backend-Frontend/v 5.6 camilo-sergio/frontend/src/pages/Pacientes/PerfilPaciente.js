import Navbar from "../../components/NavbarPaciente"
import { useState, useEffect } from 'react';
import * as bootstrap from 'bootstrap'

const API_URL = "http://localhost:5000/api/paciente";
const API_URL_T_DOC = "http://localhost:5000/api/tipo_documento";

const PerfilPaciente = () =>{

    //Estados para los datos
    const [datos, setDatos] = useState({
        id: "",
        id_usuario: "",
        id_tipo_documento: "",
        numero_documento: "",
        email: "",
        password: "",
        fecha_nacimiento: "",
        primer_nombre: "",
        segundo_nombre: "",
        primer_apellido: "",
        segundo_apellido: "",
        numero_celular: "",
        tipo_sangre: "",
        genero: "",
        nombre_acudiente: "",
        documento_acudiente: "",
        estado_paciente: ""
    });

    const [tiposDoc, setTiposDoc] = useState([]); //Almacenara los datos de tipo de documento

    useEffect(() => {
        // Se obtienen los datos del usuario logueado desde el localStorage
        const usuarioStorage = localStorage.getItem('usuario'); 
        
        if (usuarioStorage) {
            const usuarioLogeado = JSON.parse(usuarioStorage);
            const idUsuarioLogueado = usuarioLogeado.id; //Se extrae el ID
            
            if (idUsuarioLogueado) {
                obtenerDatos(idUsuarioLogueado);
            }
        } else {
            alert("No hay sesión activa. Por favor, inicia sesión.");
        }
    }, []);

    //Esto es para que se muestren los datos desde la BD en el form, con base al ID -> este ID traera la ruta .get('/:id'...)
    const obtenerDatos = async (id) => {
        try {
            //Se hacen peticiones al backend, haciendo enfasis en el id capturado de la sesion
            const [resPaciente, resTipoDoc] = await Promise.all([
                fetch(`${API_URL}/${id}`),
                fetch(API_URL_T_DOC)
            ]);

            if (!resPaciente.ok) throw new Error("No se encontró el paciente");
            if (!resTipoDoc.ok) throw new Error("No se pudo cargar el catálogo de documentos");
            
            const dataPaciente = await resPaciente.json(); //Con esto las respuestas seran en formato json
            const dataTipoDoc = await resTipoDoc.json();

            setTiposDoc(dataTipoDoc);

            //Se cambia la estructura que teniamos en Gestionar... ya que ahora se consultan los datos de un solo usuario
            //Para que salga la fecha en formato corto
            let fechaCorta = dataPaciente.fecha_nacimiento || "";
            
            if(fechaCorta.includes("T")) {
                fechaCorta = fechaCorta.split("T")[0]; //.split("T") -> Realiza un "corte" justo en la letra "T"
            }

            //Con esto se "limpia" los datos null que aparecen en la BD
            const datosLimpios = {
                //Concretamente aca se "limpian"
                ...dataPaciente,
                fecha_nacimiento: fechaCorta,
                password: "********",
                segundo_nombre: dataPaciente.segundo_nombre === null || dataPaciente.segundo_nombre === "null" ? "" : dataPaciente.segundo_nombre,
                segundo_apellido: dataPaciente.segundo_apellido === null || dataPaciente.segundo_apellido === "null" ? "" : dataPaciente.segundo_apellido,
                nombre_acudiente: dataPaciente.nombre_acudiente === null || dataPaciente.nombre_acudiente === "null" ? "" : dataPaciente.nombre_acudiente,
                documento_acudiente: dataPaciente.documento_acudiente === null || dataPaciente.documento_acudiente === "null" ? "" : dataPaciente.documento_acudiente
            };

            setDatos(datosLimpios);
        } catch (error) {
            console.error("Error al obtener datos del servidor:", error);
            alert("No se pudieron cargar los datos desde el servidor.");
        }
    };

    const cambioDatos = (e) => {
        const { name, value } = e.target;
        setDatos(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const actualizar = async (e) => {
        e.preventDefault();

        if(datos.password.length < 8){
            const modalNV = document.getElementById('noValido');
            let modalBootstrap = bootstrap.Modal.getInstance(modalNV) || new bootstrap.Modal(modalNV);
            modalBootstrap.show();

            return;
        }
        
        try {
            //Cuando se va a actualizar el perfil
            const res = await fetch(`${API_URL}/${datos.id}`, {
                method: "PUT",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            });

            if(res.ok){
                await obtenerDatos(datos.id_usuario);

                const modalAct = document.getElementById('actualiza');
                let modalBootstrap = bootstrap.Modal.getInstance(modalAct) || new bootstrap.Modal(modalAct);
                modalBootstrap.show();
            }else{
                const errorData = await res.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            alert("Hubo un error en el servidor al intentar actualizar.");
        }
    };

    const modalActualiza = () =>{
        const modalAct = document.getElementById('actualiza');
        const modalExiste = bootstrap.Modal.getInstance(modalAct);
        if(modalExiste) modalExiste.hide();

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = ''; //Borra el fondo negro si se queda pegado o se bloquea la pagina
    };

    const modalNoValido = () =>{
        const modalNV = document.getElementById('noValido');
        const modalExiste = bootstrap.Modal.getInstance(modalNV);
        if(modalExiste) modalExiste.hide();

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';
    };

    const obtenerSiglaDoc = tiposDoc.find(doc => doc.id === Number(datos.id_tipo_documento));

    const siglaDoc = obtenerSiglaDoc ? `${obtenerSiglaDoc.sigla} - ${obtenerSiglaDoc.nombre_documento}` : "";

    const cancelar = async() =>{
        await obtenerDatos(datos.id_usuario);
    }

    return(
        <>
        <Navbar />
        
        <header className="text-center mt-3">
            <h1 style={{ color: "#103e6e", fontWeight: "bolder" }}>Mi Perfil</h1>
            <h5>A continuación se hayan sus datos personales registrado en el sistema</h5>
            <h6>Solo se podran editar los campos con un *</h6>
        </header>

        <form id="formUsuario" onSubmit={actualizar} className="card shadow-lg p-4 border-0 row g-3 flex-row mx-auto" style={{ borderRadius: "16px", minWidth: "300px", width: "30vw", maxWidth: "50vw", marginTop: "25px", marginBottom: "30px" }}>

            <label htmlFor="id_tipo_documento" className="d-block mb-3">Tipo de documento
            <input type="text" name="id_tipo_documento" id="id_tipo_documento" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={siglaDoc} onChange={cambioDatos} readOnly required/>
            </label>

            <label htmlFor="numero_documento" className="d-block mb-3">Número de documento
            <input type="text" name="numero_documento" id="numero_documento" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.numero_documento} onChange={cambioDatos} readOnly required/>
            </label>

            <label htmlFor="email" className="d-block mb-3">Email*
            <input type="email" name="email" id="email" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.email} onChange={cambioDatos} required/>
            </label>
            
            <label htmlFor="password" className="d-block mb-3" >Password*
            <input type="password" name="password" id="password" placeholder="********" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.password} onChange={cambioDatos} required/>
            </label>

            <label htmlFor="fecha_nacimiento" className="d-block mb-3">Fecha de nacimiento
            <input type="date" name="fecha_nacimiento" id="fecha_nacimiento" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.fecha_nacimiento} onChange={cambioDatos} readOnly required/>
            </label>

            <label htmlFor="primer_nombre" className="d-block mb-3">Primer nombre
            <input type="text" name="primer_nombre" id="primer_nombre" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.primer_nombre} onChange={cambioDatos} readOnly required/>
            </label>

            <label htmlFor="segundo_nombre" className="d-block mb-3">Segundo nombre
            <input type="text" name="segundo_nombre" id="segundo_nombre" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.segundo_nombre} onChange={cambioDatos} readOnly/>
            </label>

            <label htmlFor="primer_apellido" className="d-block mb-3">Primer apellido
            <input type="text" name="primer_apellido" id="primer_apellido" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.primer_apellido} onChange={cambioDatos} readOnly required/>
            </label>

            <label htmlFor="segundo_apellido" className="d-block mb-3">Segundo apellido
            <input type="text" name="segundo_apellido" id="segundo_apellido" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.segundo_apellido} onChange={cambioDatos} readOnly/>
            </label>

            <label htmlFor="numero_celular" className="d-block mb-3">Número de Celular*
            <input type="tel" name="numero_celular" id="numero_celular" className="form-control border-primary-subtle" placeholder="3xxxxxxxxx" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.numero_celular} onChange={cambioDatos} required/> {/*pattern="3[0-9]{9}"*/}
            </label>
            
            <label htmlFor="tipo_sangre" className="d-block mb-3">Tipo de sangre
            <input name="tipo_sangre" id="tipo_sangre" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.tipo_sangre} onChange={cambioDatos} readOnly required/>
            </label>

            <label htmlFor="genero" className="d-block mb-3">Género
            <input name="genero" id="genero" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.genero} onChange={cambioDatos} readOnly required/>
            </label>
            
            <label htmlFor="nombre_acudiente" className="d-block mb-3">Nombre del acudiente
            <input type="text" name="nombre_acudiente" id="nombre_acudiente" placeholder="No Aplica" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.nombre_acudiente} onChange={cambioDatos} readOnly/>
            </label>

            <label htmlFor="documento_acudiente" className="d-block mb-3">Documento del acudiente
            <input type="text" name="documento_acudiente" id="documento_acudiente" placeholder="No Aplica" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.documento_acudiente} onChange={cambioDatos} readOnly/>
            </label>

            <label htmlFor="estado_paciente" className="d-block mb-3">Estado Paciente
            <input name="estado_paciente" id="estado_paciente" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.estado_paciente} onChange={cambioDatos} readOnly required/>
            </label>

            <div className="d-flex w-100 gap-3">
                <button id="btnActualizar" type="submit"  className="btn btn-success flex-fill py-2" style={{ borderRadius: "12px" }}>Actualizar</button>
                <button id="btnCancelar" type="button"  className="btn btn-light flex-fill py-2" style={{ borderRadius: "12px" }} onClick={cancelar}>Cancelar</button>
            </div>
        </form>

        {/* MODALES */}
        <div className="modal fade" id="actualiza" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                    <h4 className="text-success fw-bold mb-3">¡Paciente Actualizado!</h4>
                    <p className="text-muted mb-4">El paciente ha sido actualizado en el sistema exitosamente.</p>
                    <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarV" style={{borderRadius: "12px"}} onClick={modalActualiza}>
                        Continuar
                    </button>
                </div>
            </div>
        </div>

        <div className="modal fade" id="noValido" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                    <h4 className="text-warning fw-bold mb-3">¡Precaución!</h4>
                    <p className="text-muted mb-4">La contraseña debe tener mínimo 8 caracteres</p>
                    <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarNC" style={{borderRadius: "12px"}} onClick={modalNoValido}>
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
        </>
    );
}

export default PerfilPaciente;