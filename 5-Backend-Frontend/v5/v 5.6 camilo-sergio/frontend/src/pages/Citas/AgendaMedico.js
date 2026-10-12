import Navbar from "../../components/NavbarMedico";
import { useState, useEffect } from 'react';

const API_CITA = "http://localhost:5000/api/cita";
const API_MEDICO = "http://localhost:5000/api/medico";

const AgendaMedico = () => {

    const sesion = JSON.parse(localStorage.getItem("usuario"));

    const [misCitas, setMisCitas] = useState([]);
    const [filtroFecha, setFiltroFecha] = useState("");
    const [mensajeError, setMensajeError] = useState("");

    const cargarDatos = async () => {
        try {
            if (!sesion?.id) return;

            const resMedico = await fetch(`${API_MEDICO}/usuario/${sesion.id}`);
            if (!resMedico.ok) {
                setMensajeError("No se encontró la ficha de médico asociada a esta cuenta.");
                return;
            }
            const dataMedico = await resMedico.json();

            const resCitas = await fetch(`${API_CITA}/medico/${dataMedico.id}`);
            setMisCitas(await resCitas.json());
        } catch (error) {
            console.error("Error al obtener datos del servidor:", error);
            setMensajeError("No se pudieron cargar los datos desde el servidor.");
        }
    };

    useEffect(() => {
        cargarDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cambiarEstado = async (cita, nuevoEstado) => {
        try {
            const res = await fetch(`${API_CITA}/${cita.id}/estado`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado_cita: nuevoEstado })
            });

            if (res.ok) {
                await cargarDatos();
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error al actualizar el estado de la cita:", error);
            alert("Hubo un error de conexión con el servidor.");
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

    const citasFiltradas = misCitas.filter((cita) => {
        const fecha = cita.fecha_cita?.split("T")[0];
        return filtroFecha === "" || fecha === filtroFecha;
    });

    return (
        <>
        <Navbar />

        <header className="text-center mt-3">
            <h1 style={{ color: "#103e6e", fontWeight: "bolder" }}>Mi Agenda de Citas</h1>
            <h6>Consulte y gestione las citas asignadas a usted</h6>
        </header>

        <div className="container-fluid mt-4 px-4">
            {mensajeError && (
                <div className="alert alert-danger py-2 text-center">{mensajeError}</div>
            )}

            <div className="mb-4 d-flex justify-content-center">
                <input
                    type="date" className="form-control form-control-lg" style={{ maxWidth: "260px", border: "2px solid #d0e2ff", borderRadius: "12px" }}
                    value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)}
                />
                {filtroFecha && (
                    <button className="btn btn-outline-secondary ms-2" onClick={() => setFiltroFecha("")}>Ver todas</button>
                )}
            </div>

            <div style={{ overflowX: "auto" }}>
                <table className="table table-striped table-hover shadow-sm align-middle mb-0" style={{ border: "3px solid rgb(255, 255, 255)", borderRadius: "10px", overflow: "hidden" }}>
                    <thead className="table-dark text-center align-middle">
                        <tr>
                            <th>Fecha</th>
                            <th>Horario</th>
                            <th>Tipo de Cita</th>
                            <th>Paciente</th>
                            <th>Documento</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {citasFiltradas.length > 0 ? (
                            citasFiltradas.map((cita) => (
                                <tr key={cita.id}>
                                    <td>{cita.fecha_cita?.split("T")[0]}</td>
                                    <td>{cita.hora_inicio} - {cita.hora_fin}</td>
                                    <td>{cita.tipo_cita}</td>
                                    <td>{cita.paciente_nombre}</td>
                                    <td>{cita.paciente_documento}</td>
                                    <td><span className={`badge px-3 py-2 rounded-pill ${badgeEstado(cita.estado_cita)}`}>{cita.estado_cita}</span></td>
                                    <td>
                                        {cita.estado_cita === "Programada" && (
                                            <button className="btn btn-sm btn-outline-info me-1" onClick={() => cambiarEstado(cita, "Confirmada")}>Confirmar</button>
                                        )}
                                        {(cita.estado_cita === "Programada" || cita.estado_cita === "Confirmada") && (
                                            <>
                                                <button className="btn btn-sm btn-outline-success me-1" onClick={() => cambiarEstado(cita, "Atendida")}>Atendida</button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => cambiarEstado(cita, "Cancelada")}>Cancelar</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center text-muted py-4">No tiene citas asignadas para este filtro.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        </>
    );
};

export default AgendaMedico;
