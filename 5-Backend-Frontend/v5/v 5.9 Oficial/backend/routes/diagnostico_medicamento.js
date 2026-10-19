import express from 'express';
import pool from "../db.js";

const router = express.Router();


// GET: Obtener todos los medicamentos recetados para un diagnóstico específico
// Muy útil para mostrar la receta médica asociada a una cita
router.get('/diagnostico/:id_diagnostico', async (req, res) => {
    try {
        const { id_diagnostico } = req.params;
        // Hacemos un JOIN con la tabla medicamento para traer también el nombre del medicamento
        const [rows] = await pool.query(
            `SELECT dm.id_diagnostico, dm.id_medicamento, dm.fecha_medicacion, dm.estado_medicacion, m.nombre_medicamento 
             FROM diagnostico_medicamento dm
             JOIN medicamento m ON dm.id_medicamento = m.id
             WHERE dm.id_diagnostico = ?`, 
            [id_diagnostico]
        );
        
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Recetar (asignar) un medicamento a un diagnóstico
router.post('/', async (req, res) => {
    const { id_diagnostico, id_medicamento, estado_medicacion } = req.body;
    
    if (!id_diagnostico || !id_medicamento || !estado_medicacion) {
        return res.status(400).json({ error: 'id_diagnostico, id_medicamento y estado_medicacion son obligatorios.' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO diagnostico_medicamento 
            (id_diagnostico, id_medicamento, estado_medicacion) 
            VALUES (?, ?, ?)`,
            [id_diagnostico, id_medicamento, estado_medicacion]
        );
        
        res.status(201).json({ 
            id_diagnostico,
            id_medicamento,
            estado_medicacion,
            mensaje: 'Medicamento asignado al diagnóstico exitosamente'
        });
    } catch (error) {
        // Capturar error si intentan agregar el mismo medicamento al mismo diagnóstico dos veces
        if(error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Este medicamento ya fue recetado para este diagnóstico.' });
        }
        res.status(500).json({ error: error.message });
    }
});

// PUT: Actualizar el estado de una medicación (ej. de "Activo" a "Suspendido")
// Nota que recibimos ambos IDs por la URL al ser una clave compuesta
router.put('/:id_diagnostico/:id_medicamento', async (req, res) => {
    const { id_diagnostico, id_medicamento } = req.params;
    const { estado_medicacion } = req.body;

    if (!estado_medicacion) {
        return res.status(400).json({ error: 'El estado_medicacion es obligatorio.' });
    }

    try {
        const [result] = await pool.query(
            `UPDATE diagnostico_medicamento 
             SET estado_medicacion = ? 
             WHERE id_diagnostico = ? AND id_medicamento = ?`,
            [estado_medicacion, id_diagnostico, id_medicamento]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Registro de medicación no encontrado.' });
        }

        res.json({ mensaje: 'Estado de la medicación actualizado exitosamente.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Eliminar un medicamento de un diagnóstico (por si el médico se equivocó al recetar)
router.delete('/:id_diagnostico/:id_medicamento', async (req, res) => {
    const { id_diagnostico, id_medicamento } = req.params;

    try {
        const [result] = await pool.query(
            `DELETE FROM diagnostico_medicamento 
             WHERE id_diagnostico = ? AND id_medicamento = ?`,
            [id_diagnostico, id_medicamento]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Registro de medicación no encontrado.' });
        }

        res.json({ mensaje: 'Medicamento retirado del diagnóstico exitosamente.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;