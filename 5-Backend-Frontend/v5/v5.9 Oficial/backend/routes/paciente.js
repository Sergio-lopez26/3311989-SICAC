import { Router } from "express";
import pool from "../db.js";

import bcrypt from 'bcrypt'; //Acá se importa la librería de encriptación, tras su previa instalación al realizar usuario.js

//Toca importar el validador del email que esta en la carpeta middleware
import {funcionValEmail} from '../middleware/validacionEmail.js';

const router = Router();

//Acá se pondrá el tema de las validaciones para ciertos campos
//Se aplicaran tanto en el post como en el put
const validaLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;

//Función flecha para validación
const funcionValida = (req, res, next) => {
    const {primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, nombre_acudiente} = req.body;

    //Condición para campos obligatorios
    if(!validaLetras.test(primer_nombre)){
        return res.status(400).json({error: "El  Primer nombre solo debe contener letras y tildes"})
    }
    if(!validaLetras.test(primer_apellido)){
        return res.status(400).json({error: "El  Primer apellido solo debe contener letras y tildes"})
    }

    //Condición para campos que no son obligatorios
    if(segundo_nombre && !validaLetras.test(segundo_nombre)){
        return res.status(400).json({error: "El  Segundo nombre solo debe contener letras y tildes"})
    }
    if(segundo_apellido && !validaLetras.test(segundo_apellido)){
        return res.status(400).json({error: "El  Segundo apellido solo debe contener letras y tildes"})
    }
    if(nombre_acudiente && !validaLetras.test(nombre_acudiente)){
        return res.status(400).json({error: "El  Nombre del acudiente solo debe contener letras y tildes"})
    }

    //Ya aquí si todo esta bien validado, se continua
    next();
}

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

//Obtener registro de un paciente -> Perfil
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM paciente WHERE id_usuario = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Agregamos la funcion de validación
router.post('/', funcionValida, async (req, res) => {
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

        //Para evitar que un usuario-medico sea tambien usaurio-paciente
        const [existMedico] = await pool.query(
            'SELECT id FROM medico WHERE id_usuario = ?',
            [id_usuario]
        );

        if(existMedico.length > 0){
            return res.status(400).json({
                error: 'El Usuario ya existe como Medico'
            })
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

        //Con esto nos curamos en salud, ya que automaticamente, el paciente registrado adquiere el rol de paciente en la tabla rol_usuario
        await pool.query(
            'INSERT INTO rol_usuario (id_usuario, id_rol) VALUES (?, ?)',
            [id_usuario, 3] 
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

//Agregamos la función de validación
router.put('/:id', funcionValida, funcionValEmail, async (req, res) => {
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