import express from 'express';
import pool from "../db.js";

const router = express.Router();

// GET: Obtener un diagnóstico por el ID de la cita
router.get('/cita/:id_cita', async (req, res) => {
    try {
        const { id_cita } = req.params;
        const [rows] = await pool.query(
            `SELECT d.*, td.nombre_diagnostico 
             FROM diagnostico d
             JOIN tipo_diagnostico td ON d.id_tipo_diagnostico = td.id
             WHERE d.id_cita = ?`,
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
router.get('/paciente/:id_paciente', async (req, res) => {
    try {
        const { id_paciente } = req.params;
        const [rows] = await pool.query(
            `SELECT d.*, td.nombre_diagnostico 
             FROM diagnostico d
             JOIN tipo_diagnostico td ON d.id_tipo_diagnostico = td.id
             JOIN cita c ON c.id=d.id_cita
             JOIN paciente p ON p.id=c.id_paciente
             WHERE p.id = ?`,
            [id_paciente]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Diagnósticos no encontrado para este paciente' });
        }
        
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST: Crear un nuevo diagnóstico, asignar medicamento y actualizar la cita
router.post('/', async (req, res) => {
    const { 
        id_cita, 
        id_tipo_diagnostico, 
        motivo, 
        observaciones, 
        tratamiento_sugerido,
        medicamento, // ID del medicamento
        dosis
    } = req.body;
    
    // Validación básica
    if (!id_cita || !id_tipo_diagnostico || !motivo || !observaciones || !tratamiento_sugerido) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para el diagnóstico.' });
    }

    // Concatenamos la dosis al tratamiento ya que no hay campo 'dosis' en la BD
    const tratamientoFinal = dosis 
        ? `${tratamiento_sugerido} (Dosis: ${dosis})` 
        : tratamiento_sugerido;

    let connection;
    try {
        // Usamos una transacción para asegurar que todo se guarde o nada
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Insertar el diagnóstico
        const [resultDiag] = await connection.query(
            `INSERT INTO diagnostico 
            (id_cita, id_tipo_diagnostico, motivo, observaciones, tratamiento_sugerido) 
            VALUES (?, ?, ?, ?, ?)`,
            [id_cita, id_tipo_diagnostico, motivo, observaciones, tratamientoFinal]
        );
        
        const id_diagnostico = resultDiag.insertId;

        // 2. Si se seleccionó un medicamento, insertarlo en la tabla intermedia
        if (medicamento) {
            await connection.query(
                `INSERT INTO diagnostico_medicamento 
                (id_diagnostico, id_medicamento, estado_medicacion) 
                VALUES (?, ?, ?)`,
                [id_diagnostico, medicamento, 'Recetado'] // 'Recetado' como estado inicial
            );
        }

        // 3. Actualizar la cita a "Atendida"
        await connection.query(
            `UPDATE cita SET estado_cita = 'Atendida' WHERE id = ?`,
            [id_cita]
        );

        await connection.commit();
        
        res.status(201).json({ 
            id_diagnostico, 
            mensaje: 'Diagnóstico registrado, medicamento asignado y cita actualizada exitosamente.'
        });

    } catch (error) {
        if (connection) await connection.rollback();
        
        if(error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Ya existe un diagnóstico registrado para esta cita.' });
        }
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
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