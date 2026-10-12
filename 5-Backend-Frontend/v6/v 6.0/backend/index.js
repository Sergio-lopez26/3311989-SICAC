import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./db.js";

import rolRouter from "./routes/rol.js";
import tipoDocumentoRoute from "./routes/tipo_documento.js";
import usuarioRoute from "./routes/usuario.js";
import pacienteRoute from "./routes/paciente.js";
import medicoRoute from "./routes/medico.js";
import mapaDentalRoute from "./routes/mapa_dental.js";
import piezaDentalRoute from "./routes/pieza_dental.js";
import tipoServicioRoute from "./routes/tipo_servicio.js";
import servicioRoute from "./routes/servicio.js";
import rolUsuarioRouter from "./routes/rol_usuario.js";
import citaRoute from "./routes/cita.js";
import metodoPagoRoute from "./routes/metodo_pago.js";
import pagoRoute from "./routes/pago.js";
import tipoCitaRoute from "./routes/tipo_cita.js";
import tipoMedicamentoRoute from "./routes/tipo_medicamento.js";
import medicamentoRoute from "./routes/medicamento.js";
import diagnosticoRoute from "./routes/diagnostico.js";
import diagnosticoMedicamentoRoute from "./routes/diagnostico_medicamento.js";
import historialMedicoRoute from "./routes/historial_medico.js";
import tipoDiagnosticoRoute from "./routes/tipo_diagnostico.js";



const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) =>{
    res.send("Backend SICAC ejecutandose exitosamente");
});

app.use('/api/rol', rolRouter);
app.use('/api/tipo_documento', tipoDocumentoRoute);
app.use('/api/usuario', usuarioRoute);
app.use('/api/paciente', pacienteRoute);
app.use('/api/medico', medicoRoute);
app.use('/api/mapa_dental', mapaDentalRoute);
app.use('/api/pieza_dental', piezaDentalRoute);
app.use('/api/tipo_servicio', tipoServicioRoute);
app.use('/api/servicio', servicioRoute);
app.use('/api/rol_usuario', rolUsuarioRouter);
app.use('/api/cita', citaRoute);
app.use('/api/metodo_pago', metodoPagoRoute);
app.use('/api/pago', pagoRoute);
app.use('/api/tipo_cita', tipoCitaRoute);
app.use('/api/tipo_medicamento', tipoMedicamentoRoute);
app.use('/api/medicamento', medicamentoRoute);
app.use('/api/diagnostico', diagnosticoRoute);
app.use('/api/diagnostico_medicamento', diagnosticoMedicamentoRoute);
app.use('/api/historial_medico', historialMedicoRoute);
app.use('/api/tipo_diagnostico', tipoDiagnosticoRoute);


app.listen(PORT, () =>{
    console.log(`Servidor del backend escuchando en http://localhost:${PORT}`);
});