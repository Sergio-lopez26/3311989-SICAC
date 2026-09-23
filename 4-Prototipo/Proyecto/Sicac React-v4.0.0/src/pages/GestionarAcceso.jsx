import { useState } from "react";
import Nav from "../components/Nav";
import '../styles/styleGestionarAcceso.css'
function GestionarAcceso() {
    // 1. Estado para mantener los roles actuales/confirmados de cada usuario (por ID)
    const [rolesUsuarios, setRolesUsuarios] = useState({
        1: 'Usuario',
        2: 'Usuario',
        3: 'Usuario'
    });

    // Estado para guardar el cambio que se está intentando hacer
    const [cambioPendiente, setCambioPendiente] = useState({ usuarioId: null, nuevoRol: '' });
    
    // Estado para controlar visualmente el modal
    const [modalAbierto, setModalAbierto] = useState(false);

    // Función que se ejecuta al mover el select
    const handleRolChange = (e, usuarioId) => {
        const nuevoRol = e.target.value;
        
        // Guardamos el cambio que se quiere hacer
        setCambioPendiente({ usuarioId, nuevoRol });
        // Abrimos el modal
        setModalAbierto(true);
    };

    // Si confirma, guardamos el nuevo rol de forma definitiva
    const handleConfirmar = () => {
        setRolesUsuarios(prev => ({
            ...prev,
            [cambioPendiente.usuarioId]: cambioPendiente.nuevoRol
        }));
        
        console.log(`Cambio guardado: Usuario ${cambioPendiente.usuarioId} ahora es ${cambioPendiente.nuevoRol}`);
        setModalAbierto(false);
    };

    // Si cancela, simplemente cerramos el modal y limpiamos el pendiente
    // El select volverá automáticamente a su valor gracias al atributo `value` controlado
    const handleCancelar = () => {
        setCambioPendiente({ usuarioId: null, nuevoRol: '' });
        setModalAbierto(false);
    };

    return (
        <>
            <Nav/>
            <header>
                <h1>Gestionar Acceso</h1>
            </header>
            <div id="buscar">
                <input type="text" name="buscar" placeholder="Buscar usuario" className="mb-3" id="btnbuscar" />
                <button className="btn btn-primary ms-4" >Buscar</button>
            </div>
            
            <h2 className="usuarios">Usuarios</h2>
            
            <table className="table tablepaciente">
                <thead className="table-primary">
                    <tr className='align-middle'>
                        <th scope="col">#</th>
                        <th scope="col">Tipo de Documento</th>
                        <th scope="col">Número de Documento</th>
                        <th scope="col">Primer Nombre</th>
                        <th scope="col">Segundo Nombre</th>
                        <th scope="col">Primer Apellido</th>
                        <th scope="col">Segundo Apellido</th>
                        <th scope="col">Número de Celular</th>
                        <th scope="col">Correo</th>
                        <th scope="col">Rol</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th scope="row">1</th>
                        <td>C.C.</td>
                        <td>1023456789</td>
                        <td>Carlos</td>
                        <td>Andrés</td>
                        <td>Mendoza</td>
                        <td>Castro</td>
                        <td>3112345678</td>
                        <td>carlos.mendoza@email.com</td>
                        <td>
                            {/* Usamos `value` en lugar de `defaultValue` para hacerlo un componente controlado */}
                            <select 
                                className="form-select form-select-sm" 
                                value={rolesUsuarios[1]} 
                                onChange={(e) => handleRolChange(e, 1)}
                            >
                                <option value="Usuario">Usuario</option>
                                <option value="Paciente">Paciente</option>
                                <option value="Odontologo">Odontologo</option>
                                <option value="Administrador">Administrador</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">2</th>
                        <td>C.C.</td>
                        <td>1098765432</td>
                        <td>María</td>
                        <td>Fernanda</td>
                        <td>Gómez</td>
                        <td>Rincón</td>
                        <td>3209876543</td>
                        <td>maria.gomez@email.com</td>
                        <td>
                            <select 
                                className="form-select form-select-sm" 
                                value={rolesUsuarios[2]} 
                                onChange={(e) => handleRolChange(e, 2)}
                            >
                                <option value="Usuario">Usuario</option>
                                <option value="Paciente">Paciente</option>
                                <option value="Odontologo">Odontologo</option>
                                <option value="Administrador">Administrador</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">3</th>
                        <td>T.I.</td>
                        <td>1011121314</td>
                        <td>Juan</td>
                        <td>David</td>
                        <td>Rojas</td>
                        <td>Ortiz</td>
                        <td>3151112233</td>
                        <td>juan.rojas@email.com</td>
                        <td>
                            <select 
                                className="form-select form-select-sm" 
                                value={rolesUsuarios[3]} 
                                onChange={(e) => handleRolChange(e, 3)}
                            >
                                <option value="Usuario">Usuario</option>
                                <option value="Paciente">Paciente</option>
                                <option value="Odontologo">Odontologo</option>
                                <option value="Administrador">Administrador</option>
                            </select>
                        </td>   
                    </tr>
                </tbody>
            </table>

            {/* MODAL CONTROLADO */}
            {modalAbierto && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Advertencia</h5>
                                <button type="button" className="btn-close" onClick={handleCancelar} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p>¿Quieres cambiar el Rol de este usuario?</p>
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

export default GestionarAcceso