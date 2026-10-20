import { Router } from "express";
import pool from "../db.js";

const validaLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;

//Función flecha para validación
const funcionValida = (req, res, next) => {
    const {nombre_metodo} = req.body;

    //Condición para campos obligatorios
    if(!validaLetras.test(nombre_metodo)){
        return res.status(400).json({error: "El Nombre del Método solo debe contener letras con o sin tildes"})
    }

    //Ya aquí si todo esta bien validado, se continua
    next();
}

const router = Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM metodo_pago ORDER BY nombre_metodo');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', funcionValida, async (req, res) => {
    try {
        const { nombre_metodo } = req.body;

        if (!nombre_metodo) {
            return res.status(400).json({ error: 'Falta campo requerido' });
        }

        const [existing] = await pool.query(
            'SELECT id FROM metodo_pago WHERE nombre_metodo = ?',
            [nombre_metodo]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Ya existe un método de pago con ese nombre' });
        }

        const [result] = await pool.query(
            'INSERT INTO metodo_pago (nombre_metodo) VALUES (?)',
            [nombre_metodo]
        );

        res.status(201).json({
            mensaje: 'Método de pago creado exitosamente',
            metodo_pago: { id: result.insertId, nombre_metodo }
        });
    } catch (error) {
        console.error('Error al crear método de pago:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', funcionValida, async (req, res) => {
    try {
        const { nombre_metodo } = req.body;

        if (!nombre_metodo) {
            return res.status(400).json({ error: 'Falta el campo nombre_metodo para actualizar' });
        }

        const [result] = await pool.query(
            'UPDATE metodo_pago SET nombre_metodo = ? WHERE id = ?',
            [nombre_metodo, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Método de pago no encontrado' });
        }

        res.json({ mensaje: 'Método de pago actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM metodo_pago WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Método de pago no encontrado' });
        }

        res.json({ mensaje: 'Método de pago eliminado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
            return res.status(400).json({ error: 'No se puede eliminar: hay pagos asociados a este método de pago' });
        }
        res.status(500).json({ error: error.message });
    }
});

export default router;
