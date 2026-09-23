import { useState, useEffect } from 'react';
import * as bootstrap from 'bootstrap';

const API_URL = "http://localhost:5000/api/servicio";
const API_URL_TIPO = "http://localhost:5000/api/tipo_servicio";

//Componente núcleo: recibe el Navbar del rol correspondiente
// soloLectura: si es true, oculta formularios y botones de crear/editar/eliminar
const ServicioCore = ({ Navbar, soloLectura = false }) => {

    //Estados para los datos
    const [mostrarForm, setMostrarForm] = useState(false);
    const [mostrarForm2, setMostrarForm2] = useState(false);
    const [listServicios, setListServicios] = useState([]);
    const [tiposServicio, setTiposServicio] = useState([]); //Catálogo, para el select y para mostrar el nombre en la tabla

    const [datos, setDatos] = useState({
        id: "",
        id_tipo_servicio: "",
        id_diagnostico: "",
        nombre_servicio: "",
        procedimiento: "",
        precio_aplicado: ""
    });

    // Ajuste: filtro de búsqueda por nombre del servicio, paciente, tipo y otros datos relevantes, no solo por ID.
    const [busqueda, setBusqueda] = useState("");

    const serviciosFiltrados = listServicios.filter((servicio) => {
        const termino = busqueda.trim().toLowerCase();
        if (!termino) return true;

        const textoBusqueda = [
            servicio.nombre_servicio,
            servicio.nombre_paciente,
            nombreTipoServicio(servicio.id_tipo_servicio),
            servicio.id_diagnostico,
            servicio.procedimiento,
            servicio.precio_aplicado
        ].join(" ").toLowerCase();

        return textoBusqueda.includes(termino);
    });

    //Esto es para que se muestren los datos desde la BD en la tabla
    const obtenerDatosIniciales = async () => {
        try {
            const [resServicios, resTipos] = await Promise.all([
                fetch(API_URL),
                fetch(API_URL_TIPO)
            ]);

            const dataServicios = await resServicios.json();
            const dataTipos = await resTipos.json();

            setListServicios(dataServicios);
            setTiposServicio(dataTipos);
        } catch (error) {
            console.error("Error al obtener datos del servidor:", error);
            alert("No se pudieron cargar los datos desde el servidor.");
        }
    };

    useEffect(() => {
        obtenerDatosIniciales();
    }, []);

    //Con esto se busca el nombre del tipo de servicio, ya que el backend no lo trae unido en la consulta
    const nombreTipoServicio = (idTipo) => {
        const tipo = tiposServicio.find(t => t.id === Number(idTipo));
        return tipo ? tipo.tipo_servicio : "—";
    };

    //Esto es para al elegir una fila se muestre el form con sus respectivos datos
    const eligeRegistro = (servicio) => {
        setDatos({ ...servicio });
        setMostrarForm(true);
        setMostrarForm2(false);
    };

    const cambioInput = (e) => {
        const { name, value } = e.target;
        setDatos({ ...datos, [name]: value });
    };

    //Al elegir el tipo de servicio en el registro nuevo, se muestra como referencia su precio actual del catálogo
    const cambioTipoServicio = (e) => {
        const idTipo = e.target.value;
        const tipo = tiposServicio.find(t => t.id === Number(idTipo));

        setDatos({
            ...datos,
            id_tipo_servicio: idTipo,
            precio_aplicado: tipo ? tipo.precio_actual : ""
        });
    };

    const mostrarFormulario2 = () => {
        setMostrarForm2(true);
        setMostrarForm(false);
        setDatos({
            id: "",
            id_tipo_servicio: "",
            id_diagnostico: "",
            nombre_servicio: "",
            procedimiento: "",
            precio_aplicado: ""
        });
    };

    const modalRegistro = async () => {
        const modalReg = document.getElementById('registro');
        const modalExiste = bootstrap.Modal.getInstance(modalReg);
        if (modalExiste) modalExiste.hide();

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';

        await obtenerDatosIniciales();

        setMostrarForm2(false);
        setBusqueda("");
    };

    const modalActualiza = () => {
        const modalAct = document.getElementById('actualiza');
        const modalExiste = bootstrap.Modal.getInstance(modalAct);
        if (modalExiste) modalExiste.hide();

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';

        setMostrarForm(false);
    };

    const registrar = async (e) => {
        e.preventDefault();

        try {
            //Nota: el backend calcula precio_aplicado automáticamente desde el catálogo tipo_servicio al registrar
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            const data = await res.json();

            if (res.ok) {
                const modalReg = document.getElementById('registro');
                let modalBootstrap = bootstrap.Modal.getInstance(modalReg) || new bootstrap.Modal(modalReg);
                modalBootstrap.show();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error al registrar el servicio:", error);
            alert("Hubo un error de conexión con el servidor.");
        }
    };

    const actualizar = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${API_URL}/${datos.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            if (res.ok) {
                await obtenerDatosIniciales();

                const modalAct = document.getElementById('actualiza');
                let modalBootstrap = bootstrap.Modal.getInstance(modalAct) || new bootstrap.Modal(modalAct);
                modalBootstrap.show();
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error al actualizar servicio:", error);
            alert("Hubo un error en el servidor al intentar actualizar.");
        }
    };

    const cancelar = () => {
        setMostrarForm(false);
        setMostrarForm2(false);
        setDatos({
            id: "",
            id_tipo_servicio: "",
            id_diagnostico: "",
            nombre_servicio: "",
            procedimiento: "",
            precio_aplicado: ""
        });
    };

    return (
        <>
        <Navbar />

        <header className="text-center mt-3">
            <h1 style={{ color: "#103e6e", fontWeight: "bolder" }}>Servicios</h1>
            <h6>Elige un servicio para Editar</h6>
        </header>

        <div className="container-fluid mt-4">
            <div className="d-flex flex-nowrap justify-content-center gap-4">

                {!soloLectura && mostrarForm && (
                <div id="wrapperForm" className="card shadow p-4" style={{ flexShrink: 0, marginBottom: "30px", maxWidth: "350px" }}>
                    <form id="formServicio" onSubmit={actualizar}>
                        <label htmlFor="id_tipo_servicio" className="d-block mb-3">Tipo de Servicio
                        <select name="id_tipo_servicio" id="id_tipo_servicio" className="form-select border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.id_tipo_servicio} onChange={cambioInput} required>
                            <option value="" disabled>Seleccione el tipo de servicio</option>
                            {tiposServicio.map((tipo) => (
                                <option key={tipo.id} value={tipo.id}>{tipo.tipo_servicio}</option>
                            ))}
                        </select>
                        </label>

                        <label htmlFor="id_diagnostico" className="d-block mb-3">ID Diagnóstico
                        <input type="number" name="id_diagnostico" id="id_diagnostico" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.id_diagnostico} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="nombre_servicio" className="d-block mb-3">Nombre del Servicio
                        <input type="text" name="nombre_servicio" id="nombre_servicio" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.nombre_servicio} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="procedimiento" className="d-block mb-3">Procedimiento
                        <textarea name="procedimiento" id="procedimiento" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.procedimiento || ""} onChange={cambioInput} rows="3"/>
                        </label>

                        <label htmlFor="precio_aplicado" className="d-block mb-3">Precio Aplicado
                        <input type="number" step="0.01" name="precio_aplicado" id="precio_aplicado" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.precio_aplicado} onChange={cambioInput} required/>
                        </label>

                        <div className="d-flex w-100 gap-3">
                            <button id="btnActualizar" type="submit" className="btn btn-success flex-fill py-2" style={{ borderRadius: "12px" }}>Actualizar</button>
                            <button id="btnCancelar" type="button" className="btn btn-danger flex-fill py-2" style={{ borderRadius: "12px" }} onClick={cancelar}>Cancelar</button>
                        </div>
                    </form>
                </div>
                )}

                {!soloLectura && mostrarForm2 && (
                <div id="wrapperForm" className="card shadow p-4" style={{ flexShrink: 0, marginBottom: "30px", maxWidth: "350px", maxHeight: "55vh" }}>
                    <form id="formServicio2" onSubmit={registrar}>
                        <label htmlFor="id_tipo_servicio" className="d-block mb-3">Tipo de Servicio
                        <select name="id_tipo_servicio" id="id_tipo_servicio" className="form-select border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.id_tipo_servicio} onChange={cambioTipoServicio} required>
                            <option value="" disabled>Seleccione el tipo de servicio</option>
                            {tiposServicio.map((tipo) => (
                                <option key={tipo.id} value={tipo.id}>{tipo.tipo_servicio} (${tipo.precio_actual})</option>
                            ))}
                        </select>
                        </label>

                        <label htmlFor="id_diagnostico" className="d-block mb-3">ID Diagnóstico
                        <input type="number" name="id_diagnostico" id="id_diagnostico" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.id_diagnostico} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="nombre_servicio" className="d-block mb-3">Nombre del Servicio
                        <input type="text" name="nombre_servicio" id="nombre_servicio" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.nombre_servicio} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="procedimiento" className="d-block mb-3">Procedimiento
                        <textarea name="procedimiento" id="procedimiento" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.procedimiento || ""} onChange={cambioInput} rows="3"/>
                        </label>

                        {datos.id_tipo_servicio && (
                        <p className="text-muted small">Precio de referencia del catálogo: ${datos.precio_aplicado}</p>
                        )}

                        <div className="d-flex w-100 gap-3">
                            <button id="btnRegistrar" type="submit" className="btn btn-success flex-fill py-2" style={{ borderRadius: "12px" }}>Registrar</button>
                            <button id="btnCancelar" type="button" className="btn btn-danger flex-fill py-2" style={{ borderRadius: "12px" }} onClick={cancelar}>Cancelar</button>
                        </div>
                    </form>
                </div>
                )}

                <section id="tablaServicios" className="flex-grow-1" style={{ marginRight: "10px", minWidth: 0, maxWidth: "40vw", alignSelf: "flex-start" }}>
                    <div className="shadow-sm mb-0 bg-default p-1">
                        <div className="d-flex w-100 gap-3">
                            <input
                                type="text" className="form-control form-control-lg" placeholder="Buscar por nombre del servicio o del paciente..."
                                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                            />
                            {!soloLectura && (
                                <button id="btnRegistrar" type="button" className="btn btn-primary flex-fill py-2" style={{ borderRadius: "12px" }} onClick={mostrarFormulario2}>Nuevo</button>
                            )}
                        </div>
                        <div style={{ overflowX: "auto" }}>
                        <table id="tservicios" className="table table-striped table-hover shadow-sm align-middle mb-0" style={{ border: "3px solid rgb(255, 255, 255)", borderRadius: "10px", overflow: "hidden" }}>
                            <thead className="table-dark text-center align-middle">
                                <tr>
                                <th scope="col">Paciente</th>
                                <th scope="col">Servicio</th>
                                <th scope="col">Tipo</th>
                                <th scope="col">ID Diagnóstico</th>
                                <th scope="col">Precio Aplicado</th>
                                </tr>
                            </thead>
                            <tbody className="text-center" style={{ cursor: "pointer" }}>
                                {serviciosFiltrados.length > 0 ? (
                                    serviciosFiltrados.map((servicio) => (
                                        <tr key={servicio.id} onClick={() => eligeRegistro(servicio)}>
                                            <td>{servicio.nombre_paciente || "N/A"}</td>
                                            <td>{servicio.nombre_servicio}</td>
                                            <td>{nombreTipoServicio(servicio.id_tipo_servicio)}</td>
                                            <td>{servicio.id_diagnostico}</td>
                                            <td>${servicio.precio_aplicado}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-4">
                                            No se encontraron servicios con ese criterio de búsqueda.
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
                        <h4 className="text-success fw-bold mb-3">¡Servicio Actualizado!</h4>
                        <p className="text-muted mb-4">El servicio ha sido actualizado en el sistema exitosamente.</p>
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
                        <p className="text-muted mb-4">El servicio ha sido registrado en el sistema exitosamente.</p>
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
};

export default ServicioCore;