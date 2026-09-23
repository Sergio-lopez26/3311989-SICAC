import Nav from '../components/Nav'
import { useNavigate } from "react-router-dom";
import { useState } from 'react';

function Usuario(){

    const navegar = useNavigate();

    const [mostrarForm, setMostrarForm] = useState(false);

    const [Datos, setDatos] = useState({
        tipoDocumento: "#",
        numeroDocumento: "",
        correo: "",
        password: "",
        fechaNacimiento: "",
        primerNombre: "",
        segundoNombre: "",
        primerApellido: "",
        segundoApellido: "",
        celular: "",
        tipoSangre: "O+",
        nombreAcudiente: "",
        documentoAcudiente: ""
    });

    const lisUsuarios = [
        { id: 1, tipoDocumento: "CC", numeroDocumento: "1233504140", correo: "andrejur055@gmail.com", password: "encriptaraqui01", fechaNacimiento: "1999-02-09", primerNombre: "Jeison", segundoNombre: "Andrey", primerApellido: "Sosa", segundoApellido: "Espitia", celular: "3203720455", tipoSangre: "O+", nombreAcudiente: "NULL", documentoAcudiente: "NULL" },
        { id: 2, tipoDocumento: "TI", numeroDocumento: "1023456789", correo: "laura.martinez@gmail.com", password: "clave01", fechaNacimiento: "2005-07-12", primerNombre: "Laura", segundoNombre: "Sofía", primerApellido: "Martínez", segundoApellido: "Gómez", celular: "3114567890", tipoSangre: "A+", nombreAcudiente: "Alfonso Martinez", documentoAcudiente: "798456345" },
        { id: 3, tipoDocumento: "CC", numeroDocumento: "798456123", correo: "carlos.ruiz@gmail.com", password: "clave02", fechaNacimiento: "1988-11-23", primerNombre: "Carlos", segundoNombre: "Andrés", primerApellido: "Ruiz", segundoApellido: "Pérez", celular: "3001234567", tipoSangre: "B+", nombreAcudiente: "NULL", documentoAcudiente: "NULL" }
    ];

    const eligeRegistro = (usuario) =>{
        setDatos(usuario);
        setMostrarForm(true);
    };

    const cambioInput = (e) =>{
        const {name, value} = e.target;
        setDatos({ ...Datos, [name]: value });
    }

    const actualiza = (e) =>{
        e.preventDefault();
        alert("Datos actualizado exitosamente");
        setMostrarForm(false);
    }

    const cancelar = () =>{
        setMostrarForm(false);
    }; 

    return(
        <>
        <Nav />
        
        <header className="text-center mt-3">
            <h1  style={{ color: "#103e6e", fontWeight: "bolder" }}>Usuarios Registrados</h1>
        </header>

        <div className="container-fluid mt-4"> 
            <div className="d-flex flex-nowrap justify-content-center gap-4">

                {mostrarForm && (
                <div id="formU" className="card shadow p-4" style={{ maxWidth: "600px", flexShrink: 0, marginBottom: "30px" }}>
                    <form id="formUsuario" onSubmit={actualiza}>

                        <label htmlFor="tipoDocumento" className="d-block mb-3">Tipo de documento
                        <select name="tipoDocumento" id="tipoDocumento" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={Datos.tipoDocumento} onChange={cambioInput} required>
                            <option value="#" selected>Seleccione el tipo de documento</option>
                            <option value="CC">CC</option>
                            <option value="TI">TI</option>
                            <option value="CE">CE</option>
                        </select>
                        </label>

                        <label htmlFor="numeroDocumento" className="d-block mb-3">Numero de documento
                        <input type="number" name="numeroDocumento" id="numeroDocumento" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={Datos.numeroDocumento} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="correo" className="d-block mb-3">Email
                        <input type="email" name="correo" id="correo" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={Datos.correo} onChange={cambioInput} required/>
                        </label>
                        
                        <label htmlFor="password" className="d-block mb-3" >Password
                        <input type="password" name="password" id="password" placeholder="********" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={Datos.password} onChange={cambioInput} minLength="8" required/>
                        </label>

                        <label htmlFor="fechaNacimiento" className="d-block mb-3">Fecha de nacimiento
                        <input type="date" name="fechaNacimiento" id="fechaNacimiento" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={Datos.fechaNacimiento} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="primerNombre" className="d-block mb-3">Primer nombre
                        <input type="text" name="primerNombre" id="primerNombre" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={Datos.primerNombre} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="segundoNombre" className="d-block mb-3">Segundo nombre
                        <input type="text" name="segundoNombre" id="segundoNombre" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={Datos.segundoNombre} onChange={cambioInput} />
                        </label>

                        <label htmlFor="primerApellido" className="d-block mb-3">Primer apellido
                        <input type="text" name="primerApellido" id="primerApellido" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={Datos.primerApellido} onChange={cambioInput} required/>
                        </label>

                        <label htmlFor="segundoApellido" className="d-block mb-3">Segundo apellido
                        <input type="text" name="segundoApellido" id="segundoApellido" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={Datos.segundoApellido} onChange={cambioInput} />
                        </label>

                        <label htmlFor="celular" className="d-block mb-3">Número de Celular
                        <input type="tel" name="celular" id="celular" className="form-control" pattern="3[0-9]{9}" placeholder="3xxxxxxxxx" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={Datos.celular} onChange={cambioInput} required/>
                        </label>
                        
                        <label htmlFor="tipoSangre" className="d-block mb-3">Tipo de sangre
                        <select name="tipoSangre" id="tipoSangre" className="form-select" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={Datos.tipoSangre} onChange={cambioInput} required>
                            <option value="O-">O-</option>
                            <option value="O+" selected>O+</option>
                            <option value="A-">A-</option>
                            <option value="A+">A+</option>
                            <option value="B-">B-</option>
                            <option value="B+">B+</option>
                            <option value="AB-">AB-</option>
                            <option value="AB+">AB+</option>
                        </select>
                        </label>
                        
                        <label htmlFor="nombreAcudiente" className="d-block mb-3">Nombre del Acudiente
                        <input type="text" name="nombreAcudiente" id="nombreAcudiente" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={Datos.nombreAcudiente} onChange={cambioInput} />
                        </label>

                        <label htmlFor="documentoAcudiente" className="d-block mb-3">Documento del Acudiente
                        <input type="text" name="documentoAcudiente" id="documentoAcudiente" className="form-control" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={Datos.documentoAcudiente} onChange={cambioInput} />
                        </label>

                        <div className="d-flex w-100 gap-3">
                            <button id="btnActualizar" type="submit"  className="btn btn-primary flex-fill py-2">Actualizar</button>
                            <button id="btnCancelar" type="button" className="btn btn-secondary flex-fill py-2" onClick={cancelar}>Cancelar</button>
                        </div>
                    </form>
                </div>
                )}

                <section id="TablaUsuario" className="flex-grow-1" style={{ minWidth: 0, maxHeight: "80vh", alignSelf: "flex-start" }}>
                    <div className="shadow-sm mb-0" style={{ marginTop: "20px", overflowX: "auto" }}>
                        <table id="tUsuario" className="table table-striped table-hover text-center align-middle mb-0" style={{ border: "3px solid rgb(172, 201, 245)", borderRadius: "10px", overflow: "hidden" }} >
                            <thead className="table-primary text-center align-middle">
                                <tr>
                                <th scope="col">id</th>
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
                                    <td>{usuario.tipoDocumento}</td>
                                    <td>{usuario.numeroDocumento}</td>
                                    <td>{usuario.correo}</td>
                                    <td>{usuario.password}</td>
                                    <td>{usuario.fechaNacimiento}</td>
                                    <td>{usuario.primerNombre}</td>
                                    <td>{usuario.segundoNombre}</td>
                                    <td>{usuario.primerApellido}</td>
                                    <td>{usuario.segundoApellido}</td>
                                    <td>{usuario.celular}</td>
                                    <td>{usuario.tipoSangre}+</td>
                                    <td>{usuario.nombreAcudiente}</td>
                                    <td>{usuario.documentoAcudiente}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
        </>
    );
}

export default Usuario