import { useState, useEffect } from "react";
import Navbar from "../../components/NavbarAdmin";
import '../../styles/styleGestionarAcceso.css';
import * as bootstrap from 'bootstrap'

const API_URL = "http://localhost:5000/api/rol_usuario";

const GestionarRolUsuario = () =>{

   //Estados para los datos
    const [listUsuarioRol, setListUsuarioRol] = useState([]); //Almacenara los datos de usuario rol

    //Importante para búsqueda y consulta
    const [busqueda, setBusqueda] = useState("");

    //Esto es para que se muestren los datos desde la BD en la tabla
    const obtenerRolUsuario = async () => {
        try {
            //Se hacen peticiones al backend mediante la url
            const res = await fetch(API_URL);
            
            const dataRolUsuario = await res.json();

            setListUsuarioRol(dataRolUsuario);
        } catch (error) {
            console.error("Error al obtener datos del servidor:", error);
            alert("No se pudieron cargar los datos desde el servidor.");
        }
    };

    useEffect(() => {
        obtenerRolUsuario();
    }, []);

    const roluFiltrado = listUsuarioRol.filter(usuarioRol =>{
        const email = (usuarioRol.email || "").toLowerCase();
        const nombre = (usuarioRol.nombre_completo || "").toLowerCase();
        const rol_asignado = (usuarioRol.rol_asignado || "").toLowerCase();
        const trolu = busqueda.toLowerCase();

        return(
            trolu === "" || 
            email.includes(trolu) ||
            nombre.includes(trolu) ||
            rol_asignado.includes(trolu)
        );
    });

    const cambiarRolDirecto = async (idUsuario, idRolAnterior, nuevoIdRol) => {
        //Se evita que el Administrador principal (ID 1) pierda sus permisos, lo llamaremos superAdmin ¿les parece?
        if (Number(idUsuario) === 1 && Number(nuevoIdRol) !== 1) {
            alert("Operación denegada: No se puede eliminar el rol de Administrador al SuperUsuario principal del sistema.");
            obtenerRolUsuario(); //Forzamos el reset del select visualmente
            return;
        }

        try {
            //Se elimina la asignación vieja usando la ruta Delete del backend
            const resDelete = await fetch(`${API_URL}/${idRolAnterior}/${idUsuario}`, {
                method: "DELETE"
            });

            if (!resDelete.ok) {
                const errorData = await resDelete.json();
                alert(`Error al eliminar rol anterior: ${errorData.error}`);
                obtenerRolUsuario();
                return;
            }

            //Se inserta inmediatamente el nuevo rol elegido por el select
            const resInsert = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id_usuario: Number(idUsuario),
                    id_rol: Number(nuevoIdRol)
                })
            });

            if (resInsert.ok) {
                await obtenerRolUsuario();

                const modalReg = document.getElementById('registro');
                let modalBootstrap = bootstrap.Modal.getInstance(modalReg) || new bootstrap.Modal(modalReg);
                modalBootstrap.show();
            } else {
                const errorData = await resInsert.json();
                alert(`Error al asignar nuevo rol: ${errorData.error}`);
                await obtenerRolUsuario();
            }

        } catch (error) {
            console.error("Error al actualizar rol directamente:", error);
            alert("Hubo un error de conexión con el servidor.");
            obtenerRolUsuario();
        }
    };

    const modalRegistro =  async() => {
        const modalReg = document.getElementById('registro');
        const modalExiste = bootstrap.Modal.getInstance(modalReg);

        if(modalExiste){
            modalExiste.hide();
        }

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';
    };

    return(
        <>
        <Navbar />
        
        <header className="text-center mt-3">
            <h1 style={{ color: "#103e6e", fontWeight: "bolder" }}>Roles de Usuario</h1>
        </header>

        <div className="container-fluid mt-4 px-4 d-flex justify-content-center"> 

            <section id="tablaRolUsuario" className="flex-grow-1" style={{ minWidth: 0, maxWidth: "1000px" }}>
                <div className="shadow-sm mb-0 bg-default p-1" >
                    <div className="mb-4">
                        <input
                            type="text" className="form-control form-control-lg" placeholder="Buscar por email, nombre o rol..." 
                            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} 
                        />
                    </div>
                    <div style={{ overflowX: "auto", marginBottom: "11px"  }}>
                    <table id="trolusuario" className="table table-striped table-hover shadow-sm align-middle mb-0" style={{ border: "3px solid rgb(255, 255, 255)", borderRadius: "10px", overflow: "hidden" }} >
                        <thead className="table-dark text-center align-middle">
                            <tr>
                            <th scope="col" style={{ width: "100px" }}>ID Rol</th>
                            <th scope="col">Nombre Completo</th>
                            <th scope="col">Email</th>
                            <th scope="col" style={{ width: "200px" }}>Rol Asignado</th>
                            </tr>
                        </thead>
                        <tbody className="text-center" style={{ cursor: "pointer" }}>
                            {roluFiltrado.length > 0 ? (
                                roluFiltrado.map((usuarioRol) => (
                                    <tr key={`${usuarioRol.id_usuario}-${usuarioRol.id_rol}`}>
                                        <th scope="row" className="text-center">{usuarioRol.id_usuario}</th>
                                        <td>{usuarioRol.nombre_completo}</td>
                                        <td>{usuarioRol.email}</td>
                                        <td>
                                            {/* Select pero con restricciones conforme dejamos en el backend */}
                                            <select 
                                                className={`form-select form-select-sm fw-bold border-0 text-white rounded-pill px-3 py-1 ${
                                                    usuarioRol.id_rol === 1 ? 'bg-danger' : 
                                                    usuarioRol.id_rol === 2 ? 'bg-primary' : 'bg-success'
                                                }`}
                                                value={usuarioRol.id_rol}
                                                //Función asíncrona de borrado + inserción al cambiar la opción
                                                onChange={(e) => cambiarRolDirecto(usuarioRol.id_usuario, usuarioRol.id_rol, e.target.value)}
                                                //El "superAdmin" no puede degradarse a sí mismo por seguridad
                                                disabled={usuarioRol.id_usuario === 1}
                                            >
                                                <option value="1" className="bg-white text-dark">Administrador</option>
                                                
                                                {/* Bloquea médico si la cuenta le pertenece físicamente a un paciente registrado */}
                                                <option 
                                                    value="2" 
                                                    className="bg-white text-dark"
                                                    disabled={usuarioRol.tipo_perfil === 'perfil_paciente'}
                                                >
                                                    Medico
                                                </option>
                                                
                                                {/* Bloquea paciente si la cuenta le pertenece físicamente a un médico registrado */}
                                                <option 
                                                    value="3" 
                                                    className="bg-white text-dark"
                                                    disabled={usuarioRol.tipo_perfil === 'perfil_medico'}
                                                >
                                                    Paciente
                                                </option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center text-muted py-4">
                                        No se encontraron usuarios con ese rol en la búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </section>

            {/* MODALES */}
            <div className="modal fade" id="registro" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
            <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                    <h4 className="text-success fw-bold mb-3">¡Registro Exitoso!</h4>
                    <p className="text-muted mb-4">El rol ha sido asignado al usuario en el sistema exitosamente.</p>
                    <button type="button" className="btn btn-primary w-100 py-2" id="btnExito" style={{borderRadius: "12px"}} onClick={modalRegistro}>
                        Continuar
                    </button>
                </div>
            </div>
            </div>
        </div>
        </>
    );
}

export default GestionarRolUsuario;