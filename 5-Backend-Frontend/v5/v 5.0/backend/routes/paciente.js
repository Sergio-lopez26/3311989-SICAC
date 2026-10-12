import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query('SELECT * FROM paciente');
        res.json(rows);
        //
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { //Acá no se coloca el id, puesto que está con autoincrement
            id_usuario,
            fecha_registro,
            estado_paciente
        } = req.body;

        if (!id_usuario || !fecha_registro || !estado_paciente) {
            return res.status(400).json({
                error: 'Falta llenar campos requeridos'
            });
        }

        const [existing] = await pool.query(
            'SELECT id_usuario FROM paciente WHERE id_usuario = ?',
            [id_usuario]
        );

        if (existing.length > 0) {
            return res.status(400).json({//Mensaje de error personalizado
                error: 'Ya se encuentra registrado ese paciente' //
            });
        }
        await pool.query(
            `INSERT INTO paciente ( 
                id_usuario,
                fecha_registro,
                estado_paciente
            ) VALUES (?, ?, ?)`,
            [id_usuario, fecha_registro, estado_paciente]
        );

        res.status(201).json({
            mensaje: 'Paciente registrado exitosamente',
            paciente: req.body
        });
    } catch (error) {
        console.error('Error al registrar paciente:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const {
            id_usuario,
            fecha_registro,
            estado_paciente
        } = req.body;
        
        const [result] = await pool.query(
            `UPDATE paciente SET
                id_usuario = ?,
                fecha_registro = ?,
                estado_paciente = ?
            WHERE id = ?`,
            [id_usuario, fecha_registro, estado_paciente, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        res.json({ mensaje: 'Paciente actualizado exitosamente' });
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM paciente WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado'});
        }

        res.json({ mensaje: 'Paciente eliminado exitosamente'});
    }catch (error) {
        res.status(500).json({error: error.message});
    }
});

export default router;