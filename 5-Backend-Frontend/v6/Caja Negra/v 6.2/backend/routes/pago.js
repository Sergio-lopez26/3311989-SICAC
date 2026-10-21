import { Router } from "express";
import pool from "../db.js";

const router = Router();

const SELECT_PAGO = `
    SELECT
        pa.id,
        pa.id_cita,
        c.fecha_cita,
        c.hora_inicio,
        CONCAT(p.primer_nombre, ' ', p.primer_apellido) AS paciente_nombre,
        p.numero_documento AS paciente_documento,
        CONCAT(m.nombres, ' ', m.apellidos) AS medico_nombre,
        pa.id_metodo_pago,
        mp.nombre_metodo,
        pa.numero_pago,
        pa.fecha_pago,
        pa.monto_pagado,
        pa.estado_pago
    FROM pago pa
    JOIN cita c ON pa.id_cita = c.id
    JOIN paciente p ON c.id_paciente = p.id
    JOIN medico m ON c.id_medico = m.id
    JOIN metodo_pago mp ON pa.id_metodo_pago = mp.id
`;

// Obtener todos los pagos (uso del Administrador)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`${SELECT_PAGO} ORDER BY pa.fecha_pago DESC, pa.id DESC`);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener el/los pago(s) de una cita puntual
router.get('/cita/:id_cita', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `${SELECT_PAGO} WHERE pa.id_cita = ? ORDER BY pa.fecha_pago DESC`,
            [req.params.id_cita]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener los pagos asociados a las citas de un paciente (para que el paciente consulte sus pagos)
router.get('/paciente/:id_paciente', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `${SELECT_PAGO} WHERE c.id_paciente = ? ORDER BY pa.fecha_pago DESC`,
            [req.params.id_paciente]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            id_cita,
            id_metodo_pago,
            numero_pago,
            fecha_pago,
            monto_pagado,
            estado_pago
        } = req.body;

        if (!id_cita || !id_metodo_pago || !fecha_pago || !monto_pagado) {
            return res.status(400).json({ error: 'Falta llenar campos requeridos' });
        }

        if (Number(monto_pagado) <= 0) {
            return res.status(400).json({ error: 'El monto pagado debe ser mayor a cero' });
        }

        const [existeCita] = await pool.query('SELECT id FROM cita WHERE id = ?', [id_cita]);
        if (existeCita.length === 0) {
            return res.status(404).json({ error: 'La cita indicada no existe' });
        }

        // Se genera un número de comprobante único si no se especificó uno manualmente
        const numeroPagoFinal = (numero_pago && numero_pago.trim() !== "")
            ? numero_pago.trim()
            : `PAGO-${Date.now()}`;

        const [existing] = await pool.query(
            'SELECT id FROM pago WHERE numero_pago = ?',
            [numeroPagoFinal]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Ya existe un pago registrado con ese número de comprobante' });
        }

        const [result] = await pool.query(
            `INSERT INTO pago (id_cita, id_metodo_pago, numero_pago, fecha_pago, monto_pagado, estado_pago)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id_cita, id_metodo_pago, numeroPagoFinal, fecha_pago, monto_pagado, estado_pago || 'Pagado']
        );

        res.status(201).json({
            mensaje: 'Pago registrado exitosamente',
            pago: { id: result.insertId, numero_pago: numeroPagoFinal }
        });
    } catch (error) {
        console.error('Error al registrar pago:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const {
            id_metodo_pago,
            numero_pago,
            fecha_pago,
            monto_pagado,
            estado_pago
        } = req.body;

        if (!id_metodo_pago || !numero_pago || !fecha_pago || !monto_pagado || !estado_pago) {
            return res.status(400).json({ error: 'Falta llenar campos para actualizar' });
        }

        const [result] = await pool.query(
            `UPDATE pago SET
                id_metodo_pago = ?,
                numero_pago = ?,
                fecha_pago = ?,
                monto_pagado = ?,
                estado_pago = ?
            WHERE id = ?`,
            [id_metodo_pago, numero_pago, fecha_pago, monto_pagado, estado_pago, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }

        res.json({ mensaje: 'Pago actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM pago WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }

        res.json({ mensaje: 'Pago eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
