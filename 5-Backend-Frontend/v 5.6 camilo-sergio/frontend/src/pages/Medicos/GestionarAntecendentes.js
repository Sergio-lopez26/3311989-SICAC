import Navbar from "../../components/NavbarMedico";
import { useState, useEffect } from "react";
import "../../styles/styleGestionarAntecedentes.css";

const API_URL_PACIENTES = "http://localhost:5000/api/paciente";
const API_URL_HISTORIAL = "http://localhost:5000/api/historial_medico";

function GestionarAntecendentes() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [antecedentes, setAntecedentes] = useState("");
  const [idHistorial, setIdHistorial] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const obtenerPacientes = async () => {
      try {
        const res = await fetch(API_URL_PACIENTES);
        if (res.ok) {
          const data = await res.json();
          setPacientes(data);
        }
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
      }
    };
    obtenerPacientes();
  }, []);

  const pacientesFiltrados = pacientes.filter((p) => {
    const nombreCompleto = `${p.primer_nombre} ${p.primer_apellido}`.toLowerCase();
    const documento = (p.numero_documento || "").toString();
    const termino = busqueda.toLowerCase();
    return nombreCompleto.includes(termino) || documento.includes(termino);
  });

  const seleccionarPaciente = async (paciente) => {
    setPacienteSeleccionado(paciente);
    setBusqueda("");
    setCargando(true);
    
    try {
      const res = await fetch(`${API_URL_HISTORIAL}/paciente/${paciente.id}`);
      if (res.ok) {
        const data = await res.json();
        setAntecedentes(data.antecedentes_medicos || "");
        setIdHistorial(data.id);
      } else if (res.status === 404) {
        setAntecedentes("");
        setIdHistorial(null);
      }
    } catch (error) {
      console.error("Error al obtener historial:", error);
    } finally {
      setCargando(false);
    }
  };

  const guardarAntecedentes = async (e) => {
    e.preventDefault();
    if (!pacienteSeleccionado) return;

    try {
      if (idHistorial) {
        const res = await fetch(`${API_URL_HISTORIAL}/${idHistorial}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ antecedentes_medicos: antecedentes })
        });
        if (res.ok) alert("Antecedentes actualizados exitosamente.");
      } else {
        const res = await fetch(API_URL_HISTORIAL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            id_paciente: pacienteSeleccionado.id, 
            antecedentes_medicos: antecedentes 
          })
        });
        if (res.ok) {
          const data = await res.json();
          setIdHistorial(data.id);
          alert("Historial creado exitosamente.");
        } else {
          const errData = await res.json();
          alert(errData.error || "Error al guardar");
        }
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error de conexión con el servidor.");
    }
  };

  return (
    <>
      <Navbar />
      
      <header className="text-center mt-3">
        <h1 className="titulo-gestion">Gestionar Antecedentes</h1>
        <h6>Selecciona un paciente para gestionar su historial</h6>
      </header>

      <div className="container mt-4 mb-5">
        {!pacienteSeleccionado ? (
          <div className="row justify-content-center">
            <div className="col-md-8">
              <input 
                type="text" 
                className="form-control form-control-lg input-estilizado shadow-sm mb-3" 
                placeholder="Buscar paciente por nombre o documento..." 
                value={busqueda} 
                onChange={(e) => setBusqueda(e.target.value)} 
              />
              {busqueda && (
                <ul className="list-group shadow-sm border-0">
                  {pacientesFiltrados.length > 0 ? (
                    pacientesFiltrados.map((p) => (
                      <li 
                        key={p.id} 
                        className="list-group-item list-group-item-action py-3"
                        style={{ cursor: "pointer" }}
                        onClick={() => seleccionarPaciente(p)}
                      >
                        <strong>{p.primer_nombre} {p.primer_apellido}</strong> - Documento: {p.numero_documento}
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item text-muted text-center py-3">No se encontraron pacientes.</li>
                  )}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="card paciente-seleccionado shadow p-3 mb-4">
              <div className="card-body row align-items-center">
                <div className="col-md-9">
                  <h3 className="mb-0">
                    Paciente seleccionado: {pacienteSeleccionado.primer_nombre} {pacienteSeleccionado.primer_apellido}
                  </h3>
                </div>
                <div className="col-md-3 text-md-end mt-3 mt-md-0">
                  <button 
                    className="btn btn-light text-primary fw-bold px-4 py-2 btn-redondeado"
                    onClick={() => {
                      setPacienteSeleccionado(null);
                      setAntecedentes("");
                      setIdHistorial(null);
                    }}
                  >
                    Cambiar Paciente
                  </button>
                </div>
              </div> 
            </div>

            {cargando ? (
              <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2 text-muted">Cargando antecedentes...</p>
              </div>
            ) : (
              <form onSubmit={guardarAntecedentes} className="card shadow p-4 border-0 card-antecedentes">
                <div className="mb-3">
                  <label htmlFor="antecedentes" className="form-label fw-bold text-primary fs-5">
                    Antecedentes Médicos:
                  </label>
                  <textarea 
                    id="antecedentes" 
                    name="antecedentes" 
                    className="form-control input-estilizado" 
                    rows="5"
                    value={antecedentes}
                    onChange={(e) => setAntecedentes(e.target.value)}
                    placeholder="Escribe los antecedentes médicos del paciente..."
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success py-2 btn-redondeado w-100 fw-bold">
                  Guardar Antecedentes
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default GestionarAntecendentes;