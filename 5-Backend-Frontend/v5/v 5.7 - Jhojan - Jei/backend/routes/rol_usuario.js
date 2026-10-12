import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get('/', async (req, res) => {
    try{
        //Ya que queremos mostrar en el frontend datos de otras tablas usamos consultas con inner join y left join
        //Además el uso de COALESCE es para "cruzar" ya sea el nombre del paciente o del medico, pero segun sea la elección
        // se mostrará como nombre_completo gracias a que se concatena campos para ese resultado
        //COALESCE tambien nos permite que se muestre el segundo nombre o segundo apellido, a menos que esten como null, arrojara vacio mas no null
        //Ahora bien con el CASE, es para bloquear ociones en el frontend, y en medico no se pueda cambiar a paciente, ni viceversa
        const datosMostrar = `
            SELECT ru.id_usuario, ru.id_rol, u.email, r.rol as rol_asignado, 
                COALESCE(CONCAT(p.primer_nombre, ' ', COALESCE(p.segundo_nombre, ''), ' ', p.primer_apellido, ' ', COALESCE(p.segundo_apellido, '')),
                CONCAT(m.nombres, ' ', m.apellidos), 'Usuario sin rol') 
                as nombre_completo,

                CASE 
                    WHEN p.id IS NOT NULL THEN 'perfil_paciente'
                    WHEN m.id IS NOT NULL THEN 'perfil_medico'
                    ELSE 'sin_perfil'
                END AS tipo_perfil
            FROM rol_usuario ru INNER JOIN usuario u ON ru.id_usuario = u.id 
            INNER JOIN rol r ON ru.id_rol = r.id 
            LEFT JOIN paciente p ON u.id = p.id_usuario 
            LEFT JOIN medico m ON u.id = m.id_usuario
        `;
            
        const [rows] = await pool.query(datosMostrar);
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
                error: 'Faltan campos requeridos'
            });
        }

        const [existing] = await pool.query(
            'SELECT * FROM rol_usuario WHERE id_rol = ? and id_usuario = ?',
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
        res.status(500).json({error: error.message});
    }
});

export default router;