import { Router } from "express";
import pool from "../db.js";

import bcrypt from 'bcrypt'; //Acá se importa la librería de encriptación, tras su previa instalación al realizar usuario.js

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query(
            `SELECT id, id_usuario, id_tipo_documento, numero_documento, email, fecha_nacimiento, 
                primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, numero_celular, tipo_sangre, 
                genero, nombre_acudiente, documento_acudiente, estado_paciente 
            FROM paciente`);
        res.json(rows);
        //
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            id_usuario,
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
            genero,
            nombre_acudiente,
            documento_acudiente,
            estado_paciente
        } = req.body;

        if (!id_usuario || !id_tipo_documento || !numero_documento || !email || !password || !fecha_nacimiento || !primer_nombre || 
            !primer_apellido || !numero_celular || !tipo_sangre || !genero || !estado_paciente) {
            return res.status(400).json({
                error: 'Falta llenar campos requeridos'
            });
        }

        const [existing] = await pool.query(
            'SELECT id_tipo_documento, numero_documento FROM paciente WHERE id_tipo_documento = ? and numero_documento = ?',
            [id_tipo_documento, numero_documento]
        );

        if (existing.length > 0) {
            return res.status(400).json({//Mensaje de error personalizado
                error: 'Ya existe un paciente con esa sigla y número de documento' //
            });
        }

        // Se produce la encriptación: Convertimos el password en texto plano a un Hash seguro
        const saltRound = 10;
        const hashedPass = await bcrypt.hash(password, saltRound);
        
        await pool.query(
            `INSERT INTO paciente ( 
                id_usuario,
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
                genero,
                nombre_acudiente,
                documento_acudiente,
                estado_paciente
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_usuario, id_tipo_documento, numero_documento, email, hashedPass, fecha_nacimiento, primer_nombre, 
            segundo_nombre, primer_apellido, segundo_apellido, numero_celular, tipo_sangre, genero, nombre_acudiente, 
            documento_acudiente, estado_paciente]
        );

        res.status(201).json({
            mensaje: 'Paciente registrado exitosamente',
            paciente: { email, primer_nombre, primer_apellido } //Muestre solo unos campos
        });
    } catch (error) {
        console.error('Error al registrar paciente:', error);
        res.status(500).json({ error: error.message }); //Mensaje de error
    }
});

router.put('/:id', async (req, res) => {
    try {
        const {
            id_usuario,
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
            genero,
            nombre_acudiente,
            documento_acudiente,
            estado_paciente
        } = req.body;
        

        if (!id_usuario || !id_tipo_documento || !numero_documento || !email || !fecha_nacimiento || !primer_nombre || 
            !primer_apellido || !numero_celular || !tipo_sangre || !genero || !estado_paciente) {
            return res.status(400).json({
                error: 'Falta llenar campos para actualizar'
            });
        }

        //Buscamos el password actual que ya tiene el paciente en la BD por si no va a cambiarse
        const [currentPaciente] = await pool.query('SELECT password FROM paciente WHERE id = ?', [req.params.id]);

        if (currentPaciente.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        const usuarioPaciente = currentPaciente[0]; //Se extrae la fila a la que pertenece el registro

        let hashedPass = usuarioPaciente.password; //Se guarda el password sin cambio

        //Si como Admin digitamos un nuevo pass y (no está vacía ni son asteriscos), la encriptamos
        if(password && password.trim() !== "" && password !== "********"){
            //Se produce la encriptación: Convertimos el password en texto plano a un Hash seguro
            const saltRound = 10;
            hashedPass = await bcrypt.hash(password, saltRound);
        }
        
        const [result] = await pool.query(
            `UPDATE paciente SET
                id_usuario = ?,
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
                genero = ?,
                nombre_acudiente = ?,
                documento_acudiente = ?,
                estado_paciente = ?
            WHERE id = ?`,
            [id_usuario, id_tipo_documento, numero_documento, email, hashedPass, fecha_nacimiento, primer_nombre, 
            segundo_nombre || "", primer_apellido, segundo_apellido || "", numero_celular, tipo_sangre, genero, nombre_acudiente || null, 
            documento_acudiente || null, estado_paciente, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        //La idea es actualizar automáticamente la tabla usuario en relacion al email y el password
        //Para eso, usaremos el id_usuario (FK) que recibimos del frontend para sincronizar el email y el password
        await pool.query(
            `UPDATE usuario SET
                email = ?,
                password = ?
            WHERE id = ?`,
            [email, hashedPass, id_usuario]
        );

        res.json({ mensaje: 'Paciente actualizado exitosamente, junto a sus credenciales de usuario' });
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM paciente WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado'});
        }

        res.json({ mensaje: 'Paciente eliminado exitosamente'});
    }catch (error) {
        res.status(500).json({error: error.message});
    }
});

export default router;