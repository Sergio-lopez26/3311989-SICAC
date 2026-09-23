import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as bootstrap from 'bootstrap';

const API_URL = "http://localhost:5000/api/mapa_dental";

// Componente núcleo: recibe el Navbar del rol correspondiente y la ruta base
// hacia donde debe navegar al entrar al odontograma de un mapa puntual
// soloLectura: si es true, oculta formularios y botones de crear/editar/eliminar
const MapaDentalCore = ({ Navbar, rutaOdontograma, soloLectura = false }) => {

    const navegar = useNavigate();

    //Estados para los datos
    const [mostrarForm, setMostrarForm] = useState(false);
    const [mostrarForm2, setMostrarForm2] = useState(false);
    const [listMapas, setListMapas] = useState([]); //Almacenara los datos de mapa_dental

    const [datos, setDatos] = useState({
        id: "",
        id_historial_medico: "",
        nombre_estandar: "",
        observacion_inicial: "",
        estado_mapa_dental: "Activo"
    });

    // Ajuste: búsqueda por nombre del mapa o nombre del paciente en vez de depender del ID.
    const [busqueda, setBusqueda] = useState("");

    const mapasFiltrados = listMapas.filter((mapa) => {
        const termino = busqueda.trim().toLowerCase();
        if (!termino) return true;

        const textoBusqueda = [
            mapa.nombre_estandar,
            mapa.nombre_paciente,
            mapa.id_historial_medico,
            mapa.estado_mapa_dental
        ].join(" ").toLowerCase();

        return textoBusqueda.includes(termino);
    });

    //Esto es para que se muestren los datos desde la BD en la tabla
    const obtenerDatosIniciales = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setListMapas(data);
        } catch (error) {
            console.error("Error al obtener datos del servidor:", error);
            alert("No se pudieron cargar los datos desde el servidor.");
        }
    };

    useEffect(() => {
        obtenerDatosIniciales();
    }, []);

    //Esto es para al elegir una fila se muestre el form con sus respectivos datos
    const eligeRegistro = (mapa) => {
        setDatos({ ...mapa });
        setMostrarForm(true);
        setMostrarForm2(false);
    };

    //Con esto se va cambiando los datos conforme se seleccione una fila de la tabla
    const cambioInput = (e) => {
        const { name, value } = e.target;
        setDatos({ ...datos, [name]: value });
    };

    const mostrarFormulario2 = () => {
        setMostrarForm2(true);
        setMostrarForm(false);
        setDatos({
            id: "",
            id_historial_medico: "",
            nombre_estandar: "",
            observacion_inicial: "",
            estado_mapa_dental: "Activo"
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
            console.error("Error al registrar el mapa dental:", error);
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
            console.error("Error al actualizar mapa dental:", error);
            alert("Hubo un error en el servidor al intentar actualizar.");
        }
    };

    const cancelar = () => {
        setMostrarForm(false);
        setMostrarForm2(false);
        setDatos({
            id: "",
            id_historial_medico: "",
            nombre_estandar: "",
            observacion_inicial: "",
            estado_mapa_dental: "Activo"
        });
    };

    //Con esto navegamos hacia el odontograma del mapa seleccionado, sin disparar la selección de fila
    const irAOdontograma = (e, idMapa) => {
        e.stopPropagation();
        navegar(`${rutaOdontograma}/${idMapa}`);
    };

    return (
        <>
        <Navbar />

        <header className="text-center mt-3">
            <h1 style={{ color: "#103e6e", fontWeight: "bolder" }}>Mapas Dentales</h1>
            <h6>Elige un mapa dental para Editar, o gestiona sus piezas con el botón "Odontograma"</h6>
        </header>

        <div className="container-fluid mt-4">
            <div className="d-flex flex-nowrap justify-content-center gap-4">

                {!soloLectura && mostrarForm && (
                <div id="wrapperForm" className="card shadow p-4" style={{ flexShrink: 0, marginBottom: "30px", maxWidth: "350px" }}>
                    <form id="formMapaDental" onSubmit={actualizar}>
                        <label htmlFor="id_historial_medico" className="d-block mb-3">ID Historial Médico
                        <input type="number" name="id_historial_medico" id="id_historial_medico" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.id_historial_medico} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="nombre_estandar" className="d-block mb-3">Nombre Estándar
                        <input type="text" name="nombre_estandar" id="nombre_estandar" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.nombre_estandar} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="observacion_inicial" className="d-block mb-3">Observación Inicial
                        <textarea name="observacion_inicial" id="observacion_inicial" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.observacion_inicial || ""} onChange={cambioInput} rows="3"/>
                        </label>

                        <label htmlFor="estado_mapa_dental" className="d-block mb-3">Estado
                        <select name="estado_mapa_dental" id="estado_mapa_dental" className="form-select border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.estado_mapa_dental} onChange={cambioInput} required>
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                        </label>

                        <div className="d-flex w-100 gap-3 mb-2">
                            <button id="btnActualizar" type="submit" className="btn btn-success flex-fill py-2" style={{ borderRadius: "12px" }}>Actualizar</button>
                            <button id="btnCancelar" type="button" className="btn btn-danger flex-fill py-2" style={{ borderRadius: "12px" }} onClick={cancelar}>Cancelar</button>
                        </div>

                        <button type="button" className="btn btn-primary w-100 py-2" style={{ borderRadius: "12px" }} onClick={(e) => irAOdontograma(e, datos.id)}>
                            Ver Odontograma
                        </button>
                    </form>
                </div>
                )}

                {!soloLectura && mostrarForm2 && (
                <div id="wrapperForm" className="card shadow p-4" style={{ flexShrink: 0, marginBottom: "30px", maxWidth: "350px" }}>
                    <form id="formMapaDental2" onSubmit={registrar}>
                        <label htmlFor="id_historial_medico" className="d-block mb-3">ID Historial Médico
                        <input type="number" name="id_historial_medico" id="id_historial_medico" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.id_historial_medico} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="nombre_estandar" className="d-block mb-3">Nombre Estándar
                        <input type="text" name="nombre_estandar" id="nombre_estandar" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.nombre_estandar} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="observacion_inicial" className="d-block mb-3">Observación Inicial
                        <textarea name="observacion_inicial" id="observacion_inicial" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.observacion_inicial || ""} onChange={cambioInput} rows="3"/>
                        </label>

                        <label htmlFor="estado_mapa_dental" className="d-block mb-3">Estado
                        <select name="estado_mapa_dental" id="estado_mapa_dental" className="form-select border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.estado_mapa_dental} onChange={cambioInput} required>
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                        </label>

                        <div className="d-flex w-100 gap-3">
                            <button id="btnRegistrar" type="submit" className="btn btn-success flex-fill py-2" style={{ borderRadius: "12px" }}>Registrar</button>
                            <button id="btnCancelar" type="button" className="btn btn-danger flex-fill py-2" style={{ borderRadius: "12px" }} onClick={cancelar}>Cancelar</button>
                        </div>
                    </form>
                </div>
                )}

                <section id="tablaMapaDental" className="flex-grow-1" style={{ marginRight: "10px", minWidth: 0, maxWidth: "46vw", alignSelf: "flex-start" }}>
                    <div className="shadow-sm mb-0 bg-default p-1">
                        <div className="d-flex w-100 gap-3">
                            <input
                                type="text" className="form-control form-control-lg" placeholder="Buscar por nombre estándar o nombre del paciente..."
                                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                            />
                            {!soloLectura && (
                                <button id="btnRegistrar" type="button" className="btn btn-primary flex-fill py-2" style={{ borderRadius: "12px" }} onClick={mostrarFormulario2}>Nuevo</button>
                            )}
                        </div>
                        <div style={{ overflowX: "auto" }}>
                        <table id="tmapadental" className="table table-striped table-hover shadow-sm align-middle mb-0" style={{ border: "3px solid rgb(255, 255, 255)", borderRadius: "10px", overflow: "hidden" }}>
                            <thead className="table-dark text-center align-middle">
                                <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Paciente</th>
                                <th scope="col">Nombre Estándar</th>
                                <th scope="col">Estado</th>
                                <th scope="col">Odontograma</th>
                                </tr>
                            </thead>
                            <tbody className="text-center" style={{ cursor: "pointer" }}>
                                {mapasFiltrados.length > 0 ? (
                                    mapasFiltrados.map((mapa) => (
                                        <tr key={mapa.id} onClick={() => eligeRegistro(mapa)}>
                                            <th scope="row">{mapa.id}</th>
                                            <td>{mapa.nombre_paciente || "N/A"}</td>
                                            <td>{mapa.nombre_estandar}</td>
                                            <td>{mapa.estado_mapa_dental}</td>
                                            <td>
                                                <button type="button" className="btn btn-sm btn-primary" style={{ borderRadius: "10px" }} onClick={(e) => irAOdontograma(e, mapa.id)}>
                                                    Ver
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-4">
                                            No se encontraron mapas dentales con ese criterio de búsqueda.
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
                        <h4 className="text-success fw-bold mb-3">¡Mapa Dental Actualizado!</h4>
                        <p className="text-muted mb-4">El mapa dental ha sido actualizado en el sistema exitosamente.</p>
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
                        <p className="text-muted mb-4">El mapa dental ha sido registrado en el sistema exitosamente.</p>
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

export default MapaDentalCore;