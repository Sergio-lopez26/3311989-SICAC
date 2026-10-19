import { Router } from "express";
import pool from "../db.js";

const router = Router();

// Ajuste: al crear un mapa dental, también se generan automáticamente las 32 piezas del odontograma con estado inicial "Sano" para que el gráfico se pinte desde el inicio.
const PIEZAS_BASE = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

// Ajuste: estructura base para crear cada pieza con cuadrante, posición y estado inicial/actual por defecto.
const construirPiezasPorDefecto = (idMapa) =>
    PIEZAS_BASE.map((fdi) => ({
        id_mapa: idMapa,
        nomenclatura_fdi: Number(fdi),
        cuadrante: fdi >= 11 && fdi <= 18 ? 1 : fdi >= 21 && fdi <= 28 ? 2 : fdi >= 31 && fdi <= 38 ? 3 : 4,
        posicion: Number(String(fdi).slice(-1)),
        estado_inicial: 'Sano',
        estado_actual: 'Sano'
    }));

//Obtener registros de todos los datos
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT m.id, m.id_historial_medico, m.nombre_estandar, m.observacion_inicial, 
                m.fecha_registro, m.estado_mapa_dental,
                CONCAT_WS(' ', p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido) AS nombre_paciente
            FROM mapa_dental m
            JOIN historial_medico h ON m.id_historial_medico = h.id
            JOIN paciente p ON h.id_paciente = p.id`);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Obtener los mapas dentales de un paciente puntual (a través de su historial médico)
router.get('/historial/:id_historial_medico', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, id_historial_medico, nombre_estandar, observacion_inicial, 
                fecha_registro, estado_mapa_dental 
            FROM mapa_dental WHERE id_historial_medico = ?`,
            [req.params.id_historial_medico]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Crear nuevo mapa dental
router.post('/', async (req, res) => {
    try {
        const {
            id_historial_medico,
            nombre_estandar,
            observacion_inicial,
            //fecha_registro -> No va, ya que en la BD esta como timestamp, y es automático
            estado_mapa_dental
        } = req.body;

        if (!id_historial_medico || !nombre_estandar || !estado_mapa_dental) {
            return res.status(400).json({
                error: 'Falta llenar campos requeridos'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO mapa_dental (
                id_historial_medico,
                nombre_estandar,
                observacion_inicial,
                estado_mapa_dental
            ) VALUES (?, ?, ?, ?)`,
            [id_historial_medico, nombre_estandar, observacion_inicial || "", estado_mapa_dental]
        );

        const piezas = construirPiezasPorDefecto(result.insertId);

        await pool.query(
            `INSERT INTO pieza_dental (
                id_mapa,
                nomenclatura_fdi,
                cuadrante,
                posicion,
                estado_inicial,
                estado_actual
            ) VALUES ?`,
            [piezas.map((pieza) => [
                pieza.id_mapa,
                pieza.nomenclatura_fdi,
                pieza.cuadrante,
                pieza.posicion,
                pieza.estado_inicial,
                pieza.estado_actual
            ])]
        );

        res.status(201).json({
            mensaje: 'Mapa dental registrado exitosamente',
            mapa_dental: { id: result.insertId, nombre_estandar, estado_mapa_dental }
        });
    } catch (error) {
        console.error('Error al registrar mapa dental:', error);
        res.status(500).json({ error: error.message });
    }
});

//Actualizar mapa dental
router.put('/:id', async (req, res) => {
    try {
        const {
            id_historial_medico,
            nombre_estandar,
            observacion_inicial,
            estado_mapa_dental
        } = req.body;

        if (!id_historial_medico || !nombre_estandar || !estado_mapa_dental) {
            return res.status(400).json({
                error: 'Falta llenar campos para actualizar'
            });
        }

        const [result] = await pool.query(
            `UPDATE mapa_dental SET
                id_historial_medico = ?,
                nombre_estandar = ?,
                observacion_inicial = ?,
                estado_mapa_dental = ?
            WHERE id = ?`,
            [id_historial_medico, nombre_estandar, observacion_inicial || "", estado_mapa_dental, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Mapa dental no encontrado' });
        }

        res.json({ mensaje: 'Mapa dental actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Eliminar mapa dental
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM mapa_dental WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Mapa dental no encontrado' });
        }

        res.json({ mensaje: 'Mapa dental eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;