import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/Nav";
import * as bootstrap from 'bootstrap';
import api from "../../services/api";

function RegistrarP() {
    const navegar = useNavigate();
    const passwordRef = useRef();

    const estadoInicial = {
        tipoDocumento: "1",
        numDocumento: "",
        correo: "",
        password: "",
        fechaNacimiento: "",
        primerNombre: "",
        segundoNombre: "",
        primerApellido: "",
        segundoApellido: "",
        numCel: "",
        rh: "O+",
        nombreAcudiente: "",
        documentoAcudiente: "",
        estado: "Activo",
        fechaRegistro: ""
    };

    const [paciente, setPaciente] = useState(estadoInicial);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPaciente({ ...paciente, [name]: value });
    };

    const buscarPaciente = async () => {
        if (paciente.numDocumento === "") {
            alert("Ingrese el cc del paciente.");
            return;
        }

        try {
            const respuesta = await api.get(`/users?numero_documento=${paciente.numDocumento}`);
            
            if (respuesta.data.length > 0) {
                const usuarioExistente = respuesta.data[0];
                const rol = Number(usuarioExistente.id_rol);

                if (rol === 1 || rol === 2) {
                    alert(`No se puede registrar. Este documento ya pertenece a un ${rol === 1 ? "Administrador" : "Odontólogo"}.`);
                    setMostrarFormulario(false);
                    return;
                }
                if (rol === 3) {
                    alert("Este paciente ya se encuentra registrado.");
                    return;
                }
            }
            setMostrarFormulario(true);
        } catch (error) {
            console.error("Error al verificar:", error);
            alert("Error al conectar con el servidor.");
        }
    };

    const registraPaciente = async (e) => {
        e.preventDefault();
        const pass = passwordRef.current.value;

        if (pass.length < 8) {
            const modalPrec = document.getElementById('precaucion');
            let modalBootstrap = bootstrap.Modal.getInstance(modalPrec) || new bootstrap.Modal(modalPrec);
            modalBootstrap.show();
            return;
        }

        try {
            const nuevoUsuario = {
                email: paciente.correo,
                password: pass,
                id_rol: 3,
                id_tipo_documento: Number(paciente.tipoDocumento),
                numero_documento: paciente.numDocumento,
                primer_nombre: paciente.primerNombre,
                segundo_nombre: paciente.segundoNombre || "",
                primer_apellido: paciente.primerApellido,
                segundo_apellido: paciente.segundoApellido || "",
                fecha_nacimiento: paciente.fechaNacimiento,
                numero_celular: paciente.numCel,
                tipo_sangre: paciente.rh,
                nombre_acudiente: paciente.nombreAcudiente || "",
                documento_acudiente: paciente.documentoAcudiente || ""
            };

            await api.post("/users", nuevoUsuario);

            const resBusqueda = await api.get(`/users?numero_documento=${paciente.numDocumento}`);
            const idUsuario = resBusqueda.data[0].id;

            const nuevoPaciente = {
                id_usuario: idUsuario,
                fecha_registro: paciente.fechaRegistro,
                estado: paciente.estado
            };

            await api.post("/paciente", nuevoPaciente); 

            const modalReg = document.getElementById('registro');
            let modalBootstrap = bootstrap.Modal.getInstance(modalReg) || new bootstrap.Modal(modalReg);
            modalBootstrap.show();

        } catch (error) {
            console.error("Error al registrar:", error);
            alert("Ocurrió un error al intentar guardar el registro.");
        }
    };

    const cancelar = () => {
        setMostrarFormulario(false);
        setPaciente(estadoInicial);
    };

    return (
        <>
            <Nav />
            <div className="registro-page">
                <header className="text-center mt-3">
                    <h1>Registrar Paciente</h1>
                </header>

                <div className="mb-3 text-center">
                    <div className="buscar-id d-flex justify-content-center align-items-center gap-2 mx-auto">
                        <input type="number" name="numDocumento" className="form-control" value={paciente.numDocumento} onChange={handleChange} placeholder="Ingrese el Número del Documento" />
                        <button className="btn btn-success" type="button" onClick={buscarPaciente}>Buscar</button>
                    </div>
                </div>

                {mostrarFormulario && (
                    <form id="formOdontologo" onSubmit={registraPaciente}>
                        <label>Tipo Documento
                            <select name="tipoDocumento" value={paciente.tipoDocumento} onChange={handleChange}>
                                <option value="1">Cédula de Ciudadanía</option>
                                <option value="2">Tarjeta de Identidad</option>
                                <option value="3">Cédula de Extranjería</option>
                            </select>
                        </label>
                        <label>Número Documento <input name="numDocumento" value={paciente.numDocumento} onChange={handleChange} disabled /></label>
                        <label>Correo <input type="email" name="correo" value={paciente.correo} onChange={handleChange} required /></label>
                        <label>Contraseña <input type="password" name="password" ref={passwordRef} required /></label>
                        <label>Fecha de Nacimiento <input type="date" name="fechaNacimiento" value={paciente.fechaNacimiento} onChange={handleChange} required /></label>
                        <label>Primer Nombre <input name="primerNombre" value={paciente.primerNombre} onChange={handleChange} required /></label>
                        <label>Segundo Nombre <input name="segundoNombre" value={paciente.segundoNombre} onChange={handleChange} /></label>
                        <label>Primer Apellido <input name="primerApellido" value={paciente.primerApellido} onChange={handleChange} required /></label>
                        <label>Segundo Apellido <input name="segundoApellido" value={paciente.segundoApellido} onChange={handleChange} /></label>
                        <label>Número de Celular <input type="tel" name="numCel" value={paciente.numCel} onChange={handleChange} required /></label>
                        <label>Tipo de Sangre
                            <select name="rh" value={paciente.rh} onChange={handleChange}>
                                <option value="O+">O+</option> <option value="A+">A+</option> <option value="B+">B+</option> <option value="AB+">AB+</option>
                            </select>
                        </label>
                        <label>Nombre Acudiente <input name="nombreAcudiente" value={paciente.nombreAcudiente} onChange={handleChange} /></label>
                        <label>Documento Acudiente <input name="documentoAcudiente" value={paciente.documentoAcudiente} onChange={handleChange} /></label>
                        <label>Estado del Paciente
                            <select name="estado" value={paciente.estado} onChange={handleChange} required>
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </label>
                        <label>Fecha de Registro <input type="date" name="fechaRegistro" value={paciente.fechaRegistro} onChange={handleChange} required /></label>

                        <div className="d-flex w-100 gap-3 mt-4 mb-4">
                            <button className="btn btn-primary flex-fill py-2" type="submit">Registrar</button>
                            <button className="btn btn-secondary flex-fill py-2" type="button" onClick={cancelar}>Cancelar</button>
                        </div>
                    </form>
                )}

                <div className="modal fade" id="precaucion" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered"><div className="modal-content p-4"><h4>¡Precaución!</h4><p>La contraseña debe tener mínimo 8 caracteres</p><button className="btn btn-primary" onClick={() => bootstrap.Modal.getInstance(document.getElementById('precaucion')).hide()}>Aceptar</button></div></div>
                </div>
                <div className="modal fade" id="registro" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered"><div className="modal-content p-4"><h4>¡Registro Exitoso!</h4><p>El Paciente ha sido registrado.</p><button className="btn btn-primary" onClick={() => { bootstrap.Modal.getInstance(document.getElementById('registro')).hide(); navegar('/Pacientes'); }}>Continuar</button></div></div>
                </div>
            </div>
        </>
    );
}

export default RegistrarP;