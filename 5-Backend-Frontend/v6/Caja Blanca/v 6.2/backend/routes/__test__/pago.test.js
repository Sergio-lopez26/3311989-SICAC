import request from 'supertest';
import express from 'express';
import router from '../pago.js';

// Se simula el módulo de la BD
jest.mock('../../db.js');
import pool from '../../db.js';

// Se crea una app de Express mínima para los test
const app = express();
app.use(express.json());
app.use('/pago', router);

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Pruebas de Caja Blanca - Pago', () => {

    // GET /
    test('GET / debe retornar la lista de todos los pagos', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1, monto_pagado: 50000 }]]);

        const res = await request(app).get('/pago');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    // GET /cita/:id_cita
    test('GET /cita/:id_cita debe retornar los pagos de una cita puntual', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1, id_cita: 2 }]]);

        const res = await request(app).get('/pago/cita/2');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    // GET /paciente/:id_paciente
    test('GET /paciente/:id_paciente debe retornar los pagos asociados a las citas de un paciente', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1, paciente_nombre: 'Juan Perez' }]]);

        const res = await request(app).get('/pago/paciente/5');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    // POST /
    test('POST / debe rechazar si faltan campos requeridos', async () => {
        const res = await request(app)
            .post('/pago')
            .send({
                id_cita: 1
                // Faltan campos obligatorios
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Falta llenar campos requeridos');
        expect(pool.query).not.toHaveBeenCalled();
    });
test('POST / debe rechazar si el monto pagado es menor o igual a cero', async () => {
        const res = await request(app)
            .post('/pago')
            .send({
                id_cita: 1,
                id_metodo_pago: 1,
                fecha_pago: '2026-06-01',
                monto_pagado: -10 // Usamos un número negativo para que pase la validación de requeridos y llegue a la de <= 0
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('El monto pagado debe ser mayor a cero');
    });

    test('POST / debe retornar 404 si la cita indicada no existe', async () => {
        // Validación de existencia de cita devuelve array vacío
        pool.query.mockResolvedValueOnce([[]]);

        const res = await request(app)
            .post('/pago')
            .send({
                id_cita: 99,
                id_metodo_pago: 1,
                fecha_pago: '2026-06-01',
                monto_pagado: 50000
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('La cita indicada no existe');
    });

    test('POST / debe rechazar si ya existe un pago con el mismo número de comprobante', async () => {
        // 1. Existe cita OK
        pool.query.mockResolvedValueOnce([[{ id: 1 }]]);
        // 2. Existe pago con el mismo número
        pool.query.mockResolvedValueOnce([[{ id: 1 }]]);

        const res = await request(app)
            .post('/pago')
            .send({
                id_cita: 1,
                id_metodo_pago: 1,
                numero_pago: 'PAGO-123',
                fecha_pago: '2026-06-01',
                monto_pagado: 50000
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Ya existe un pago registrado con ese número de comprobante');
    });

    test('POST / debe registrar el pago exitosamente (con número generado automáticamente)', async () => {
        // 1. Existe cita OK
        pool.query.mockResolvedValueOnce([[{ id: 1 }]]);
        // 2. No existe pago previo (array vacío para numero_pago automático)
        pool.query.mockResolvedValueOnce([[]]);
        // 3. Insert OK
        pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

        const res = await request(app)
            .post('/pago')
            .send({
                id_cita: 1,
                id_metodo_pago: 1,
                fecha_pago: '2026-06-01',
                monto_pagado: 50000
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.mensaje).toBe('Pago registrado exitosamente');
    });

    test('POST / debe registrar el pago exitosamente enviando numero_pago vacío (para generar automático)', async () => {
        // 1. Existe cita OK
        pool.query.mockResolvedValueOnce([[{ id: 1 }]]);
        // 2. No existe pago previo
        pool.query.mockResolvedValueOnce([[]]);
        // 3. Insert OK
        pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

        const res = await request(app)
            .post('/pago')
            .send({
                id_cita: 1,
                id_metodo_pago: 1,
                numero_pago: "", // Cadena vacía para cubrir la línea 80
                fecha_pago: '2026-06-01',
                monto_pagado: 50000
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.mensaje).toBe('Pago registrado exitosamente');
    });

    test('POST / debe registrar el pago exitosamente (con número manual)', async () => {
        // 1. Existe cita OK
        pool.query.mockResolvedValueOnce([[{ id: 1 }]]);
        // 2. No existe pago previo con ese número
        pool.query.mockResolvedValueOnce([[]]);
        // 3. Insert OK
        pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

        const res = await request(app)
            .post('/pago')
            .send({
                id_cita: 1,
                id_metodo_pago: 1,
                numero_pago: 'MANUAL-999',
                fecha_pago: '2026-06-01',
                monto_pagado: 50000
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.mensaje).toBe('Pago registrado exitosamente');
    });

    // PUT /:id
    test('PUT / debe rechazar si faltan campos obligatorios para actualizar', async () => {
        const res = await request(app)
            .put('/pago/1')
            .send({
                id_metodo_pago: 1
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Falta llenar campos para actualizar');
    });

    test('PUT / debe retornar 404 si el pago no existe al actualizar', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const res = await request(app)
            .put('/pago/1')
            .send({
                id_metodo_pago: 1,
                numero_pago: 'PAGO-123',
                fecha_pago: '2026-06-01',
                monto_pagado: 50000,
                estado_pago: 'Pagado'
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Pago no encontrado');
    });

    test('PUT / debe actualizar el pago exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app)
            .put('/pago/1')
            .send({
                id_metodo_pago: 1,
                numero_pago: 'PAGO-123',
                fecha_pago: '2026-06-01',
                monto_pagado: 50000,
                estado_pago: 'Pagado'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Pago actualizado exitosamente');
    });

    // DELETE /:id
    test('DELETE / debe retornar 404 si el pago no existe', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const res = await request(app).delete('/pago/1');

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Pago no encontrado');
    });

    test('DELETE / debe eliminar el pago exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app).delete('/pago/1');

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Pago eliminado exitosamente');
    });
});

describe('Manejo de Errores de Base de Datos (Catch) - Pago', () => {

    test('GET / debe capturar error y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).get('/pago');
        expect(res.statusCode).toBe(500);
    });

    test('GET /cita/:id_cita debe capturar error y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).get('/pago/cita/1');
        expect(res.statusCode).toBe(500);
    });

    test('GET /paciente/:id_paciente debe capturar error y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).get('/pago/paciente/1');
        expect(res.statusCode).toBe(500);
    });

    test('POST / debe capturar error y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});
        const res = await request(app).post('/pago').send({
            id_cita: 1,
            id_metodo_pago: 1,
            fecha_pago: '2026-06-01',
            monto_pagado: 50000
        });
        expect(res.statusCode).toBe(500);
        silencio.mockRestore();
    });

    test('PUT /:id debe capturar error y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).put('/pago/1').send({
            id_metodo_pago: 1,
            numero_pago: 'PAGO-123',
            fecha_pago: '2026-06-01',
            monto_pagado: 50000,
            estado_pago: 'Pagado'
        });
        expect(res.statusCode).toBe(500);
    });

    test('DELETE /:id debe capturar error y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).delete('/pago/1');
        expect(res.statusCode).toBe(500);
    });
});