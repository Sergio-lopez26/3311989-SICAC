import Navbar from "../../components/NavbarPaciente";
import { useState, useEffect } from "react";
import "../../styles/styleVerHistorial.css";

const API_URL_HISTORIAL = "http://localhost:5000/api/historial_medico/paciente/";
const API_URL_CITA = "http://localhost:5000/api/cita/paciente/"; // Nueva URL para consultar las citas
const API_URL_DIAGNOSTICO = "http://localhost:5000/api/diagnostico/cita/";
const API_URL_PACIENTE = "http://localhost:5000/api/paciente/";

function VerHistorial() {
  const [historial, setHistorial] = useState(null);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerHistorialYDiagnosticos = async () => {
      try {
        setCargando(true);
        
        // 1. Obtener usuario logueado
        const usuarioStorage = localStorage.getItem("usuario");
        if (!usuarioStorage) throw new Error("No hay una sesión activa. Por favor, inicia sesión.");

        const usuarioLogueado = JSON.parse(usuarioStorage);
        const idUsuario = usuarioLogueado.id || usuarioLogueado.id_usuario; 

        // 2. Obtener el ID del paciente
        const resPaciente = await fetch(`${API_URL_PACIENTE}${idUsuario}`);
        if (!resPaciente.ok) throw new Error("Error al obtener los datos del perfil del paciente.");
        const dataPaciente = await resPaciente.json();
        const idPaciente = dataPaciente.id;

        // 3. Obtener el historial médico
        const resHistorial = await fetch(`${API_URL_HISTORIAL}${idPaciente}`);
        if (resHistorial.ok) {
            const dataHistorial = await resHistorial.json();
            setHistorial(dataHistorial);
        } else if (resHistorial.status === 404) {
            setHistorial({ antecedentes_medicos: "No hay antecedentes médicos registrados." });
        } else {
            throw new Error("Error al obtener la información del historial.");
        }

        // 4. Obtener las citas del paciente para extraer los diagnósticos
        const resCitas = await fetch(`${API_URL_CITA}${idPaciente}`);
        if (resCitas.ok) {
            const citas = await resCitas.json();
            
            // Filtramos solo las citas que ya fueron atendidas
            const citasAtendidas = citas.filter(cita => cita.estado_cita === 'Atendida');
            
            // 5. Consultar el diagnóstico de cada cita atendida
            const promesasDiagnosticos = citasAtendidas.map(async (cita) => {
                try {
                    const resDiag = await fetch(`${API_URL_DIAGNOSTICO}${cita.id}`);
                    if (resDiag.ok) {
                        const dataDiag = await resDiag.json();
                        // Combinamos la información de la cita con la del diagnóstico
                        return {
                            id: dataDiag.id,
                            fecha: cita.fecha_cita,
                            medico: cita.medico_nombre,
                            motivo: dataDiag.motivo,
                            id_tipo_diagnostico: dataDiag.id_tipo_diagnostico,
                            tratamiento: dataDiag.tratamiento_sugerido, // Ajustado al nombre real en la BD
                            observaciones: dataDiag.observaciones
                        };
                    }
                } catch (err) {
                    console.error(`Error al obtener diagnóstico de la cita ${cita.id}:`, err);
                }
                return null;
            });

            const resultadosDiagnosticos = await Promise.all(promesasDiagnosticos);
            // Quitamos los nulos (citas atendidas que por alguna razón no retornaron diagnóstico)
            setDiagnosticos(resultadosDiagnosticos.filter(diag => diag !== null));
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerHistorialYDiagnosticos();
  }, []);

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
              
              <div className="card shadow p-4 border-0 mb-4 card-antecedentes">
                <h4 className="text-primary fw-bold mb-3">Antecedentes Médicos</h4>
                <p className="text-dark fs-5 mb-0">
                  {historial.antecedentes_medicos}
                </p>
              </div>

              <div className="card shadow p-4 border-0 card-diagnosticos">
                <h4 className="text-primary fw-bold mb-4">Diagnósticos y Consultas Realizadas</h4>
                
                {diagnosticos.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover shadow-sm align-middle mb-0 tabla-borde-custom">
                      <thead className="table-dark text-center align-middle">
                        <tr>
                          <th scope="col">Fecha</th>
                          <th scope="col">Doctor</th>
                          <th scope="col">Motivo</th>
                          <th scope="col">Tratamiento / Observaciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diagnosticos.map((diag) => (
                          <tr key={diag.id}>
                            <td className="text-center">{diag.fecha ? diag.fecha.split("T")[0] : "N/D"}</td>
                            <td className="text-center">{diag.medico}</td>
                            <td>{diag.motivo}</td>
                            <td>
                              {/* Mostramos el id_tipo_diagnostico como referencia momentánea */}
                              <span className="badge bg-info text-dark px-2 py-1 mb-2 rounded-pill d-inline-block">
                                Tipo de Diagnóstico ID: {diag.id_tipo_diagnostico}
                              </span>
                              <br/>
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
                    Aún no tienes diagnósticos o consultas registradas en el sistema.
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