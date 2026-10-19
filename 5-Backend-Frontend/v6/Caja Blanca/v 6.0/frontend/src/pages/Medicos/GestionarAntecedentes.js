import Navbar from "../../components/NavbarMedico";
import { useState, useEffect } from "react";
import "../../styles/styleGestionarAntecedentes.css";

const API_URL_PACIENTES = "http://localhost:5000/api/paciente";
const API_URL_HISTORIAL = "http://localhost:5000/api/historial_medico";
const API_URL_DIAGNOSTICOS="http://localhost:5000/api/diagnostico/paciente";


function GestionarAntecendentes() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [antecedentes, setAntecedentes] = useState("");
  const [idHistorial, setIdHistorial] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [diagnostisco,setDiagnostico]=useState([]);

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
    }
    try{
      let res=await fetch(`${API_URL_DIAGNOSTICOS}/${paciente.id}`)
      if(res.ok){
        const data=await res.json();
        const dataFiltrada=data.map((diag)=>{
          return{...diag,
          fecha_registro: diag.fecha_registro.slice(0,10)
          };
        })
        setDiagnostico(Array.isArray(dataFiltrada) ? dataFiltrada : [dataFiltrada]);

      }else if (res.status === 404) {
        setDiagnostico([]);
      }
    }catch(error){
      console.error("Error al obtener diagnostico:", error);
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
              <div>
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
              <h2 className="mt-3"><strong>Diagnósticos anteriores</strong></h2>
              <ul className="list-group w-100 p-0">
                {diagnostisco.length>0?(
                diagnostisco.map((p)=>
                <li key={p.id} className="list-group-item bg-white rounded-4 mt-3 p-4 shadow-sm border-0   border-5">
                    {/* ENCABEZADO: Motivo (Izquierda) y Fecha (Derecha) */}
                    <div className="d-flex justify-content-between align-items-start mb-3 border-bottom pb-3">
                      <div>
                        <span className="text-primary text-uppercase fw-bold" style={{ fontSize: "0.80rem", letterSpacing: "1px" }}>
                          Motivo de consulta
                        </span>
                        <h5 className="mb-0 mt-1 fw-bold text-dark">{p.motivo}</h5>
                      </div>
                      <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill shadow-sm">
                        fecha: {p.fecha_registro}
                      </span>
                    </div>

                    {/* CUERPO: Tratamiento y Observaciones (En dos columnas) */}
                    <div className="row">
                      
                      {/* Columna Izquierda: Tratamiento */}
                      <div className="col-md-6 mb-3 mb-md-0">
                        <div className="p-3 bg-light rounded-3 h-100 border">
                          <strong className="text-primary d-block mb-1">Tratamiento sugerido:</strong> 
                          <span className="text-dark">{p.tratamiento_sugerido}</span>
                        </div>
                      </div>

                      {/* Columna Derecha: Observaciones */}
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100 border">
                          <strong className="text-primary d-block mb-1">Observaciones:</strong> 
                          <span className="text-muted">{p.observaciones}</span>
                        </div>
                      </div>

                    </div>
                  </li>)):(
                  <li className="list-group-item text-muted text-center py-3">
                    No se encontraron diagnosticos.
                  </li>
                )
                }
              </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default GestionarAntecendentes;