import { Router } from "express";
import pool from "../db.js";

const router = Router();

// Consulta base reutilizada para traer los datos "legibles" de la cita (no solo los ids)
const SELECT_CITA = `
    SELECT
        c.id,
        c.id_tipo_cita,
        tc.tipo_cita,
        c.id_paciente,
        p.numero_documento AS paciente_documento,
        CONCAT(p.primer_nombre, ' ', COALESCE(p.segundo_nombre, ''), ' ', p.primer_apellido, ' ', COALESCE(p.segundo_apellido, '')) AS paciente_nombre,
        c.id_medico,
        CONCAT(m.nombres, ' ', m.apellidos) AS medico_nombre,
        m.matricula_profesional,
        c.fecha_cita,
        c.hora_inicio,
        c.hora_fin,
        c.estado_cita
    FROM cita c
    JOIN tipo_cita tc ON c.id_tipo_cita = tc.id
    JOIN paciente p ON c.id_paciente = p.id
    JOIN medico m ON c.id_medico = m.id
`;

// Obtener todas las citas (uso principalmente del Administrador)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`${SELECT_CITA} ORDER BY c.fecha_cita DESC, c.hora_inicio DESC`);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener las citas de un paciente en particular (uso del propio Paciente)
router.get('/paciente/:id_paciente', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `${SELECT_CITA} WHERE c.id_paciente = ? ORDER BY c.fecha_cita DESC, c.hora_inicio DESC`,
            [req.params.id_paciente]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener las citas asignadas a un médico en particular (uso del propio Médico/Odontólogo)
router.get('/medico/:id_medico', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `${SELECT_CITA} WHERE c.id_medico = ? ORDER BY c.fecha_cita DESC, c.hora_inicio DESC`,
            [req.params.id_medico]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Función interna para validar el cruce de horario de un médico en una fecha
const existeCruceHorario = async (id_medico, fecha_cita, hora_inicio, hora_fin, idExcluir = null) => {
    let query = `
        SELECT id FROM cita
        WHERE id_medico = ?
        AND fecha_cita = ?
        AND estado_cita != 'Cancelada'
        AND hora_inicio < ?
        AND hora_fin > ?
    `;
    const params = [id_medico, fecha_cita, hora_fin, hora_inicio];

    if (idExcluir) {
        query += ' AND id != ?';
        params.push(idExcluir);
    }

    const [rows] = await pool.query(query, params);
    return rows.length > 0;
};

router.post('/', async (req, res) => {
    try {
        const {
            id_tipo_cita,
            id_paciente,
            id_medico,
            fecha_cita,
            hora_inicio,
            hora_fin,
            estado_cita
        } = req.body;

        if (!id_tipo_cita || !id_paciente || !id_medico || !fecha_cita || !hora_inicio || !hora_fin) {
            return res.status(400).json({ error: 'Falta llenar campos requeridos' });
        }

        if (hora_fin <= hora_inicio) {
            return res.status(400).json({ error: 'La hora de fin debe ser posterior a la hora de inicio' });
        }

        // No se permiten citas en fechas ya pasadas
        const hoy = new Date().toISOString().split('T')[0];
        if (fecha_cita < hoy) {
            return res.status(400).json({ error: 'No se puede agendar una cita en una fecha pasada' });
        }

        const cruceMedico = await existeCruceHorario(id_medico, fecha_cita, hora_inicio, hora_fin);
        if (cruceMedico) {
            return res.status(400).json({ error: 'El médico ya tiene una cita agendada que se cruza con ese horario' });
        }

        // También se valida que el mismo paciente no tenga dos citas cruzadas
        const [crucePaciente] = await pool.query(
            `SELECT id FROM cita WHERE id_paciente = ? AND fecha_cita = ? AND estado_cita != 'Cancelada'
             AND hora_inicio < ? AND hora_fin > ?`,
            [id_paciente, fecha_cita, hora_fin, hora_inicio]
        );
        if (crucePaciente.length > 0) {
            return res.status(400).json({ error: 'El paciente ya tiene una cita agendada en ese horario' });
        }

        const [result] = await pool.query(
            `INSERT INTO cita (id_tipo_cita, id_paciente, id_medico, fecha_cita, hora_inicio, hora_fin, estado_cita)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id_tipo_cita, id_paciente, id_medico, fecha_cita, hora_inicio, hora_fin, estado_cita || 'Programada']
        );

        res.status(201).json({
            mensaje: 'Cita agendada exitosamente',
            cita: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error al agendar cita:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const {
            id_tipo_cita,
            id_paciente,
            id_medico,
            fecha_cita,
            hora_inicio,
            hora_fin,
            estado_cita
        } = req.body;

        if (!id_tipo_cita || !id_paciente || !id_medico || !fecha_cita || !hora_inicio || !hora_fin || !estado_cita) {
            return res.status(400).json({ error: 'Falta llenar campos para actualizar' });
        }

        if (hora_fin <= hora_inicio) {
            return res.status(400).json({ error: 'La hora de fin debe ser posterior a la hora de inicio' });
        }

        // Solo se valida el cruce de horario si la cita sigue activa (no cancelada)
        if (estado_cita !== 'Cancelada') {
            const cruceMedico = await existeCruceHorario(id_medico, fecha_cita, hora_inicio, hora_fin, req.params.id);
            if (cruceMedico) {
                return res.status(400).json({ error: 'El médico ya tiene una cita agendada que se cruza con ese horario' });
            }
        }

        const [result] = await pool.query(
            `UPDATE cita SET
                id_tipo_cita = ?,
                id_paciente = ?,
                id_medico = ?,
                fecha_cita = ?,
                hora_inicio = ?,
                hora_fin = ?,
                estado_cita = ?
            WHERE id = ?`,
            [id_tipo_cita, id_paciente, id_medico, fecha_cita, hora_inicio, hora_fin, estado_cita, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        res.json({ mensaje: 'Cita actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta liviana pensada para que el propio Médico solo cambie el estado de la cita (ej. Atendida)
router.put('/:id/estado', async (req, res) => {
    try {
        const { estado_cita } = req.body;

        if (!estado_cita) {
            return res.status(400).json({ error: 'Falta el campo estado_cita' });
        }

        const [result] = await pool.query(
            'UPDATE cita SET estado_cita = ? WHERE id = ?',
            [estado_cita, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        res.json({ mensaje: 'Estado de la cita actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM cita WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        res.json({ mensaje: 'Cita eliminada exitosamente' });
    } catch (error) {
        // La tabla pago referencia a cita con ON DELETE RESTRICT
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
            return res.status(400).json({ error: 'No se puede eliminar: la cita tiene un pago registrado. Cambie su estado a Cancelada en su lugar' });
        }
        res.status(500).json({ error: error.message });
    }
});

export default router;
