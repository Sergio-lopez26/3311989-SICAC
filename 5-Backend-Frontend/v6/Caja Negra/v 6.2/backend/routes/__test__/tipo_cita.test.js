import request from 'supertest';
import express from 'express';
import router from '../tipo_cita.js';

// Se simula el módulo de la BD
jest.mock('../../db.js');
import pool from '../../db.js';

// Se crea una app de Express mínima para los test
const app = express();
app.use(express.json());
app.use('/tipo_cita', router);

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Pruebas de Caja Blanca - Tipo Cita', () => {

    // GET /
    test('GET / debe retornar la lista de tipos de cita', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1, tipo_cita: 'General' }]]);

        const res = await request(app).get('/tipo_cita');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    // POST /
    test('POST / debe rechazar si el tipo de cita no cumple con la validación de letras', async () => {
        const res = await request(app)
            .post('/tipo_cita')
            .send({ tipo_cita: 'General123' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('El Tipo de Cita solo debe contener letras con o sin tildes');
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('POST / debe rechazar si falta el campo tipo_cita', async () => {
        const res = await request(app)
            .post('/tipo_cita')
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Falta campo requerido');
    });

    test('POST / debe rechazar si ya existe un tipo de cita con ese nombre', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1 }]]); // Simula que ya existe

        const res = await request(app)
            .post('/tipo_cita')
            .send({ tipo_cita: 'General' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Ya existe un tipo de cita con ese nombre');
    });

    test('POST / debe crear el tipo de cita exitosamente', async () => {
        pool.query
            .mockResolvedValueOnce([[]]) // No existe
            .mockResolvedValueOnce([{ insertId: 1 }]); // Insert OK

        const res = await request(app)
            .post('/tipo_cita')
            .send({ tipo_cita: 'Odontología' });

        expect(res.statusCode).toBe(201);
        expect(res.body.mensaje).toBe('Tipo de cita creado exitosamente');
    });

    // PUT /:id
    test('PUT /:id debe rechazar si el formato es inválido en la validación', async () => {
        const res = await request(app)
            .put('/tipo_cita/1')
            .send({ tipo_cita: 'General#' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('El Tipo de Cita solo debe contener letras con o sin tildes');
    });

    test('PUT /:id debe rechazar si falta el campo tipo_cita para actualizar', async () => {
        const res = await request(app)
            .put('/tipo_cita/1')
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Falta el campo tipo_cita para actualizar');
    });

    test('PUT /:id debe retornar 404 si no existe el tipo de cita', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const res = await request(app)
            .put('/tipo_cita/1')
            .send({ tipo_cita: 'General' });

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Tipo de cita no encontrado');
    });

    test('PUT /:id debe actualizar exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app)
            .put('/tipo_cita/1')
            .send({ tipo_cita: 'General' });

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Tipo de cita actualizado exitosamente');
    });

    // DELETE /:id
    test('DELETE /:id debe retornar 404 si no existe el tipo de cita', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const res = await request(app).delete('/tipo_cita/1');

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Tipo de cita no encontrado');
    });

    test('DELETE /:id debe manejar restricción de llave foránea (ER_ROW_IS_REFERENCED)', async () => {
        const dbError = new Error('FK Error');
        dbError.code = 'ER_ROW_IS_REFERENCED';
        pool.query.mockRejectedValueOnce(dbError);

        const res = await request(app).delete('/tipo_cita/1');

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('No se puede eliminar: hay citas asociadas');
    });

    test('DELETE /:id debe manejar restricción de llave foránea (ER_ROW_IS_REFERENCED_2)', async () => {
        const dbError = new Error('FK Error');
        dbError.code = 'ER_ROW_IS_REFERENCED_2';
        pool.query.mockRejectedValueOnce(dbError);

        const res = await request(app).delete('/tipo_cita/1');

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('No se puede eliminar: hay citas asociadas');
    });

    test('DELETE /:id debe eliminar exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app).delete('/tipo_cita/1');

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Tipo de cita eliminado exitosamente');
    });
});

describe('Manejo de Errores de Base de Datos (Catch) - Tipo Cita', () => {

    test('GET / debe capturar error y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).get('/tipo_cita');
        expect(res.statusCode).toBe(500);
    });

    test('POST / debe capturar error y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});
        const res = await request(app).post('/tipo_cita').send({ tipo_cita: 'General' });
        expect(res.statusCode).toBe(500);
        silencio.mockRestore();
    });

    test('PUT /:id debe capturar error y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).put('/tipo_cita/1').send({ tipo_cita: 'General' });
        expect(res.statusCode).toBe(500);
    });

    test('DELETE /:id debe capturar error y retornar 500', async () => {
        const dbError = new Error('Fallo genérico');
        dbError.code = 'ER_OTHER';
        pool.query.mockRejectedValueOnce(dbError);
        const res = await request(app).delete('/tipo_cita/1');
        expect(res.statusCode).toBe(500);
    });
});