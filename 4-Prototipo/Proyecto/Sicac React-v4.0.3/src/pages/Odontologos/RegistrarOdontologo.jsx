import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/Nav";
import * as bootstrap from 'bootstrap';
import api from "../../services/api";

function RegistrarO() {
    const navegar = useNavigate();
    const passwordRef = useRef();

    const estadoInicial = {
        tipoDocumento: "CC",
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
        estadoOdontologo: "Activo",
        fechaRegistro: "",
        especializacion: "",
    };

    const [odontologo, setOdontologo] = useState(estadoInicial);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOdontologo({ ...odontologo, [name]: value });
    };

    const buscarOdontologo = async () => {
        if (odontologo.numDocumento === "") {
            alert("Ingrese el cc del odontologo.");
            return;
        }

        try {
            const res = await api.get(`/users?numero_documento=${odontologo.numDocumento}`);
            
            if (res.data.length > 0) {
                const usuarioExistente = res.data[0];
                
                if (usuarioExistente.id_rol === 1 || usuarioExistente.id_rol === 3) {
                    alert("Error: Este número de documento ya pertenece a un Paciente o Administrador y no puede registrarse como odontólogo.");
                    return;
                }
                
                if (usuarioExistente.id_rol === 2) {
                    alert("Este usuario ya está registrado como Odontólogo.");
                    return;
                }
            }

            setMostrarFormulario(true);
        } catch (error) {
            console.error("Error al buscar usuario:", error);
            alert("Error al verificar el documento en la base de datos.");
        }
    };

    const registraOdontologo = async (e) => {
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
                email: odontologo.correo,
                password: pass,
                id_rol: 2, 
                id_tipo_documento: odontologo.tipoDocumento === "CC" ? 1 : 2,
                numero_documento: odontologo.numDocumento,
                primer_nombre: odontologo.primerNombre,
                segundo_nombre: odontologo.segundoNombre,
                primer_apellido: odontologo.primerApellido,
                segundo_apellido: odontologo.segundoApellido,
                fecha_nacimiento: odontologo.fechaNacimiento,
                numero_celular: odontologo.numCel,
                tipo_sangre: odontologo.rh,
                nombre_acudiente: "",
                documento_acudiente: ""
            };

            await api.post('/users', nuevoUsuario);

            const resBusqueda = await api.get(`/users?numero_documento=${odontologo.numDocumento}`);
            const idUsuario = resBusqueda.data[0].id;

            const nuevoOdontologo = {
                id_usuario: idUsuario,
                fecha_registro: odontologo.fechaRegistro,
                especializacion: odontologo.especializacion,
                estado: odontologo.estadoOdontologo
            };

            await api.post('/odontologo', nuevoOdontologo);

            const modalReg = document.getElementById('registro');
            let modalBootstrap = bootstrap.Modal.getInstance(modalReg) || new bootstrap.Modal(modalReg);
            modalBootstrap.show();

        } catch (error) {
            console.error("Error:", error);
            alert("Ocurrió un error al registrar. Intente de nuevo.");
        }
    };

    const cancelar = () => {
        setMostrarFormulario(false);
        setOdontologo(estadoInicial);
    };

    return (
        <>
            <Nav />
            <div className="registro-page">
                <header className="text-center mt-3"><h1>Registrar Odontólogo</h1></header>
                <div className="mb-3 text-center">
                    <div className="buscar-id d-flex justify-content-center align-items-center gap-2 mx-auto">
                        <input type="number" name="numDocumento" className="form-control" value={odontologo.numDocumento} onChange={handleChange} placeholder="Ingrese el Número del Documento" />
                        <button className="btn btn-success" type="button" onClick={buscarOdontologo}>Buscar</button>
                    </div>
                </div>

                {mostrarFormulario && (
                    <form id="formOdontologo" onSubmit={registraOdontologo}>
                        <label>Tipo Documento
                            <select name="tipoDocumento" value={odontologo.tipoDocumento} onChange={handleChange}>
                                <option value="CC">Cédula de Ciudadanía</option>
                                <option value="TI">Tarjeta de Identidad</option>
                            </select>
                        </label>
                        <label>Número Documento <input name="numDocumento" value={odontologo.numDocumento} onChange={handleChange} /></label>
                        <label>Correo <input type="email" name="correo" value={odontologo.correo} onChange={handleChange} /></label>
                        <label>Contraseña <input type="password" name="password" ref={passwordRef} /></label>
                        <label>Fecha de Nacimiento <input type="date" name="fechaNacimiento" value={odontologo.fechaNacimiento} onChange={handleChange} /></label>
                        <label>Primer Nombre <input name="primerNombre" value={odontologo.primerNombre} onChange={handleChange} /></label>
                        <label>Segundo Nombre <input name="segundoNombre" value={odontologo.segundoNombre} onChange={handleChange} /></label>
                        <label>Primer Apellido <input name="primerApellido" value={odontologo.primerApellido} onChange={handleChange} /></label>
                        <label>Segundo Apellido <input name="segundoApellido" value={odontologo.segundoApellido} onChange={handleChange} /></label>
                        <label>Número de Celular <input type="tel" name="numCel" value={odontologo.numCel} onChange={handleChange} /></label>
                        <label>Tipo de Sangre
                            <select name="rh" value={odontologo.rh} onChange={handleChange}>
                                <option value="O+">O+</option> <option value="A+">A+</option>
                            </select>
                        </label>
                        <label>Estado del Odontólogo
                            <select name="estadoOdontologo" value={odontologo.estadoOdontologo} onChange={handleChange} required>
                                <option value="Activo">Activo</option> <option value="Inactivo">Inactivo</option>
                            </select>
                        </label>
                        <label>Fecha de Registro <input type="date" name="fechaRegistro" value={odontologo.fechaRegistro} onChange={handleChange} required /></label>
                        <label>Especialización <input name="especializacion" value={odontologo.especializacion} onChange={handleChange} required /></label>

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
                    <div className="modal-dialog modal-dialog-centered"><div className="modal-content p-4"><h4>¡Registro Exitoso!</h4><p>El Odontólogo ha sido registrado.</p><button className="btn btn-primary" onClick={() => { bootstrap.Modal.getInstance(document.getElementById('registro')).hide(); navegar('/Odontologos'); }}>Continuar</button></div></div>
                </div>
            </div>
        </>
    );
}

export default RegistrarO;