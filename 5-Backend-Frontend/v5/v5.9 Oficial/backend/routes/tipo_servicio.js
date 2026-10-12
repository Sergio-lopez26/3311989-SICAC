import { Router } from "express";
import pool from "../db.js";

const validaLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;

//Función flecha para validación
const funcionValida = (req, res, next) => {
    const {tipo_servicio} = req.body;

    //Condición para campos obligatorios
    if(!validaLetras.test(tipo_servicio)){
        return res.status(400).json({error: "El Tipo de Servicio solo debe contener letras con o sin tildes"})
    }

    //Ya aquí si todo esta bien validado, se continua
    next();
}

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, tipo_servicio, descripcion, precio_actual 
            FROM tipo_servicio`);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Crear nuevo tipo de servicio
router.post('/', funcionValida, async (req, res) => {
    try {
        const {
            tipo_servicio,
            descripcion,
            precio_actual
        } = req.body;

        if (!tipo_servicio || !precio_actual) {
            return res.status(400).json({
                error: 'Faltan campos requeridos'
            });
        }

        const [existing] = await pool.query(
            'SELECT id FROM tipo_servicio WHERE tipo_servicio = ?',
            [tipo_servicio]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                error: 'Ya existe un tipo de servicio con ese nombre'
            });
        }

        await pool.query(
            `INSERT INTO tipo_servicio (
                tipo_servicio,
                descripcion,
                precio_actual
            ) VALUES (?, ?, ?)`,
            [tipo_servicio, descripcion || "", precio_actual]
        );

        res.status(201).json({
            mensaje: 'Tipo de servicio creado exitosamente',
            tipo_servicio: req.body
        });
    } catch (error) {
        console.error('Error al crear tipo de servicio:', error);
        res.status(500).json({ error: error.message });
    }
});

//Actualizar tipo de servicio
router.put('/:id', funcionValida, async (req, res) => {
    try {
        const {
            tipo_servicio,
            descripcion,
            precio_actual
        } = req.body;

        if (!tipo_servicio || !precio_actual) {
            return res.status(400).json({ error: 'Faltan campos requeridos para actualizar' });
        }

        const [result] = await pool.query(
            `UPDATE tipo_servicio SET
                tipo_servicio = ?,
                descripcion = ?,
                precio_actual = ?
            WHERE id = ?`,
            [tipo_servicio, descripcion || "", precio_actual, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tipo de servicio no encontrado' });
        }

        res.json({ mensaje: 'Tipo de servicio actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Eliminar tipo de servicio
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM tipo_servicio WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tipo de servicio no encontrado' });
        }

        res.json({ mensaje: 'Tipo de servicio eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;