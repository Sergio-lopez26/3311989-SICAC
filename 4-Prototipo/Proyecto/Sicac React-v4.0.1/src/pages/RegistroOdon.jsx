import { useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/stylesRegistro.css";
import logo from "../assets/logo.png";

function RegistroOdontologo() {
    const navegar = useNavigate();

    const passwordRef = useRef();
    const validaPassRef = useRef();

    const validaContraseña = (e) => {
        e.preventDefault();

        const pass = passwordRef.current.value;
        const valida = validaPassRef.current.value;

        if (pass.length < 8) {
            alert("La contraseña debe tener mínimo 8 caracteres");
            passwordRef.current.style.border = "2px solid red";
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

        alert(
            "Odontólogo registrado\nEl odontólogo ha sido registrado exitosamente"
        );

        navegar("/Login");
    };

    const cancelar = () => {
        navegar("/Login");
    };

    return (
        <div className="registro-page">
            <header>
                <img id="logo" src={logo} alt="Logo" />
                <h1>Registro de Odontólogos</h1>
                <p>Por favor completar los campos con sus respectivos datos</p>
            </header>

            <form id="formRegistro" onSubmit={validaContraseña}>

                <label htmlFor="tipoDocumento">
                    Tipo de Documento
                    <select id="tipoDocumento" required>
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="CE">Cédula de Extranjería</option>
                    </select>
                </label>

                <label htmlFor="numDocumento">
                    Número de Documento
                    <input id="numDocumento" type="text" required />
                </label>

                <label htmlFor="correo">
                    Correo Electrónico
                    <input id="correo" type="email" required />
                </label>

                <label htmlFor="fechaNacimiento">
                    Fecha de Nacimiento
                    <input id="fechaNacimiento" type="date" required />
                </label>

                <label htmlFor="primerNombre">
                    Primer Nombre
                    <input id="primerNombre" type="text" required />
                </label>

                <label htmlFor="segundoNombre">
                    Segundo Nombre
                    <input id="segundoNombre" type="text" />
                </label>

                <label htmlFor="primerApellido">
                    Primer Apellido
                    <input id="primerApellido" type="text" required />
                </label>

                <label htmlFor="segundoApellido">
                    Segundo Apellido
                    <input id="segundoApellido" type="text" />
                </label>

                <label htmlFor="numCel">
                    Número de Celular
                    <input
                        id="numCel"
                        type="tel"
                        pattern="3[0-9]{9}"
                        placeholder="3xxxxxxxxx"
                        required
                    />
                </label>

                <label htmlFor="rh">
                    Tipo de Sangre
                    <select id="rh" required>
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

                {/* CAMPOS DEL ODONTÓLOGO */}

                <label htmlFor="estadoOdontologo">
                    Estado del Odontólogo
                    <select id="estadoOdontologo" required>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                </label>

                <label htmlFor="fechaRegistro">
                    Fecha de Registro
                    <input id="fechaRegistro" type="date" required />
                </label>

                <label htmlFor="especializacion">
                    Especialización
                    <input
                        id="especializacion"
                        type="text"
                        placeholder="Ej: Ortodoncia"
                        required
                    />
                </label>

                <label htmlFor="password">
                    Contraseña
                    <input
                        id="password"
                        ref={passwordRef}
                        type="password"
                        placeholder="********"
                        required
                    />
                </label>

                <label htmlFor="confirmarPassword">
                    Confirmar Contraseña
                    <input
                        id="confirmarPassword"
                        ref={validaPassRef}
                        type="password"
                        placeholder="********"
                        required
                    />
                </label>

                <div className="botones">
                    <button type="submit">Registrar Odontólogo</button>
                      <button
  type="button"
  onClick={() => navegar("/Usuarios")}
>
   Cancelar
</button>

                </div>

                <div className="enlace">
                    <Link to="/Login">
                        ¿Ya tienes cuenta?
                    </Link>
                </div>
            </form>
        </div>
    
    );
}

export default RegistroOdontologo;