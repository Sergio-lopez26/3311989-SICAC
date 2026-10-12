import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query('SELECT * FROM administrador');
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
        } = req.body;

        if (!id_usuario) {
            return res.status(400).json({
                error: 'Falta llenar el campo requerido'
            });
        }

        const [existing] = await pool.query(
            'SELECT id_usuario FROM administrador WHERE id_usuario = ?',
            [id_usuario]
        );

        if (existing.length > 0) {
            return res.status(400).json({//Mensaje de error personalizado
                error: 'Ya se encuentra registrado ese administrador' //
            });
        }
        await pool.query(
            `INSERT INTO administrador ( 
                id_usuario,
            ) VALUES (?)`,
            [id_usuario]
        );

        res.status(201).json({
            mensaje: 'Administrador registrado exitosamente',
            administrador: req.body
        });
    } catch (error) {
        console.error('Error al registrar administrador:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const {
            id_usuario
        } = req.body;
        
        const [result] = await pool.query(
            `UPDATE administrador SET
                id_usuario = ?
            WHERE id = ?`,
            [id_usuario, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Administrador no encontrado' });
        }

        res.json({ mensaje: 'Administrador actualizado exitosamente' });
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM administrador WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Administrador no encontrado'});
        }

        res.json({ mensaje: 'Administrador eliminado exitosamente'});
    }catch (error) {
        res.status(500).json({error: error.message});
    }
});

export default router;