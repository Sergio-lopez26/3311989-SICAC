import { Router } from "express";
import pool from "../db.js";

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, id_historial_medico, nombre_estandar, observacion_inicial, 
                fecha_registro, estado_mapa_dental 
            FROM mapa_dental`);
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

        await pool.query(
            `INSERT INTO mapa_dental (
                id_historial_medico,
                nombre_estandar,
                observacion_inicial,
                estado_mapa_dental
            ) VALUES (?, ?, ?, ?)`,
            [id_historial_medico, nombre_estandar, observacion_inicial || "", estado_mapa_dental]
        );

        res.status(201).json({
            mensaje: 'Mapa dental registrado exitosamente',
            mapa_dental: { nombre_estandar, estado_mapa_dental }
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