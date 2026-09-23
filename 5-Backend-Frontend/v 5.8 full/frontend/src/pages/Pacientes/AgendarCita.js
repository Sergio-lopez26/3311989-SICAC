import Navbar from "../../components/NavbarPaciente";
import { useState, useEffect } from 'react';
import * as bootstrap from 'bootstrap';

const API_CITA = "http://localhost:5000/api/cita";
const API_TIPO_CITA = "http://localhost:5000/api/tipo_cita";
const API_MEDICO = "http://localhost:5000/api/medico";
const API_PACIENTE = "http://localhost:5000/api/paciente";
const API_PAGO = "http://localhost:5000/api/pago";

const AgendarCita = () => {

    const sesion = JSON.parse(localStorage.getItem("usuario"));

    const [idPaciente, setIdPaciente] = useState(null);
    const [misCitas, setMisCitas] = useState([]);
    const [misPagos, setMisPagos] = useState([]);
    const [tiposCita, setTiposCita] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [mensajeError, setMensajeError] = useState("");

    const [datos, setDatos] = useState({
        id_tipo_cita: "",
        id_medico: "",
        fecha_cita: "",
        hora_inicio: "",
        hora_fin: ""
    });

    const cambioInput = (e) => {
        const { name, value } = e.target;
        setDatos({ ...datos, [name]: value });
    };

    const cargarDatos = async () => {
        try {
            if (!sesion?.id) return;

            // Se obtiene el id de la ficha de paciente asociada a este usuario logueado
            const resPaciente = await fetch(`${API_PACIENTE}/${sesion.id}`);
            if (!resPaciente.ok) {
                setMensajeError("No se encontró la ficha de paciente asociada a esta cuenta.");
                return;
            }
            const dataPaciente = await resPaciente.json();
            setIdPaciente(dataPaciente.id);

            const [resTipoCita, resMedico, resCitas, resPagos] = await Promise.all([
                fetch(API_TIPO_CITA),
                fetch(API_MEDICO),
                fetch(`${API_CITA}/paciente/${dataPaciente.id}`),
                fetch(`${API_PAGO}/paciente/${dataPaciente.id}`)
            ]);

            setTiposCita(await resTipoCita.json());
            const dataMedicos = await resMedico.json();
            setMedicos(dataMedicos.filter(m => m.estado_medico === "Activo"));
            setMisCitas(await resCitas.json());
            setMisPagos(await resPagos.json());
        } catch (error) {
            console.error("Error al obtener datos del servidor:", error);
            setMensajeError("No se pudieron cargar los datos desde el servidor.");
        }
    };

    useEffect(() => {
        cargarDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const agendar = async (e) => {
        e.preventDefault();
        setMensajeError("");

        if (!idPaciente) return;

        try {
            const res = await fetch(API_CITA, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...datos,
                    id_tipo_cita: Number(datos.id_tipo_cita),
                    id_medico: Number(datos.id_medico),
                    id_paciente: idPaciente
                })
            });

            if (res.ok) {
                setDatos({ id_tipo_cita: "", id_medico: "", fecha_cita: "", hora_inicio: "", hora_fin: "" });
                await cargarDatos();

                const modalAgenda = document.getElementById('agendada');
                let modalBootstrap = bootstrap.Modal.getInstance(modalAgenda) || new bootstrap.Modal(modalAgenda);
                modalBootstrap.show();
            } else {
                const errorData = await res.json();
                setMensajeError(errorData.error);
            }
        } catch (error) {
            console.error("Error al agendar la cita:", error);
            setMensajeError("Hubo un error de conexión con el servidor.");
        }
    };

    const cancelarCita = async (cita) => {
        if (!window.confirm("¿Está seguro de cancelar esta cita?")) return;

        try {
            const res = await fetch(`${API_CITA}/${cita.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_tipo_cita: cita.id_tipo_cita,
                    id_paciente: cita.id_paciente,
                    id_medico: cita.id_medico,
                    fecha_cita: cita.fecha_cita,
                    hora_inicio: cita.hora_inicio,
                    hora_fin: cita.hora_fin,
                    estado_cita: "Cancelada"
                })
            });

            if (res.ok) {
                await cargarDatos();
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error al cancelar la cita:", error);
            alert("Hubo un error de conexión con el servidor.");
        }
    };

    const cerrarModalAgendada = () => {
        const modalAgenda = document.getElementById('agendada');
        const modalExiste = bootstrap.Modal.getInstance(modalAgenda);
        if (modalExiste) modalExiste.hide();
        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';
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

    const pagoDeCita = (idCita) => misPagos.find(p => p.id_cita === idCita);

    const hoy = new Date().toISOString().split('T')[0];

    return (
        <>
        <Navbar />

        <header className="text-center mt-3">
            <h1 style={{ color: "#103e6e", fontWeight: "bolder" }}>Agendamiento de Citas</h1>
            <h6>Reserve su cita odontológica y consulte su historial de citas y pagos</h6>
        </header>

        <div className="container-fluid mt-4">
            <div className="d-flex flex-wrap justify-content-center gap-4">

                <div className="card shadow p-4" style={{ maxWidth: "480px", width: "100%" }}>
                    <h5 className="mb-3 text-center" style={{ color: "#103e6e" }}>Nueva Cita</h5>

                    {mensajeError && (
                        <div className="alert alert-danger py-2">{mensajeError}</div>
                    )}

                    <form onSubmit={agendar}>
                        <label htmlFor="id_tipo_cita" className="d-block mb-3">Tipo de cita
                        <select name="id_tipo_cita" id="id_tipo_cita" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.id_tipo_cita} onChange={cambioInput} required>
                            <option value="">Seleccione el tipo de cita</option>
                            {tiposCita.map((tc) => (
                                <option key={tc.id} value={tc.id}>{tc.tipo_cita}</option>
                            ))}
                        </select>
                        </label>

                        <label htmlFor="id_medico" className="d-block mb-3">Odontólogo
                        <select name="id_medico" id="id_medico" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.id_medico} onChange={cambioInput} required>
                            <option value="">Seleccione el odontólogo</option>
                            {medicos.map((m) => (
                                <option key={m.id} value={m.id}>{m.nombres} {m.apellidos}</option>
                            ))}
                        </select>
                        </label>

                        <label htmlFor="fecha_cita" className="d-block mb-3">Fecha
                        <input type="date" name="fecha_cita" id="fecha_cita" className="form-control" min={hoy} style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.fecha_cita} onChange={cambioInput} required/>
                        </label>

                        <div className="d-flex gap-3">
                            <label htmlFor="hora_inicio" className="d-block mb-3 flex-fill">Hora inicio
                            <input type="time" name="hora_inicio" id="hora_inicio" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.hora_inicio} onChange={cambioInput} required/>
                            </label>

                            <label htmlFor="hora_fin" className="d-block mb-3 flex-fill">Hora fin
                            <input type="time" name="hora_fin" id="hora_fin" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.hora_fin} onChange={cambioInput} required/>
                            </label>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-2 mt-2" style={{ borderRadius: "12px" }}>
                            Agendar Cita
                        </button>
                    </form>
                </div>

                <section className="flex-grow-1" style={{ minWidth: "320px", maxWidth: "900px" }}>
                    <h5 className="mb-3 text-center" style={{ color: "#103e6e" }}>Mis Citas</h5>
                    <div style={{ overflowX: "auto" }}>
                        <table className="table table-striped table-hover shadow-sm align-middle mb-0" style={{ border: "3px solid rgb(255, 255, 255)", borderRadius: "10px", overflow: "hidden" }}>
                            <thead className="table-dark text-center align-middle">
                                <tr>
                                    <th>Fecha</th>
                                    <th>Horario</th>
                                    <th>Tipo</th>
                                    <th>Odontólogo</th>
                                    <th>Estado</th>
                                    <th>Pago</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {misCitas.length > 0 ? (
                                    misCitas.map((cita) => {
                                        const pago = pagoDeCita(cita.id);
                                        return (
                                            <tr key={cita.id}>
                                                <td>{cita.fecha_cita?.split("T")[0]}</td>
                                                <td>{cita.hora_inicio} - {cita.hora_fin}</td>
                                                <td>{cita.tipo_cita}</td>
                                                <td>{cita.medico_nombre}</td>
                                                <td><span className={`badge px-3 py-2 rounded-pill ${badgeEstado(cita.estado_cita)}`}>{cita.estado_cita}</span></td>
                                                <td>{pago ? (pago.estado_pago === "Pagado" ? <span className="badge bg-success">Pagado</span> : <span className="badge bg-warning text-dark">{pago.estado_pago}</span>) : <span className="text-muted">Sin registrar</span>}</td>
                                                <td>
                                                    {(cita.estado_cita === "Programada" || cita.estado_cita === "Confirmada") && cita.fecha_cita?.split("T")[0] >= hoy && (
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => cancelarCita(cita)}>Cancelar</button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">Aún no tiene citas agendadas.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>

        <div className="modal fade" id="agendada" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                    <h4 className="text-success fw-bold mb-3">¡Cita Agendada!</h4>
                    <p className="text-muted mb-4">Su cita ha sido registrada exitosamente en el sistema.</p>
                    <button type="button" className="btn btn-primary w-100 py-2" style={{borderRadius: "12px"}} onClick={cerrarModalAgendada}>
                        Continuar
                    </button>
                </div>
            </div>
        </div>
        </>
    );
};

export default AgendarCita;
