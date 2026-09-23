import Navbar from "../../components/NavbarMedico";
import { useState, useEffect } from "react";
import * as bootstrap from "bootstrap";
import "../../styles/styleHistorialMedico.css";

const API_URL_PACIENTE = "http://localhost:5000/api/paciente";
const API_URL_DIAGNOSTICO = "http://localhost:5000/api/tipo_diagnostico";
const API_URL_MEDICAMENTO = "http://localhost:5000/api/medicamento";
const API_URL_TIPO_MEDICAMENTO = "http://localhost:5000/api/tipo_medicamento";

const HistorialMedico = () => {
  const [listPacientes, setListPacientes] = useState([]);
  const [tiposDiagnostico, setTiposDiagnostico] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [tiposMedicamento, setTiposMedicamento] = useState([]); 

  const [busqueda, setBusqueda] = useState("");
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  const [datosHistorial, setDatosHistorial] = useState({
    id_paciente: "",
    motivo: "",
    observaciones: "",
    tratamiento: "",
    fecha: "",
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
      const [resPacientes, resDiag, resMed, resTipoMed] = await Promise.all([
        fetch(API_URL_PACIENTE),
        fetch(API_URL_DIAGNOSTICO),
        fetch(API_URL_MEDICAMENTO),
        fetch(API_URL_TIPO_MEDICAMENTO)
      ]);

      const dataPacientes = await resPacientes.json();
      const dataDiag = await resDiag.json();
      const dataMed = await resMed.json();
      const dataTipoMed = await resTipoMed.json();

      setListPacientes(dataPacientes);
      setTiposDiagnostico(dataDiag);
      setMedicamentos(dataMed);
      setTiposMedicamento(dataTipoMed);
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
            p.primer_nombre,
            p.segundo_nombre,
            p.primer_apellido,
            p.segundo_apellido
          ];

          const nombreCompleto = partesNombre
            .filter((parte) => parte && parte !== "null")
            .join(" ")
            .toLowerCase();

          const doc = (p.numero_documento || "").toString();
          const termino = busqueda.toLowerCase().trim();

          return nombreCompleto.includes(termino) || doc.includes(termino);
        });

  const seleccionarPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
    setDatosHistorial((prev) => ({
      ...prev,
      id_paciente: paciente.id
    }));
    setBusqueda("");
  };

  const cambioInput = (e) => {
    const { name, value } = e.target;
    setDatosHistorial({ ...datosHistorial, [name]: value });
  };

  const guardarNuevoDiagnostico = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL_DIAGNOSTICO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoDiagnostico)
      });

      if (res.ok) {
        const dataCreada = await res.json();
        
        const resDiag = await fetch(API_URL_DIAGNOSTICO);
        const dataDiag = await resDiag.json();
        setTiposDiagnostico(dataDiag);

        setDatosHistorial((prev) => ({
          ...prev,
          id_tipo_diagnostico: dataCreada.id
        }));

        setNuevoDiagnostico({ nombre_diagnostico: "", descripcion: "" });
        const modalElement = document.getElementById("modalNuevoDiagnostico");
        const modalBootstrap = bootstrap.Modal.getInstance(modalElement);
        if (modalBootstrap) modalBootstrap.hide();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error("Error al guardar diagnóstico:", error);
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
        const dataMed = await resMed.json();
        setMedicamentos(dataMed);

        setDatosHistorial((prev) => ({
          ...prev,
          medicamento: dataCreada.id
        }));

        setNuevoMedicamento({ id_tipo_medicamento: "", nombre_medicamento: "" });
        const modalElement = document.getElementById("modalNuevoMedicamento");
        const modalBootstrap = bootstrap.Modal.getInstance(modalElement);
        if (modalBootstrap) modalBootstrap.hide();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error("Error al guardar medicamento:", error);
      alert("Error de conexión al guardar medicamento.");
    }
  };

  const guardarHistorial = (e) => {
    e.preventDefault();
    console.log("Guardando historial:", datosHistorial);
    alert("Historial médico guardado con éxito.");
  };

  const cancelar = () => {
    setPacienteSeleccionado(null);
    setDatosHistorial({
      id_paciente: "",
      motivo: "",
      observaciones: "",
      tratamiento: "",
      fecha: "",
      id_tipo_diagnostico: "",
      medicamento: "",
      dosis: ""
    });
  };

  return (
    <>
      <Navbar />

      <header className="text-center mt-3">
        <h1 className="titulo-principal">Historial Paciente</h1>
        <h6>Selecciona un paciente para registrar su historial médico</h6>
      </header>

      <div className="container mt-4">
        {/* BUSCADOR */}
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
              <ul className="list-group position-absolute w-100 shadow mt-1 buscador-lista">
                {pacientesFiltrados.length > 0 ? (
                  pacientesFiltrados.map((paciente) => {
                    const partesRender = [
                      paciente.primer_nombre,
                      paciente.segundo_nombre,
                      paciente.primer_apellido,
                      paciente.segundo_apellido
                    ];
                    const nombreLimpioRender = partesRender
                      .filter((p) => p && p !== "null")
                      .join(" ");

                    return (
                      <li
                        key={paciente.id}
                        className="list-group-item list-group-item-action item-cursor d-flex justify-content-between align-items-center"
                        onClick={() => seleccionarPaciente(paciente)}
                      >
                        <div>
                          <strong>{nombreLimpioRender}</strong>
                          <br />
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

        {/* FORMULARIO EDITABLE */}
        {pacienteSeleccionado && (
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card mb-4 border-0 shadow-sm text-white card-paciente-seleccionado">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">
                      Paciente: {[
                        pacienteSeleccionado.primer_nombre,
                        pacienteSeleccionado.segundo_nombre,
                        pacienteSeleccionado.primer_apellido,
                        pacienteSeleccionado.segundo_apellido
                      ]
                        .filter((p) => p && p !== "null")
                        .join(" ")}
                    </h5>
                    <p className="mb-0 small">
                      Documento: {pacienteSeleccionado.numero_documento} | Sangre: {pacienteSeleccionado.tipo_sangre}
                    </p>
                  </div>
                  <button className="btn btn-sm btn-outline-light" onClick={cancelar}>
                    Cambiar Paciente
                  </button>
                </div>
              </div>

              <div className="card shadow p-4 card-formulario">
                <form id="form-historial" onSubmit={guardarHistorial}>
                  
                  <div className="mb-3">
                    <label htmlFor="motivo" className="form-label fw-bold">Motivo</label>
                    <input
                      type="text"
                      name="motivo"
                      id="motivo"
                      className="form-control input-custom"
                      value={datosHistorial.motivo}
                      onChange={cambioInput}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="observaciones" className="form-label fw-bold">Observaciones</label>
                    <textarea
                      name="observaciones"
                      id="observaciones"
                      rows="3"
                      className="form-control input-custom"
                      value={datosHistorial.observaciones}
                      onChange={cambioInput}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="tratamiento" className="form-label fw-bold">Tratamiento</label>
                    <input
                      type="text"
                      name="tratamiento"
                      id="tratamiento"
                      className="form-control input-custom"
                      value={datosHistorial.tratamiento}
                      onChange={cambioInput}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="fecha" className="form-label fw-bold">Fecha de la cita</label>
                    <input
                      type="date"
                      name="fecha"
                      id="fecha"
                      className="form-control input-custom"
                      value={datosHistorial.fecha}
                      onChange={cambioInput}
                      required
                    />
                  </div>

                  {/* DIAGNÓSTICO */}
                  <div className="mb-3">
                    <label htmlFor="id_tipo_diagnostico" className="form-label fw-bold">
                      Tipo de diagnóstico
                    </label>
                    <div className="input-group">
                      <select
                        name="id_tipo_diagnostico"
                        id="id_tipo_diagnostico"
                        className="form-select input-group-custom-left"
                        value={datosHistorial.id_tipo_diagnostico}
                        onChange={cambioInput}
                        required
                      >
                        <option value="">Seleccione tipo de diagnóstico</option>
                        {tiposDiagnostico.map((diag) => (
                          <option key={diag.id} value={diag.id}>
                            {diag.nombre_diagnostico}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-outline-primary fw-bold btn-group-custom-right"
                        data-bs-toggle="modal"
                        data-bs-target="#modalNuevoDiagnostico"
                      >
                        + Nuevo
                      </button>
                    </div>
                  </div>

                  {/* MEDICAMENTO */}
                  <div className="mb-3">
                    <label htmlFor="medicamento" className="form-label fw-bold">Medicamento asignado</label>
                    <div className="input-group">
                      <select
                        name="medicamento"
                        id="medicamento"
                        className="form-select input-group-custom-left"
                        value={datosHistorial.medicamento}
                        onChange={cambioInput}
                        required
                      >
                        <option value="">Seleccione medicamento</option>
                        {medicamentos.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.nombre_medicamento} {med.categoria_medicamento ? `(${med.categoria_medicamento})` : ''}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-outline-primary fw-bold btn-group-custom-right"
                        data-bs-toggle="modal"
                        data-bs-target="#modalNuevoMedicamento"
                      >
                        + Nuevo
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="dosis" className="form-label fw-bold">Dosis</label>
                    <input
                      type="text"
                      name="dosis"
                      id="dosis"
                      className="form-control input-custom"
                      value={datosHistorial.dosis}
                      onChange={cambioInput}
                      required
                    />
                  </div>

                  <div className="d-flex w-100 gap-3">
                    <button type="submit" className="btn btn-success flex-fill py-2 btn-redondeado">
                      Guardar
                    </button>
                    <button type="button" className="btn btn-danger flex-fill py-2 btn-redondeado" onClick={cancelar}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* MODAL NUEVO DIAGNÓSTICO */}
        <div className="modal fade" id="modalNuevoDiagnostico" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 p-3 modal-content-custom">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold modal-titulo">
                  Agregar Nuevo Tipo de Diagnóstico
                </h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form onSubmit={guardarNuevoDiagnostico}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Nombre del Diagnóstico</label>
                    <input
                      type="text"
                      className="form-control input-custom"
                      value={nuevoDiagnostico.nombre_diagnostico}
                      onChange={(e) => setNuevoDiagnostico({ ...nuevoDiagnostico, nombre_diagnostico: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Descripción</label>
                    <textarea
                      rows="3"
                      className="form-control input-custom"
                      value={nuevoDiagnostico.descripcion}
                      onChange={(e) => setNuevoDiagnostico({ ...nuevoDiagnostico, descripcion: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 gap-2">
                  <button type="button" className="btn btn-secondary flex-fill btn-redondeado" data-bs-dismiss="modal">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success flex-fill btn-redondeado">
                    Guardar Diagnóstico
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* MODAL NUEVO MEDICAMENTO */}
        <div className="modal fade" id="modalNuevoMedicamento" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 p-3 modal-content-custom">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold modal-titulo">
                  Registrar Nuevo Medicamento
                </h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form onSubmit={guardarNuevoMedicamento}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Categoría (Tipo de Medicamento)</label>
                    <select
                      className="form-select input-custom"
                      value={nuevoMedicamento.id_tipo_medicamento}
                      onChange={(e) => setNuevoMedicamento({ ...nuevoMedicamento, id_tipo_medicamento: e.target.value })}
                      required
                    >
                      <option value="">Seleccione una categoría</option>
                      {tiposMedicamento.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.categoria_medicamento || tipo.nombre_tipo_medicamento || `Categoría ${tipo.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Nombre del Medicamento</label>
                    <input
                      type="text"
                      className="form-control input-custom"
                      value={nuevoMedicamento.nombre_medicamento}
                      onChange={(e) => setNuevoMedicamento({ ...nuevoMedicamento, nombre_medicamento: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 gap-2">
                  <button type="button" className="btn btn-secondary flex-fill btn-redondeado" data-bs-dismiss="modal">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success flex-fill btn-redondeado">
                    Guardar Medicamento
                  </button>
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