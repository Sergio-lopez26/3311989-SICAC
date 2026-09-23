import { Router } from "express";
import pool from "../db.js";

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query('SELECT * FROM tipo_documento'); //[rows] almacenará los registros hayados
        res.json(rows);
        //
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Crear nuevo tipo de documento
router.post('/', async (req, res) => {
    try {
        const {
            sigla,
            nombre_documento
        } = req.body;

        if (!sigla || !nombre_documento) {
            return res.status(400).json({
                error: 'Faltan campos requeridos'
            });
        }

        //Se verifica si ya existe un cliente con ese documento
        const [existing] = await pool.query(
            'SELECT sigla FROM tipo_documento WHERE sigla = ?',
            [sigla]
        );

        if (existing.length > 0) { 
            return res.status(400).json({
                error: 'Ya existe un tipo de documento con esa sigla'
            });
        }
        //Estructura de inserción de datos
        await pool.query(
            `INSERT INTO tipo_documento ( 
                sigla,
                nombre_documento
            ) VALUES (?, ?)`,
            [sigla, nombre_documento]
        );

        res.status(201).json({
            mensaje: 'Tipo de documento creado exitosamente',
            tipo_documento: req.body
        });
    } catch (error) {
        console.error('Error al crear tipo de documento:', error);
        res.status(500).json({ error: error.message }); //Mensaje de error
    }
});

//Actualizar tipo documento
router.put('/:id', async (req, res) => {
    try {
        const {
            sigla,
            nombre_documento
        } = req.body;

        //Por si los campos quedan vacios
        if (!sigla || !nombre_documento) {
            return res.status(400).json({ error: 'Faltan campos requeridos para actualizar' });
        }

        // Se coloca id en actualizar y eliminar
        const [result] = await pool.query(
            `UPDATE tipo_documento SET
                sigla = ?,
                nombre_documento = ?
            WHERE id = ?`,
            [sigla, nombre_documento, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tipo de documento no encontrado' });
        }

        res.json({ mensaje: 'Tipo de documento actualizado exitosamente' });
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Eliminar tipo de documento
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM tipo_documento WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tipo de documento no encontrado'});
        }

        res.json({ mensaje: 'Tipo de documento eliminado exitosamente'});
    }catch (error) {
        res.status(500).json({error: error.message});
    }
});

export default router;