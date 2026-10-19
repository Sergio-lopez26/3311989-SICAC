import { Router } from "express";
import pool from "../db.js";

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT s.id, s.id_tipo_servicio, s.id_diagnostico, s.nombre_servicio, s.procedimiento, 
                s.precio_aplicado, s.fecha_servicio,
                CONCAT_WS(' ', p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido) AS nombre_paciente
            FROM servicio s
            JOIN diagnostico d ON s.id_diagnostico = d.id
            JOIN cita c ON d.id_cita = c.id
            JOIN paciente p ON c.id_paciente = p.id`);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Obtener los servicios asociados a un diagnóstico puntual
router.get('/diagnostico/:id_diagnostico', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, id_tipo_servicio, id_diagnostico, nombre_servicio, procedimiento, 
                precio_aplicado, fecha_servicio 
            FROM servicio WHERE id_diagnostico = ?`,
            [req.params.id_diagnostico]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Crear nuevo servicio
router.post('/', async (req, res) => {
    try {
        const {
            id_tipo_servicio,
            id_diagnostico,
            nombre_servicio,
            procedimiento
            //fecha_servicio -> No va, ya que en la BD esta como timestamp, y es automático
        } = req.body;

        if (!id_tipo_servicio || !id_diagnostico || !nombre_servicio) {
            return res.status(400).json({
                error: 'Falta llenar campos requeridos'
            });
        }

        //Se toma el precio actual del catálogo (tipo_servicio) para dejarlo fijo en el histórico
        const [tipoServicioRows] = await pool.query(
            'SELECT precio_actual FROM tipo_servicio WHERE id = ?',
            [id_tipo_servicio]
        );

        if (tipoServicioRows.length === 0) {
            return res.status(404).json({ error: 'El tipo de servicio seleccionado no existe' });
        }

        const precio_aplicado = tipoServicioRows[0].precio_actual;

        await pool.query(
            `INSERT INTO servicio (
                id_tipo_servicio,
                id_diagnostico,
                nombre_servicio,
                procedimiento,
                precio_aplicado
            ) VALUES (?, ?, ?, ?, ?)`,
            [id_tipo_servicio, id_diagnostico, nombre_servicio, procedimiento || "", precio_aplicado]
        );

        res.status(201).json({
            mensaje: 'Servicio registrado exitosamente',
            servicio: { nombre_servicio, precio_aplicado }
        });
    } catch (error) {
        console.error('Error al registrar servicio:', error);
        res.status(500).json({ error: error.message });
    }
});

//Actualizar servicio
router.put('/:id', async (req, res) => {
    try {
        const {
            id_tipo_servicio,
            id_diagnostico,
            nombre_servicio,
            procedimiento,
            precio_aplicado
        } = req.body;

        if (!id_tipo_servicio || !id_diagnostico || !nombre_servicio || !precio_aplicado) {
            return res.status(400).json({
                error: 'Falta llenar campos para actualizar'
            });
        }

        const [result] = await pool.query(
            `UPDATE servicio SET
                id_tipo_servicio = ?,
                id_diagnostico = ?,
                nombre_servicio = ?,
                procedimiento = ?,
                precio_aplicado = ?
            WHERE id = ?`,
            [id_tipo_servicio, id_diagnostico, nombre_servicio, procedimiento || "", precio_aplicado, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        res.json({ mensaje: 'Servicio actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Eliminar servicio
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM servicio WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        res.json({ mensaje: 'Servicio eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;