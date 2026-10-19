import express from 'express';
import pool from "../db.js";

const router = express.Router();


// GET: Obtener todos los tipos de diagnóstico
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tipo_diagnostico');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Obtener un tipo de diagnóstico específico por su ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            'SELECT * FROM tipo_diagnostico WHERE id = ?', 
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Tipo de diagnóstico no encontrado' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Crear un nuevo tipo de diagnóstico
router.post('/', async (req, res) => {
    const { nombre_diagnostico, descripcion } = req.body;
    
    // Validar que se envíen los campos NOT NULL
    if (!nombre_diagnostico || !descripcion) {
        return res.status(400).json({ error: 'El nombre_diagnostico y la descripcion son obligatorios.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO tipo_diagnostico (nombre_diagnostico, descripcion) VALUES (?, ?)',
            [nombre_diagnostico, descripcion]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            nombre_diagnostico,
            descripcion,
            mensaje: 'Tipo de diagnóstico creado exitosamente'
        });
    } catch (error) {
        // Capturar el error si se viola el UNIQUE (uc_diagnostico)
        if(error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: `El diagnóstico '${nombre_diagnostico}' ya está registrado.` });
        }
        res.status(500).json({ error: error.message });
    }
});

// PUT: Actualizar un tipo de diagnóstico existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre_diagnostico, descripcion } = req.body;

    if (!nombre_diagnostico || !descripcion) {
        return res.status(400).json({ error: 'Faltan datos para la actualización.' });
    }

    try {
        const [result] = await pool.query(
            `UPDATE tipo_diagnostico 
             SET nombre_diagnostico = ?, descripcion = ? 
             WHERE id = ?`,
            [nombre_diagnostico, descripcion, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Tipo de diagnóstico no encontrado' });
        }

        res.json({ mensaje: 'Tipo de diagnóstico actualizado exitosamente' });
    } catch (error) {
        if(error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Ya existe otro tipo de diagnóstico con ese nombre.' });
        }
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Eliminar un tipo de diagnóstico
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM tipo_diagnostico WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Tipo de diagnóstico no encontrado' });
        }

        res.json({ mensaje: 'Tipo de diagnóstico eliminado exitosamente' });
    } catch (error) {
        // Manejo de restricción de clave foránea
        // Si el tipo de diagnóstico ya se usó en la tabla "diagnostico", no se puede eliminar
        if(error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                error: 'No se puede eliminar este tipo de diagnóstico porque ya está asociado a uno o más diagnósticos de pacientes.' 
            });
        }
        res.status(500).json({ error: error.message });
    }
});

export default router;