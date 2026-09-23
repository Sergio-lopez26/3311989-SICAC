import { useState, useEffect } from "react";
import Nav from "../components/Nav";
import api from "../services/api"; 
import '../styles/styleGestionarAcceso.css';

function GestionarAcceso() {
    const [usuarios, setUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState(""); 
    const [cambioPendiente, setCambioPendiente] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);

    const ROLES = {
        0: 'Usuario',
        1: 'Administrador',
        2: 'Odontologo',
        3: 'Paciente'
    };

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await api.get("/users");
                setUsuarios(response.data);
            } catch (error) {
                console.error("Error al cargar usuarios:", error);
                alert("No se pudieron cargar los usuarios.");
            }
        };
        fetchUsuarios();
    }, []);

    const usuariosFiltrados = usuarios.filter((usuario) => {
        const nombreCompleto = `${usuario.primer_nombre || ""} ${usuario.segundo_nombre || ""} ${usuario.primer_apellido || ""} ${usuario.segundo_apellido || ""}`.toLowerCase();
        const doc = String(usuario.numero_documento || "");
        return (
            nombreCompleto.includes(busqueda.toLowerCase()) || 
            doc.includes(busqueda)
        );
    });

    const handleRolChange = (e, usuario) => {
        const nuevoRol = parseInt(e.target.value);
        setCambioPendiente({ ...usuario, id_rol: nuevoRol });
        setModalAbierto(true);
    };

    const handleConfirmar = async () => {
        try {
            await api.put(`/users/${cambioPendiente.id}`, cambioPendiente);
            
            setUsuarios(prev => prev.map(u => u.id === cambioPendiente.id ? cambioPendiente : u));
            setModalAbierto(false);
            setCambioPendiente(null);
        } catch (error) {
            console.error("Error al actualizar rol:", error);
            alert("No se pudo actualizar el rol en el servidor.");
        }
    };

    const handleCancelar = () => {
        setModalAbierto(false);
        setCambioPendiente(null);
    };

    return (
        <>
            <Nav />
            <header className="text-center mt-3">
                <h1>Gestionar Acceso</h1>
            </header>
            
            <div id="buscar" className="container mt-4">
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o documento..." 
                    className="form-control" 
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>
            
            <h2 className="usuarios mt-4 text-center">Usuarios Registrados</h2>
            
            <div className="container mt-3">
                <table className="table table-hover tablepaciente">
                    <thead className="table-primary">
                        <tr className='align-middle'>
                            <th>ID</th>
                            <th>Tipo Doc</th>
                            <th>Número Documento</th>
                            <th>Nombre Completo</th>
                            <th>Email</th>
                            <th>Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosFiltrados.length > 0 ? (
                            usuariosFiltrados.map((usuario) => (
                                <tr key={usuario.id} className="align-middle">
                                    <td>{usuario.id}</td>
                                    <td>{usuario.id_tipo_documento}</td>
                                    <td>{usuario.numero_documento}</td>
                                    <td>{`${usuario.primer_nombre} ${usuario.segundo_nombre || ""} ${usuario.primer_apellido} ${usuario.segundo_apellido}`}</td>
                                    <td>{usuario.email}</td>
                                    <td>
                                        <select 
                                            className="form-select form-select-sm" 
                                            value={usuario.id_rol} 
                                            onChange={(e) => handleRolChange(e, usuario)}
                                        >
                                            <option value={0}>Usuario</option>
                                            <option value={1}>Administrador</option>
                                            <option value={2}>Odontologo</option>
                                            <option value={3}>Paciente</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">No se encontraron resultados</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE CONFIRMACIÓN */}
            {modalAbierto && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirmar cambio</h5>
                                <button type="button" className="btn-close" onClick={handleCancelar}></button>
                            </div>
                            <div className="modal-body">
                                <p>¿Seguro que deseas cambiar el rol a <strong>{ROLES[cambioPendiente.id_rol]}</strong>?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-danger" onClick={handleCancelar}>Cancelar</button>
                                <button type="button" className="btn btn-success" onClick={handleConfirmar}>Confirmar Cambios</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default GestionarAcceso;