import request from 'supertest';
import express from 'express';
import router from '../metodo_pago.js';

// Se simula el módulo de la BD
jest.mock('../../db.js');
import pool from '../../db.js';

// Se crea una app de Express mínima para los test
const app = express();
app.use(express.json());
app.use('/metodo_pago', router);

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Pruebas de Caja Blanca - Método de Pago', () => {

    // GET /
    test('GET / debe retornar la lista de métodos de pago', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1, nombre_metodo: 'Efectivo' }]]);

        const res = await request(app).get('/metodo_pago');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    // POST /
    test('POST / debe rechazar si el nombre del método no cumple con la validación de letras', async () => {
        const res = await request(app)
            .post('/metodo_pago')
            .send({ nombre_metodo: 'Efectivo123' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('El Nombre del Método solo debe contener letras con o sin tildes');
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('POST / debe rechazar si falta el campo nombre_metodo', async () => {
        const res = await request(app)
            .post('/metodo_pago')
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Falta campo requerido');
    });

    test('POST / debe rechazar si ya existe un método de pago con ese nombre', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1 }]]); // Simula que ya existe

        const res = await request(app)
            .post('/metodo_pago')
            .send({ nombre_metodo: 'Efectivo' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Ya existe un método de pago con ese nombre');
    });

    test('POST / debe crear el método de pago exitosamente', async () => {
        pool.query
            .mockResolvedValueOnce([[]]) // No existe
            .mockResolvedValueOnce([{ insertId: 1 }]); // Insert OK

        const res = await request(app)
            .post('/metodo_pago')
            .send({ nombre_metodo: 'Tarjeta' });

        expect(res.statusCode).toBe(201);
        expect(res.body.mensaje).toBe('Método de pago creado exitosamente');
    });

    // PUT /:id
    test('PUT /:id debe rechazar si el formato es inválido en la validación', async () => {
        const res = await request(app)
            .put('/metodo_pago/1')
            .send({ nombre_metodo: 'Tarjeta#' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('El Nombre del Método solo debe contener letras con o sin tildes');
    });

    test('PUT /:id debe rechazar si falta el campo nombre_metodo para actualizar', async () => {
        const res = await request(app)
            .put('/metodo_pago/1')
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Falta el campo nombre_metodo para actualizar');
    });

    test('PUT /:id debe retornar 404 si no existe el método de pago', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const res = await request(app)
            .put('/metodo_pago/1')
            .send({ nombre_metodo: 'Efectivo' });

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Método de pago no encontrado');
    });

    test('PUT /:id debe actualizar exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app)
            .put('/metodo_pago/1')
            .send({ nombre_metodo: 'Efectivo' });

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Método de pago actualizado exitosamente');
    });

    // DELETE /:id
    test('DELETE /:id debe retornar 404 si no existe el método de pago', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const res = await request(app).delete('/metodo_pago/1');

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Método de pago no encontrado');
    });

    test('DELETE /:id debe manejar restricción de llave foránea (ER_ROW_IS_REFERENCED)', async () => {
        const dbError = new Error('FK Error');
        dbError.code = 'ER_ROW_IS_REFERENCED';
        pool.query.mockRejectedValueOnce(dbError);

        const res = await request(app).delete('/metodo_pago/1');

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('No se puede eliminar: hay pagos asociados');
    });

    test('DELETE /:id debe manejar restricción de llave foránea (ER_ROW_IS_REFERENCED_2)', async () => {
        const dbError = new Error('FK Error');
        dbError.code = 'ER_ROW_IS_REFERENCED_2';
        pool.query.mockRejectedValueOnce(dbError);

        const res = await request(app).delete('/metodo_pago/1');

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('No se puede eliminar: hay pagos asociados');
    });

    test('DELETE /:id debe eliminar exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app).delete('/metodo_pago/1');

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Método de pago eliminado exitosamente');
    });
});

describe('Manejo de Errores de Base de Datos (Catch) - Método de Pago', () => {

    test('GET / debe capturar error y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).get('/metodo_pago');
        expect(res.statusCode).toBe(500);
    });

    test('POST / debe capturar error y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});
        const res = await request(app).post('/metodo_pago').send({ nombre_metodo: 'Efectivo' });
        expect(res.statusCode).toBe(500);
        silencio.mockRestore();
    });

    test('PUT /:id debe capturar error y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).put('/metodo_pago/1').send({ nombre_metodo: 'Efectivo' });
        expect(res.statusCode).toBe(500);
    });

    test('DELETE /:id debe capturar error y retornar 500', async () => {
        const dbError = new Error('Fallo genérico');
        dbError.code = 'ER_OTHER';
        pool.query.mockRejectedValueOnce(dbError);
        const res = await request(app).delete('/metodo_pago/1');
        expect(res.statusCode).toBe(500);
    });
});