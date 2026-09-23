import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Nav from '../../components/Nav';
import * as bootstrap from 'bootstrap';

function GestionarP() {

    const passwordRef = useRef();

    const [mostrarForm, setMostrarForm] = useState(false)
;
    const [pacientes, setPacientes] = useState([
        {
            id: 1,
            idTipoDocumento: "CC",
            numeroDocumento: "1012918783",
            correo: "carlos.odontologo@sicac.com",
            password: "clave123",
            fechaNacimiento: "2002-06-16",
            primerNombre: "Carlos",
            segundoNombre: "Alberto",
            primerApellido: "Ruiz",
            segundoApellido: "Gomez",
            numeroCelular: "5987603482",
            tipoSangre: "O+",
            nombreAcudiente: "",
            documentoAcudiente: "",
            fechaRegistro: "2026-03-15",
            estadoPaciente: "Activo"
        },
        {
            id: 2,
            idTipoDocumento: "CC",
            numeroDocumento: "987654321",
            correo: "laura.martinez@sicac.com",
            password: "clave123",
            fechaNacimiento: "2002-06-16",
            primerNombre: "Laura",
            segundoNombre: "",
            primerApellido: "Martínez",
            segundoApellido: "Vega",
            numeroCelular: "3159876543",
            tipoSangre: "A+",
            nombreAcudiente: "",
            documentoAcudiente: "",
            fechaRegistro: "2026-05-20",
            estadoPaciente: "Activo"
        },
        {
            id: 3,
            idTipoDocumento: "CC",
            numeroDocumento: "7825941054",
            correo: "Dilan.Garzon@sicac.com",
            password: "clave123",
            fechaNacimiento: "2002-06-16",
            primerNombre: "Dilan",
            segundoNombre: "Estiben",
            primerApellido: "Garzon",
            segundoApellido: "Perez",
            numeroCelular: "3032518448",
            tipoSangre: "AB-",
            nombreAcudiente: "",
            documentoAcudiente: "",
            fechaRegistro: "2025-11-15",
            estadoPaciente: "Activo"
        }

    ]);

    const [pacienteElegido, setPacienteElegido] = useState(null);

    // Importante para búsqueda y consulta
    const [busqueda, setBusqueda] = useState("");

    const pacientesFiltrados = pacientes.filter((pacient) => {
        const nombreCompleto = `${pacient.primerNombre} ${pacient.segundoNombre} ${pacient.primerApellido} ${pacient.segundoApellido}`.toLowerCase();
        return (
            nombreCompleto.includes(busqueda.toLowerCase()) ||
            pacient.numeroDocumento.includes(busqueda)
        );
    });

    const eligeRegistro = (paciente) =>{
        setPacienteElegido({ ...paciente}); //Acá se copian los datos del paciente en el form " ...paciente"
        setMostrarForm(true);
    };

    const cambioInput = (e) =>{
        const {name, value} = e.target;
        setPacienteElegido(prev => ({...prev, [name]: value }));
    };

    const modalActualiza = () =>{
        const modalAct = document.getElementById('actualiza');
        const modalExiste = bootstrap.Modal.getInstance(modalAct);

        if(modalExiste){
            modalExiste.hide();
        }
        setMostrarForm(false);
        setPacienteElegido(null);

    };

    const modalNoValido = () =>{
        const modalNV = document.getElementById('noValido');
        const modalExiste = bootstrap.Modal.getInstance(modalNV);

        if(modalExiste){
            modalExiste.hide();
        }
    };

    const actualizar = (e) =>{
        e.preventDefault();
        const pass = passwordRef.current.value;

        if(pass.length < 8){
            const modalNV = document.getElementById('noValido');
            let modalBootstrap = bootstrap.Modal.getInstance(modalNV);

            if(!modalBootstrap){
                modalBootstrap = new bootstrap.Modal(modalNV);
            }
            modalBootstrap.show();
            
            passwordRef.current.style.border = "2px solid yellow";
            return;
        }

        const modalAct = document.getElementById('actualiza');
        let modalBootstrap = bootstrap.Modal.getInstance(modalAct);
        if(!modalBootstrap){
            modalBootstrap = new bootstrap.Modal(modalAct);
        }
        modalBootstrap.show();
        
        setPacientes(prevPacientes => 
            prevPacientes.map(p => p.id === pacienteElegido.id ? pacienteElegido : p)
        );
    };
    
    const cancelar = () =>{
        setMostrarForm(false);
        setPacienteElegido(null); // Al vaciar este estado, el form se limpia solito
    }; 

    return (
        <>

        <Nav />

        <header className="text-center mt-3">
            <h1>Consultar Pacientes</h1>
        </header>

        <div className="container-fluid mt-4">
            <div className="d-flex flex-nowrap justify-content-center gap-4">
                {mostrarForm && pacienteElegido &&(
                <div id="formP" className="card shadow p-4" style={{ maxWidth: "600px", flexShrink: 0, marginBottom: "30px" }}>
                    <form id="formPaciente" onSubmit={actualizar}>

                        <label htmlFor="idTipoDocumento" className="d-block mb-3">Tipo de documento
                        <select name="idTipoDocumento" id="idTipoDocumento" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.idTipoDocumento || ""} onChange={cambioInput} required>
                            <option value="">Seleccione el tipo de documento</option>
                            <option value="CC">CC</option>
                            <option value="TI">TI</option>
                            <option value="CE">CE</option>
                        </select>
                        </label>

                        <label htmlFor="numeroDocumento" className="d-block mb-3">Numero de documento
                        <input type="number" name="numeroDocumento" id="numeroDocumento" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.numeroDocumento || ""} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="correo" className="d-block mb-3">Email
                        <input type="email" name="correo" id="correo" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.correo || ""} onChange={cambioInput} required/>
                        </label>
                        
                        <label htmlFor="password" className="d-block mb-3" >Password
                        <input type="password" ref={passwordRef} name="password" id="password" placeholder="********" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.password || ""} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="fechaNacimiento" className="d-block mb-3">Fecha de nacimiento
                        <input type="date" name="fechaNacimiento" id="fechaNacimiento" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.fechaNacimiento || ""} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="primerNombre" className="d-block mb-3">Primer nombre
                        <input type="text" name="primerNombre" id="primerNombre" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.primerNombre || ""} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="segundoNombre" className="d-block mb-3">Segundo nombre
                        <input type="text" name="segundoNombre" id="segundoNombre" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.segundoNombre || ""} onChange={cambioInput} />
                        </label>

                        <label htmlFor="primerApellido" className="d-block mb-3">Primer apellido
                        <input type="text" name="primerApellido" id="primerApellido" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.primerApellido || ""} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="segundoApellido" className="d-block mb-3">Segundo apellido
                        <input type="text" name="segundoApellido" id="segundoApellido" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.segundoApellido || ""} onChange={cambioInput} />
                        </label>

                        <label htmlFor="numeroCelular" className="d-block mb-3">Número de Celular
                        <input type="tel" name="numeroCelular" id="numeroCelular" className="form-control" pattern="3[0-9]{9}" placeholder="3xxxxxxxxx" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.numeroCelular || ""} onChange={cambioInput} required/>
                        </label>
                        
                        <label htmlFor="tipoSangre" className="d-block mb-3">Tipo de sangre
                        <select name="tipoSangre" id="tipoSangre" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.tipoSangre || ""} onChange={cambioInput} required>
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
                        
                        <label htmlFor="nombreAcudiente" className="d-block mb-3">Nombre del acudiente
                        <input type="text" name="nombreAcudiente" id="nombreAcudiente" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.nombreAcudiente || ""} onChange={cambioInput} />
                        </label>

                        <label htmlFor="documentoAcudiente" className="d-block mb-3">Documento del acudiente
                        <input type="text" name="documentoAcudiente" id="documentoAcudiente" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.documentoAcudiente || ""} onChange={cambioInput} />
                        </label>

                        <label htmlFor="fechaRegistro" className="d-block mb-3">Fecha de registro
                        <input type="date" name="fechaRegistro" id="fechaRegistro" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.fechaRegistro || ""} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="estadoPaciente" className="d-block mb-3">Estado
                        <input type="text" name="estadoPaciente" id="estadoPaciente" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={pacienteElegido.estadoPaciente || ""} onChange={cambioInput} />
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
                                    <th>Tipo Documento</th>
                                    <th>Número Documento</th>
                                    <th>Correo</th>
                                    <th>Nombre Completo</th>
                                    <th>Celular</th>
                                    <th>Fecha Registro</th>
                                    <th>Estado</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pacientesFiltrados.length > 0 ? (
                                    pacientesFiltrados.map((pacient) => (
                                        <tr key={pacient.id}>
                                            <td>
                                                {pacient.idTipoDocumento}
                                            </td>
                                            <td><strong>{pacient.numeroDocumento}</strong></td>
                                            <td>
                                                {pacient.correo}
                                            </td>
                                            <td>
                                                {pacient.primerNombre} {pacient.segundoNombre} {pacient.primerApellido} {pacient.segundoApellido}
                                            </td>
                                            <td>
                                                {pacient.numeroCelular}
                                            </td>
                                            <td>
                                                {pacient.fechaRegistro}
                                            </td>
                                            <td>
                                                <span className={`badge ${pacient.estadoPaciente === "Activo" ? "bg-primary" : "bg-danger"}`}>
                                                    {pacient.estadoPaciente}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button className="btn btn-sm btn-outline-success" onClick={() => eligeRegistro(pacient)}>Editar</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center text-muted py-4">
                                            No se encontraron pacientes con ese criterio de búsqueda.
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
                                        
                        <h4 className="text-success fw-bold mb-3">Paciente Actualizado!</h4>
                        
                        <p className="text-muted mb-4">El paciente ha sido actualizado en el sistema exitosamente.</p>
                        
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarV" style={{borderRadius: "12px"}} 
                        onClick={modalActualiza}>
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
                        
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarNC" style={{borderRadius: "12px"}} 
                        onClick={modalNoValido}>
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

export default GestionarP;
