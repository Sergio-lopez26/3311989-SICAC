import { json, Router } from "express";
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
                error: 'Ya existe un usuario con ese número de documento' //
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
            usuario: req.body
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: error.message }); //Mensaje de error
    }
});

//Ruta para el Login
router.post('/login', async(req, res) =>{
    try{
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({
                error: "Falta ingresar el email y/o la contraseña"
            });
        }

        const [rows] = await pool.query('SELECT * FROM usuario WHERE email = ? AND password = ?',
            [email, password]
        );

        if(rows.length === 0){
            return res.status(401).json({
                error: "Credenciales incorrectas"
            });
        }

        const usuario = rows[0];

        res.status(200).json({
            mensaje: 'Credenciales validas',
            usuario: {
                primer_nombre: usuario.primer_nombre,
                primer_apellido: usuario.primer_apellido,
                email: usuario.email
            }
        });
    }catch(error){
        console.error('Error al ingresar', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
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
        
        const [result] = await pool.query(
            `UPDATE usuario SET
                id_tipo_documento = ?,
                numero_documento = ?,
                email = ?,
                password = ?,
                fecha_nacimiento = ?,
                primer_nombre = ?,
                segundo_nombre = ?,
                primer_apellido = ?,
                segundo_apellido = ?,
                numero_celular= ?,
                tipo_sangre = ?,
                nombre_acudiente = ?,
                documento_acudiente = ?
            WHERE id = ?`,
            [id_tipo_documento, numero_documento, email, password, fecha_nacimiento, primer_nombre, 
            segundo_nombre, primer_apellido, segundo_apellido, numero_celular, tipo_sangre, nombre_acudiente, 
            documento_acudiente, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ mensaje: 'Usuario actualizado exitosamente' });
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM usuario WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado'});
        }

        res.json({ mensaje: 'Usuario eliminado exitosamente'});
    }catch (error) {
        res.status(500).json({error: error.message});
    }
});

export default router;