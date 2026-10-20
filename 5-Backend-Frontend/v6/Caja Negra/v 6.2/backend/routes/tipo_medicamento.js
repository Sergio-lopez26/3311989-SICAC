import express from 'express';
import pool from "../db.js";

const router = express.Router();


// GET: Obtener todas las categorías (tipos) de medicamentos
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tipo_medicamento');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Obtener un tipo de medicamento específico por su ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            'SELECT * FROM tipo_medicamento WHERE id = ?', 
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Tipo de medicamento no encontrado' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Crear una nueva categoría de medicamento
router.post('/', async (req, res) => {
    const { categoria_medicamento } = req.body;
    
    if (!categoria_medicamento) {
        return res.status(400).json({ error: 'El campo categoria_medicamento es obligatorio.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO tipo_medicamento (categoria_medicamento) VALUES (?)',
            [categoria_medicamento]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            categoria_medicamento,
            mensaje: 'Categoría de medicamento creada exitosamente'
        });
    } catch (error) {
        // Capturar la restricción UNIQUE de la categoría
        if(error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: `La categoría '${categoria_medicamento}' ya se encuentra registrada.` });
        }
        res.status(500).json({ error: error.message });
    }
});

// PUT: Actualizar el nombre de una categoría de medicamento
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { categoria_medicamento } = req.body;

    if (!categoria_medicamento) {
        return res.status(400).json({ error: 'El campo categoria_medicamento es obligatorio para actualizar.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE tipo_medicamento SET categoria_medicamento = ? WHERE id = ?',
            [categoria_medicamento, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Tipo de medicamento no encontrado' });
        }

        res.json({ mensaje: 'Categoría de medicamento actualizada exitosamente' });
    } catch (error) {
        if(error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Ya existe otra categoría con ese mismo nombre.' });
        }
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Eliminar una categoría de medicamento
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM tipo_medicamento WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Tipo de medicamento no encontrado' });
        }

        res.json({ mensaje: 'Categoría de medicamento eliminada exitosamente' });
    } catch (error) {
        // Validación de Clave Foránea: 
        // Evita que se elimine una categoría si hay medicamentos que pertenecen a ella.
        if(error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                error: 'No se puede eliminar esta categoría porque hay medicamentos registrados que pertenecen a ella.' 
            });
        }
        res.status(500).json({ error: error.message });
    }
});

export default router;
