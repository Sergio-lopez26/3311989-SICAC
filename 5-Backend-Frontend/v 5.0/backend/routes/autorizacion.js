import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get('/', async (req, res) => {
    try{
        const [rows] = await pool.query('SELECT * FROM autorizacion');
        res.json(rows);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try{
        const {
            rol
        } = req.body;

        if(!rol) {
            return res.status(400).json({
                error: 'Falta campo requerido'
            });
        }

        const [existing] = await pool.query(
            'SELECT rol FROM autorizacion WHERE rol = ?',
            [rol]
        );

        if (existing.length > 0) { 
            return res.status(400).json({
                error: 'Ya existe un nivel de autorizacion con ese rol'
            });
        }

        await pool.query(
            `INSERT INTO autorizacion (
                rol
            ) VALUES (?)`,
            [rol]
        );

        res.status(201).json({
            mensaje: 'Autorizacion creada exitosamente',
            autorizacion: req.body
        });
    }catch(error){
        console.error('Error al crear autorizacion:', error);
        res.status(500).json({ error: error.message });
    }
});

//En teoría no debería poderse, puesto que es solo un campo
/*router.put('/:rol', async (req, res) => {
    try {
        const {
            rol
        } = req.body;

        const [result] = await pool.query(
            `UPDATE autorizacion SET
                rol = ?
            WHERE rol = ?`,
            [rol, req.params.rol]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Autorizacion no encontrada' });
        }

        res.json({ mensaje: 'Autorizacion actualizada exitosamente' });
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
});
*/
router.delete('/:rol', async(req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM autorizacion WHERE rol = ?',
            [req.params.rol]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Autorizacion no encontrada'});
        }

        res.json({ mensaje: 'Autorizacion eliminada exitosamente'});
    }catch (error) {
        res.status(500).json({error: error.message});
    }
});

export default router;