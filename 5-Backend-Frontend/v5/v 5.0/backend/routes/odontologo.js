import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query('SELECT * FROM odontologo');
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
            estado_odontologo,
            fecha_registro,
            especializacion
        } = req.body;

        if (!id_usuario || !estado_odontologo || !fecha_registro || !especializacion) {
            return res.status(400).json({
                error: 'Falta llenar campos requeridos'
            });
        }

        const [existing] = await pool.query(
            'SELECT id_usuario FROM odontologo WHERE id_usuario = ?',
            [id_usuario]
        );

        if (existing.length > 0) {
            return res.status(400).json({//Mensaje de error personalizado
                error: 'Ya se encuentra registrado ese odontologo' //
            });
        }
        await pool.query(
            `INSERT INTO odontologo ( 
                id_usuario,
                estado_odontologo,
                fecha_registro,
                especializacion
            ) VALUES (?, ?, ?). ?`,
            [id_usuario, estado_odontologo, fecha_registro, especializacion]
        );

        res.status(201).json({
            mensaje: 'Odontologo registrado exitosamente',
            odontologo: req.body
        });
    } catch (error) {
        console.error('Error al registrar odontologo:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const {
            id_usuario,
            estado_odontologo,
            fecha_registro,
            especializacion
        } = req.body;
        
        const [result] = await pool.query(
            `UPDATE odontologo SET
                id_usuario = ?,
                estado_odontologo = ?
                fecha_registro = ?,
                especializacion = ?
            WHERE id = ?`,
            [id_usuario, estado_odontologo, fecha_registro, especializacion, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Odontologo no encontrado' });
        }

        res.json({ mensaje: 'Odontologo actualizado exitosamente' });
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM odontologo WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Odontologo no encontrado'});
        }

        res.json({ mensaje: 'Odontologo eliminado exitosamente'});
    }catch (error) {
        res.status(500).json({error: error.message});
    }
});

export default router;