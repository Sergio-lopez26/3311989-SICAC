import { useState, useRef, useEffect } from "react";
import Nav from '../../components/Nav';
import * as bootstrap from 'bootstrap';
import api from "../../services/api"; 

function GestionarPacientes() {

    const passwordRef = useRef();

    const [mostrarForm, setMostrarForm] = useState(false);
    const [pacientes, setPacientes] = useState([]);
    const [tiposDoc, setTiposDoc] = useState([]); 
    const [pacienteElegido, setPacienteElegido] = useState(null);
    const [busqueda, setBusqueda] = useState("");

 
    const obtenerPacientesYDocumentos = async () => {
        try {
            const [resUsuarios, resTiposDoc] = await Promise.all([
                api.get("/users"),
                api.get("/tipo_documento")
            ]);

            const soloPacientes = resUsuarios.data.filter(usuario => usuario.id_rol === 3);
            
            setPacientes(soloPacientes);
            setTiposDoc(resTiposDoc.data);
        } catch (error) {
            console.error("Error al cargar los datos de pacientes:", error);
            alert("No se pudieron obtener los registros desde el servidor.");
        }
    };

 
    useEffect(() => {
        obtenerPacientesYDocumentos();
    }, []);

 
    const pacientesFiltrados = pacientes.filter((pacient) => {
        const nombreCompleto = `${pacient.primer_nombre || ""} ${pacient.segundo_nombre || ""} ${pacient.primer_apellido || ""} ${pacient.segundo_apellido || ""}`.toLowerCase();
        const numDoc = String(pacient.numero_documento || "");
        return (
            nombreCompleto.includes(busqueda.toLowerCase()) ||
            numDoc.includes(busqueda)
        );
    });

    const eligeRegistro = (paciente) =>{
        setPacienteElegido({ ...paciente }); 
        setMostrarForm(true);
    };

    const cambioInput = (e) =>{
        const {name, value} = e.target;
        if (name === "id_tipo_documento") {
            setPacienteElegido(prev => ({...prev, [name]: Number(value) }));
        } else {
            setPacienteElegido(prev => ({...prev, [name]: value }));
        }
    };

    const modalActualiza = () =>{
        const modalAct = document.getElementById('actualiza');
        const modalExiste = bootstrap.Modal.getInstance(modalAct);
        if(modalExiste) modalExiste.hide();

        setMostrarForm(false);
        setPacienteElegido(null);
    };

    const modalNoValido = () =>{
        const modalNV = document.getElementById('noValido');
        const modalExiste = bootstrap.Modal.getInstance(modalNV);
        if(modalExiste) modalExiste.hide();
    };

    const actualizar = async (e) =>{
        e.preventDefault();
        const pass = passwordRef.current.value;

        if(pass.length < 8){
            const modalNV = document.getElementById('noValido');
            let modalBootstrap = bootstrap.Modal.getInstance(modalNV) || new bootstrap.Modal(modalNV);
            modalBootstrap.show();
            
            passwordRef.current.style.border = "2px solid yellow";
            return;
        }

        try {
            const idPaciente = pacienteElegido.id;
            await api.put(`/users/${idPaciente}`, pacienteElegido);

            await obtenerPacientesYDocumentos();

            const modalAct = document.getElementById('actualiza');
            let modalBootstrap = bootstrap.Modal.getInstance(modalAct) || new bootstrap.Modal(modalAct);
            modalBootstrap.show();
            
        } catch (error) {
            console.error("Error al actualizar el paciente:", error);
            alert("Hubo un fallo en el servidor al intentar guardar los cambios.");
        }
    };
    
    const cancelar = () =>{
        setMostrarForm(false);
        setPacienteElegido(null); 
    }; 

    const obtenerSiglaDoc = (idTipo) => {
        const encontrado = tiposDoc.find(doc => doc.id === Number(idTipo));
        return encontrado ? encontrado.sigla : "N/A";
    };

    return (
        <>
        <Nav />

        <header className="text-center mt-3">
            <h1 style={{ color: "#103e6e", fontWeight: "bolder" }}>Consultar Pacientes</h1>
            <h6>Listado completo de información de pacientes</h6>
        </header>

        <div className="container-fluid mt-4">
            <div className="d-flex flex-nowrap justify-content-center gap-4">
                
                {mostrarForm && pacienteElegido && (
                <div id="formP" className="card shadow p-4" style={{ maxWidth: "600px", flexShrink: 0, marginBottom: "30px" }}>
                    <form id="formPaciente" onSubmit={actualizar}>

                        <label htmlFor="id_tipo_documento" className="d-block mb-3">Tipo de documento
                        <select name="id_tipo_documento" id="id_tipo_documento" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.id_tipo_documento || ""} onChange={cambioInput} required>
                            <option value="">Seleccione el tipo de documento</option>
                            {tiposDoc.map((doc) => (
                                <option key={doc.id} value={doc.id}>
                                    {doc.sigla} - {doc.nombre_documento}
                                </option>
                            ))}
                        </select>
                        </label>

                        <label htmlFor="numero_documento" className="d-block mb-3">Número de documento
                        <input type="text" name="numero_documento" id="numero_documento" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.numero_documento || ""} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="email" className="d-block mb-3">Email
                        <input type="email" name="email" id="email" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.email || ""} onChange={cambioInput} required/>
                        </label>
                        
                        <label htmlFor="password" className="d-block mb-3" >Password
                        <input type="password" ref={passwordRef} name="password" id="password" placeholder="********" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.password || ""} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="fecha_nacimiento" className="d-block mb-3">Fecha de nacimiento
                        <input type="date" name="fecha_nacimiento" id="fecha_nacimiento" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.fecha_nacimiento || ""} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="primer_nombre" className="d-block mb-3">Primer nombre
                        <input type="text" name="primer_nombre" id="primer_nombre" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.primer_nombre || ""} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="segundo_nombre" className="d-block mb-3">Segundo nombre
                        <input type="text" name="segundo_nombre" id="segundo_nombre" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.segundo_nombre || ""} onChange={cambioInput} />
                        </label>

                        <label htmlFor="primer_apellido" className="d-block mb-3">Primer apellido
                        <input type="text" name="primer_apellido" id="primer_apellido" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.primer_apellido || ""} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="segundo_apellido" className="d-block mb-3">Segundo apellido
                        <input type="text" name="segundo_apellido" id="segundo_apellido" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.segundo_apellido || ""} onChange={cambioInput} />
                        </label>

                        <label htmlFor="numero_celular" className="d-block mb-3">Número de Celular
                        <input type="tel" name="numero_celular" id="numero_celular" className="form-control" pattern="3[0-9]{9}" placeholder="3xxxxxxxxx" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.numero_celular || ""} onChange={cambioInput} required/>
                        </label>
                        
                        <label htmlFor="tipo_sangre" className="d-block mb-3">Tipo de sangre
                        <select name="tipo_sangre" id="tipo_sangre" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.tipo_sangre || "O+"} onChange={cambioInput} required>
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
                        
                        <label htmlFor="nombre_acudiente" className="d-block mb-3">Nombre del acudiente
                        <input type="text" name="nombre_acudiente" id="nombre_acudiente" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.nombre_acudiente || ""} onChange={cambioInput} />
                        </label>

                        <label htmlFor="documento_acudiente" className="d-block mb-3">Documento del acudiente
                        <input type="text" name="documento_acudiente" id="documento_acudiente" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.documento_acudiente || ""} onChange={cambioInput} />
                        </label>

                        <div className="d-flex w-100 gap-3">
                            <button id="btnActualizar" type="submit"  className="btn btn-success flex-fill py-2">Guardar Cambios</button>
                            <button id="btnCancelar" type="button" className="btn btn-danger flex-fill py-2" onClick={cancelar}>Cancelar</button>
                        </div>
                    </form>
                </div>
                )}

                <section id="TablaPaciente" className="flex-grow-1" style={{ minWidth: 0, maxHeight: "80vh", alignSelf: "flex-start" }}>
                    <div className="table-responsive border rounded bg-default p-1">
                        <div className="mb-4">
                            <input
                                type="text" className="form-control" placeholder="Buscar por nombre, apellido o número de documento..." 
                                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>

                        <table id="tPaciente" className="table table-hover align-middle mb-0" style={{ border: "3px solid rgb(255, 255, 255)", borderRadius: "10px", overflow: "hidden" }}>
                            <thead className="table-primary">
                                <tr>
                                    <th>Tipo Doc</th>
                                    <th>Número Doc</th>
                                    <th>Nombre Completo</th>
                                    <th>Celular</th>
                                    <th>Fecha Nac.</th>
                                    <th>Sangre</th>
                                    <th>Acudiente</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pacientesFiltrados.length > 0 ? (
                                    pacientesFiltrados.map((pacient) => (
                                        <tr key={pacient.id}>
                                            <td>{obtenerSiglaDoc(pacient.id_tipo_documento)}</td>
                                            <td><strong>{pacient.numero_documento}</strong></td>
                                            <td>{pacient.primer_nombre} {pacient.segundo_nombre || ""} {pacient.primer_apellido} {pacient.segundo_apellido || ""}</td>
                                            <td>{pacient.numero_celular}</td>
                                            <td>{pacient.fecha_nacimiento}</td>
                                            <td>{pacient.tipo_sangre}</td>
                                            <td>
                                                {pacient.nombre_acudiente || "N/A"}
                                                <br/><small className="text-muted">{pacient.documento_acudiente}</small>
                                            </td>
                                            <td className="text-center">
                                                <button className="btn btn-sm btn-outline-success" onClick={() => eligeRegistro(pacient)}>Editar</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center text-muted py-4">
                                            No se encontraron registros de pacientes con ese criterio.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* MODALES BOOTSTRAP */}
                <div className="modal fade" id="actualiza" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                        <h4 className="text-success fw-bold mb-3">¡Paciente Actualizado!</h4>
                        <p className="text-muted mb-4">El paciente ha sido actualizado en el sistema exitosamente.</p>
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
                        <p className="text-muted mb-4">La contraseña debe tener mínimo 8 caracteres</p>
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

export default GestionarPacientes;