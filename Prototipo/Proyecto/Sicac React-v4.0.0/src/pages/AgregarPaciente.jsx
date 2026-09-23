import { useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../styles/stylesRegistro.css';
import logo from '../assets/logo.png';
import Nav from "../components/Nav";

function AgregarP() {
    const navegar = useNavigate();
    const passwordRef = useRef();
    const validaPassRef = useRef();

    const validarYRegistrar = (e) => {
        e.preventDefault();
        const form = e.target;
        const pass = passwordRef.current.value;
        const valida = validaPassRef.current.value;

        if (pass.length < 8) {
            alert("La contraseña debe tener mínimo 8 caracteres");
            passwordRef.current.style.border = "2px solid red";
            passwordRef.current.focus();
            return;
        }

        if (pass !== valida) {
            alert("La contraseña no coincide");
            passwordRef.current.value = "";
            validaPassRef.current.value = "";
            passwordRef.current.style.border = "2px solid yellow";
            validaPassRef.current.style.border = "2px solid yellow";
            passwordRef.current.focus();
            return;
        }

        const nuevoPaciente = {
            id_tipo_documento: form.id_tipo_documento.value,
            numero_documento: form.numero_documento.value,
            email: form.email.value,
            password: pass,
            fecha_nacimiento: form.fecha_nacimiento.value,
            primer_nombre: form.primer_nombre.value,
            segundo_nombre: form.segundo_nombre.value,
            primer_apellido: form.primer_apellido.value,
            segundo_apellido: form.segundo_apellido.value,
            numero_celular: form.numero_celular.value,
            tipo_sangre: form.tipo_sangre.value,
            nombre_acudiente: form.nombre_acudiente.value,
            documento_acudiente: form.documento_acudiente.value,
            estado_paciente: "Activo"
        };

        const pacientesGuardados = JSON.parse(localStorage.getItem('pacientes') || '[]');
        const existePaciente = pacientesGuardados.some(p => p.numero_documento === nuevoPaciente.numero_documento);

        if (existePaciente) {
            alert("Ya existe un paciente con ese número de documento.");
            return;
        }

        pacientesGuardados.push({ id: pacientesGuardados.length + 1, ...nuevoPaciente });
        localStorage.setItem('pacientes', JSON.stringify(pacientesGuardados));

        console.log("Objeto estructurado para el Backend:", nuevoPaciente);
        alert("Paciente registrado en el sistema exitosamente.");
        navegar('/Usuarios');
    };

    const cancelar = () => {
        navegar('/Usuarios');
    };

    return (
        <>
            <Nav />
            <div className="registro-page">
                <header>
                    <img id="logo" src={logo} alt="Logo" />
                    <h1>Registro de Pacientes</h1>
                    <p>Complete los datos del paciente que desea registrar en el sistema.</p>
                </header>

                <form id="formRegistro" onSubmit={validarYRegistrar}>
                    <label htmlFor="id_tipo_documento">Tipo de Documento
                        <select id="id_tipo_documento" name="id_tipo_documento" required>
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="TI">Tarjeta de Identidad</option>
                            <option value="CE">Cédula de Extranjería</option>
                        </select>
                    </label>

                    <label htmlFor="numero_documento">Número de Documento
                        <input id="numero_documento" name="numero_documento" type="text" required />
                    </label>

                    <label htmlFor="email">Email
                        <input id="email" name="email" type="email" required />
                    </label>

                    <label htmlFor="fecha_nacimiento">Fecha de Nacimiento
                        <input id="fecha_nacimiento" name="fecha_nacimiento" type="date" required />
                    </label>

                    <label htmlFor="primer_nombre">Primer Nombre
                        <input id="primer_nombre" name="primer_nombre" type="text" required />
                    </label>

                    <label htmlFor="segundo_nombre">Segundo Nombre
                        <input id="segundo_nombre" name="segundo_nombre" type="text" />
                    </label>

                    <label htmlFor="primer_apellido">Primer Apellido
                        <input id="primer_apellido" name="primer_apellido" type="text" required />
                    </label>

                    <label htmlFor="segundo_apellido">Segundo Apellido
                        <input id="segundo_apellido" name="segundo_apellido" type="text" />
                    </label>

                    <label htmlFor="numero_celular">Número de Celular
                        <input id="numero_celular" name="numero_celular" type="tel" pattern="3[0-9]{9}" placeholder="3xxxxxxxxx" required />
                    </label>

                    <label htmlFor="tipo_sangre">Tipo de Sangre
                        <select id="tipo_sangre" name="tipo_sangre" required>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </label>

                    <label htmlFor="nombre_acudiente">Nombre del Acudiente
                        <input id="nombre_acudiente" name="nombre_acudiente" type="text" />
                    </label>

                    <label htmlFor="documento_acudiente">Documento del Acudiente
                        <input id="documento_acudiente" name="documento_acudiente" type="text" />
                    </label>

                    <label htmlFor="password">Contraseña
                        <input id="password" ref={passwordRef} name="password" type="password" placeholder="********" required />
                    </label>

                    <label htmlFor="confirmarPassword">Confirmar Contraseña
                        <input id="confirmarPassword" ref={validaPassRef} name="confirmarPassword" type="password" placeholder="********" required />
                    </label>

                    <div className="botones">
                        <button className="btn btn-primary" type="submit">Registrar Paciente</button>
                        <button className="btn btn-secondary" type="button" onClick={cancelar}>Cancelar</button>
                    </div>
                    <div className="enlace">
                        <Link to='/Usuarios'>Volver a Usuarios</Link>
                    </div>
                </form>
            </div>
        </>
    );
}

export default AgregarP;
