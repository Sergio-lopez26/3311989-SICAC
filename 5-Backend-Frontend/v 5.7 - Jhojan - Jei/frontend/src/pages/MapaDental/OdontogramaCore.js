import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as bootstrap from 'bootstrap';
import '../../styles/styleOdontograma.css';

const API_URL_PIEZA = "http://localhost:5000/api/pieza_dental";
const API_URL_MAPA = "http://localhost:5000/api/mapa_dental";

//Códigos FDI de las 32 piezas permanentes, organizados como se ven en un odontograma real
//Fila superior (maxilar): de derecha a izquierda del paciente -> 18..11 | 21..28
const FILA_SUPERIOR = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
//Fila inferior (mandíbula): 48..41 | 31..38
const FILA_INFERIOR = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

//Estados clínicos disponibles para cada pieza, junto a un color representativo
const ESTADOS = {
    "Sano": "#8fce8f",
    "Cariado": "#f28b82",
    "Obturado": "#8ab4f8",
    "Ausente": "#c9c9c9",
    "Corona": "#ffd966",
    "Endodoncia": "#d9a3e0",
    "Fracturado": "#f6b26b",
    "Sellante": "#a6d8d8",
    "Extracción Indicada": "#e06666"
};

//Componente núcleo: recibe el Navbar del rol correspondiente y la ruta de regreso al listado de mapas
// soloLectura: si es true, oculta botones de crear/editar/eliminar
const OdontogramaCore = ({ Navbar, rutaVolver, soloLectura = false }) => {

    const { idMapa } = useParams();
    const navegar = useNavigate();

    const [infoMapa, setInfoMapa] = useState(null);
    const [piezas, setPiezas] = useState([]); //Piezas ya registradas para este mapa
    const [piezaSeleccionada, setPiezaSeleccionada] = useState(null); //fdi seleccionado actualmente
    const [datosForm, setDatosForm] = useState({
        id: "",
        id_mapa: idMapa,
        nomenclatura_fdi: "",
        cuadrante: "",
        posicion: "",
        estado_inicial: "Sano",
        estado_actual: "Sano"
    });

    const obtenerDatos = useCallback(async () => {
        try {
            const [resPiezas, resMapas] = await Promise.all([
                fetch(`${API_URL_PIEZA}/mapa/${idMapa}`),
                fetch(API_URL_MAPA)
            ]);

            const dataPiezas = await resPiezas.json();
            const dataMapas = await resMapas.json();

            setPiezas(dataPiezas);

            //Como no existe un GET por id individual para mapa_dental, se busca dentro del listado completo
            const mapaEncontrado = dataMapas.find(m => String(m.id) === String(idMapa));
            setInfoMapa(mapaEncontrado || null);
        } catch (error) {
            console.error("Error al obtener datos del odontograma:", error);
            alert("No se pudieron cargar los datos desde el servidor.");
        }
    }, [idMapa]);

    useEffect(() => {
        obtenerDatos();
    }, [obtenerDatos]);

    //Con esto buscamos si ya existe una pieza registrada para determinado código FDI
    const buscarPieza = (fdi) => piezas.find(p => String(p.nomenclatura_fdi) === String(fdi));

    const colorDiente = (fdi) => {
        const pieza = buscarPieza(fdi);
        if (!pieza) return "#ffffff"; //Sin registrar aún
        return ESTADOS[pieza.estado_actual] || "#ffffff";
    };

    //Al hacer clic en un diente, se carga (o inicializa) el formulario correspondiente
    const seleccionarDiente = (fdi) => {
        const pieza = buscarPieza(fdi);
        const cuadrante = Math.floor(fdi / 10);
        const posicion = fdi % 10;

        if (pieza) {
            setDatosForm({ ...pieza });
        } else {
            setDatosForm({
                id: "",
                id_mapa: idMapa,
                nomenclatura_fdi: String(fdi),
                cuadrante,
                posicion,
                estado_inicial: "Sano",
                estado_actual: "Sano"
            });
        }

        setPiezaSeleccionada(fdi);
    };

    const cambioInput = (e) => {
        const { name, value } = e.target;
        setDatosForm({ ...datosForm, [name]: value });
    };

    const modalGuardado = () => {
        const modalG = document.getElementById('guardado');
        const modalExiste = bootstrap.Modal.getInstance(modalG);
        if (modalExiste) modalExiste.hide();

        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = '';
    };

    const guardarPieza = async (e) => {
        e.preventDefault();

        try {
            const esNueva = !datosForm.id;
            const url = esNueva ? API_URL_PIEZA : `${API_URL_PIEZA}/${datosForm.id}`;
            const metodo = esNueva ? "POST" : "PUT";

            const res = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosForm)
            });

            const data = await res.json();

            if (res.ok) {
                await obtenerDatos();

                const modalG = document.getElementById('guardado');
                let modalBootstrap = bootstrap.Modal.getInstance(modalG) || new bootstrap.Modal(modalG);
                modalBootstrap.show();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error al guardar la pieza dental:", error);
            alert("Hubo un error de conexión con el servidor.");
        }
    };

    const cerrarPanel = () => {
        setPiezaSeleccionada(null);
    };

    const renderFila = (fila) => (
        <div className="fila-dientes">
            {fila.map((fdi) => {
                const pieza = buscarPieza(fdi);
                return (
                    <button
                        type="button"
                        key={fdi}
                        className={`diente-btn ${piezaSeleccionada === fdi ? "diente-activo" : ""}`}
                        style={{ backgroundColor: colorDiente(fdi) }}
                        onClick={() => seleccionarDiente(fdi)}
                        title={pieza ? `${fdi} - ${pieza.estado_actual}` : `${fdi} - Sin registrar`}
                    >
                        {fdi}
                    </button>
                );
            })}
        </div>
    );

    return (
        <>
        <Navbar />

        <header className="text-center mt-3">
            <h1 style={{ color: "#103e6e", fontWeight: "bolder" }}>Odontograma</h1>
            <h6>
                {infoMapa
                    ? `Mapa: ${infoMapa.nombre_estandar} (ID Historial: ${infoMapa.id_historial_medico})`
                    : `Mapa dental ID ${idMapa}`}
            </h6>
            <h6>Haz clic en una pieza para registrar o actualizar su estado</h6>
            <button type="button" className="btn btn-light mt-2" style={{ borderRadius: "12px" }} onClick={() => navegar(rutaVolver)}>
                ← Volver a Mapas Dentales
            </button>
        </header>

        <div className="container-fluid mt-4">
            <div className="d-flex flex-wrap justify-content-center gap-4">

                <div className="odontograma-wrapper card shadow p-4">
                    {renderFila(FILA_SUPERIOR)}
                    <hr />
                    {renderFila(FILA_INFERIOR)}

                    <div className="leyenda mt-3">
                        {Object.entries(ESTADOS).map(([nombre, color]) => (
                            <span key={nombre} className="leyenda-item">
                                <span className="leyenda-color" style={{ backgroundColor: color }}></span>
                                {nombre}
                            </span>
                        ))}
                    </div>
                </div>

                {piezaSeleccionada && (
                <div id="wrapperForm" className="card shadow p-4" style={{ flexShrink: 0, maxWidth: "320px" }}>
                    <form id="formPieza" onSubmit={guardarPieza}>
                        <h5 className="text-center mb-3" style={{ color: "#103e6e" }}>Pieza {piezaSeleccionada}</h5>

                        <label htmlFor="cuadrante" className="d-block mb-3">Cuadrante
                        <input type="text" name="cuadrante" id="cuadrante" className="form-control" value={datosForm.cuadrante} readOnly/>
                        </label>

                        <label htmlFor="posicion" className="d-block mb-3">Posición
                        <input type="text" name="posicion" id="posicion" className="form-control" value={datosForm.posicion} readOnly/>
                        </label>

                        <label htmlFor="estado_inicial" className="d-block mb-3">Estado Inicial
                        <select name="estado_inicial" id="estado_inicial" className="form-select" value={datosForm.estado_inicial} onChange={cambioInput} disabled={soloLectura} required>
                            {Object.keys(ESTADOS).map((estado) => (
                                <option key={estado} value={estado}>{estado}</option>
                            ))}
                        </select>
                        </label>

                        <label htmlFor="estado_actual" className="d-block mb-3">Estado Actual
                        <select name="estado_actual" id="estado_actual" className="form-select" value={datosForm.estado_actual} onChange={cambioInput} disabled={soloLectura} required>
                            {Object.keys(ESTADOS).map((estado) => (
                                <option key={estado} value={estado}>{estado}</option>
                            ))}
                        </select>
                        </label>

                        <div className="d-flex w-100 gap-3">
                            {!soloLectura && (
                                <button type="submit" className="btn btn-success flex-fill py-2" style={{ borderRadius: "12px" }}>
                                    {datosForm.id ? "Actualizar" : "Registrar"}
                                </button>
                            )}
                            <button type="button" className="btn btn-danger flex-fill py-2" style={{ borderRadius: "12px", flexGrow: soloLectura ? 1 : 0 }} onClick={cerrarPanel}>
                                {soloLectura ? "Cerrar" : "Cerrar"}
                            </button>
                        </div>
                    </form>
                </div>
                )}
            </div>
        </div>

        {/* MODAL */}
        <div className="modal fade" id="guardado" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "380px"}}>
                <div className="modal-content text-center border-0 p-4" style={{borderRadius: "16px"}}>
                    <h4 className="text-success fw-bold mb-3">¡Pieza Guardada!</h4>
                    <p className="text-muted mb-4">El estado de la pieza dental ha sido guardado exitosamente.</p>
                    <button type="button" className="btn btn-primary w-100 py-2" style={{borderRadius: "12px"}} onClick={modalGuardado}>
                        Continuar
                    </button>
                </div>
            </div>
        </div>
        </>
    );
};

export default OdontogramaCore;