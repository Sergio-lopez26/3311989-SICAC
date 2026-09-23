import Nav from '../../components/Nav'
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from 'react';
import * as bootstrap from 'bootstrap'
import api from "../../services/api"; 

function Usuario(){

    const navegar = useNavigate();
    const passwordRef = useRef();

    const [mostrarForm, setMostrarForm] = useState(false);
    const [lisUsuarios, setLisUsuarios] = useState([]); 
    const [tiposDoc, setTiposDoc] = useState([]); 

    const [datos, setDatos] = useState({
        id: "",
        id_tipo_documento: "",
        numero_documento: "",
        email: "",
        password: "",
        fecha_nacimiento: "",
        primer_nombre: "",
        segundo_nombre: "",
        primer_apellido: "",
        segundo_apellido: "",
        numero_celular: "",
        tipo_sangre: "O+",
        nombre_acudiente: "",
        documento_acudiente: "",
        id_rol: 1
    });

    const obtenerDatosIniciales = async () => {
        try {
            const [resUsuarios, resTiposDoc] = await Promise.all([
                api.get("/users"),
                api.get("/tipo_documento")
            ]);
            
            setLisUsuarios(resUsuarios.data);
            setTiposDoc(resTiposDoc.data);
        } catch (error) {
            console.error("Error al obtener datos del servidor:", error);
            alert("No se pudieron cargar los datos desde el servidor.");
        }
    };

    useEffect(() => {
        obtenerDatosIniciales();
    }, []);

    const eligeRegistro = (usuario) =>{
        setDatos(usuario);
        setMostrarForm(true);
    };

    const cambioInput = (e) =>{
        const {name, value} = e.target;
        if (name === "id_tipo_documento") {
            setDatos({ ...datos, [name]: Number(value) });
        } else {
            setDatos({ ...datos, [name]: value });
        }
    };

    const modalActualiza = () =>{
        const modalAct = document.getElementById('actualiza');
        const modalExiste = bootstrap.Modal.getInstance(modalAct);
        if(modalExiste) modalExiste.hide();
        setMostrarForm(false);
    };

    const modalNoValido = () =>{
        const modalNV = document.getElementById('noValido');
        const modalExiste = bootstrap.Modal.getInstance(modalNV);
        if(modalExiste) modalExiste.hide();
    };

    const actualizar = async (e) => {
        e.preventDefault();
        const pass = passwordRef.current.value;
        passwordRef.current.style.border = "";

        if(pass.length < 8){
            const modalNV = document.getElementById('noValido');
            let modalBootstrap = bootstrap.Modal.getInstance(modalNV) || new bootstrap.Modal(modalNV);
            modalBootstrap.show();
            passwordRef.current.style.border = "2px solid yellow";
            return;
        }
        
        try {
            await api.put(`/users/${datos.id}`, datos);
            
            await obtenerDatosIniciales();

            const modalAct = document.getElementById('actualiza');
            let modalBootstrap = bootstrap.Modal.getInstance(modalAct) || new bootstrap.Modal(modalAct);
            modalBootstrap.show();
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            alert("Hubo un error en el servidor al intentar actualizar.");
        }
    };

    const cancelar = () =>{
        setMostrarForm(false);
    }; 

    const obtenerSiglaDoc = (idTipo) => {
        const encontrado = tiposDoc.find(doc => doc.id === Number(idTipo));
        return encontrado ? encontrado.sigla : "N/A";
    };

    return(
        <>
        <Nav />
        
        <header className="text-center mt-3">
            <h1 style={{ color: "#103e6e", fontWeight: "bolder" }}>Usuarios Registrados</h1>
            <h6>Elige un Registro para Editar</h6>
        </header>

        <div className="container-fluid mt-4"> 
            <div className="d-flex flex-nowrap justify-content-center gap-4">

                {mostrarForm && (
                <div id="wrapperForm" className="card shadow p-4" style={{ maxWidth: "600px", flexShrink: 0, marginBottom: "30px" }}>
                    <form id="formUsuario" onSubmit={actualizar}>

                        <label htmlFor="id_tipo_documento" className="d-block mb-3">Tipo de documento
                        {/* SELECT DINÁMICO MAPEADO DESDE EL DB.JSON */}
                        <select name="id_tipo_documento" id="id_tipo_documento" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.id_tipo_documento} onChange={cambioInput} required>
                            <option value="">Seleccione el tipo de documento</option>
                            {tiposDoc.map((doc) => (
                                <option key={doc.id} value={doc.id}>
                                    {doc.sigla} - {doc.nombre_documento}
                                </option>
                            ))}
                        </select>
                        </label>

                        <label htmlFor="numero_documento" className="d-block mb-3">Número de documento
                        <input type="text" name="numero_documento" id="numero_documento" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.numero_documento} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="email" className="d-block mb-3">Email
                        <input type="email" name="email" id="email" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.email} onChange={cambioInput} required/>
                        </label>
                        
                        <label htmlFor="password" className="d-block mb-3" >Password
                        <input type="password" ref={passwordRef} name="password" id="password" placeholder="********" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.password} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="fecha_nacimiento" className="d-block mb-3">Fecha de nacimiento
                        <input type="date" name="fecha_nacimiento" id="fecha_nacimiento" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.fecha_nacimiento} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="primer_nombre" className="d-block mb-3">Primer nombre
                        <input type="text" name="primer_nombre" id="primer_nombre" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.primer_nombre} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="segundo_nombre" className="d-block mb-3">Segundo nombre
                        <input type="text" name="segundo_nombre" id="segundo_nombre" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.segundo_nombre} onChange={cambioInput} />
                        </label>

                        <label htmlFor="primer_apellido" className="d-block mb-3">Primer apellido
                        <input type="text" name="primer_apellido" id="primer_apellido" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.primer_apellido} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="segundo_apellido" className="d-block mb-3">Segundo apellido
                        <input type="text" name="segundo_apellido" id="segundo_apellido" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.segundo_apellido} onChange={cambioInput} />
                        </label>

                        <label htmlFor="numero_celular" className="d-block mb-3">Número de Celular
                        <input type="tel" name="numero_celular" id="numero_celular" className="form-control" pattern="3[0-9]{9}" placeholder="3xxxxxxxxx" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.numero_celular} onChange={cambioInput} required/>
                        </label>
                        
                        <label htmlFor="tipo_sangre" className="d-block mb-3">Tipo de sangre
                        <select name="tipo_sangre" id="tipo_sangre" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.tipo_sangre} onChange={cambioInput} required>
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
                        <input type="text" name="nombre_acudiente" id="nombre_acudiente" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.nombre_acudiente} onChange={cambioInput} />
                        </label>

                        <label htmlFor="documento_acudiente" className="d-block mb-3">Documento del acudiente
                        <input type="text" name="documento_acudiente" id="documento_acudiente" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.documento_acudiente} onChange={cambioInput} />
                        </label>

                        <div className="d-flex w-100 gap-3">
                            <button id="btnActualizar" type="submit"  className="btn btn-success flex-fill py-2">Actualizar</button>
                            <button id="btnCancelar" type="button" className="btn btn-danger flex-fill py-2" onClick={cancelar}>Cancelar</button>
                        </div>
                    </form>
                </div>
                )}

                <section id="TablaUsuario" className="flex-grow-1" style={{ minWidth: 0, maxHeight: "80vh", alignSelf: "flex-start" }}>
                    <div className="shadow-sm mb-0 bg-default p-1" style={{ marginTop: "5px", overflowX: "auto" }}>
                        <table id="tUsuario" className="table table-hover align-middle mb-0" style={{ border: "3px solid rgb(255, 255, 255)", borderRadius: "10px", overflow: "hidden" }} >
                            <thead className="table-dark text-center align-middle">
                                <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Tipo Documento</th>
                                <th scope="col">Número Documento</th>
                                <th scope="col">Email</th>
                                <th scope="col">Password</th>
                                <th scope="col">Fecha Nacimiento</th>
                                <th scope="col">Primer Nombre</th>
                                <th scope="col">Segundo Nombre</th>
                                <th scope="col">Primer Apellido</th>
                                <th scope="col">Segundo Apellido</th>
                                <th scope="col">Número Celular</th>
                                <th scope="col">Tipo de Sangre</th>
                                <th scope="col">Nombre Acudiente</th>
                                <th scope="col">Documento Acudiente</th>
                                </tr>
                            </thead>
                            <tbody style={{ cursor: "pointer" }}>
                                {lisUsuarios.map((usuario) => (
                                <tr key={usuario.id} onClick={() => eligeRegistro(usuario)}>
                                    <th scope="row">{usuario.id}</th>
                                    {/* Muestra dinámicamente la sigla (CC, TI, etc.) en vez de mostrar el número de ID directamente */}
                                    <td>{obtenerSiglaDoc(usuario.id_tipo_documento)}</td>
                                    <td>{usuario.numero_documento}</td>
                                    <td>{usuario.email}</td>
                                    <td>••••••••</td>
                                    <td>{usuario.fecha_nacimiento}</td>
                                    <td>{usuario.primer_nombre}</td>
                                    <td>{usuario.segundo_nombre || "N/A"}</td>
                                    <td>{usuario.primer_apellido}</td>
                                    <td>{usuario.segundo_apellido || "N/A"}</td>
                                    <td>{usuario.numero_celular}</td>
                                    <td>{usuario.tipo_sangre}</td>
                                    <td>{usuario.nombre_acudiente || "Ninguno"}</td>
                                    <td>{usuario.documento_acudiente || "Ninguno"}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* MODALES */}
                <div className="modal fade" id="actualiza" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                        <h4 className="text-success fw-bold mb-3">¡Usuario Actualizado!</h4>
                        <p className="text-muted mb-4">El usuario ha sido actualizado en el sistema exitosamente.</p>
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

export default Usuario;