import { json, Router } from "express";
import pool from "../db.js";

import bcrypt from 'bcrypt'; //Acá se importa la librería de encriptación, tras su previa instalación al realizar usuario.js

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query(
            `SELECT id, id_usuario, id_tipo_documento, numero_documento, email, nombres, apellidos, 
                matricula_profesional, numero_celular, fecha_registro, estado_medico 
            FROM medico`);
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
            nombres,
            apellidos,
            matricula_profesional,
            numero_celular,
            //fecha_registro, -> Este ya no va, debido a que en la BD esta como timestamp, y es automático
            estado_medico
        } = req.body;

        if (!id_usuario || !id_tipo_documento || !numero_documento || !email || !password || !nombres || 
            !apellidos || !matricula_profesional || !numero_celular || !estado_medico) {
            return res.status(400).json({
                error: 'Falta llenar campos requeridos'
            });
        }

        const [existing] = await pool.query(
            'SELECT id FROM medico WHERE (id_tipo_documento = ? and numero_documento = ?) or matricula_profesional = ?',
            [id_tipo_documento, numero_documento, matricula_profesional]
        );

        if (existing.length > 0) {
            return res.status(400).json({//Mensaje de error personalizado
                error: 'Ya existe un medico con ese documento o esa matricula profesional' //
            });
        }

        // Se produce la encriptación: Convertimos el password en texto plano a un Hash seguro
        const saltRound = 10;
        const hashedPass = await bcrypt.hash(password, saltRound);
        
        //fecha_registro,  -> Este ya no va, debido a que en la BD esta como timestamp, y es automático
        await pool.query(
            `INSERT INTO medico ( 
                id_usuario,
                id_tipo_documento,
                numero_documento,
                email,
                password,
                nombres,
                apellidos,
                matricula_profesional,
                numero_celular,
                estado_medico
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_usuario, id_tipo_documento, numero_documento, email, hashedPass, nombres, apellidos, 
            matricula_profesional, numero_celular, estado_medico]
        );

        res.status(201).json({
            mensaje: 'Medico registrado exitosamente',
            medico: { email, nombres, apellidos } //Muestre solo unos campos
        });
    } catch (error) {
        console.error('Error al registrar medico:', error);
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
            password, //La cual provendra del RegistroInical -> usuario
            nombres,
            apellidos,
            matricula_profesional,
            numero_celular,
            //fecha_registro, -> Este ya no va, debido a que en la BD esta como timestamp, y es automático
            estado_medico
        } = req.body;
        

        if (!id_usuario || !id_tipo_documento || !numero_documento || !email || !nombres || 
            !apellidos || !matricula_profesional || !numero_celular || !estado_medico) {
            return res.status(400).json({
                error: 'Falta llenar campos para actualizar'
            });
        }

        //Se busca el password actual del médico en la BD por si se va a cambiar
        const [currentMedico] = await pool.query('SELECT password FROM medico WHERE id = ?', [req.params.id]);

        if (currentMedico.length === 0) {
            return res.status(404).json({ error: 'Medico no encontrado' });
        }

        const usuarioOdontologo = currentPaciente[0]; //Se extrae la fila a la que pertenece el registro

        let hashedPass = usuarioOdontologo.password; //Se guarda el password sin cambio
        
        //Si como Admin digitamos un nuevo pass y (no está vacía ni son asteriscos), la encriptamos
        if(password && password.trim() !== "" && password !== "********"){
            //Se produce la encriptación: Convertimos el password en texto plano a un Hash seguro
            const saltRound = 10;
            const hashedPass = await bcrypt.hash(password, saltRound);
        }

        //fecha_registro,  -> Este ya no va, debido a que en la BD esta como timestamp, y es automático
        const [result] = await pool.query(
            `UPDATE medico SET
                id_usuario = ?,
                id_tipo_documento = ?,
                numero_documento = ?,
                email = ?,
                password = ?,
                nombres = ?,
                apellidos = ?,
                matricula_profesional = ?,
                numero_celular= ?,
                estado_medico = ?
            WHERE id = ?`,
            [id_usuario, id_tipo_documento, numero_documento, email, hashedPass, nombres, apellidos, 
            matricula_profesional, numero_celular, estado_medico, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Medico no encontrado' });
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

        res.json({ mensaje: 'Medico actualizado exitosamente, junto a sus credenciales de usuario' });
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM medico WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Medico no encontrado'});
        }

        res.json({ mensaje: 'Medico eliminado exitosamente'});
    }catch (error) {
        res.status(500).json({error: error.message});
    }
});

export default router;