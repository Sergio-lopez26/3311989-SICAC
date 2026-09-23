import Navbar from "../../components/NavbarAdmin"
import { useState, useEffect } from 'react';
import * as bootstrap from 'bootstrap'

const API_URL = "http://localhost:5000/api/tipo_documento";

const GestionarTipoDocumento = () =>{

    //Estados para los datos
    const [mostrarForm, setMostrarForm] = useState(false);
    const [mostrarForm2, setMostrarForm2] = useState(false);
    const [listTipoDoc, setListTipoDoc] = useState([]); //Almacenara los datos de tipos de documento

    const [datos, setDatos] = useState({
        id: "",
        sigla: "",
        nombre_documento: ""
    });

    //Importante para búsqueda y consulta
    const [busqueda, setBusqueda] = useState("");

    const tipoDocFiltrados = listTipoDoc.filter((tipoDoc) => {
        const tipo = (tipoDoc.sigla).toLowerCase();

        return (
            tipo.includes(busqueda.toLowerCase())
        );
    });

    //Esto es para que se muestren los datos desde la BD en la tabla
    const obtenerDatosIniciales = async () => {
        try {
            //Se hacen peticiones al backend mediante las url
            const [resTipoDoc] = await Promise.all([
                fetch(API_URL),
            ]);
            
            const dataTipoDoc = await resTipoDoc.json();

            setListTipoDoc(dataTipoDoc);
        } catch (error) {
            console.error("Error al obtener datos del servidor:", error);
            alert("No se pudieron cargar los datos desde el servidor.");
        }
    };

    useEffect(() => {
        obtenerDatosIniciales();
    }, []);

    //Esto es para al elegir una fila se muestre el form con sus respectivos datos
    const eligeRegistro = (tipoDoc) =>{
        setDatos({
            ...tipoDoc,
        });
        setMostrarForm(true);
        setMostrarForm2(false);
    };

    //Con esto se va cambiando los datos conforme se seleccione una fila de la tabla
    const cambioInput = (e) =>{
        const {name, value} = e.target;
        if (name === "sigla") {
            setDatos({ ...datos, [name]: value.toUpperCase() });
        } else {
            setDatos({ ...datos, [name]: value });
        }
    };

    const mostrarFormulario2 = () =>{
        setMostrarForm2(true);
        setMostrarForm(false);
        setDatos({
            id: "",
            sigla: "",
            nombre_documento: ""
        });
    }

    const modalRegistro = () => {
        const modalReg = document.getElementById('registro');
        const modalExiste = bootstrap.Modal.getInstance(modalReg);

        if(modalExiste){
            modalExiste.hide();
        }

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';

        setMostrarForm2(false);
        setBusqueda("");
        setDatos();
    };

    const modalActualiza = () =>{
        const modalAct = document.getElementById('actualiza');
        const modalExiste = bootstrap.Modal.getInstance(modalAct);
        if(modalExiste) modalExiste.hide();

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = ''; //Borra el fondo negro si se queda pegado o se bloquea la pagina

        setMostrarForm(false);
    };

    const registrar = async (e) => {
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
            console.error("Error al registrar el tipo de documento:", error);
            alert("Hubo un error de conexión con el servidor.");
        }
    };

    const actualizar = async (e) => {
        e.preventDefault();

        try {
            //Cuando se va a actualizar un registro
            const res = await fetch(`${API_URL}/${datos.id}`, {
                method: "PUT",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            });

            if(res.ok){
                await obtenerDatosIniciales();

                const modalAct = document.getElementById('actualiza');
                let modalBootstrap = bootstrap.Modal.getInstance(modalAct) || new bootstrap.Modal(modalAct);
                modalBootstrap.show();
            }else{
                const errorData = await res.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error al actualizar tipo de documento:", error);
            alert("Hubo un error en el servidor al intentar actualizar.");
        }
    };

    const cancelar = () =>{
        setMostrarForm(false);
        setMostrarForm2(false);
        setDatos({
            id: "",
            sigla: "",
            nombre_documento: ""
        });
    };

    return(
        <>
        <Navbar />
        
        <header className="text-center mt-3">
            <h1 style={{ color: "#103e6e", fontWeight: "bolder" }}>Tipos de Documento</h1>
            <h6>Elige una Fila para Editar</h6>
        </header>

        <div className="container-fluid mt-4"> 
            <div className="d-flex flex-nowrap justify-content-center gap-4" >

                {mostrarForm && (
                <div id="wrapperForm" className="card shadow p-4" style={{ flexShrink: 0, marginBottom: "30px" }}>
                    <form id="formTipoDocumento" onSubmit={actualizar}>
                        <label htmlFor="sigla" className="d-block mb-3">Sigla
                        <input type="text" name="sigla" id="sigla" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.sigla} onChange={cambioInput} readOnly required/>
                        </label>

                        <label htmlFor="nombre_documento" className="d-block mb-3">Nombre de Documento
                        <input type="text" name="nombre_documento" id="nombre_documento" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.nombre_documento} onChange={cambioInput} required/>
                        </label>

                        <div className="d-flex w-100 gap-3">
                            <button id="btnActualizar" type="submit"  className="btn btn-success flex-fill py-2" style={{ borderRadius: "12px" }}>Actualizar</button>
                            <button id="btnCancelar" type="button" className="btn btn-danger flex-fill py-2" style={{ borderRadius: "12px" }} onClick={cancelar}>Cancelar</button>
                        </div>
                    </form>
                </div>
                )}

                {mostrarForm2 && (
                <div id="wrapperForm" className="card shadow p-4" style={{ flexShrink: 0, marginBottom: "30px" }}>
                    <form id="formTipoDocumento2" onSubmit={registrar}>
                        <label htmlFor="sigla" className="d-block mb-3">Sigla
                        <input type="text" name="sigla" id="sigla" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.sigla} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="nombre_documento" className="d-block mb-3">Nombre de Documento
                        <input type="text" name="nombre_documento" id="nombre_documento" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.nombre_documento} onChange={cambioInput} required/>
                        </label>

                        <div className="d-flex w-100 gap-3">
                            <button id="btnRegistrar" type="submit"  className="btn btn-success flex-fill py-2" style={{ borderRadius: "12px" }}>Registrar</button>
                            <button id="btnCancelar" type="button" className="btn btn-danger flex-fill py-2" style={{ borderRadius: "12px" }} onClick={cancelar}>Cancelar</button>
                        </div>
                    </form>
                </div>
                )}

                <section id="TablaTipoDocumento" className="flex-grow-1" style={{ marginRight: "10px", minWidth: 0, maxWidth: "30vw", alignSelf: "flex-start" }}>
                    <div className="shadow-sm mb-0 bg-default p-1" >
                        <div className="d-flex w-100 gap-3">
                            <input
                                type="text" className="form-control form-control-lg" placeholder="Buscar por sigla..." 
                                value={busqueda} onChange={(e) => setBusqueda(e.target.value)} 
                            />
                            <button id="btnRegistrar" type="button" className="btn btn-primary flex-fill py-2" style={{ borderRadius: "12px" }} onClick={mostrarFormulario2}>Nuevo</button>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                        <table id="tpaciente" className="table table-striped table-hover shadow-sm align-middle mb-0" style={{ border: "3px solid rgb(255, 255, 255)", borderRadius: "10px", overflow: "hidden" }} >
                            <thead className="table-dark text-center align-middle">
                                <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Sigla</th>
                                <th scope="col">Nombre de Documento</th>
                                </tr>
                            </thead>
                            <tbody className="text-center" style={{ cursor: "pointer" }}>
                                {tipoDocFiltrados.length > 0 ? (
                                    tipoDocFiltrados.map((tipoDoc) => (
                                        <tr key={tipoDoc.id} onClick={() => eligeRegistro(tipoDoc)}>
                                            <th scope="row">{tipoDoc.id}</th>
                                            <td>{tipoDoc.sigla}</td>
                                            <td>{tipoDoc.nombre_documento}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center text-muted py-4">
                                            No se encontraron tipos de documento con ese criterio de búsqueda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </section>

                {/* MODALES */}
                <div className="modal fade" id="actualiza" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                        <h4 className="text-success fw-bold mb-3">¡Tipo de Documento Actualizado!</h4>
                        <p className="text-muted mb-4">El tipo de documento ha sido actualizado en el sistema exitosamente.</p>
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarV" style={{borderRadius: "12px"}} onClick={modalActualiza}>
                            Continuar
                        </button>
                    </div>
                </div>
                </div>

                <div className="modal fade" id="registro" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                        <h4 className="text-success fw-bold mb-3">¡Registro Exitoso!</h4>
                        <p className="text-muted mb-4">El tipo de documento ha sido registrado en el sistema exitosamente.</p>
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnExito" style={{borderRadius: "12px"}} onClick={modalRegistro}>
                            Continuar
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </div>
        </>
    );
}

export default GestionarTipoDocumento;