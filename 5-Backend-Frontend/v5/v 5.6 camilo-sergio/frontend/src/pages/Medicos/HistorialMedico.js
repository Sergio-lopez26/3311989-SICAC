import Navbar from "../../components/NavbarMedico";
import { useState, useEffect } from "react";
import * as bootstrap from "bootstrap";
import "../../styles/styleHistorialMedico.css";

const API_URL_PACIENTE = "http://localhost:5000/api/paciente";
const API_URL_DIAGNOSTICO_TIPOS = "http://localhost:5000/api/tipo_diagnostico";
const API_URL_MEDICAMENTO = "http://localhost:5000/api/medicamento";
const API_URL_TIPO_MEDICAMENTO = "http://localhost:5000/api/tipo_medicamento";
const API_URL_CITAS = "http://localhost:5000/api/cita";
const API_URL_DIAGNOSTICO = "http://localhost:5000/api/diagnostico"; 

const HistorialMedico = () => {
  const [listPacientes, setListPacientes] = useState([]);
  const [tiposDiagnostico, setTiposDiagnostico] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [tiposMedicamento, setTiposMedicamento] = useState([]); 
  const [todasLasCitas, setTodasLasCitas] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  const [datosHistorial, setDatosHistorial] = useState({
    id_paciente: "",
    motivo: "",
    observaciones: "",
    tratamiento_sugerido: "",
    id_cita: "",
    id_tipo_diagnostico: "",
    medicamento: "",
    dosis: ""
  });

  const [nuevoDiagnostico, setNuevoDiagnostico] = useState({
    nombre_diagnostico: "",
    descripcion: ""
  });

  const [nuevoMedicamento, setNuevoMedicamento] = useState({
    id_tipo_medicamento: "",
    nombre_medicamento: ""
  });

  const obtenerDatosIniciales = async () => {
    try {
      const [resPacientes, resDiag, resMed, resTipoMed, resCitas] = await Promise.all([
        fetch(API_URL_PACIENTE),
        fetch(API_URL_DIAGNOSTICO_TIPOS),
        fetch(API_URL_MEDICAMENTO),
        fetch(API_URL_TIPO_MEDICAMENTO),
        fetch(API_URL_CITAS) // <-- Cambiado
      ]);

      setListPacientes(await resPacientes.json());
      setTiposDiagnostico(await resDiag.json());
      setMedicamentos(await resMed.json());
      setTiposMedicamento(await resTipoMed.json());
      setTodasLasCitas(await resCitas.json()); // <-- Guardamos todas las citas
    } catch (error) {
      console.error("Error al obtener datos iniciales:", error);
    }
  };

  useEffect(() => {
    obtenerDatosIniciales();
  }, []);

  const pacientesFiltrados =
    busqueda.trim() === ""
      ? []
      : listPacientes.filter((p) => {
          const partesNombre = [
            p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido
          ];
          const nombreCompleto = partesNombre.filter(parte => parte && parte !== "null").join(" ").toLowerCase();
          const doc = (p.numero_documento || "").toString();
          const termino = busqueda.toLowerCase().trim();
          return nombreCompleto.includes(termino) || doc.includes(termino);
        });

  const seleccionarPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
    setDatosHistorial((prev) => ({
      ...prev,
      id_paciente: paciente.id,
      id_cita: "" 
    }));
    setBusqueda("");
  };

  const cambioInput = (e) => {
    const { name, value } = e.target;
    setDatosHistorial({ ...datosHistorial, [name]: value });
  };

  const guardarHistorial = async (e) => {
    e.preventDefault();
    
    if (!datosHistorial.id_cita) {
      alert("Por favor, selecciona la cita asignada para este paciente.");
      return;
    }

    try {
      const res = await fetch(API_URL_DIAGNOSTICO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosHistorial)
      });

      if (res.ok) {
        alert("Diagnóstico registrado y cita marcada como Atendida exitosamente.");
        cancelar(); 
        obtenerDatosIniciales(); 
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error al guardar el diagnóstico:", error);
      alert("Error de conexión con el servidor.");
    }
  };

  const guardarNuevoDiagnostico = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL_DIAGNOSTICO_TIPOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoDiagnostico)
      });

      if (res.ok) {
        const dataCreada = await res.json();
        const resDiag = await fetch(API_URL_DIAGNOSTICO_TIPOS);
        setTiposDiagnostico(await resDiag.json());

        setDatosHistorial(prev => ({ ...prev, id_tipo_diagnostico: dataCreada.id }));
        setNuevoDiagnostico({ nombre_diagnostico: "", descripcion: "" });
        
        bootstrap.Modal.getInstance(document.getElementById("modalNuevoDiagnostico"))?.hide();
      } else {
        alert(`Error: ${(await res.json()).error}`);
      }
    } catch (error) {
      alert("Error de conexión al guardar diagnóstico.");
    }
  };

  const guardarNuevoMedicamento = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL_MEDICAMENTO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoMedicamento)
      });

      if (res.ok) {
        const dataCreada = await res.json();
        const resMed = await fetch(API_URL_MEDICAMENTO);
        setMedicamentos(await resMed.json());

        setDatosHistorial(prev => ({ ...prev, medicamento: dataCreada.id }));
        setNuevoMedicamento({ id_tipo_medicamento: "", nombre_medicamento: "" });
        
        bootstrap.Modal.getInstance(document.getElementById("modalNuevoMedicamento"))?.hide();
      } else {
        alert(`Error: ${(await res.json()).error}`);
      }
    } catch (error) {
      alert("Error de conexión al guardar medicamento.");
    }
  };

  const cancelar = () => {
    setPacienteSeleccionado(null);
    setDatosHistorial({
      id_paciente: "",
      motivo: "",
      observaciones: "",
      tratamiento_sugerido: "",
      id_cita: "",
      id_tipo_diagnostico: "",
      medicamento: "",
      dosis: ""
    });
  };

  // <-- AQUÍ SUCEDE LA MAGIA: Filtra las citas basándose SOLO en el id_paciente
  const citasDelPacienteSeleccionado = pacienteSeleccionado 
    ? todasLasCitas.filter(c => c.id_paciente === pacienteSeleccionado.id && c.estado_cita !== 'Cancelada')
    : [];

  return (
    <>
      <Navbar />

      <header className="text-center mt-3">
        <h1 className="titulo-principal">Consulta Médica</h1>
        <h6>Selecciona un paciente para registrar su diagnóstico</h6>
      </header>

      <div className="container mt-4 mb-5">
        <div className="row justify-content-center mb-3">
          <div className="col-md-8 position-relative">
            <input
              type="text"
              className="form-control form-control-lg shadow-sm"
              placeholder="Buscar paciente por nombre o documento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            {busqueda.trim() !== "" && (
              <ul className="list-group position-absolute w-100 shadow mt-1 buscador-lista" style={{ zIndex: 1000 }}>
                {pacientesFiltrados.length > 0 ? (
                  pacientesFiltrados.map((paciente) => {
                    const nombreLimpio = [paciente.primer_nombre, paciente.segundo_nombre, paciente.primer_apellido, paciente.segundo_apellido].filter(p => p && p !== "null").join(" ");
                    return (
                      <li key={paciente.id} className="list-group-item list-group-item-action item-cursor d-flex justify-content-between align-items-center" onClick={() => seleccionarPaciente(paciente)}>
                        <div>
                          <strong>{nombreLimpio}</strong><br />
                          <small className="text-muted">Doc: {paciente.numero_documento}</small>
                        </div>
                        <span className="badge bg-primary rounded-pill">Seleccionar</span>
                      </li>
                    );
                  })
                ) : (
                  <li className="list-group-item text-muted">No se encontraron pacientes</li>
                )}
              </ul>
            )}
          </div>
        </div>

        {pacienteSeleccionado && (
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card mb-4 border-0 shadow-sm text-white card-paciente-seleccionado" style={{ backgroundColor: "#103e6e" }}>
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">
                      Paciente: {[pacienteSeleccionado.primer_nombre, pacienteSeleccionado.segundo_nombre, pacienteSeleccionado.primer_apellido, pacienteSeleccionado.segundo_apellido].filter((p) => p && p !== "null").join(" ")}
                    </h5>
                    <p className="mb-0 small">Documento: {pacienteSeleccionado.numero_documento} | Sangre: {pacienteSeleccionado.tipo_sangre}</p>
                  </div>
                  <button className="btn btn-sm btn-outline-light" onClick={cancelar}>Cambiar Paciente</button>
                </div>
              </div>

              <div className="card shadow p-4 border-0" style={{ borderRadius: "16px" }}>
                <form id="form-historial" onSubmit={guardarHistorial}>
                  
                  <div className="mb-3">
                    <label htmlFor="id_cita" className="form-label fw-bold text-primary">Cita Asignada</label>
                    <select name="id_cita" id="id_cita" className="form-select" value={datosHistorial.id_cita} onChange={cambioInput} required>
                      <option value="">Seleccione la cita del paciente...</option>
                      {citasDelPacienteSeleccionado.length > 0 ? (
                        citasDelPacienteSeleccionado.map((cita) => (
                          <option key={cita.id} value={cita.id}>
                            {cita.fecha_cita.split('T')[0]} | {cita.hora_inicio} - {cita.hora_fin} ({cita.tipo_cita}) - {cita.estado_cita}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>El paciente no tiene citas registradas</option>
                      )}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="motivo" className="form-label fw-bold">Motivo de consulta</label>
                    <input type="text" name="motivo" id="motivo" className="form-control" value={datosHistorial.motivo} onChange={cambioInput} required />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="id_tipo_diagnostico" className="form-label fw-bold">Tipo de diagnóstico</label>
                    <div className="input-group">
                      <select name="id_tipo_diagnostico" id="id_tipo_diagnostico" className="form-select" value={datosHistorial.id_tipo_diagnostico} onChange={cambioInput} required>
                        <option value="">Seleccione tipo de diagnóstico...</option>
                        {tiposDiagnostico.map((diag) => (
                          <option key={diag.id} value={diag.id}>{diag.nombre_diagnostico}</option>
                        ))}
                      </select>
                      <button type="button" className="btn btn-outline-primary fw-bold" data-bs-toggle="modal" data-bs-target="#modalNuevoDiagnostico">+ Nuevo</button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="observaciones" className="form-label fw-bold">Observaciones</label>
                    <textarea name="observaciones" id="observaciones" rows="3" className="form-control" value={datosHistorial.observaciones} onChange={cambioInput} required />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="tratamiento_sugerido" className="form-label fw-bold">Tratamiento sugerido</label>
                    <input type="text" name="tratamiento_sugerido" id="tratamiento_sugerido" className="form-control" value={datosHistorial.tratamiento_sugerido} onChange={cambioInput} required />
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-8">
                      <label htmlFor="medicamento" className="form-label fw-bold">Medicamento (Opcional)</label>
                      <div className="input-group">
                        <select name="medicamento" id="medicamento" className="form-select" value={datosHistorial.medicamento} onChange={cambioInput}>
                          <option value="">Ninguno</option>
                          {medicamentos.map((med) => (
                            <option key={med.id} value={med.id}>{med.nombre_medicamento}</option>
                          ))}
                        </select>
                        <button type="button" className="btn btn-outline-primary fw-bold" data-bs-toggle="modal" data-bs-target="#modalNuevoMedicamento">+ Nuevo</button>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="dosis" className="form-label fw-bold">Dosis</label>
                      <input type="text" name="dosis" id="dosis" className="form-control" value={datosHistorial.dosis} onChange={cambioInput} disabled={!datosHistorial.medicamento} placeholder={!datosHistorial.medicamento ? "N/A" : "Ej. 1 cada 8 hrs"} />
                    </div>
                  </div>

                  <div className="d-flex w-100 gap-3">
                    <button type="submit" className="btn btn-success flex-fill py-2 fw-bold" style={{ borderRadius: "12px" }}>Guardar Registro</button>
                    <button type="button" className="btn btn-danger flex-fill py-2 fw-bold" onClick={cancelar} style={{ borderRadius: "12px" }}>Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Diagnóstico */}
        <div className="modal fade" id="modalNuevoDiagnostico" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 p-3" style={{ borderRadius: "16px" }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold" style={{ color: "#103e6e" }}>Nuevo Tipo de Diagnóstico</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form onSubmit={guardarNuevoDiagnostico}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Nombre del Diagnóstico</label>
                    <input type="text" className="form-control" value={nuevoDiagnostico.nombre_diagnostico} onChange={(e) => setNuevoDiagnostico({ ...nuevoDiagnostico, nombre_diagnostico: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Descripción</label>
                    <textarea rows="3" className="form-control" value={nuevoDiagnostico.descripcion} onChange={(e) => setNuevoDiagnostico({ ...nuevoDiagnostico, descripcion: e.target.value })} required />
                  </div>
                </div>
                <div className="modal-footer border-0 gap-2">
                  <button type="button" className="btn btn-secondary flex-fill" data-bs-dismiss="modal" style={{ borderRadius: "12px" }}>Cancelar</button>
                  <button type="submit" className="btn btn-success flex-fill" style={{ borderRadius: "12px" }}>Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Modal Medicamento */}
        <div className="modal fade" id="modalNuevoMedicamento" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 p-3" style={{ borderRadius: "16px" }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold" style={{ color: "#103e6e" }}>Registrar Medicamento</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form onSubmit={guardarNuevoMedicamento}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Categoría</label>
                    <select className="form-select" value={nuevoMedicamento.id_tipo_medicamento} onChange={(e) => setNuevoMedicamento({ ...nuevoMedicamento, id_tipo_medicamento: e.target.value })} required>
                      <option value="">Seleccione una categoría</option>
                      {tiposMedicamento.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>{tipo.categoria_medicamento}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Nombre del Medicamento</label>
                    <input type="text" className="form-control" value={nuevoMedicamento.nombre_medicamento} onChange={(e) => setNuevoMedicamento({ ...nuevoMedicamento, nombre_medicamento: e.target.value })} required />
                  </div>
                </div>
                <div className="modal-footer border-0 gap-2">
                  <button type="button" className="btn btn-secondary flex-fill" data-bs-dismiss="modal" style={{ borderRadius: "12px" }}>Cancelar</button>
                  <button type="submit" className="btn btn-success flex-fill" style={{ borderRadius: "12px" }}>Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default HistorialMedico;