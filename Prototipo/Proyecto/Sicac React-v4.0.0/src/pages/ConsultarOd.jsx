import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import Nav from '../components/Nav'

function ConsultarOdontologo(){

  const [odontologos, setOdontologos] = useState([
    {
      id: 1,
      id_tipo_documento: "1", 
      numero_documento: "1012918783",
      email: "carlos.odontologo@sicac.com",
      primer_nombre: "Carlos",
      segundo_nombre: "Alberto",
      primer_apellido: "Ruiz",
      segundo_apellido: "Gomez",
      numero_celular: "5987603482",
      tipo_sangre: "O+",
      especializacion: "Ortodoncia",
      estado_odontologo: "Activo",
      fecha_registro: "2026-03-15"
    },
    {
      id: 2,
      id_tipo_documento: "1",
      numero_documento: "987654321",
      email: "laura.martinez@sicac.com",
      primer_nombre: "Laura",
      segundo_nombre: "", 
      primer_apellido: "Martínez",
      segundo_apellido: "Vega",
      numero_celular: "3159876543",
      tipo_sangre: "A+",
      especializacion: "Odontopediatría",
      estado_odontologo: "Activo",
      fecha_registro: "2026-05-20"
    },
     {
      id: 3,
      id_tipo_documento: "2",
      numero_documento: "7825941054",
      email: "Dilan.Garzon@sicac.com",
      primer_nombre: "Dilan",
      segundo_nombre: "Estiben", 
      primer_apellido: "Garzon",
      segundo_apellido: "Perez",
      numero_celular: "3032518448",
      tipo_sangre: "AB-",
      especializacion: "Odontopediatría",
      estado_odontologo: "Activo",
      fecha_registro: "2025-11-15"
    }
    
  ]);

  const[busqueda, setBusqueda] = useState("");

    const odontologosFiltrados = odontologos.filter((odonto) => {
    const nombreCompleto = `${odonto.primer_nombre} ${odonto.segundo_nombre} ${odonto.primer_apellido} ${odonto.segundo_apellido}`.toLowerCase();
    return (
    nombreCompleto.includes(busqueda.toLowerCase()) ||
    odonto.numero_documento.includes(busqueda)
    );
  });

   return (
    <>
      <Nav />
      <div className="container mt-5"> 
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Consultar Odontólogos</h2>
        </div>
      

        <div className="mb-4">
          <input
            type="text"
            className="form-control px-3 py-2"
            placeholder="Buscar por nombre, apellido o número de documento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="table-responsive border rounded bg-light p-3">
          <table className="table table-striped table-hover align-middle mb-0">
            <thead className="table-primary">
              <tr>
                <th>Documento</th>
                <th>Nombre Completo</th>
                <th>Especialización</th>
                <th>Celular</th>
                <th>Email</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {odontologosFiltrados.length > 0 ? (
                odontologosFiltrados.map((odonto) => (
                  <tr key={odonto.id}>
                    <td><strong>{odonto.numero_documento}</strong></td>
                    <td>
                      {odonto.primer_nombre} {odonto.segundo_nombre} {odonto.primer_apellido} {odonto.segundo_apellido}
                    </td>
                    <td>
                      <span className="badge bg-info text-dark">{odonto.especializacion}</span>
                    </td>
                    <td>{odonto.numero_celular}</td>
                    <td>{odonto.email}</td>
                    <td>
                      <span className={`badge ${odonto.estado_odontologo === "Activo" ? "bg-success" : "bg-danger"}`}>
                        {odonto.estado_odontologo}
                      </span>
                    </td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary me-2">Eliminar</button>
                      <button className="btn btn-sm btn-outline-warning">Editar</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No se encontraron odontólogos con ese criterio de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ConsultarOdontologo;







