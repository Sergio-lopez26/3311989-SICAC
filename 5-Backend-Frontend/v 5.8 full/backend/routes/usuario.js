import { Router } from "express";
import pool from "../db.js";

//Toca instalar el bycript -> npm install bcrypt
import bcrypt from 'bcrypt'; //Acá se importa la librería de encriptación, tras su previa instalación

//Toca importar el validador del email que esta en la carpeta middleware
import {funcionValEmail} from '../middleware/validacionEmail.js';

const router = Router();

router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query('SELECT id, email FROM usuario'); //Acá se omite que nos devuelva el password (por seguridad)
        res.json(rows);
        //
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', funcionValEmail, async (req, res) => {
    try {
        const { //Acá no se coloca el id, puesto que está con autoincrement
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Falta llenar campos requeridos'
            });
        }

        //Aca mejor revisamos si el usuario ya tiene asociado un paciente, asi nos facilita lo que haremos en el frontend
        const [existing] = await pool.query(
            `SELECT u.id, u.email, p.id AS id_paciente 
            FROM usuario u 
            LEFT JOIN paciente p ON u.id = p.id_usuario 
            WHERE u.email = ?`,
            [email]
        );

        if (existing.length > 0) {
            const usuarioPaciente = existing[0]; //[0] -> Primera fila

            if (!usuarioPaciente.id_paciente) {
                return res.status(200).json({
                    registroIncompleto: true, //Registro en usuario, mas no en paciente
                    mensaje: 'Detectamos que ya tienes una cuenta creada pero no has completado tus datos de paciente.',
                    usuario: {
                        id: usuarioPaciente.id,
                        email: usuarioPaciente.email
                    }
                });
            }
            return res.status(400).json({//Mensaje de error personalizado
                error: 'Ya se encuentra registrado ese email de usuario' //
            });
        }

        // Se produce la encriptación: Convertimos el password en texto plano a un Hash seguro
        const saltRound = 10;
        const hashedPass = await bcrypt.hash(password, saltRound);

        const [result] = await pool.query( //Con result capturamos los datos ya que necesitamos el id para enviarselo al frontend
            `INSERT INTO usuario ( 
                email,
                password
            ) VALUES (?, ?)`,
            [email, hashedPass] //-> hashedPass: Contiene el Password encriptado
        );

        const idCapturado = result.insertId; //Se extrae el id autoincrementado

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: { id: idCapturado, email: email } //Aca que solo muestre el id e email, y no el password - Ademas se envia el id capturado para que el frontend lo guarde
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: error.message });
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

        const [users] = await pool.query('SELECT * FROM usuario WHERE email = ?', //users: almacenara lo consultado
            [email]
        );

        if(users.length === 0){
            return res.status(401).json({
                error: "Credenciales incorrectas"
            });
        }

        const usuarioLogin = users[0];

        let comparar = false; //Iniciamos la variable como falsa

        //Una cosita: las claves encriptadas simpre empiezan con un $2b$ o con un $2a$ - ni idea del por qué
        //Actualizacion: Ya lo sé, y es por la version del motor del node.jsXD
        if(usuarioLogin.password.startsWith('$2b$') || usuarioLogin.password.startsWith('$2a$') || usuarioLogin.password.startsWith('$2y$')){
            //Con esto basicamente reemplazamos momentáneamente el '$2y$' con el que encripta el hash en laravel por el $2b$ nativo del bcrypt de node
            const hashLaravel = usuarioLogin.password.replace(/^\$2y\$/, '$2b$');
            //Se verifica la contraseña encriptada con Bcrypt y tambien el de Hash (pero con el prefijo reemplazado)
            comparar = await bcrypt.compare(password, hashLaravel);
        }else{
            //Se verifica la contraseña no encriptada, ya que en MySql tenemos registros sin encriptacion por lo del DML
            comparar = (password === usuarioLogin.password);
        }

        if (!comparar) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        //Se consulta el rol que tiene el usuario y se traen sus nombres (ya sea el paciente o el médico)
        const queryInfo = `
            SELECT r.rol AS rol, p.primer_nombre AS nombre_paciente, p.primer_apellido AS apellido_paciente, 
                m.nombres AS nombre_medico, m.apellidos AS apellido_medico 
            FROM usuario u 
            LEFT JOIN rol_usuario ru ON u.id = ru.id_usuario
            LEFT JOIN rol r ON ru.id_rol = r.id 
            LEFT JOIN paciente p ON u.id = p.id_usuario
            LEFT JOIN medico m ON u.id = m.id_usuario
            WHERE u.id = ?
        `;
        
        const [infoRows] = await pool.query(queryInfo, [usuarioLogin.id]); //infoRows: almacena la consulta join

        //Si la cuenta existe pero no completó el formulario de paciente, osea, esta registrado en la tabla usuario, mas no en paciente ni en medico
        if (infoRows.length === 0 || (!infoRows[0].rol && !infoRows[0].nombre_paciente && !infoRows[0].nombre_medico)) {
            return res.status(200).json({
                registroIncompleto: true, 
                mensaje: 'Registro incompleto como médico o paciente',
                usuario: {
                    id: usuarioLogin.id,
                    email: usuarioLogin.email
                }
            });
        }

        //Con esto extraemos todos los privilegios activos que MySQL devuelva
        const rolesAsignados = infoRows.map(row => row.rol).filter(Boolean);

        //Se determina qué nombre se envia según el rol
        let nombreUsuario = "Usuario";
        let apellidoUsuario = "";

        //Con esto buscamos en el arreglo de filas[infoRows] dónde hay nombres reales guardados
        const filaConDatos = infoRows.find(row => row.nombre_paciente || row.nombre_medico);

        if (filaConDatos) {
            if (filaConDatos.nombre_medico) {
                nombreUsuario = filaConDatos.nombre_medico;
                apellidoUsuario = filaConDatos.apellido_medico || "";
            } else if (filaConDatos.nombre_paciente) {
                nombreUsuario = filaConDatos.nombre_paciente;
                apellidoUsuario = filaConDatos.apellido_paciente || "";
            }
        }
        
        const nombreCompletoU = `${nombreUsuario} ${apellidoUsuario}`.trim(); //-> trim(): elimina espacios en blanco
        
        // Si la consulta arroja más de un rol asignado a un mismo usuario
        if (rolesAsignados.length > 1) {
            return res.status(200).json({
                ElegirRol: true, //Servirá como "desvío" para el frontend
                mensaje: 'El usuario cuenta con múltiples roles asignados',
                usuarioReal: {
                    id: usuarioLogin.id,
                    email: usuarioLogin.email,
                    nombre_completo: nombreCompletoU,
                    roles: rolesAsignados
                }
            });
        }

        //Se obtiene la respuesta para el frontend, en caso solo el usuario posea un rol
        res.status(200).json({
            mensaje: 'Ingreso exitoso',
            usuario: {
                id: usuarioLogin.id,
                email: usuarioLogin.email,
                rol: rolesAsignados[0] || 'sin_rol',
                nombre_completo: nombreCompletoU
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
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Faltan campos requeridos para actualizar' });
        }

        // Se produce de nuevo la encriptación: Convertimos el password en texto plano a un Hash seguro
        const saltRound = 10;
        const hashedPass = await bcrypt.hash(password, saltRound);
        
        const [result] = await pool.query(
            `UPDATE usuario SET
                email = ?,
                password = ?
            WHERE id = ?`,
            [email, hashedPass, req.params.id]
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

router.post('/verifica_email', async (req, res) => {
    try {
        const { 
            email 
        } = req.body;

        const [rows] = await pool.query(
            'SELECT id FROM usuario WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'El correo electrónico ingresado no se encuentra registrado en el sistema.'
            });
        }

        res.status(200).json({ 
            mensaje: 'Correo verificado correctamente.' //Falta es ahora genera el cod aleatorio
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;