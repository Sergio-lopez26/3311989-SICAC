import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/stylesRegistro.css";
import logo from "../assets/logo.png";

function EditarOdontologo() {
    const navegar = useNavigate();

    const passwordRef = useRef();
    const validaPassRef = useRef();

    const [odontologo, setOdontologo] = useState({
        idOdontologo: "",
        tipoDocumento: "CC",
        numDocumento: "",
        correo: "",
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
        password: "",
    });

    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const handleChange = (e) => {
        setOdontologo({
            ...odontologo,
            [e.target.id]: e.target.value,
        });
    };

    const buscarOdontologo = () => {
        if (odontologo.idOdontologo === "") {
            alert("Ingrese el ID del odontólogo.");
            return;
        }

        // Datos de ejemplo (después los reemplazarás por los de tu base de datos)
        const datos = {
            idOdontologo: odontologo.idOdontologo,
            tipoDocumento: "CC",
            numDocumento: "123456789",
            correo: "odontologo@gmail.com",
            fechaNacimiento: "1995-05-10",
            primerNombre: "Carlos",
            segundoNombre: "Andrés",
            primerApellido: "Pérez",
            segundoApellido: "Gómez",
            numCel: "3001234567",
            rh: "O+",
            estadoOdontologo: "Activo",
            fechaRegistro: "2026-06-20",
            especializacion: "Ortodoncia",
            password: "12345678",
        };

        setOdontologo(datos);
        setMostrarFormulario(true);
    };

    const editarOdontologo = (e) => {
        e.preventDefault();

        const pass = passwordRef.current.value;
        const confirma = validaPassRef.current.value;

        if (pass.length < 8) {
            alert("La contraseña debe tener mínimo 8 caracteres.");
            return;
        }

        if (pass !== confirma) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        alert("Odontólogo actualizado correctamente.");

        console.log({
            ...odontologo,
            password: pass,
        });

        navegar("/Usuarios");
    };

    return (
        <div className="registro-page">

            <header>
                <img id="logo" src={logo} alt="Logo" />
                <h1>Editar Odontólogo</h1>
                <p>Ingrese el ID del odontólogo para editar su información.</p>
            </header>

            <div className="buscar-id">
                <label htmlFor="idOdontologo">
                    ID del Odontólogo
                </label>

                <input
                    type="number"
                    id="idOdontologo"
                    value={odontologo.idOdontologo}
                    onChange={handleChange}
                    placeholder="Ingrese el ID"
                />

                <button
                    type="button"
                    onClick={buscarOdontologo}
                >
                    Buscar
                </button>
            </div>

            {mostrarFormulario && (

                <form onSubmit={editarOdontologo}>

                    <label>
                        Tipo Documento
                        <select
                            id="tipoDocumento"
                            value={odontologo.tipoDocumento}
                            onChange={handleChange}
                        >
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="TI">Tarjeta de Identidad</option>
                            <option value="CE">Cédula de Extranjería</option>
                        </select>
                    </label>

                    <label>
                        Número Documento
                        <input
                            id="numDocumento"
                            value={odontologo.numDocumento}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Correo
                        <input
                            type="email"
                            id="correo"
                            value={odontologo.correo}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Fecha de Nacimiento
                        <input
                            type="date"
                            id="fechaNacimiento"
                            value={odontologo.fechaNacimiento}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Primer Nombre
                        <input
                            id="primerNombre"
                            value={odontologo.primerNombre}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Segundo Nombre
                        <input
                            id="segundoNombre"
                            value={odontologo.segundoNombre}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Primer Apellido
                        <input
                            id="primerApellido"
                            value={odontologo.primerApellido}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Segundo Apellido
                        <input
                            id="segundoApellido"
                            value={odontologo.segundoApellido}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Número de Celular
                        <input
                            id="numCel"
                            value={odontologo.numCel}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Tipo de Sangre
                        <select
                            id="rh"
                            value={odontologo.rh}
                            onChange={handleChange}
                        >
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

                    <label>
                        Estado
                        <select
                            id="estadoOdontologo"
                            value={odontologo.estadoOdontologo}
                            onChange={handleChange}
                        >
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </label>

                    <label>
                        Fecha Registro
                        <input
                            type="date"
                            id="fechaRegistro"
                            value={odontologo.fechaRegistro}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Especialización
                        <input
                            id="especializacion"
                            value={odontologo.especializacion}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Nueva Contraseña
                        <input
                            type="password"
                            ref={passwordRef}
                            defaultValue={odontologo.password}
                        />
                    </label>

                    <label>
                        Confirmar Contraseña
                        <input
                            type="password"
                            ref={validaPassRef}
                            defaultValue={odontologo.password}
                        />
                    </label>

                    <div className="botones">
                        <button type="submit">
                            Guardar Cambios
                        </button>

                        <button
                            type="button"
                            onClick={() => navegar("/Usuarios")}
                        >
                            Cancelar
                        </button>
                    </div>

                </form>

            )}

        </div>
    );
}

export default EditarOdontologo;