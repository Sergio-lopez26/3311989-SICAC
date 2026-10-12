import Navbar from "../../components/NavbarMedico";
import { useState, useEffect } from 'react';
import * as bootstrap from 'bootstrap'

const API_URL = "http://localhost:5000/api/medico";
const API_URL_T_DOC = "http://localhost:5000/api/tipo_documento";

const PerfilMedico = () =>{
    //Estados para los datos
    const [datos, setDatos] = useState({
        id: "", 
        id_usuario: "", 
        id_tipo_documento: "", 
        numero_documento: "",
        email: "", 
        password: "", 
        nombres: "", 
        apellidos: "",
        matricula_profesional: "", 
        numero_celular: "", 
        fecha_registro: "", 
        estado_medico: ""
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

    const obtenerDatos = async (id) => {
        try {
            //Se hacen peticiones al backend, haciendo enfasis en el id capturado de la sesion
            const [resMedico, resTipoDoc] = await Promise.all([
                fetch(`${API_URL}/${id}`),
                fetch(API_URL_T_DOC)
            ]);

            if (!resMedico.ok) throw new Error("No se encontró el paciente");
            if (!resTipoDoc.ok) throw new Error("No se pudo cargar el catálogo de documentos");
            
            const dataMedico = await resMedico.json();
            const dataTipoDoc = await resTipoDoc.json();

            setTiposDoc(dataTipoDoc);

            //Se cambia la estructura que teniamos en Gestionar... ya que ahora se consultan los datos de un solo usuario
            //Para que salga la fecha en formato corto
            let fechaCorta = dataMedico.fecha_registro || "";
            
            if(fechaCorta.includes("T")) {
                fechaCorta = fechaCorta.split("T")[0]; //.split("T") -> Realiza un "corte" justo en la letra "T"
            }

            //Con esto se "limpia" los datos null que aparecen en la BD
            const datosLimpios = {
                //Concretamente aca se "limpian"
                ...dataMedico,
                fecha_registro: fechaCorta,
                password: "********"
            };
            setDatos(datosLimpios);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
        }
    };

    //Con esto se va cambiando los datos conforme sea el usuario quien se loguee
    const cambioDatos = (e) =>{
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
            <input name="id_tipo_documento" id="id_tipo_documento" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={siglaDoc} onChange={cambioDatos} readOnly required/>
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

            <label htmlFor="nombres" className="d-block mb-3">Nombres
            <input type="text" name="nombres" id="nombres" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.nombres} onChange={cambioDatos} readOnly required/>
            </label>

            <label htmlFor="apellidos" className="d-block mb-3">Apellidos
            <input type="text" name="apellidos" id="apellidos" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.apellidos} onChange={cambioDatos} readOnly required/>
            </label>

            <label htmlFor="matricula_profesional" className="d-block mb-3">Matricula Profesional
            <input type="text" name="matricula_profesional" id="matricula_profesional" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.matricula_profesional} onChange={cambioDatos} readOnly required/>
            </label>

            <label htmlFor="numero_celular" className="d-block mb-3">Número de Celular*
            <input type="tel" name="numero_celular" id="numero_celular" className="form-control border-primary-subtle" placeholder="3xxxxxxxxx" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.numero_celular} onChange={cambioDatos} required/> {/*pattern="3[0-9]{9}"*/}
            </label>
            
            <label htmlFor="fecha_registro" className="d-block mb-3">Fecha de Registro
            <input type="date" name="fecha_registro" id="fecha_registro" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.fecha_registro} onChange={cambioDatos} readOnly/>
            </label>

            <label htmlFor="estado_medico" className="d-block mb-3">Estado Médico
            <input name="estado_medico" id="estado_medico" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.estado_medico} onChange={cambioDatos} readOnly required/>
            </label>

            <div className="d-flex w-100 gap-3">
                <button id="btnActualizar" type="submit"  className="btn btn-success flex-fill py-2" style={{ borderRadius: "12px" }}>Actualizar</button>
                <button id="btnCancelar" type="button" className="btn btn-danger flex-fill py-2" style={{ borderRadius: "12px" }} onClick={cancelar}>Cancelar</button>
            </div>
        </form>
    

        {/* MODALES */}
        <div className="modal fade" id="actualiza" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                    <h4 className="text-success fw-bold mb-3">¡Médico Actualizado!</h4>
                    <p className="text-muted mb-4">El médico ha sido actualizado en el sistema exitosamente.</p>
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

export default PerfilMedico
