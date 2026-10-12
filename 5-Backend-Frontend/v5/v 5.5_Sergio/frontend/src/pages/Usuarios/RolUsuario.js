import { useState, useEffect } from "react";
import Navbar from "../../components/NavbarAdmin";
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

    const registrarRolDirecto = async (id_rol, id_usuario) => {
        //Se evita que el Administrador principal (ID 1) pierda sus permisos, lo llamaremos superAdmin ¿les parece?
        if (Number(id_usuario) === 1 && Number(id_rol) !== 1) {
            alert("Operación denegada: No se puede eliminar el rol de Administrador al SuperUsuario principal del sistema.");
            obtenerRolUsuario(); //Forzamos el reset del select visualmente
            return;
        }

        try {
            //Se inserta el nuevo rol elegido por el select
            const registrarRol = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id_rol: Number(id_rol),
                    id_usuario: Number(id_usuario)
                })
            });

            if (registrarRol.ok) {
                await obtenerRolUsuario();

                const modalReg = document.getElementById('registro');
                let modalBootstrap = bootstrap.Modal.getInstance(modalReg) || new bootstrap.Modal(modalReg);
                modalBootstrap.show();
            } else {
                const errorData = await registrarRol.json();
                alert(`Error al asignar nuevo rol: ${errorData.error}`);
                await obtenerRolUsuario();
            }

        } catch (error) {
            obtenerRolUsuario();

            console.error("Error al registrar rol directamente:", error);
            alert("Hubo un error de conexión con el servidor.");
        }
    };

    const eliminarRolDirecto = async (id_rol, id_usuario) => {
        try {
            const eliminarRol = await fetch(`${API_URL}/${id_rol}/${id_usuario}`, {
                method: "DELETE"
            });

            if (eliminarRol.ok) {
                const modalElim = document.getElementById('eliminar');
                let modalBootstrap = bootstrap.Modal.getInstance(modalElim) || new bootstrap.Modal(modalElim);
                modalBootstrap.show();

                await obtenerRolUsuario();
            }else{
                const errorData = await eliminarRol.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error al eliminar rol directamente:", error);
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

    const modalEliminar =  async() => {
        const modalElim = document.getElementById('eliminar');
        const modalExiste = bootstrap.Modal.getInstance(modalElim);

        if(modalExiste){
            modalExiste.hide();
        }

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';
    };

    const cancelar = async() => {
        await obtenerRolUsuario();
    };

    return(
        <>
        <Navbar />
        
        <header className="text-center mt-3">
            <h1 style={{ color: "#103e6e", fontWeight: "bolder" }}>Roles de Usuario</h1>
        </header>

        <div className="container-fluid mt-4 px-4 d-flex justify-content-center rol_usuario"> 

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
                            <th scope="col" style={{ width: "100px" }}>ID Usuario</th>
                            <th scope="col">Nombre Completo</th>
                            <th scope="col">Email</th>
                            <th scope="col" style={{ width: "200px" }}>Rol Asignado</th>
                            </tr>
                        </thead>
                        <tbody className="text-center" style={{ cursor: "pointer" }}>
                            {roluFiltrado.length > 0 ? (
                                roluFiltrado.map((usuarioRol) => (
                                    <tr key={`${usuarioRol.id_rol}-${usuarioRol.id_usuario}`}>
                                        <th scope="row" className="text-center">{usuarioRol.id_usuario}</th>
                                        <td>{usuarioRol.nombre_completo}</td>
                                        <td>{usuarioRol.email}</td>
                                        <td>
                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                            {/* Select pero con restricciones conforme dejamos en el backend */}
                                            <select 
                                                className={`form-select form-select-sm fw-bold border-0 text-white rounded-pill px-3 py-1 ${
                                                    usuarioRol.id_rol === 1 ? 'bg-danger' : 
                                                    usuarioRol.id_rol === 2 ? 'bg-primary' : 'bg-success'
                                                }`}
                                                value={usuarioRol.id_rol}
                                                //Función asíncrona de inserción al cambiar la opción -> e.target.value es el valor del select, osea el id_rol
                                                onChange={(e) => registrarRolDirecto(e.target.value, usuarioRol.id_usuario)}
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
                                            {/* Boton exclusivo para cuando el rol sea Administrador, y no sea el "superAdmin" */}
                                            {usuarioRol.id_rol === 1 && usuarioRol.id_usuario !== 1 && (
                                                <button type="button" className="btn btn-outline-danger d-flex align-items-center justify-content-center" style={{width: "30px", height: "30px", backgroundColor: "#ffffff"}}
                                                onClick={() => eliminarRolDirecto(usuarioRol.id_rol, usuarioRol.id_usuario)}>
                                                🗑️
                                                </button>
                                            )}
                                            </div>
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

            <div className="modal fade" id="cSesion" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                    
                        <h4 className="text-danger fw-bold mb-3">¡Cerrar Sesión!</h4>
                        
                        <p className="text-muted mb-4">Estimado Administrador. ¿Desea eliminar el rol asignado al usuario?</p>
                        
                        <div className="d-flex w-100 gap-3 mt-4">
                            <button type="button" className="btn btn-danger w-50 py-2" id="btnSalir" style={{borderRadius: "12px"}} 
                            onClick={eliminarRolDirecto}>
                                Sí
                            </button>
                            <button type="button" className="btn btn-primary w-50 py-2" id="btnCerrar" style={{borderRadius: "12px"}} 
                            onClick={cancelar}>
                                No
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="eliminar" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                        <h4 className="text-success fw-bold mb-3">¡Eliminación Exitosa!</h4>
                        <p className="text-muted mb-4">El rol ha sido eliminado del usuario en el sistema exitosamente.</p>
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnExito" style={{borderRadius: "12px"}} onClick={modalEliminar}>
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