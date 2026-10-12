import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./db.js";

import rolRouter from "./routes/rol.js";
import tipoDocumentoRoute from "./routes/tipo_documento.js";
import usuarioRoute from "./routes/usuario.js";
import pacienteRoute from "./routes/paciente.js";
import medicoRoute from "./routes/medico.js";
import rolUsuarioRouter from "./routes/rol_usuario.js";
import tipoCitaRoute from "./routes/tipo_cita.js";
import metodoPagoRoute from "./routes/metodo_pago.js";
import citaRoute from "./routes/cita.js";
import pagoRoute from "./routes/pago.js";

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
app.use('/api/rol_usuario', rolUsuarioRouter);
app.use('/api/tipo_cita', tipoCitaRoute);
app.use('/api/metodo_pago', metodoPagoRoute);
app.use('/api/cita', citaRoute);
app.use('/api/pago', pagoRoute);


app.listen(PORT, () =>{
    console.log(`Servidor del backend escuchando en http://localhost:${PORT}`);
});