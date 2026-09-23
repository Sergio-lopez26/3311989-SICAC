import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from '../assets/logo.png';
import Nav from "../components/Nav";
import * as bootstrap from 'bootstrap';

function RegistrarP() {
    const navegar = useNavigate();

    const passwordRef = useRef();

    const estadoInicial ={
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
        nombreAcudiente: "",
        documentoAcudiente: "",
        fechaRegistro: "",
        estadoPaciente: "Activo",        
    };

    const [paciente, setPaciente] = useState(estadoInicial);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const handleChange = (e) => {
        const{name, value} = e.target;
        setPaciente({
            ...paciente,
            [name]: value,
        });
    };

    const buscarPaciente = () => {
        if (paciente.numDocumento === "") {
            alert("Ingrese el cc del paciente.");
            return;
        }

        // Datos de ejemplo (después los reemplazarás por los de tu base de datos)
        const datos = {
            tipoDocumento: "CC",
            numDocumento: paciente.numDocumento,
            correo: "odontologo@gmail.com",
            password: "12345678",
            fechaNacimiento: "1995-05-10",
            primerNombre: "Carlos",
            segundoNombre: "Andrés",
            primerApellido: "Pérez",
            segundoApellido: "Gómez",
            numCel: "3001234567",
            rh: "O+",
            nombreAcudiente: "",
            documentoAcudiente: "",
            fechaRegistro: "",
            estadoPaciente: "Activo", 
            
        };

        setPaciente(datos);
        setMostrarFormulario(true);
    };

    const modalPrecaucion = () =>{
        const modalPrec = document.getElementById('precaucion');
        const modalExiste = bootstrap.Modal.getInstance(modalPrec);

        if(modalExiste){
            modalExiste.hide();
        }
    };

    const modalRegistro = () =>{
        const modalReg = document.getElementById('registro');
        const modalExiste = bootstrap.Modal.getInstance(modalReg);

        if(modalExiste){
            modalExiste.hide();
            navegar('/Pacientes');
        }

    };

    const editarPaciente = (e) => {
        e.preventDefault();
        const pass = passwordRef.current.value;

        if (pass.length < 8) {
            const modalPrec = document.getElementById('precaucion');
            let modalBootstrap = bootstrap.Modal.getInstance(modalPrec);

            if(!modalBootstrap){
                modalBootstrap = new bootstrap.Modal(modalPrec);
            }
            modalBootstrap.show();

            passwordRef.current.style.border = "2px solid yellow";
            return;
        }

        const modalReg = document.getElementById('registro');
        let modalBootstrap = bootstrap.Modal.getInstance(modalReg);
        if(!modalBootstrap){
            modalBootstrap = new bootstrap.Modal(modalReg);
        }
        modalBootstrap.show();

        console.log({
            ...paciente,
            password: pass,
        });
    };

    const cancelar = () =>{
        setMostrarFormulario(false);
        
        setPaciente(estadoInicial);

        if(passwordRef.current){
            password.current.value = "";
        }
    }; 

    return (
        <>
        <Nav />

        <div className="registro-page">

            <header className="text-center mt-3">
                <h1>Registrar Paciente</h1>
                <h6>Ingrese el Documento de Identidad del Paciente.</h6>
            </header>

            <div className="mb-3 text-center">
            
                <div className="buscar-id d-flex justify-content-center align-items-center gap-2 mx-auto">
                    <input
                        type="number"
                        id="numDocumentoBusq"
                        name="numDocumento"
                        className="form-control"
                        value={paciente.numDocumento}
                        onChange={handleChange}
                        placeholder="Ingrese el Número del Documento"
                    />
                    <button className="btn btn-success" type="button" onClick={buscarPaciente}>
                        Buscar
                    </button>
                </div>

            </div>

            {mostrarFormulario && (

                <form id="formPaciente" onSubmit={editarPaciente}>

                    <label htmlFor="tipoDocumento">
                        Tipo Documento
                        <select
                            id="tipoDocumento"
                            name="tipoDocumento"
                            value={paciente.tipoDocumento}
                            onChange={handleChange}
                        >
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="TI">Tarjeta de Identidad</option>
                            <option value="CE">Cédula de Extranjería</option>
                        </select>
                    </label>

                    <label htmlFor="numDocumento">
                        Número Documento
                        <input
                            id="numDocumento"
                            name="numDocumento"
                            value={paciente.numDocumento}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="correo">
                        Correo
                        <input
                            type="email"
                            id="correo"
                            name="correo"
                            value={paciente.correo}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="password">
                        Contraseña
                        <input
                            type="password"
                            name="password"
                            ref={passwordRef}
                            defaultValue={paciente.password}
                        />
                    </label>

                    <label htmlFor="fechaNacimiento">
                        Fecha de Nacimiento
                        <input
                            type="date"
                            id="fechaNacimiento"
                            name="fechaNacimiento"
                            value={paciente.fechaNacimiento}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="primerNombre">
                        Primer Nombre
                        <input
                            type="text"
                            id="primerNombre"
                            name="primerNombre"
                            value={paciente.primerNombre}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="segundoNombre">
                        Segundo Nombre
                        <input
                            type="text"
                            id="segundoNombre"
                            name="segundoNombre"
                            value={paciente.segundoNombre}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="primerApellido">
                        Primer Apellido
                        <input
                            type="text"
                            id="primerApellido"
                            name="primerApellido"
                            value={paciente.primerApellido}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="segundoApellido">
                        Segundo Apellido
                        <input
                            type="text"
                            id="segundoApellido"
                            name="segundoApellido"
                            value={paciente.segundoApellido}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="numCel">
                        Número de Celular
                        <input
                            type="tel"
                            id="numCel"
                            name="numCel"
                            value={paciente.numCel}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="rh">
                        Tipo de Sangre
                        <select
                            id="rh"
                            name="rh"
                            value={paciente.rh}
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

                    <label htmlFor="nombreAcudiente">
                        Nombre Acudiente
                        <input
                            type="text"
                            id="nombreAcudiente"
                            name="nombreAcudiente"
                            value={paciente.nombreAcudiente}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="documentoAcudiente">
                        Docuemnto Acudiente
                        <input
                            type="text"
                            id="nombreAcudiente"
                            name="documentoAcudiente"
                            value={paciente.documentoAcudiente}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="fechaRegistro">
                        Fecha Registro
                        <input
                            type="date"
                            id="fechaRegistro"
                            name="fechaRegistro"
                            value={paciente.fechaRegistro}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="estadoPaciente">
                        Estado Paciente
                        <select
                            id="estadoPaciente"
                            name="estadoPaciente"
                            value={paciente.estadoPaciente}
                            onChange={handleChange}
                        >
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </label>

                    <div className="d-flex w-100 gap-3 mt-4 mb-4">
                        <button className="btn btn-primary flex-fill py-2" type="submit" >Registrar</button>
                        <button className="btn btn-secondary flex-fill py-2" type="button" onClick={cancelar}>Cancelar</button>
                    </div>

                </form>

            )}
            <div className="modal fade" id="precaucion" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                    
                        <h4 className="text-danger fw-bold mb-3">¡Precaución!</h4>
                        
                        <p className="text-muted mb-4">La contraseña debe tener mínimo 8 caractéres</p>
                        
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnCerrarP" style={{borderRadius: "12px"}} 
                        onClick={modalPrecaucion}>
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="registro" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                        <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                        
                        <h4 className="text-success fw-bold mb-3">¡Registro Exitoso!</h4>
                        
                        <p className="text-muted mb-4">El Paciente ha sido registrado en el sistema exitosamente.</p>
                        
                        <button type="button" className="btn btn-primary w-100 py-2" id="btnExito" style={{borderRadius: "12px"}} 
                        onClick={modalRegistro}>
                            Continuar
                        </button>
                    </div>
                </div>
            </div>

        </div>
        </>
        );
}

export default RegistrarP;
