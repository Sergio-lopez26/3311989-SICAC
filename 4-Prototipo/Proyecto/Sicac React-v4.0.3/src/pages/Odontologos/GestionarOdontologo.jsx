import { useState, useRef, useEffect } from "react";
import Nav from '../../components/Nav';
import * as bootstrap from 'bootstrap';
import api from "../../services/api";

function GestionarO() {

    const passwordRef = useRef();

    const [mostrarForm, setMostrarForm] = useState(false);
    const [odontologos, setOdontologos] = useState([]);
    const [odontologoElegido, setOdontologoElegido] = useState(null);

    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        cargarOdontologos();
    }, []);

    const cargarOdontologos = async () => {
        try {
            const [resUsuarios, resOdontologos] = await Promise.all([
                api.get("/users?id_rol=2"),
                api.get("/odontologo")
            ]);

            const datosCombinados = resUsuarios.data.map(usuario => {
                const infoEspecifica = resOdontologos.data.find(o => Number(o.id_usuario) === Number(usuario.id)) || {};
                return {
                    ...usuario,
                    id_odontologo_tabla: infoEspecifica.id || null, 
                    fecha_registro: infoEspecifica.fecha_registro || "",
                    especializacion: infoEspecifica.especializacion || "",
                    estado: infoEspecifica.estado || "Activo"
                };
            });

            setOdontologos(datosCombinados);
        } catch (error) {
            console.error("Error al cargar odontólogos:", error);
        }
    };

    const odontologosFiltrados = odontologos.filter((odonto) => {
        const nombreCompleto = `${odonto.primer_nombre} ${odonto.segundo_nombre || ""} ${odonto.primer_apellido} ${odonto.segundo_apellido || ""}`.toLowerCase();
        return (
            nombreCompleto.includes(busqueda.toLowerCase()) ||
            odonto.numero_documento.includes(busqueda)
        );
    });

    const eligeRegistro = (odontologo) => {
        setOdontologoElegido({ ...odontologo });
        setMostrarForm(true);
    };

    const cambioInput = (e) => {
        const { name, value } = e.target;
        setOdontologoElegido(prev => ({ ...prev, [name]: value }));
    };

    const modalActualiza = () => {
        const modalAct = document.getElementById('actualiza');
        const modalExiste = bootstrap.Modal.getInstance(modalAct);

        if (modalExiste) {
            modalExiste.hide();
        }
        setMostrarForm(false);
        setOdontologoElegido(null);
    };

    const modalNoValido = () => {
        const modalNV = document.getElementById('noValido');
        const modalExiste = bootstrap.Modal.getInstance(modalNV);

        if (modalExiste) {
            modalExiste.hide();
        }
    };

    const actualizar = async (e) => {
        e.preventDefault();
        const pass = passwordRef.current.value;

        if (pass.length < 8) {
            const modalNV = document.getElementById('noValido');
            let modalBootstrap = bootstrap.Modal.getInstance(modalNV);

            if (!modalBootstrap) {
                modalBootstrap = new bootstrap.Modal(modalNV);
            }
            modalBootstrap.show();
            
            passwordRef.current.style.border = "2px solid yellow";
            return;
        }

        try {
            const datosUsuario = {
                email: odontologoElegido.email,
                password: pass,
                id_rol: 2,
                id_tipo_documento: Number(odontologoElegido.id_tipo_documento),
                numero_documento: odontologoElegido.numero_documento,
                primer_nombre: odontologoElegido.primer_nombre,
                segundo_nombre: odontologoElegido.segundo_nombre || "",
                primer_apellido: odontologoElegido.primer_apellido,
                segundo_apellido: odontologoElegido.segundo_apellido || "",
                fecha_nacimiento: odontologoElegido.fecha_nacimiento,
                numero_celular: odontologoElegido.numero_celular,
                tipo_sangre: odontologoElegido.tipo_sangre,
                nombre_acudiente: "",
                documento_acudiente: "",
                id: odontologoElegido.id
            };

            const datosOdontologo = {
                id_usuario: odontologoElegido.id, 
                fecha_registro: odontologoElegido.fecha_registro,
                especializacion: odontologoElegido.especializacion || "",
                estado: odontologoElegido.estado || "Activo"
            };

            await api.put(`/users/${odontologoElegido.id}`, datosUsuario);

            if (odontologoElegido.id_odontologo_tabla) {
                await api.put(`/odontologo/${odontologoElegido.id_odontologo_tabla}`, {
                    id: odontologoElegido.id_odontologo_tabla,
                    ...datosOdontologo
                });
            } else {
                await api.post(`/odontologo`, datosOdontologo);
            }

            await cargarOdontologos();

            const modalAct = document.getElementById('actualiza');
            let modalBootstrap = bootstrap.Modal.getInstance(modalAct);
            if (!modalBootstrap) {
                modalBootstrap = new bootstrap.Modal(modalAct);
            }
            modalBootstrap.show();

        } catch (error) {
            console.error("Error detallado al guardar los cambios:", error.response?.data || error.message);
            alert("Hubo un error al guardar los cambios. Revisa la consola (F12) para más detalles.");
        }
    };
    
    const cancelar = () => {
        setMostrarForm(false);
        setOdontologoElegido(null);
    }; 

    return (
        <>
        <Nav />

        <header className="text-center mt-3">
            <h1>Consultar Odontólogos</h1>
        </header>

        <div className="container-fluid mt-4">
            <div className="d-flex flex-nowrap justify-content-center gap-4">
                {mostrarForm && odontologoElegido && (
                <div id="formP" className="card shadow p-4" style={{ maxWidth: "600px", flexShrink: 0, marginBottom: "30px" }}>
                    <form id="formOdontologo" onSubmit={actualizar}>

                        <label htmlFor="id_tipo_documento" className="d-block mb-3">Tipo de documento
                        <select name="id_tipo_documento" id="id_tipo_documento" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={odontologoElegido.id_tipo_documento || ""} onChange={cambioInput} required>
                            <option value="">Seleccione el tipo de documento</option>
                            <option value="1">CC</option>
                            <option value="2">TI</option>
                            <option value="3">CE</option>
                        </select>
                        </label>

                        <label htmlFor="numero_documento" className="d-block mb-3">Numero de documento
                        <input type="number" name="numero_documento" id="numero_documento" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={odontologoElegido.numero_documento || ""} onChange={cambioInput} required disabled/>
                        </label>

                        <label htmlFor="email" className="d-block mb-3">Email
                        <input type="email" name="email" id="email" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={odontologoElegido.email || ""} onChange={cambioInput} required/>
                        </label>
                        
                        <label htmlFor="password" className="d-block mb-3">Password
                        <input type="password" ref={passwordRef} name="password" id="password" placeholder="********" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={odontologoElegido.password || ""} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="fecha_nacimiento" className="d-block mb-3">Fecha de nacimiento
                        <input type="date" name="fecha_nacimiento" id="fecha_nacimiento" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={odontologoElegido.fecha_nacimiento || ""} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="primer_nombre" className="d-block mb-3">Primer nombre
                        <input type="text" name="primer_nombre" id="primer_nombre" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={odontologoElegido.primer_nombre || ""} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="segundo_nombre" className="d-block mb-3">Segundo nombre
                        <input type="text" name="segundo_nombre" id="segundo_nombre" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={odontologoElegido.segundo_nombre || ""} onChange={cambioInput} />
                        </label>

                        <label htmlFor="primer_apellido" className="d-block mb-3">Primer apellido
                        <input type="text" name="primer_apellido" id="primer_apellido" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={odontologoElegido.primer_apellido || ""} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="segundo_apellido" className="d-block mb-3">Segundo apellido
                        <input type="text" name="segundo_apellido" id="segundo_apellido" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={odontologoElegido.segundo_apellido || ""} onChange={cambioInput} />
                        </label>

                        <label htmlFor="numero_celular" className="d-block mb-3">Número de Celular
                        <input type="tel" name="numero_celular" id="numero_celular" className="form-control" pattern="3[0-9]{9}" placeholder="3xxxxxxxxx" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={odontologoElegido.numero_celular || ""} onChange={cambioInput} required/>
                        </label>
                        
                        <label htmlFor="tipo_sangre" className="d-block mb-3">Tipo de sangre
                        <select name="tipo_sangre" id="tipo_sangre" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={odontologoElegido.tipo_sangre || ""} onChange={cambioInput} required>
                            <option value="O-">O-</option>
                            <option value="O+">O+</option>
                            <option value="A-">A-</option>
                            <option value="A+">A+</option>
                            <option value="B-">B-</option>
                            <option value="B+">B+</option>
                            <option value="AB-">AB-</option>
                            <option value="AB+">AB+</option>
                        </select>
                        </label>

                        <label htmlFor="estado" className="d-block mb-3">Estado
                        <input type="text" name="estado" id="estado" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={odontologoElegido.estado || ""} onChange={cambioInput} />
                        </label>

                        <label htmlFor="fecha_registro" className="d-block mb-3">Fecha de registro
                        <input type="date" name="fecha_registro" id="fecha_registro" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={odontologoElegido.fecha_registro || ""} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="especializacion" className="d-block mb-3">Especialización
                        <input type="text" name="especializacion" id="especializacion" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={odontologoElegido.especializacion || ""} onChange={cambioInput} />
                        </label>

                        <div className="d-flex w-100 gap-3">
                            <button id="btnActualizar" type="submit" className="btn btn-success flex-fill py-2">Guardar Cambios</button>
                            <button id="btnCancelar" type="button" className="btn btn-danger flex-fill py-2" onClick={cancelar}>Cancelar</button>
                        </div>
                    </form>
                </div>
                )}

                <section id="TablaOdontologo" className="flex-grow-1" style={{ minWidth: 0, maxHeight: "80vh", alignSelf: "flex-start" }}>
                    <div className="table-responsive border rounded bg-default p-1">
                        <div className="mb-4">
                            <input
                                type="text" className="form-control" placeholder="Buscar por nombre, apellido o número de documento..." 
                                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>

                        <table id="tOdontologo" className="table table-hover align-middle mb-0" style={{ border: "3px solid rgb(255, 255, 255)", borderRadius: "10px", overflow: "hidden" }}>
                            <thead className="table-primary">
                                <tr>
                                    <th>Tipo Documento</th>
                                    <th>Número Documento</th>
                                    <th>Correo</th>
                                    <th>Nombre Completo</th>
                                    <th>Celular</th>
                                    <th>Estado</th>
                                    <th>Fecha Registro</th>
                                    <th>Especialización</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {odontologosFiltrados.length > 0 ? (
                                    odontologosFiltrados.map((odonto) => (
                                        <tr key={odonto.id}>
                                            <td>
                                                {odonto.id_tipo_documento === 1 || odonto.id_tipo_documento === "1" ? "CC" : odonto.id_tipo_documento === 2 || odonto.id_tipo_documento === "2" ? "TI" : "CE"}
                                            </td>
                                            <td><strong>{odonto.numero_documento}</strong></td>
                                            <td>{odonto.email}</td>
                                            <td>
                                                {odonto.primer_nombre} {odonto.segundo_nombre || ""} {odonto.primer_apellido} {odonto.segundo_apellido || ""}
                                            </td>
                                            <td>{odonto.numero_celular}</td>
                                            <td>
                                                <span className={`badge ${odonto.estado === "Activo" ? "bg-primary" : "bg-danger"}`}>
                                                    {odonto.estado || "Activo"}
                                                </span>
                                            </td>
                                            <td>{odonto.fecha_registro}</td>
                                            <td>
                                                <span className="badge bg-info text-dark">{odonto.especializacion || "General"}</span>
                                            </td>
                                            <td className="text-center">
                                                <button className="btn btn-sm btn-outline-success" onClick={() => eligeRegistro(odonto)}>Editar</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center text-muted py-4">
                                            No se encontraron odontólogos con ese criterio de búsqueda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="modal fade" id="actualiza" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                        <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                            <h4 className="text-success fw-bold mb-3">Odontólogo Actualizado!</h4>
                            <p className="text-muted mb-4">El odontólogo ha sido actualizado en el sistema exitosamente.</p>
                            <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarV" style={{borderRadius: "12px"}} onClick={modalActualiza}>
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="noValido" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                        <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                            <h4 className="text-warning fw-bold mb-3">¡Precaución!</h4>
                            <p className="text-muted mb-4">La contraseña debe tener mínimo 8 caractéres</p>
                            <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarNC" style={{borderRadius: "12px"}} onClick={modalNoValido}>
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default GestionarO;