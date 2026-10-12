import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get('/', async (req, res) => {
    try{
        const [rows] = await pool.query('SELECT * FROM autorizacion_usuario');
        res.json(rows);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try{
        const {
            rol,
            id_usuario
        } = req.body;

        if(!rol || !id_usuario) {
            return res.status(400).json({
                error: 'Faltan campo requeridos'
            });
        }

        const [existing] = await pool.query(
            'SELECT rol, id_usuario FROM autorizacion_usuario WHERE rol = ? and id_usuario = ?',
            [rol, id_usuario]
        );

        if (existing.length > 0) { 
            return res.status(400).json({
                error: 'Ya existe esa autorizacion asignada al usuario'
            });
        }

        await pool.query(
            `INSERT INTO autorizacion_usuario (
                rol,
                id_usuario
            ) VALUES (?, ?)`,
            [rol, id_usuario]
        );

        res.status(201).json({
            mensaje: 'Autorizacion asignada al usuario exitosamente',
            autorizacion_usuario: req.body
        });
    }catch(error){
        console.error('Error al asignar autorizacion:', error);
        res.status(500).json({ error: error.message });
    }
});
/* Para pensar y echar cabeza
router.put('/:rol', async (req, res) => {
    try {
        const {
            rol,
            id_usuario
        } = req.body;

        const [result] = await pool.query(
            `UPDATE autorizacion_usuario SET
                rol = ?,
                id_usuario = ?
            WHERE rol = ?`,
            [rol, id_usuario, req.params.rol]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Autorizacion no encontrada' });
        }

        res.json({ mensaje: 'Autorizacion actualizada exitosamente' });
    }catch (error) {
        res.status(500).json({ error: error, message });
    }
});

router.delete('/:rol', async(req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM autorizacion_usuario WHERE rol = ?',
            [req.params.rol]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Autorizacion no encontrada'});
        }

        res.json({ mensaje: 'Autorizacion eliminada exitosamente'});
    }catch (error) {
        res.status(500).json({error: error. message});
    }
});
*/
export default router;