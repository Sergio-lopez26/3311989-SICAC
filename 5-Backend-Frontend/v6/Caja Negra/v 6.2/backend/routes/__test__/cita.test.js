import request from 'supertest';
import express from 'express';
import router from '../cita.js';

// Se simula el módulo de la BD
jest.mock('../../db.js');
import pool from '../../db.js';

// Se crea una app de Express mínima para los test
const app = express();
app.use(express.json());
app.use('/cita', router);

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Pruebas de Caja Blanca - Cita', () => {

    // GET /
    test('GET / debe retornar la lista de todas las citas', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1, estado_cita: 'Programada' }]]);

        const res = await request(app).get('/cita');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    // GET /:id_medico (por id_usuario)
    test('GET /:id_medico debe retornar las citas del médico por usuario', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1, id_medico: 2 }]]);

        const res = await request(app).get('/cita/5');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    // GET /paciente/:id_paciente
    test('GET /paciente/:id_paciente debe retornar las citas de un paciente específico', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1, id_paciente: 10 }]]);

        const res = await request(app).get('/cita/paciente/10');

        expect(res.statusCode).toBe(200);
    });

    // GET /medico/:id_medico
    test('GET /medico/:id_medico debe retornar las citas asignadas a un médico', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1, id_medico: 3 }]]);

        const res = await request(app).get('/cita/medico/3');

        expect(res.statusCode).toBe(200);
    });

    // POST /
    test('POST / debe rechazar si faltan campos requeridos', async () => {
        const res = await request(app)
            .post('/cita')
            .send({
                id_tipo_cita: 1,
                id_paciente: 1
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Falta llenar campos requeridos');
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('POST / debe rechazar si la hora de fin es anterior o igual a la de inicio', async () => {
        const res = await request(app)
            .post('/cita')
            .send({
                id_tipo_cita: 1,
                id_paciente: 1,
                id_medico: 1,
                fecha_cita: '2026-12-01',
                hora_inicio: '10:00:00',
                hora_fin: '09:00:00'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('La hora de fin debe ser posterior a la hora de inicio');
    });

    test('POST / debe rechazar si la fecha de la cita ya pasó', async () => {
        const res = await request(app)
            .post('/cita')
            .send({
                id_tipo_cita: 1,
                id_paciente: 1,
                id_medico: 1,
                fecha_cita: '2020-01-01',
                hora_inicio: '08:00:00',
                hora_fin: '09:00:00'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('No se puede agendar una cita en una fecha pasada');
    });

    test('POST / debe rechazar si hay cruce de horario para el médico', async () => {
        // existeCruceHorario encuentra cruce
        pool.query.mockResolvedValueOnce([[{ id: 99 }]]);

        const res = await request(app)
            .post('/cita')
            .send({
                id_tipo_cita: 1,
                id_paciente: 1,
                id_medico: 1,
                fecha_cita: '2026-12-01',
                hora_inicio: '08:00:00',
                hora_fin: '09:00:00'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('El médico ya tiene una cita agendada que se cruza con ese horario');
    });

    test('POST / debe rechazar si hay cruce de horario para el paciente', async () => {
        // 1. Cruce médico libre (vacío)
        pool.query.mockResolvedValueOnce([[]]);
        // 2. Cruce paciente con registro existente
        pool.query.mockResolvedValueOnce([[{ id: 88 }]]);

        const res = await request(app)
            .post('/cita')
            .send({
                id_tipo_cita: 1,
                id_paciente: 1,
                id_medico: 1,
                fecha_cita: '2026-12-01',
                hora_inicio: '08:00:00',
                hora_fin: '09:00:00'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('El paciente ya tiene una cita agendada en ese horario');
    });

    test('POST / debe crear cita exitosamente (con estado por defecto)', async () => {
        // 1. Validar cruce médico (vacío)
        pool.query.mockResolvedValueOnce([[]]);
        // 2. Validar cruce paciente (vacío)
        pool.query.mockResolvedValueOnce([[]]);
        // 3. Insert OK
        pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

        const res = await request(app)
            .post('/cita')
            .send({
                id_tipo_cita: 1,
                id_paciente: 1,
                id_medico: 1,
                fecha_cita: '2026-12-01',
                hora_inicio: '08:00:00',
                hora_fin: '09:00:00'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.mensaje).toBe('Cita agendada exitosamente');
    });

    // PUT /:id
    test('PUT / debe rechazar si faltan campos obligatorios para actualizar', async () => {
        const res = await request(app)
            .put('/cita/1')
            .send({
                id_tipo_cita: 1
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Falta llenar campos para actualizar');
    });

    test('PUT / debe rechazar si la hora de fin es anterior o igual en actualización', async () => {
        const res = await request(app)
            .put('/cita/1')
            .send({
                id_tipo_cita: 1,
                id_paciente: 1,
                id_medico: 1,
                fecha_cita: '2026-12-01',
                hora_inicio: '10:00:00',
                hora_fin: '09:00:00',
                estado_cita: 'Programada'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('La hora de fin debe ser posterior a la hora de inicio');
    });

    test('PUT / debe rechazar si hay cruce de médico al actualizar', async () => {
        // existeCruceHorario encuentra cruce
        pool.query.mockResolvedValueOnce([[{ id: 2 }]]);

        const res = await request(app)
            .put('/cita/1')
            .send({
                id_tipo_cita: 1,
                id_paciente: 1,
                id_medico: 1,
                fecha_cita: '2026-12-01',
                hora_inicio: '08:00:00',
                hora_fin: '09:00:00',
                estado_cita: 'Programada'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('El médico ya tiene una cita agendada que se cruza con ese horario');
    });

    test('PUT / debe retornar 404 si la cita no existe al actualizar', async () => {
        // 1. Sin cruce de médico
        pool.query.mockResolvedValueOnce([[]]);
        // 2. Update afectado = 0
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const res = await request(app)
            .put('/cita/1')
            .send({
                id_tipo_cita: 1,
                id_paciente: 1,
                id_medico: 1,
                fecha_cita: '2026-12-01',
                hora_inicio: '08:00:00',
                hora_fin: '09:00:00',
                estado_cita: 'Programada'
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Cita no encontrada');
    });

    test('PUT / debe actualizar la cita exitosamente', async () => {
        // 1. Sin cruce de médico
        pool.query.mockResolvedValueOnce([[]]);
        // 2. Update OK
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app)
            .put('/cita/1')
            .send({
                id_tipo_cita: 1,
                id_paciente: 1,
                id_medico: 1,
                fecha_cita: '2026-12-01',
                hora_inicio: '08:00:00',
                hora_fin: '09:00:00',
                estado_cita: 'Programada'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Cita actualizada exitosamente');
    });

    // PUT /:id/estado
    test('PUT /:id/estado debe rechazar si falta el campo estado_cita', async () => {
        const res = await request(app)
            .put('/cita/1/estado')
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Falta el campo estado_cita');
    });

    test('PUT /:id/estado debe retornar 404 si la cita no existe al cambiar estado', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const res = await request(app)
            .put('/cita/999/estado')
            .send({ estado_cita: 'Atendida' });

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Cita no encontrada');
    });

    test('PUT /:id/estado debe actualizar el estado exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app)
            .put('/cita/1/estado')
            .send({ estado_cita: 'Atendida' });

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Estado de la cita actualizado exitosamente');
    });

    // DELETE /:id
    test('DELETE / debe retornar 404 si la cita no existe', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const res = await request(app).delete('/cita/1');

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Cita no encontrada');
    });

    test('DELETE / debe manejar restricción de llave foránea genérica (ER_ROW_IS_REFERENCED)', async () => {
        const dbError = new Error('Foreign key constraint error');
        dbError.code = 'ER_ROW_IS_REFERENCED';
        pool.query.mockRejectedValueOnce(dbError);

        const res = await request(app).delete('/cita/1');

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('No se puede eliminar: la cita tiene un pago registrado');
    });

    test('DELETE / debe manejar restricción de llave foránea (ER_ROW_IS_REFERENCED_2)', async () => {
        const dbError = new Error('Foreign key constraint error');
        dbError.code = 'ER_ROW_IS_REFERENCED_2';
        pool.query.mockRejectedValueOnce(dbError);

        const res = await request(app).delete('/cita/1');

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('No se puede eliminar: la cita tiene un pago registrado');
    });

    test('DELETE / debe eliminar la cita exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app).delete('/cita/1');

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Cita eliminada exitosamente');
    });
});

describe('Manejo de Errores de Base de Datos (Catch) - Cita', () => {

    test('GET / debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));
        const res = await request(app).get('/cita');
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Fallo de conexión');
    });

    test('GET /:id_medico debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).get('/cita/5');
        expect(res.statusCode).toBe(500);
    });

    test('GET /paciente/:id_paciente debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).get('/cita/paciente/10');
        expect(res.statusCode).toBe(500);
    });

    test('GET /medico/:id_medico debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).get('/cita/medico/3');
        expect(res.statusCode).toBe(500);
    });

    test('POST / debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));

        const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});

        const res = await request(app)
            .post('/cita')
            .send({
                id_tipo_cita: 1,
                id_paciente: 1,
                id_medico: 1,
                fecha_cita: '2026-12-01',
                hora_inicio: '08:00:00',
                hora_fin: '09:00:00'
            });

        expect(res.statusCode).toBe(500);
        silencio.mockRestore();
    });

    test('PUT /:id debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app)
            .put('/cita/1')
            .send({
                id_tipo_cita: 1,
                id_paciente: 1,
                id_medico: 1,
                fecha_cita: '2026-12-01',
                hora_inicio: '08:00:00',
                hora_fin: '09:00:00',
                estado_cita: 'Programada'
            });
        expect(res.statusCode).toBe(500);
    });

    test('PUT /:id/estado debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app)
            .put('/cita/1/estado')
            .send({ estado_cita: 'Atendida' });
        expect(res.statusCode).toBe(500);
    });

    test('DELETE /:id debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).delete('/cita/1');
        expect(res.statusCode).toBe(500);
    });

    test('GET /:id_medico (por usuario) debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).get('/cita/usuario-test');
        expect(res.statusCode).toBe(500);
    });

    test('DELETE / debe capturar error genérico de BD diferente a llave foránea y retornar 500', async () => {
        const dbError = new Error('Error desconocido de BD');
        dbError.code = 'ER_OTHER_ERROR';
        pool.query.mockRejectedValueOnce(dbError);

        const res = await request(app).delete('/cita/1');

        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Error desconocido de BD');
    });
});
