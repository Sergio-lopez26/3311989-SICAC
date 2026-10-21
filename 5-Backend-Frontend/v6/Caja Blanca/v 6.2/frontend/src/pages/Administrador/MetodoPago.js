import Navbar from "../../components/NavbarAdmin"
import { useState, useEffect } from 'react';
import * as bootstrap from 'bootstrap'

const API_URL = "http://localhost:5000/api/metodo_pago";

const GestionarMetodosPago = () =>{

    const [mostrarForm, setMostrarForm] = useState(false);
    const [mostrarForm2, setMostrarForm2] = useState(false);
    const [listMetodoPago, setListMetodoPago] = useState([]);

    const [datos, setDatos] = useState({
        id: "",
        nombre_metodo: ""
    });

    const [busqueda, setBusqueda] = useState("");

    const metodoPagoFiltrado = listMetodoPago.filter((mp) => {
        const ttipo = (mp.nombre_metodo || "").toLowerCase();
        return ttipo.includes(busqueda.toLowerCase());
    });

    const obtenerDatosIniciales = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setListMetodoPago(data);
        } catch (error) {
            console.error("Error al obtener datos del servidor:", error);
            alert("No se pudieron cargar los datos desde el servidor.");
        }
    };

    useEffect(() => {
        obtenerDatosIniciales();
    }, []);

    const eligeRegistro = (mp) =>{
        setDatos({ ...mp });
        setMostrarForm(true);
        setMostrarForm2(false);
    };

    const cambioInput = (e) =>{
        const {name, value} = e.target;
        setDatos({ ...datos, [name]: value });
    };

    const mostrarFormulario2 = () =>{
        setMostrarForm2(true);
        setMostrarForm(false);
        setDatos({ id: "", nombre_metodo: "" });
    };

    const modalRegistro = async() => {
        const modalReg = document.getElementById('registro');
        const modalExiste = bootstrap.Modal.getInstance(modalReg);
        if(modalExiste) modalExiste.hide();

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';

        await obtenerDatosIniciales();
        setMostrarForm2(false);
    };

    const modalActualiza = () =>{
        const modalAct = document.getElementById('actualiza');
        const modalExiste = bootstrap.Modal.getInstance(modalAct);
        if(modalExiste) modalExiste.hide();

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';

        setMostrarForm(false);
    };

    const registrar = async (e) => {
        e.preventDefault();
        try{
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            const data = await res.json();

            if(res.ok){
                const modalReg = document.getElementById('registro');
                let modalBootstrap = bootstrap.Modal.getInstance(modalReg) || new bootstrap.Modal(modalReg);
                modalBootstrap.show();
            }else{
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error al registrar el nuevo método de pago:", error);
            alert("Hubo un error de conexión con el servidor.");
        }
    };

    const actualizar = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/${datos.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            if(res.ok){
                await obtenerDatosIniciales();

                const modalAct = document.getElementById('actualiza');
                let modalBootstrap = bootstrap.Modal.getInstance(modalAct) || new bootstrap.Modal(modalAct);
                modalBootstrap.show();
            }else{
                const errorData = await res.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error al actualizar método de pago:", error);
            alert("Hubo un error en el servidor al intentar actualizar.");
        }
    };

    const eliminar = async () => {
        if (!window.confirm("¿Está seguro de eliminar este método de pago?")) return;
        try {
            const res = await fetch(`${API_URL}/${datos.id}`, { method: "DELETE" });
            if (res.ok) {
                await obtenerDatosIniciales();
                setMostrarForm(false);
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error al eliminar método de pago:", error);
            alert("Hubo un error de conexión con el servidor.");
        }
    };

    const cancelar = () =>{
        setMostrarForm(false);
        setMostrarForm2(false);
        setDatos({ id: "", nombre_metodo: "" });
    };

    return(
        <>
        <Navbar />

        <header className="text-center mt-3">
            <h1 style={{ color: "#103e6e", fontWeight: "bolder" }}>Métodos de Pago</h1>
            <h6>Elige un método de pago para editar</h6>
        </header>

        <div className="container-fluid mt-4">
            <div className="d-flex flex-nowrap justify-content-center gap-4">

                {mostrarForm && (
                <div id="wrapperForm" className="card shadow p-4" style={{ flexShrink: 0, marginBottom: "30px", maxHeight: "35vh" }}>
                    <form onSubmit={actualizar}>
                        <label htmlFor="nombre_metodo" className="d-block mb-3">Nombre del método
                        <input type="text" name="nombre_metodo" id="nombre_metodo" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.nombre_metodo} onChange={cambioInput} required/>
                        </label>

                        <div className="d-flex w-100 gap-3">
                            <button type="submit" className="btn btn-success flex-fill py-2" style={{ borderRadius: "12px" }}>Actualizar</button>
                            <button type="button" className="btn btn-outline-danger flex-fill py-2" style={{ borderRadius: "12px" }} onClick={eliminar}>Eliminar</button>
                            <button type="button" className="btn btn-danger flex-fill py-2" style={{ borderRadius: "12px" }} onClick={cancelar}>Cancelar</button>
                        </div>
                    </form>
                </div>
                )}

                {mostrarForm2 && (
                <div id="wrapperForm" className="card shadow p-4" style={{ flexShrink: 0, marginBottom: "30px", maxHeight: "30vh" }}>
                    <form onSubmit={registrar}>
                        <label htmlFor="nombre_metodo" className="d-block mb-3">Nombre del método
                        <input type="text" name="nombre_metodo" id="nombre_metodo" className="form-control border-primary-subtle" style={{ border: "2px solid #d0e2ff", borderRadius: "12px" }} value={datos.nombre_metodo} onChange={cambioInput} required/>
                        </label>

                        <div className="d-flex w-100 gap-3">
                            <button type="submit" className="btn btn-success flex-fill py-2" style={{ borderRadius: "12px" }}>Registrar</button>
                            <button type="button" className="btn btn-danger flex-fill py-2" style={{ borderRadius: "12px" }} onClick={cancelar}>Cancelar</button>
                        </div>
                    </form>
                </div>
                )}

                <section className="flex-grow-1" style={{ marginRight: "10px", minWidth: 0, maxWidth: "30vw", alignSelf: "flex-start" }}>
                    <div className="shadow-sm mb-0 bg-default p-1">
                        <div className="d-flex w-100 gap-3">
                            <input
                                type="text" className="form-control form-control-lg" placeholder="Buscar método de pago..."
                                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                            />
                            <button type="button" className="btn btn-primary flex-fill py-2" style={{ borderRadius: "12px" }} onClick={mostrarFormulario2}>Nuevo</button>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                        <table className="table table-striped table-hover shadow-sm align-middle mb-0" style={{ border: "3px solid rgb(255, 255, 255)", borderRadius: "10px", overflow: "hidden" }}>
                            <thead className="table-dark text-center align-middle">
                                <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Método de Pago</th>
                                </tr>
                            </thead>
                            <tbody className="text-center" style={{ cursor: "pointer" }}>
                                {metodoPagoFiltrado.length > 0 ? (
                                    metodoPagoFiltrado.map((mp) => (
                                        <tr key={mp.id} onClick={() => eligeRegistro(mp)}>
                                            <th scope="row">{mp.id}</th>
                                            <td>{mp.nombre_metodo}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="text-center text-muted py-4">
                                            No se encontró método de pago consultado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </section>

                <div className="modal fade" id="actualiza" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                        <h4 className="text-success fw-bold mb-3">¡Actualizado!</h4>
                        <p className="text-muted mb-4">El método de pago ha sido actualizado en el sistema exitosamente.</p>
                        <button type="button" className="btn btn-primary w-100 py-2" style={{borderRadius: "12px"}} onClick={modalActualiza}>
                            Continuar
                        </button>
                    </div>
                </div>
                </div>

                <div className="modal fade" id="registro" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                    <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                        <h4 className="text-success fw-bold mb-3">¡Registro Exitoso!</h4>
                        <p className="text-muted mb-4">El método de pago ha sido registrado en el sistema exitosamente.</p>
                        <button type="button" className="btn btn-primary w-100 py-2" style={{borderRadius: "12px"}} onClick={modalRegistro}>
                            Continuar
                        </button>
                    </div>
                </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default GestionarMetodosPago;
