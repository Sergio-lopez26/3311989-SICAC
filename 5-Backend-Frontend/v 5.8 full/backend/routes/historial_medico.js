import express from 'express';
import pool from "../db.js";

const router = express.Router();


// Obtener el historial médico por ID del paciente (relación 1 a 1 según tu modelo)
router.get('/paciente/:id', async (req, res) => {
    try {
        const idPaciente = req.params.id;
        const [rows] = await pool.query(
            'SELECT * FROM historial_medico WHERE id_paciente = ?', 
            [idPaciente]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Historial no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo historial médico
router.post('/', async (req, res) => {
    const { id_paciente, antecedentes_medicos } = req.body;
    
    try {
        const [result] = await pool.query(
            'INSERT INTO historial_medico (id_paciente, antecedentes_medicos) VALUES (?, ?)',
            [id_paciente, antecedentes_medicos]
        );
        res.status(201).json({ 
            id: result.insertId, 
            id_paciente, 
            antecedentes_medicos 
        });
    } catch (error) {
        // Manejo de error si se viola el CONSTRAINT uc_paciente UNIQUE
        if(error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El paciente ya tiene un historial médico.' });
        }
        res.status(500).json({ error: error.message });
    }
});

export default router;