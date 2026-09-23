import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get('/', async (req, res) => {
    try{
        const [rows] = await pool.query('SELECT * FROM rol_usuario');
        res.json(rows);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try{
        const {
            id_rol,
            id_usuario
        } = req.body;

        if(!id_rol || !id_usuario) {
            return res.status(400).json({
                error: 'Faltan campo requeridos'
            });
        }

        const [existing] = await pool.query(
            'SELECT id_rol, id_usuario FROM rol_usuario WHERE id_rol = ? and id_usuario = ?',
            [id_rol, id_usuario]
        );

        if (existing.length > 0) { 
            return res.status(400).json({
                error: 'Ya existe ese rol asignado al usuario'
            });
        }

        await pool.query(
            `INSERT INTO rol_usuario (
                id_rol,
                id_usuario
            ) VALUES (?, ?)`,
            [id_rol, id_usuario]
        );

        res.status(201).json({
            mensaje: 'Rol asignado al usuario exitosamente',
            rol_usuario: req.body
        });
    }catch(error){
        console.error('Error al asignar rol:', error);
        res.status(500).json({ error: error.message });
    }
});

/*
Al ser rol_usuario una tabla intermedia, su estructura cambia un poco:
- Ya no se puede actualizar, sino mas bien, se elimina una asignacion y se crea una nueva, pero no se edita
- Adicionalmente, para eliminar, se necesita si o si los datos de ambos campos (id_rol y id_usuario) -> Esto para
    evitar eliminar todos los usuarios que tienen asignado un mismo rol
*/

router.delete('/:id_rol/:id_usuario', async(req, res) => {
    try {
        const {
            id_rol,
            id_usuario
        } = req.params;

        const [result] = await pool.query(
            'DELETE FROM rol_usuario WHERE id_rol = ? and id_usuario = ?',
            [id_rol, id_usuario]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Asignación de rol no encontrada'});
        }

        res.json({ mensaje: 'Rol eliminado del usuario exitosamente'});
    }catch (error) {
        res.status(500).json({error: error. message});
    }
});

export default router;