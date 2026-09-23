import express from 'express';
import pool from "../db.js";

const router = express.Router();


// GET: Obtener un diagnóstico por el ID de la cita
router.get('/cita/:id_cita', async (req, res) => {
    try {
        const { id_cita } = req.params;
        const [rows] = await pool.query(
            'SELECT * FROM diagnostico WHERE id_cita = ?', 
            [id_cita]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Diagnóstico no encontrado para esta cita' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Crear un nuevo diagnóstico
router.post('/', async (req, res) => {
    const { 
        id_cita, 
        id_tipo_diagnostico, 
        motivo, 
        observaciones, 
        tratamiento_sugerido 
    } = req.body;
    
    // Validación básica para asegurar que lleguen los datos requeridos (NOT NULL)
    if (!id_cita || !id_tipo_diagnostico || !motivo || !observaciones || !tratamiento_sugerido) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO diagnostico 
            (id_cita, id_tipo_diagnostico, motivo, observaciones, tratamiento_sugerido) 
            VALUES (?, ?, ?, ?, ?)`,
            [id_cita, id_tipo_diagnostico, motivo, observaciones, tratamiento_sugerido]
        );
        
        // No es necesario enviar la fecha_registro en el INSERT porque tiene DEFAULT CURRENT_TIMESTAMP
        res.status(201).json({ 
            id: result.insertId, 
            id_cita,
            id_tipo_diagnostico,
            motivo,
            observaciones,
            tratamiento_sugerido,
            mensaje: 'Diagnóstico registrado exitosamente'
        });
    } catch (error) {
        // Capturar el error de la restricción UNIQUE para id_cita
        if(error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Ya existe un diagnóstico registrado para esta cita.' });
        }
        res.status(500).json({ error: error.message });
    }
});

// PUT: Actualizar un diagnóstico existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { 
        id_tipo_diagnostico, 
        motivo, 
        observaciones, 
        tratamiento_sugerido 
    } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE diagnostico 
             SET id_tipo_diagnostico = ?, motivo = ?, observaciones = ?, tratamiento_sugerido = ? 
             WHERE id = ?`,
            [id_tipo_diagnostico, motivo, observaciones, tratamiento_sugerido, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Diagnóstico no encontrado' });
        }

        res.json({ mensaje: 'Diagnóstico actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;