import Navbar from "../../components/NavbarAdmin";
import { useState, useEffect } from 'react';
import * as bootstrap from 'bootstrap';

const API_CITA = "http://localhost:5000/api/cita";
const API_TIPO_CITA = "http://localhost:5000/api/tipo_cita";
const API_MEDICO = "http://localhost:5000/api/medico";
const API_PACIENTE = "http://localhost:5000/api/paciente";
const API_METODO_PAGO = "http://localhost:5000/api/metodo_pago";
const API_PAGO = "http://localhost:5000/api/pago";

const estadoInicialCita = {
    id: "",
    id_tipo_cita: "",
    id_paciente: "",
    id_medico: "",
    fecha_cita: "",
    hora_inicio: "",
    hora_fin: "",
    estado_cita: "Programada"
};

const estadoInicialPago = {
    id_cita: "",
    id_metodo_pago: "",
    numero_pago: "",
    fecha_pago: new Date().toISOString().split("T")[0],
    monto_pagado: "",
    estado_pago: "Pagado"
};

const GestionarCitas = () => {

    const [mostrarForm, setMostrarForm] = useState(false);
    const [listCitas, setListCitas] = useState([]);
    const [tiposCita, setTiposCita] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [metodosPago, setMetodosPago] = useState([]);
    const [pagos, setPagos] = useState([]);

    const [datos, setDatos] = useState(estadoInicialCita);
    const [datosPago, setDatosPago] = useState(estadoInicialPago);
    const [citaSeleccionadaPago, setCitaSeleccionadaPago] = useState(null);

    const [busqueda, setBusqueda] = useState("");
    const [mensajeError, setMensajeError] = useState("");
    const [mensajeErrorPago, setMensajeErrorPago] = useState("");

    const obtenerDatosIniciales = async () => {
        try {
            const [resCita, resTipoCita, resMedico, resPaciente, resMetodoPago, resPago] = await Promise.all([
                fetch(API_CITA),
                fetch(API_TIPO_CITA),
                fetch(API_MEDICO),
                fetch(API_PACIENTE),
                fetch(API_METODO_PAGO),
                fetch(API_PAGO)
            ]);

            setListCitas(await resCita.json());
            setTiposCita(await resTipoCita.json());
            setMedicos(await resMedico.json());
            setPacientes(await resPaciente.json());
            setMetodosPago(await resMetodoPago.json());
            setPagos(await resPago.json());
        } catch (error) {
            console.error("Error al obtener datos del servidor:", error);
            alert("No se pudieron cargar los datos desde el servidor.");
        }
    };

    useEffect(() => {
        obtenerDatosIniciales();
    }, []);

    const citasFiltradas = listCitas.filter((cita) => {
        const termino = busqueda.toLowerCase();
        return (
            termino === "" ||
            (cita.paciente_nombre || "").toLowerCase().includes(termino) ||
            (cita.medico_nombre || "").toLowerCase().includes(termino) ||
            (cita.paciente_documento || "").toString().includes(termino) ||
            (cita.tipo_cita || "").toLowerCase().includes(termino) ||
            (cita.estado_cita || "").toLowerCase().includes(termino)
        );
    });

    const pagoDeCita = (idCita) => pagos.find(p => p.id_cita === idCita);

    // ---------- FORM DE CITA ----------
    const cambioInput = (e) => {
        const { name, value } = e.target;
        setDatos({ ...datos, [name]: value });
    };

    const nuevaCita = () => {
        setDatos(estadoInicialCita);
        setMensajeError("");
        setMostrarForm(true);
    };

    const eligeRegistro = (cita) => {
        setDatos({
            id: cita.id,
            id_tipo_cita: cita.id_tipo_cita,
            id_paciente: cita.id_paciente,
            id_medico: cita.id_medico,
            fecha_cita: cita.fecha_cita?.split("T")[0] || "",
            hora_inicio: cita.hora_inicio,
            hora_fin: cita.hora_fin,
            estado_cita: cita.estado_cita
        });
        setMensajeError("");
        setMostrarForm(true);
    };

    const guardarCita = async (e) => {
        e.preventDefault();
        setMensajeError("");

        const esEdicion = Boolean(datos.id);
        const url = esEdicion ? `${API_CITA}/${datos.id}` : API_CITA;
        const metodo = esEdicion ? "PUT" : "POST";

        const payload = {
            id_tipo_cita: Number(datos.id_tipo_cita),
            id_paciente: Number(datos.id_paciente),
            id_medico: Number(datos.id_medico),
            fecha_cita: datos.fecha_cita,
            hora_inicio: datos.hora_inicio,
            hora_fin: datos.hora_fin,
            estado_cita: datos.estado_cita
        };

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await obtenerDatosIniciales();
                setMostrarForm(false);

                const modalOk = document.getElementById('citaGuardada');
                let modalBootstrap = bootstrap.Modal.getInstance(modalOk) || new bootstrap.Modal(modalOk);
                modalBootstrap.show();
            } else {
                const errorData = await res.json();
                setMensajeError(errorData.error);
            }
        } catch (error) {
            console.error("Error al guardar la cita:", error);
            setMensajeError("Hubo un error de conexión con el servidor.");
        }
    };

    const eliminarCita = async (id) => {
        if (!window.confirm("¿Está seguro de eliminar esta cita? Esta acción no se puede deshacer.")) return;

        try {
            const res = await fetch(`${API_CITA}/${id}`, { method: "DELETE" });

            if (res.ok) {
                await obtenerDatosIniciales();
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error al eliminar la cita:", error);
            alert("Hubo un error de conexión con el servidor.");
        }
    };

    const cancelarForm = () => setMostrarForm(false);

    const cerrarModalCita = () => {
        const modalOk = document.getElementById('citaGuardada');
        const modalExiste = bootstrap.Modal.getInstance(modalOk);
        if (modalExiste) modalExiste.hide();
        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';
    };

    // ---------- MODAL DE PAGO ----------
    const abrirModalPago = (cita) => {
        setCitaSeleccionadaPago(cita);
        setMensajeErrorPago("");

        const pagoExistente = pagoDeCita(cita.id);
        if (pagoExistente) {
            setDatosPago({
                id: pagoExistente.id,
                id_cita: cita.id,
                id_metodo_pago: pagoExistente.id_metodo_pago,
                numero_pago: pagoExistente.numero_pago,
                fecha_pago: pagoExistente.fecha_pago?.split("T")[0] || "",
                monto_pagado: pagoExistente.monto_pagado,
                estado_pago: pagoExistente.estado_pago
            });
        } else {
            setDatosPago({ ...estadoInicialPago, id_cita: cita.id });
        }

        const modalPago = document.getElementById('modalPago');
        let modalBootstrap = bootstrap.Modal.getInstance(modalPago) || new bootstrap.Modal(modalPago);
        modalBootstrap.show();
    };

    const cambioInputPago = (e) => {
        const { name, value } = e.target;
        setDatosPago({ ...datosPago, [name]: value });
    };

    const guardarPago = async (e) => {
        e.preventDefault();
        setMensajeErrorPago("");

        const esEdicion = Boolean(datosPago.id);
        const url = esEdicion ? `${API_PAGO}/${datosPago.id}` : API_PAGO;
        const metodo = esEdicion ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...datosPago,
                    id_metodo_pago: Number(datosPago.id_metodo_pago),
                    monto_pagado: Number(datosPago.monto_pagado)
                })
            });

            if (res.ok) {
                await obtenerDatosIniciales();

                const modalPago = document.getElementById('modalPago');
                const modalExiste = bootstrap.Modal.getInstance(modalPago);
                if (modalExiste) modalExiste.hide();
                document.querySelector('.modal-backdrop')?.remove();
                document.body.style.overflow = '';
            } else {
                const errorData = await res.json();
                setMensajeErrorPago(errorData.error);
            }
        } catch (error) {
            console.error("Error al registrar el pago:", error);
            setMensajeErrorPago("Hubo un error de conexión con el servidor.");
        }
    };

    const badgeEstado = (estado) => {
        const colores = {
            "Programada": "bg-primary",
            "Confirmada": "bg-info text-dark",
            "Atendida": "bg-success",
            "Cancelada": "bg-danger"
        };
        return colores[estado] || "bg-secondary";
    };

    return (
        <>
        <Navbar />

        <header className="text-center mt-3">
            <h1 style={{ color: "#103e6e", fontWeight: "bolder" }}>Gestión de Citas y Pagos</h1>
            <h6>Elige un registro para editar, o crea una nueva cita</h6>
        </header>

        <div className="container-fluid mt-4">
            <div className="d-flex flex-wrap justify-content-center gap-4">

                {mostrarForm && (
                <div id="wrapperFormCita" className="card shadow p-4" style={{ maxWidth: "480px", flexShrink: 0, marginBottom: "30px", width: "100%" }}>
                    <h5 className="mb-3 text-center" style={{ color: "#103e6e" }}>{datos.id ? "Editar Cita" : "Nueva Cita"}</h5>

                    {mensajeError && <div className="alert alert-danger py-2">{mensajeError}</div>}

                    <form onSubmit={guardarCita}>
                        <label htmlFor="id_tipo_cita" className="d-block mb-3">Tipo de cita
                        <select name="id_tipo_cita" id="id_tipo_cita" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.id_tipo_cita} onChange={cambioInput} required>
                            <option value="">Seleccione el tipo de cita</option>
                            {tiposCita.map((tc) => <option key={tc.id} value={tc.id}>{tc.tipo_cita}</option>)}
                        </select>
                        </label>

                        <label htmlFor="id_paciente" className="d-block mb-3">Paciente
                        <select name="id_paciente" id="id_paciente" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.id_paciente} onChange={cambioInput} required>
                            <option value="">Seleccione el paciente</option>
                            {pacientes.map((p) => <option key={p.id} value={p.id}>{p.primer_nombre} {p.primer_apellido} - {p.numero_documento}</option>)}
                        </select>
                        </label>

                        <label htmlFor="id_medico" className="d-block mb-3">Odontólogo
                        <select name="id_medico" id="id_medico" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.id_medico} onChange={cambioInput} required>
                            <option value="">Seleccione el odontólogo</option>
                            {medicos.map((m) => <option key={m.id} value={m.id}>{m.nombres} {m.apellidos}</option>)}
                        </select>
                        </label>

                        <label htmlFor="fecha_cita" className="d-block mb-3">Fecha
                        <input type="date" name="fecha_cita" id="fecha_cita" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.fecha_cita} onChange={cambioInput} required/>
                        </label>

                        <div className="d-flex gap-3">
                            <label htmlFor="hora_inicio" className="d-block mb-3 flex-fill">Hora inicio
                            <input type="time" name="hora_inicio" id="hora_inicio" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.hora_inicio} onChange={cambioInput} required/>
                            </label>

                            <label htmlFor="hora_fin" className="d-block mb-3 flex-fill">Hora fin
                            <input type="time" name="hora_fin" id="hora_fin" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.hora_fin} onChange={cambioInput} required/>
                            </label>
                        </div>

                        <label htmlFor="estado_cita" className="d-block mb-3">Estado
                        <select name="estado_cita" id="estado_cita" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.estado_cita} onChange={cambioInput} required>
                            <option value="Programada">Programada</option>
                            <option value="Confirmada">Confirmada</option>
                            <option value="Atendida">Atendida</option>
                            <option value="Cancelada">Cancelada</option>
                        </select>
                        </label>

                        <div className="d-flex w-100 gap-3 mt-2">
                            <button type="submit" className="btn btn-success flex-fill py-2" style={{ borderRadius: "12px" }}>{datos.id ? "Actualizar" : "Agendar"}</button>
                            <button type="button" className="btn btn-danger flex-fill py-2" style={{ borderRadius: "12px" }} onClick={cancelarForm}>Cancelar</button>
                        </div>
                    </form>
                </div>
                )}

                <section className="flex-grow-1" style={{ minWidth: 0, maxWidth: "1100px" }}>
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <input
                            type="text" className="form-control form-control-lg" placeholder="Buscar por paciente, médico, documento, tipo o estado..."
                            style={{ maxWidth: "500px", border: "2px solid #d0e2ff", borderRadius: "12px" }}
                            value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                        />
                        {!mostrarForm && (
                            <button className="btn btn-primary" style={{ borderRadius: "12px" }} onClick={nuevaCita}>+ Nueva Cita</button>
                        )}
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table className="table table-striped table-hover shadow-sm align-middle mb-0" style={{ border: "3px solid rgb(255, 255, 255)", borderRadius: "10px", overflow: "hidden" }}>
                            <thead className="table-dark text-center align-middle">
                                <tr>
                                    <th>ID</th>
                                    <th>Fecha</th>
                                    <th>Horario</th>
                                    <th>Tipo</th>
                                    <th>Paciente</th>
                                    <th>Odontólogo</th>
                                    <th>Estado</th>
                                    <th>Pago</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="text-center" style={{ cursor: "pointer" }}>
                                {citasFiltradas.length > 0 ? (
                                    citasFiltradas.map((cita) => {
                                        const pago = pagoDeCita(cita.id);
                                        return (
                                            <tr key={cita.id}>
                                                <td onClick={() => eligeRegistro(cita)}>{cita.id}</td>
                                                <td onClick={() => eligeRegistro(cita)}>{cita.fecha_cita?.split("T")[0]}</td>
                                                <td onClick={() => eligeRegistro(cita)}>{cita.hora_inicio} - {cita.hora_fin}</td>
                                                <td onClick={() => eligeRegistro(cita)}>{cita.tipo_cita}</td>
                                                <td onClick={() => eligeRegistro(cita)}>{cita.paciente_nombre}</td>
                                                <td onClick={() => eligeRegistro(cita)}>{cita.medico_nombre}</td>
                                                <td onClick={() => eligeRegistro(cita)}>
                                                    <span className={`badge px-3 py-2 rounded-pill ${badgeEstado(cita.estado_cita)}`}>{cita.estado_cita}</span>
                                                </td>
                                                <td>
                                                    {pago ? (
                                                        <span className={`badge ${pago.estado_pago === "Pagado" ? "bg-success" : "bg-warning text-dark"}`}>
                                                            {pago.estado_pago} (${Number(pago.monto_pagado).toLocaleString()})
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">Sin registrar</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => abrirModalPago(cita)}>
                                                        {pago ? "Ver / Editar Pago" : "Registrar Pago"}
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger ms-1" onClick={() => eliminarCita(cita.id)}>🗑️</button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center text-muted py-4">No se encontraron citas con ese criterio de búsqueda.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>

        {/* MODAL DE PAGO */}
        <div className="modal fade" id="modalPago" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 p-4" style={{ borderRadius: "16px" }}>
                    <h4 className="text-center mb-3" style={{ color: "#103e6e" }}>Registro de Pago</h4>

                    {citaSeleccionadaPago && (
                        <p className="text-muted text-center mb-3">
                            Cita del {citaSeleccionadaPago.fecha_cita?.split("T")[0]} — {citaSeleccionadaPago.paciente_nombre}
                        </p>
                    )}

                    {mensajeErrorPago && <div className="alert alert-danger py-2">{mensajeErrorPago}</div>}

                    <form onSubmit={guardarPago}>
                        <label htmlFor="id_metodo_pago" className="d-block mb-3">Método de pago
                        <select name="id_metodo_pago" id="id_metodo_pago" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datosPago.id_metodo_pago} onChange={cambioInputPago} required>
                            <option value="">Seleccione el método</option>
                            {metodosPago.map((mp) => <option key={mp.id} value={mp.id}>{mp.nombre_metodo}</option>)}
                        </select>
                        </label>

                        <label htmlFor="numero_pago" className="d-block mb-3">Número de comprobante (opcional)
                        <input type="text" name="numero_pago" id="numero_pago" className="form-control" placeholder="Se genera automáticamente si se deja vacío" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datosPago.numero_pago} onChange={cambioInputPago}/>
                        </label>

                        <label htmlFor="fecha_pago" className="d-block mb-3">Fecha de pago
                        <input type="date" name="fecha_pago" id="fecha_pago" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datosPago.fecha_pago} onChange={cambioInputPago} required/>
                        </label>

                        <label htmlFor="monto_pagado" className="d-block mb-3">Monto pagado
                        <input type="number" min="0" step="0.01" name="monto_pagado" id="monto_pagado" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datosPago.monto_pagado} onChange={cambioInputPago} required/>
                        </label>

                        <label htmlFor="estado_pago" className="d-block mb-3">Estado del pago
                        <select name="estado_pago" id="estado_pago" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datosPago.estado_pago} onChange={cambioInputPago} required>
                            <option value="Pagado">Pagado</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Anulado">Anulado</option>
                        </select>
                        </label>

                        <div className="d-flex w-100 gap-3 mt-2">
                            <button type="submit" className="btn btn-success flex-fill py-2" style={{ borderRadius: "12px" }}>Guardar Pago</button>
                            <button type="button" className="btn btn-secondary flex-fill py-2" style={{ borderRadius: "12px" }} data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        {/* MODAL ÉXITO CITA */}
        <div className="modal fade" id="citaGuardada" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                    <h4 className="text-success fw-bold mb-3">¡Listo!</h4>
                    <p className="text-muted mb-4">La cita se guardó exitosamente en el sistema.</p>
                    <button type="button" className="btn btn-primary w-100 py-2" style={{borderRadius: "12px"}} onClick={cerrarModalCita}>
                        Continuar
                    </button>
                </div>
            </div>
        </div>
        </>
    );
};

export default GestionarCitas;
