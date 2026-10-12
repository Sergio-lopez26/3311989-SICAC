import { Router } from "express";
import pool from "../db.js";

const validaLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;

//Función flecha para validación
const funcionValida = (req, res, next) => {
    const {tipo_cita} = req.body;

    //Condición para campos obligatorios
    if(!validaLetras.test(tipo_cita)){
        return res.status(400).json({error: "El Tipo de Cita solo debe contener letras con o sin tildes"})
    }

    //Ya aquí si todo esta bien validado, se continua
    next();
}

const router = Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tipo_cita ORDER BY tipo_cita');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', funcionValida, async (req, res) => {
    try {
        const { tipo_cita } = req.body;

        if (!tipo_cita) {
            return res.status(400).json({ error: 'Falta campo requerido' });
        }

        const [existing] = await pool.query(
            'SELECT id FROM tipo_cita WHERE tipo_cita = ?',
            [tipo_cita]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Ya existe un tipo de cita con ese nombre' });
        }

        const [result] = await pool.query(
            'INSERT INTO tipo_cita (tipo_cita) VALUES (?)',
            [tipo_cita]
        );

        res.status(201).json({
            mensaje: 'Tipo de cita creado exitosamente',
            tipo_cita: { id: result.insertId, tipo_cita }
        });
    } catch (error) {
        console.error('Error al crear tipo de cita:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', funcionValida, async (req, res) => {
    try {
        const { tipo_cita } = req.body;

        if (!tipo_cita) {
            return res.status(400).json({ error: 'Falta el campo tipo_cita para actualizar' });
        }

        const [result] = await pool.query(
            'UPDATE tipo_cita SET tipo_cita = ? WHERE id = ?',
            [tipo_cita, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tipo de cita no encontrado' });
        }

        res.json({ mensaje: 'Tipo de cita actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM tipo_cita WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tipo de cita no encontrado' });
        }

        res.json({ mensaje: 'Tipo de cita eliminado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
            return res.status(400).json({ error: 'No se puede eliminar: hay citas asociadas a este tipo de cita' });
        }
        res.status(500).json({ error: error.message });
    }
});

export default router;
