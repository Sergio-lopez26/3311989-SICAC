import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./db.js";

import autorizacionRouter from "./routes/autorizacion.js";
import autorizacionUsuarioRouter from "./routes/autorizacion_usuario.js";
import tipoDocumentoRoute from "./routes/tipoDocumento.js";
import usuarioRoute from "./routes/usuario.js";
import administradorRoute from "./routes/administrador.js";
import odontologoRoute from "./routes/odontologo.js";
import pacienteRoute from "./routes/paciente.js";
import historialMedicoRoute from "./routes/historial_medico.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) =>{
    res.send("Backend SICAC ejecutandose exitosamente");
});

app.use('/api/autorizacion', autorizacionRouter);
app.use('/api/autorizacion_usuario', autorizacionUsuarioRouter);
app.use('/api/tipo_documento', tipoDocumentoRoute);
app.use('/api/usuario', usuarioRoute);
app.use('/api/administrador', administradorRoute);
app.use('/api/odontologo', odontologoRoute);
app.use('/api/paciente', pacienteRoute);
app.use('/api/historial_medico', historialMedicoRoute);

app.listen(PORT, () =>{
    console.log(`Servidor del backend escuchando en http://localhost:${PORT}`);
});