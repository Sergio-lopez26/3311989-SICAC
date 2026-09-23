import Navbar from "../../components/NavbarPaciente";
import { useState, useEffect } from "react";
import "../../styles/styleVerHistorial.css";

const API_URL_HISTORIAL = "http://localhost:5000/api/historial_medico/paciente/";

function VerHistorial() {
  const [historial, setHistorial] = useState(null);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // ID del paciente logueado (puedes ajustarlo según tu lógica de sesión)
  const idPacienteLogueado = 1; 

  useEffect(() => {
    const obtenerHistorialPaciente = async () => {
      try {
        setCargando(true);
        
        // 1. Obtener el historial médico (antecedentes) del paciente
        const resHistorial = await fetch(`${API_URL_HISTORIAL}${idPacienteLogueado}`);
        
        if (!resHistorial.ok) {
          if (resHistorial.status === 404) {
            throw new Error("No se encontró un historial médico registrado para este paciente.");
          }
          throw new Error("Error al obtener la información del historial.");
        }

        const dataHistorial = await resHistorial.json();
        setHistorial(dataHistorial);

        // 2. Obtener los diagnósticos asociados a este historial o paciente
        try {
          const resDiag = await fetch(`http://localhost:5000/api/diagnostico/historial_medico/${dataHistorial.id}`);
          if (resDiag.ok) {
            const dataDiag = await resDiag.json();
            setDiagnosticos(dataDiag);
          }
        } catch (err) {
          console.error("No se pudieron cargar los diagnósticos:", err);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerHistorialPaciente();
  }, [idPacienteLogueado]);

  return (
    <>
      <Navbar />
      
      <header className="text-center mt-3">
        <h1 className="titulo-historial">Mi Historial Médico</h1>
        <h6>Consulta tus antecedentes y diagnósticos médicos registrados</h6>
      </header>

      <div className="container mt-4 mb-5">
        {cargando && (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2 text-muted">Cargando tu información médica...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-warning text-center shadow-sm" role="alert">
            {error}
          </div>
        )}

        {!cargando && !error && historial && (
          <div className="row justify-content-center">
            <div className="col-md-10">
              
              {/* SECCIÓN DE ANTECEDENTES */}
              <div className="card shadow p-4 border-0 mb-4 card-antecedentes">
                <h4 className="text-primary fw-bold mb-3">Antecedentes Médicos</h4>
                <p className="text-dark fs-5 mb-0">
                  {historial.antecedentes_medicos ? historial.antecedentes_medicos : "No hay antecedentes médicos registrados."}
                </p>
              </div>

              {/* SECCIÓN DE LISTA DE DIAGNÓSTICOS DEL DOCTOR */}
              <div className="card shadow p-4 border-0 card-diagnosticos">
                <h4 className="text-primary fw-bold mb-4">Diagnósticos y Consultas Realizadas</h4>
                
                {diagnosticos.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover shadow-sm align-middle mb-0 tabla-borde-custom">
                      <thead className="table-dark text-center align-middle">
                        <tr>
                          <th scope="col">Fecha</th>
                          <th scope="col">Motivo</th>
                          <th scope="col">Diagnóstico</th>
                          <th scope="col">Tratamiento / Observaciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diagnosticos.map((diag) => (
                          <tr key={diag.id}>
                            <td className="text-center">{diag.fecha ? diag.fecha.split("T")[0] : "N/D"}</td>
                            <td>{diag.motivo}</td>
                            <td className="text-center">
                              <span className="badge bg-info text-dark px-3 py-2 rounded-pill">
                                {diag.nombre_diagnostico || "Consultar"}
                              </span>
                            </td>
                            <td>
                              <strong>Tratamiento:</strong> {diag.tratamiento} <br />
                              <small className="text-muted">Obs: {diag.observaciones}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted text-center mb-0 py-3">
                    Aún no tienes diagnósticos o consultas registradas por un médico en el sistema.
                  </p>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default VerHistorial;