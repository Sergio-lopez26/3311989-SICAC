import express from 'express';
import pool from "../db.js";

const router = express.Router();


// GET: Obtener todos los medicamentos
// Se incluye un JOIN para que el Frontend reciba el nombre de la categoría y no solo el ID
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT m.id, m.id_tipo_medicamento, m.nombre_medicamento, tm.categoria_medicamento 
             FROM medicamento m
             JOIN tipo_medicamento tm ON m.id_tipo_medicamento = tm.id`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Obtener un medicamento específico por su ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            'SELECT * FROM medicamento WHERE id = ?', 
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Medicamento no encontrado' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Registrar un nuevo medicamento
router.post('/', async (req, res) => {
    const { id_tipo_medicamento, nombre_medicamento } = req.body;
    
    // Validación de campos NOT NULL
    if (!id_tipo_medicamento || !nombre_medicamento) {
        return res.status(400).json({ error: 'El id_tipo_medicamento y el nombre_medicamento son obligatorios.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO medicamento (id_tipo_medicamento, nombre_medicamento) VALUES (?, ?)',
            [id_tipo_medicamento, nombre_medicamento]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            id_tipo_medicamento,
            nombre_medicamento,
            mensaje: 'Medicamento registrado exitosamente'
        });
    } catch (error) {
        // Capturar la restricción UNIQUE del nombre del medicamento
        if(error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: `El medicamento '${nombre_medicamento}' ya se encuentra registrado en el sistema.` });
        }
        res.status(500).json({ error: error.message });
    }
});

// PUT: Actualizar un medicamento existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { id_tipo_medicamento, nombre_medicamento } = req.body;

    if (!id_tipo_medicamento || !nombre_medicamento) {
        return res.status(400).json({ error: 'Faltan datos para la actualización.' });
    }

    try {
        const [result] = await pool.query(
            `UPDATE medicamento 
             SET id_tipo_medicamento = ?, nombre_medicamento = ? 
             WHERE id = ?`,
            [id_tipo_medicamento, nombre_medicamento, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Medicamento no encontrado' });
        }

        res.json({ mensaje: 'Medicamento actualizado exitosamente' });
    } catch (error) {
        if(error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Ya existe otro medicamento con ese nombre.' });
        }
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Eliminar un medicamento del catálogo
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM medicamento WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Medicamento no encontrado' });
        }

        res.json({ mensaje: 'Medicamento eliminado exitosamente' });
    } catch (error) {
        // Si el medicamento ya fue recetado en la tabla diagnostico_medicamento,
        // MySQL arrojará un error de restricción de clave foránea (ER_ROW_IS_REFERENCED_2).
        if(error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                error: 'No se puede eliminar este medicamento porque ya ha sido recetado en un diagnóstico.' 
            });
        }
        res.status(500).json({ error: error.message });
    }
});

export default router;