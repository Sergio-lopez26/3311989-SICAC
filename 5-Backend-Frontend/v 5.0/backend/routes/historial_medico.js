import { Router } from "express";
import pool from "../db.js";

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query('SELECT * FROM historial_medico');
        res.json(rows);
        //
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Crear nuevo historial medico
router.post('/', async (req, res) => {
    try {
        const {
            id_paciente,
            id_mapa_dental
        } = req.body;

        if (!id_paciente || !id_mapa_dental) {
            return res.status(400).json({
                error: 'Faltan campos requeridos'
            });
        }

        //Se verifica si ya existe el historial medico
        const [existing] = await pool.query(
            'SELECT id_paciente FROM historial_medico WHERE id_paciente = ?',
            [id_paciente]
        );

        if (existing.length > 0) { 
            return res.status(400).json({
                error: 'Ya existe un historial médico de ese paciente' //
            });
        }
        //Estructura de inserción de datos
        await pool.query(
            `INSERT INTO historial_medico ( 
                id_paciente,
                id_mapa_dental
            ) VALUES (?, ?)`,
            [id_paciente, id_mapa_dental]
        );

        res.status(201).json({
            mensaje: 'Historial medico creado exitosamente',
            historial_medico: req.body
        });
    } catch (error) {
        console.error('Error al crear historial del paciente:', error);
        res.status(500).json({ error: error.message }); //Mensaje de error
    }
});

//Actualizar historial medico
router.put('/:id', async (req, res) => {
    try {
        const {
            id_paciente,
            id_mapa_dental
        } = req.body;
        
        const [result] = await pool.query(
            `UPDATE historial_medico SET
                id_paciente = ?,
                id_mapa_dental = ?
            WHERE id = ?`,
            [id_paciente, id_mapa_dental, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Historial medico no encontrado' });
        }

        res.json({ mensaje: 'Historial medico actualizado exitosamente' });
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Eliminar historial medico
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM historial_medico WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Historial medico no encontrado'});
        }

        res.json({ mensaje: 'Historial medico eliminado exitosamente'});
    }catch (error) {
        res.status(500).json({error: error.message});
    }
});

export default router;