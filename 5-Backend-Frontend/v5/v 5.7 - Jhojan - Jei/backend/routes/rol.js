import { Router } from "express";
import pool from "../db.js";
/*
req.params: req -> peticion; params -> parámetros
Lo anterior es un objeto que crea el "express" para almacenar todas las variavles que se pongan dentro de la ruta (URL)
*/
/*
req.body: guarda todos los datos que el frontend envia dentro del body de la petición http
*/
const router = Router();

router.get('/', async (req, res) => {
    try{
        const [rows] = await pool.query('SELECT * FROM rol');
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
            'SELECT rol FROM rol WHERE rol = ?',
            [rol]
        );

        if (existing.length > 0) { 
            return res.status(400).json({
                error: 'Ya existe un rol con ese nombre'
            });
        }

        await pool.query(
            `INSERT INTO rol (
                rol
            ) VALUES (?)`,
            [rol]
        );

        res.status(201).json({
            mensaje: 'Rol creado exitosamente',
            rol: req.body //Muestra todo los datos capturados
        });
    }catch(error){
        console.error('Error al crear rol:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const {
            rol
        } = req.body;

        //Por si el campo queda vacio
        if (!rol) {
            return res.status(400).json({ error: 'Falta el campo rol para actualizar' });
        }

        const [result] = await pool.query(
            `UPDATE rol SET
                rol = ?
            WHERE id = ?`,
            [rol, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Rol no encontrado' });
        }

        res.json({ mensaje: 'Rol actualizado exitosamente' });
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async(req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM rol WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Rol no encontrado'});
        }

        res.json({ mensaje: 'Rol eliminado exitosamente'});
    }catch (error) {
        res.status(500).json({error: error.message});
    }
});

export default router;