import { useRef,useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Nav from "../../components/Nav";
import * as bootstrap from 'bootstrap';

function RegistrarO() {
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
        estadoOdontologo: "Activo",
        fechaRegistro: "",
        especializacion: "Activo",        
    };

    const [odontologo, setOdontologo] = useState(estadoInicial);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const handleChange = (e) => {
        const{name, value} = e.target;
        setOdontologo({
            ...odontologo,
            [name]: value,
        });
    };

    const buscarOdontologo = () => {
        if (odontologo.numDocumento === "") {
            alert("Ingrese el cc del odontologo.");
            return;
        }

        // Datos de ejemplo (después se reemplazará por los de la BBDD)
        const datos = {
            tipoDocumento: "CC",
            numDocumento: odontologo.numDocumento,
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
            estadoOdontologo: "Activo",
            fechaRegistro: "",
            especializacion: "Activo",   
        };

        setOdontologo(datos);
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
            navegar('/Odontologos');
        }

    };

    const registraOdontologo = (e) => {
        e.preventDefault();
        const pass = passwordRef.current.value;

        if (pass.length < 8) {
            const modalPrec = document.getElementById('precaucion');
            let modalBootstrap = bootstrap.Modal.getInstance(modalPrec);

            if(!modalBootstrap){
                modalBootstrap = new bootstrap.Modal(modalPrec);
            }
            modalBootstrap.show();

            passwordRef.current.style.border = "2px solid red";
            return;
        }

        const modalReg = document.getElementById('registro');
        let modalBootstrap = bootstrap.Modal.getInstance(modalReg);
        if(!modalBootstrap){
            modalBootstrap = new bootstrap.Modal(modalReg);
        }
        modalBootstrap.show();

        console.log({
            ...odontologo,
            password: pass,
        });
    };

    const cancelar = () =>{
        setMostrarFormulario(false);
        
        setOdontologo(estadoInicial);

        if(passwordRef.current){
            password.current.value = "";
        }
    }; 

    return (
        <>
        <Nav />

        <div className="registro-page">

            <header className="text-center mt-3">
                <h1>Registrar Odontólogo</h1>
                <h6>Ingrese el Documento de Identidad del nuevo Odontólogo.</h6>
            </header>

            <div className="mb-3 text-center">
            
                <div className="buscar-id d-flex justify-content-center align-items-center gap-2 mx-auto">
                    <input
                        type="number"
                        id="numDocumentoBusq"
                        name="numDocumento"
                        className="form-control"
                        value={odontologo.numDocumento}
                        onChange={handleChange}
                        placeholder="Ingrese el Número del Documento"
                    />
                    <button className="btn btn-success" type="button" onClick={buscarOdontologo}>
                        Buscar
                    </button>
                </div>
            </div>


            {mostrarFormulario && (

                <form id="formOdontologo" onSubmit={registraOdontologo}>

                    <label htmlFor="tipoDocumento">
                        Tipo Documento
                        <select
                            id="tipoDocumento"
                            name="tipoDocumento"
                            value={odontologo.tipoDocumento}
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
                            value={odontologo.numDocumento}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="correo">
                        Correo
                        <input
                            type="email"
                            id="correo"
                            name="correo"
                            value={odontologo.correo}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="password">
                        Contraseña
                        <input
                            type="password"
                            name="password"
                            ref={passwordRef}
                            defaultValue={odontologo.password}
                        />
                    </label>

                    <label htmlFor="fechaNacimiento">
                        Fecha de Nacimiento
                        <input
                            type="date"
                            id="fechaNacimiento"
                            name="fechaNacimiento"
                            value={odontologo.fechaNacimiento}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="primerNombre">
                        Primer Nombre
                        <input
                            type="text"
                            id="primerNombre"
                            name="primerNombre"
                            value={odontologo.primerNombre}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="segundoNombre">
                        Segundo Nombre
                        <input
                            type="text"
                            id="segundoNombre"
                            name="segundoNombre"
                            value={odontologo.segundoNombre}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="primerApellido">
                        Primer Apellido
                        <input
                            type="text"
                            id="primerApellido"
                            name="primerApellido"
                            value={odontologo.primerApellido}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="segundoApellido">
                        Segundo Apellido
                        <input
                            type="text"
                            id="segundoApellido"
                            name="segundoApellido"
                            value={odontologo.segundoApellido}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="numCel">
                        Número de Celular
                        <input
                            type="tel"
                            id="numCel"
                            name="numCel"
                            value={odontologo.numCel}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="rh">
                        Tipo de Sangre
                        <select
                            id="rh"
                            name="rh"
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

                    <label htmlFor="nombreAcudiente">
                        Nombre Acudiente
                        <input
                            type="text"
                            id="nombreAcudiente"
                            name="nombreAcudiente"
                            value={odontologo.nombreAcudiente}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="documentoAcudiente">
                        Docuemnto Acudiente
                        <input
                            type="text"
                            id="nombreAcudiente"
                            name="documentoAcudiente"
                            value={odontologo.documentoAcudiente}
                            onChange={handleChange}
                        />
                    </label>

                    <label htmlFor="estadoOdontologo">
                        Estado del Odontólogo
                        <select
                            id="estadoOdontologo"
                            name="estadoOdontologo"
                            value={odontologo.estadoOdontologo}
                            onChange={handleChange}
                            required
                        >
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </label>

                    <label htmlFor="fechaRegistro">
                        Fecha de Registro
                        <input
                            type="date"
                            id="fechaRegistro"
                            name="fechaRegistro"
                            value={odontologo.fechaRegistro}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label htmlFor="especializacion">
                        Especialización
                        <input
                            id="especializacion"
                            type="text"
                            name="especializacion"
                            value={odontologo.especializacion}
                            onChange={handleChange}
                            placeholder="Ej: Ortodoncia"
                            required
                        />
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
                        
                        <p className="text-muted mb-4">El Odontólogo ha sido registrado en el sistema exitosamente.</p>
                        
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

export default RegistrarO;