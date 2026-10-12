import Navbar from "../../components/NavbarAdmin"
import { useState, useEffect } from 'react';
import * as bootstrap from 'bootstrap'
import RegistroInicial from "../Ingreso/RegistroInicial"; //Se importa esta funcion de la pagina a la cual llamaremos como modal

const API_URL = "http://localhost:5000/api/medico";
const API_URL_U = "http://localhost:5000/api/usuario";
const API_URL_T_DOC = "http://localhost:5000/api/tipo_documento";

const RegistroMedico = () =>{

    //Estados para los datos
    const [mostrarForm, setMostrarForm] = useState(false);
    const [listUsuario, setListUsuario] = useState([]); //Almacenara los datos de usuario, no de medico
    const [tiposDoc, setTiposDoc] = useState([]); //Almacenara los datos de tipo de documento

    const datosInciales = {
        //Con lo siguiente, el formulario se "reinicia" tras el registro, ya que este será su estado natural
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
        estado_medico: "Activo"
    };

    const [datos, setDatos] = useState(datosInciales);

    //Importante para búsqueda y consulta
    const [busqueda, setBusqueda] = useState("");

    const obtenerDatosVarios = async () => {
        try {
            const [resUsuario, resTipoDoc] = await Promise.all([
                fetch(API_URL_U),
                fetch(API_URL_T_DOC)
            ])
            const dataUsuario = await resUsuario.json(); //Se llama al GET '/' de usuario del backend en formato json
            const dataTipoDoc = await resTipoDoc.json();

            setListUsuario(dataUsuario);
            setTiposDoc(dataTipoDoc);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
        }
    };

    useEffect(() => {
        obtenerDatosVarios();
    }, []);

    //Filtrado de email
    const usuariosFiltrados = listUsuario.filter((usuario) => {
        const emailUsuario = (usuario.email || "").toLowerCase();
        const termino = busqueda.toLowerCase();
        //Si el buscador está vacío no muestra nada, si escribe, filtra coincidencias
        return termino !== "" && emailUsuario.includes(termino);
    });

    //Cuando como Admin hacemos clic en un resultado de la búsqueda previa
    const seleccionarUsuario = (usuario) => {
        setBusqueda(usuario.email); //Deja el email seleccionado visible en la barra de búsqueda

        //Se rellena las credenciales del formulario en modo lectura, tal como en RegistroPaciente
        setDatos({
            ...datosInciales,
            id_usuario: usuario.id,
            email: usuario.email,
            password: usuario.password || "********" //Pass encriptado que ya está en la BD
        });
        
        setMostrarForm(true); //
    };

    //Con esto se va cambiando los datos conforme se seleccione una fila de la tabla
    const cambioInput = (e) =>{
        const {name, value} = e.target;
        setDatos({ ...datos, [name]: value });
    };

    const modalRegistro = () => {
        const modalReg = document.getElementById('registro');
        const modalExiste = bootstrap.Modal.getInstance(modalReg);

        if(modalExiste){
            modalExiste.hide();
        }

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';

        setMostrarForm(false);
        setBusqueda("");
        setDatos(datosInciales);
    };

    const usuarioModal = async (usuarioNuevo) => {
        //Para que se el botón x del modal automaticamente
        const cerrarModal = document.querySelector('#modalNuevoUsuario .btn-close');
        if (cerrarModal) {
            cerrarModal.click(); // Se cierra este modal y limpia el fondo
        }
        await obtenerDatosVarios(); //Se refresca la lista de la BD
        //Se resetea el email en búsqueda para que coincida con el nuevo email registrado
        setBusqueda(usuarioNuevo.email);
    };

    const Registrar = async (e) => {
        e.preventDefault();
                
        try{
            //Cuando se va a agregar un nuevo registro
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos) //Con esta línea, se envian los datos capturados
            });

            const data = await res.json(); //Acá se lee la respuesta desde el express

            //Si esta bien todo
            if(res.ok){
                const modalReg = document.getElementById('registro');
                let modalBootstrap = bootstrap.Modal.getInstance(modalReg) || new bootstrap.Modal(modalReg);
                modalBootstrap.show();
            }else{
                alert(`Error: ${data.error}`); //Este mensaje nos muestra el error exacto que nos envie el backend
            }
        } catch (error) {
            console.error("Error al registrar el usuario:", error);
            alert("Hubo un error de conexión con el servidor.");
        }
    };

    const cancelar = () =>{
        setMostrarForm(false);
        setBusqueda("");
        setDatos(datosInciales);
    }; 

    return(
        <>
        <Navbar />
        
        <header className="text-center mt-3">
            <h1 style={{ color: "#103e6e", fontWeight: "bolder" }}>Registar Nuevo Médico</h1>
            <h5 style={{ color: "#103e6e", fontWeight: "bolder" }}>Para regitrar al médico, se requiere de un usuario registrado</h5>
            <button type="button" className="btn btn-link p-0 mb-1 fw-bold" data-bs-toggle="modal" data-bs-target="#modalNuevoUsuario">
                Registrar nuevo usuario aquí
            </button>
            <h6 className="text-muted middle">En caso de ya contar con un usuario registrado, por favor consultarlo a continuación</h6>
        </header>

        <div className="mb-4 container" style={{ maxWidth: "800px" }}>
            <input
                type="text" className="form-control form-control-lg" placeholder="Buscar por email..." 
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)} 
                style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }}
            />
        </div>

        <div className="container-fluid mt-4 px-4">
            <div className="row g-4 justify-content-center">
                <div className="col-12 col-lg-6" style={{ maxWidth: "550px", alignSelf: "flex-start"  }}>
                    <div className="shadow-sm mb-0 bg-default p-1" style={{ borderRadius: "12px", overflow: "hidden" }}>
                        
                        <div style={{ overflowX: "auto" }}>
                            <table id="tusuario" className="table table-striped table-hover shadow-sm align-middle mb-0" style={{ border: "3px solid rgb(255, 255, 255)", borderRadius: "10px", overflow: "hidden" }} >
                                <thead className="table-dark text-center align-middle">
                                    <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Password</th>
                                    </tr>
                                </thead>
                                <tbody style={{ cursor: "pointer" }}>
                                    {usuariosFiltrados.length > 0 ? (
                                        usuariosFiltrados.map((usuario) => (
                                            <tr key={usuario.id} onClick={() => seleccionarUsuario(usuario)}>
                                                <th scope="row">{usuario.id}</th>
                                                <td>{usuario.email}</td>
                                                <td>••••••••</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center text-muted py-4">
                                                No se encontraron usuarios registrados con ese email.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div className="col-12 col-lg-6" style={{ maxWidth: "550px", alignSelf: "flex-start"  }}>

                    {mostrarForm ? (
                    <div id="wrapperForm" className="card shadow-sm border-0 p-4" style={{ borderRadius: "16px", backgroundColor: "#ffffff", marginBottom: "16px"}}>
                        <h5 className="fw-bold mb-3" style={{ color: "#103e6e" }}>Registro de Datos Personales del Médico</h5>
                        
                        <form id="formMedico" onSubmit={Registrar}>                          

                            <label htmlFor="id_tipo_documento" className="d-block mb-3">Tipo de documento
                            {/* SELECT DINÁMICO MAPEADO DESDE EL DB.JSON */}
                            <select name="id_tipo_documento" id="id_tipo_documento" className="form-select border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.id_tipo_documento} onChange={cambioInput} required>
                                <option value="">Seleccione el tipo de documento</option>
                                {tiposDoc.map((doc) => (
                                    <option key={doc.id} value={doc.id}>
                                        {doc.sigla} - {doc.nombre_documento}
                                    </option>
                                ))}
                            </select>
                            </label>

                            <label htmlFor="numero_documento" className="d-block mb-3">Número de documento
                            <input type="text" name="numero_documento" id="numero_documento" pattern="[0-9]{7-10}" maxLength="10" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.numero_documento} onChange={cambioInput} required/>
                            </label>

                            <label htmlFor="email" className="d-block mb-3">Email
                            <input type="email" name="email" id="email" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.email} onChange={cambioInput} readOnly required/>
                            </label>
                            
                            <label htmlFor="password" className="d-block mb-3" >Password
                            <input type="password" name="password" id="password" placeholder="********" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.password} onChange={cambioInput} readOnly required/>
                            </label>

                            <label htmlFor="nombres" className="d-block mb-3">Nombres
                            <input type="text" name="nombres" id="nombres" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.nombres} onChange={cambioInput} required/>
                            </label>

                            <label htmlFor="apellidos" className="d-block mb-3">Apellidos
                            <input type="text" name="apellidos" id="apellidos" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.apellidos} onChange={cambioInput} required/>
                            </label>

                            <label htmlFor="matricula_profesional" className="d-block mb-3">Matricula Profesional
                            <input type="text" name="matricula_profesional" id="matricula_profesional" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.matricula_profesional} onChange={cambioInput} />
                            </label>

                            <label htmlFor="numero_celular" className="d-block mb-3">Número de Celular
                            <input type="tel" name="numero_celular" id="numero_celular" className="form-control border-primary-subtle" placeholder="3xxxxxxxxx" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.numero_celular} onChange={cambioInput} required/> {/*pattern="3[0-9]{9}"*/}
                            </label>
                            
                            {/* Falta fecha_registro, no obstante este campo es timestamp, por ende no será visible en el registro */}
                            
                            {/* Falta estado_medico, no obstante este campo será Activo, y solo se puede actualizar no registrar como algo diferente de Activo, por ende no será visible en el registro */}

                            <div className="d-flex w-100 gap-3">
                                <button id="btnRegistrar" type="submit"  className="btn btn-success flex-fill py-2" style={{ borderRadius: "12px" }}>Registrar</button>
                                <button id="btnCancelar" type="button" className="btn btn-danger flex-fill py-2" style={{ borderRadius: "12px" }} onClick={cancelar}>Cancelar</button>
                            </div>
                        </form>
                    </div> 
                    ) : ( 
                        <div className="card shadow-sm border-0 p-4 text-center justify-content-center h-100" style={{ borderRadius: "16px", backgroundColor: "#f8f9fa", border: "2px dashed #c2dbfe", minHeight: "350px", marginBottom: "16px" }}>
                            <p className="text-muted mb-0">Seleccione una cuenta de la lista de búsqueda para completar los datos de registro del odontólogo.</p>
                        </div>
                    )}             
                </div>
            </div>
        </div>
        
        {/* MODAL */}
        <div className="modal fade" id="registro" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
            <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                    <h4 className="text-success fw-bold mb-3">¡Registro Exitoso!</h4>
                    <p className="text-muted mb-4">El médico ha sido registrado en el sistema exitosamente.</p>
                    <button type="button" className="btn btn-primary w-100 py-2" id="btnExito" style={{borderRadius: "12px"}} onClick={modalRegistro}>
                        Continuar
                    </button>
                </div>
            </div>
        </div>

        {/* MODAL Nuevo Usuario */}
        <div className="modal fade" id="modalNuevoUsuario" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
            <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "400px"}}>
                <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold" style={{ color: "#103e6e" }}>Crear Nueva Cuenta de Usuario</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {/* Se llama el props */}
                        <RegistroInicial propsRegistro={usuarioModal} />
                    </div>
                </div>
            </div>
        </div>
    </>
    );
}

export default RegistroMedico;