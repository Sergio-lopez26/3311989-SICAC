import { Router } from "express";
import pool from "../db.js";

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query('SELECT * FROM usuario');
        res.json(rows);
        //
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            id_tipo_documento,
            numero_documento,
            email,
            password,
            fecha_nacimiento,
            primer_nombre,
            segundo_nombre,
            primer_apellido,
            segundo_apellido,
            numero_celular,
            tipo_sangre,
            nombre_acudiente,
            documento_acudiente
        } = req.body;

        if (!id_tipo_documento || !numero_documento || !email || !password || !fecha_nacimiento || !primer_nombre || 
            !primer_apellido || !numero_celular || !tipo_sangre) {
            return res.status(400).json({
                error: 'Falta llenar campos requeridos'
            });
        }

        const [existing] = await pool.query(
            'SELECT numero_documento FROM usuario WHERE numero_documento = ?',
            [numero_documento]
        );

        if (existing.length > 0) {
            return res.status(400).json({//Mensaje de error personalizado
                error: 'Ya exixte un usuario con ese número de documento' //
            });
        }
        await pool.query(
            `INSERT INTO usuario ( 
                id_tipo_documento,
                numero_documento,
                email,
                password,
                fecha_nacimiento,
                primer_nombre,
                segundo_nombre,
                primer_apellido,
                segundo_apellido,
                numero_celular,
                tipo_sangre,
                nombre_acudiente,
                documento_acudiente
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_tipo_documento, numero_documento, email, password, fecha_nacimiento, primer_nombre, 
            segundo_nombre, primer_apellido, segundo_apellido, numero_celular, tipo_sangre, nombre_acudiente, 
            documento_acudiente]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            registro: req.body
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: error.message }); //Mensaje de error
    }
});

export default router;