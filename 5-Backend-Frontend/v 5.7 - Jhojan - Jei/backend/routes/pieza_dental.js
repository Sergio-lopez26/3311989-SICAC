import { Router } from "express";
import pool from "../db.js";

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, id_mapa, nomenclatura_fdi, cuadrante, posicion, 
                estado_inicial, estado_actual 
            FROM pieza_dental`);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Obtener todas las piezas de un mapa dental puntual (las 32 piezas que lo componen)
router.get('/mapa/:id_mapa', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, id_mapa, nomenclatura_fdi, cuadrante, posicion, 
                estado_inicial, estado_actual 
            FROM pieza_dental WHERE id_mapa = ?`,
            [req.params.id_mapa]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Crear nueva pieza dental
router.post('/', async (req, res) => {
    try {
        const {
            id_mapa,
            nomenclatura_fdi,
            cuadrante,
            posicion,
            estado_inicial,
            estado_actual
        } = req.body;

        if (!id_mapa || !nomenclatura_fdi || !cuadrante || !posicion || !estado_inicial) {
            return res.status(400).json({
                error: 'Falta llenar campos requeridos'
            });
        }

        //Se valida que esa pieza (nomenclatura FDI) no esté repetida dentro del mismo mapa dental
        const [existing] = await pool.query(
            'SELECT id FROM pieza_dental WHERE id_mapa = ? and nomenclatura_fdi = ?',
            [id_mapa, nomenclatura_fdi]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                error: 'Esa pieza dental ya se encuentra registrada en este mapa'
            });
        }

        await pool.query(
            `INSERT INTO pieza_dental (
                id_mapa,
                nomenclatura_fdi,
                cuadrante,
                posicion,
                estado_inicial,
                estado_actual
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [id_mapa, nomenclatura_fdi, cuadrante, posicion, estado_inicial, estado_actual || estado_inicial]
        );

        res.status(201).json({
            mensaje: 'Pieza dental registrada exitosamente',
            pieza_dental: { nomenclatura_fdi, estado_inicial }
        });
    } catch (error) {
        console.error('Error al registrar pieza dental:', error);
        res.status(500).json({ error: error.message });
    }
});

//Actualizar pieza dental (uso más frecuente: cambiar el estado_actual tras un procedimiento)
router.put('/:id', async (req, res) => {
    try {
        const {
            id_mapa,
            nomenclatura_fdi,
            cuadrante,
            posicion,
            estado_inicial,
            estado_actual
        } = req.body;

        if (!id_mapa || !nomenclatura_fdi || !cuadrante || !posicion || !estado_inicial || !estado_actual) {
            return res.status(400).json({
                error: 'Falta llenar campos para actualizar'
            });
        }

        const [result] = await pool.query(
            `UPDATE pieza_dental SET
                id_mapa = ?,
                nomenclatura_fdi = ?,
                cuadrante = ?,
                posicion = ?,
                estado_inicial = ?,
                estado_actual = ?
            WHERE id = ?`,
            [id_mapa, nomenclatura_fdi, cuadrante, posicion, estado_inicial, estado_actual, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pieza dental no encontrada' });
        }

        res.json({ mensaje: 'Pieza dental actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Eliminar pieza dental
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM pieza_dental WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pieza dental no encontrada' });
        }

        res.json({ mensaje: 'Pieza dental eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;  