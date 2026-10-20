import request from 'supertest';
import express from 'express';
import pool from '../../db.js';
import router from '../tipo_medicamento.js';

// Simulamos la base de datos db.js
jest.mock('../../db.js', () => ({
    query: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/tipo-medicamento', router);

describe('Pruebas para las rutas de Tipo de Medicamento', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /tipo-medicamento', () => {
        test('debe devolver todas las categorías de medicamentos (status 200)', async () => {
            const mockCategorias = [
                { id: 1, categoria_medicamento: 'Analgésico' },
                { id: 2, categoria_medicamento: 'Antibiótico' }
            ];

            pool.query.mockResolvedValueOnce([mockCategorias]);

            const response = await request(app).get('/tipo-medicamento');

            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM tipo_medicamento');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockCategorias);
        });

        test('debe devolver 500 en caso de error de BD', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de conexión'));

            const response = await request(app).get('/tipo-medicamento');

            expect(response.status).toBe(500);
        });
    });

    describe('GET /tipo-medicamento/:id', () => {
        test('debe devolver una categoría específica (status 200)', async () => {
            const mockCategoria = { id: 1, categoria_medicamento: 'Analgésico' };
            pool.query.mockResolvedValueOnce([[mockCategoria]]);

            const response = await request(app).get('/tipo-medicamento/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockCategoria);
        });

        test('debe devolver 404 si no encuentra el tipo de medicamento', async () => {
            pool.query.mockResolvedValueOnce([[]]);

            const response = await request(app).get('/tipo-medicamento/99');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ mensaje: 'Tipo de medicamento no encontrado' });
        });
        test('debe devolver 500 en caso de error de BD al buscar por ID (cubre línea 32)', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error al buscar la categoría'));

            const response = await request(app).get('/tipo-medicamento/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error al buscar la categoría' });
        });
    });

    describe('POST /tipo-medicamento', () => {
        const payloadValido = { categoria_medicamento: 'Antiinflamatorio' };

        test('debe crear una nueva categoría exitosamente (status 201)', async () => {
            pool.query.mockResolvedValueOnce([{ insertId: 3 }]);

            const response = await request(app)
                .post('/tipo-medicamento')
                .send(payloadValido);

            expect(pool.query).toHaveBeenCalledWith(
                expect.any(String),
                ['Antiinflamatorio']
            );
            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                id: 3,
                categoria_medicamento: 'Antiinflamatorio',
                mensaje: 'Categoría de medicamento creada exitosamente'
            });
            
        });

        test('debe retornar 400 si falta la categoria_medicamento', async () => {
            const response = await request(app)
                .post('/tipo-medicamento')
                .send({}); 

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'El campo categoria_medicamento es obligatorio.' });
        });

        test('debe retornar 400 si la categoría ya está registrada (ER_DUP_ENTRY)', async () => {
            const errorDuplicado = new Error('Duplicado');
            errorDuplicado.code = 'ER_DUP_ENTRY';
            
            pool.query.mockRejectedValueOnce(errorDuplicado);

            const response = await request(app)
                .post('/tipo-medicamento')
                .send(payloadValido);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: `La categoría 'Antiinflamatorio' ya se encuentra registrada.` });
        });
        test('debe devolver 500 ante un error interno de BD que no sea duplicado (cubre línea 60)', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error inesperado al crear'));

            const response = await request(app)
                .post('/tipo-medicamento')
                .send({ categoria_medicamento: 'Jarabe' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error inesperado al crear' });
        });
    });

    describe('PUT /tipo-medicamento/:id', () => {
        const payloadActualizacion = { categoria_medicamento: 'Antihistamínico' };

        test('debe actualizar la categoría exitosamente (status 200)', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app)
                .put('/tipo-medicamento/1')
                .send(payloadActualizacion);

            expect(pool.query).toHaveBeenCalledWith(
                expect.any(String),
                ['Antihistamínico', '1']
            );
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ mensaje: 'Categoría de medicamento actualizada exitosamente' });
        });

        test('debe devolver 404 si la categoría a actualizar no existe', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const response = await request(app)
                .put('/tipo-medicamento/99')
                .send(payloadActualizacion);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ mensaje: 'Tipo de medicamento no encontrado' });
        });

        test('debe retornar 400 si falta el campo para la actualización', async () => {
            const response = await request(app)
                .put('/tipo-medicamento/1')
                .send({}); 

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'El campo categoria_medicamento es obligatorio para actualizar.' });
        });

        test('debe retornar 400 si el nuevo nombre ya existe (ER_DUP_ENTRY)', async () => {
            const errorDuplicado = new Error('Duplicado');
            errorDuplicado.code = 'ER_DUP_ENTRY';
            
            pool.query.mockRejectedValueOnce(errorDuplicado);

            const response = await request(app)
                .put('/tipo-medicamento/1')
                .send(payloadActualizacion);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Ya existe otra categoría con ese mismo nombre.' });
        });
        test('debe devolver 500 ante un error interno de BD al actualizar (cubre línea 88)', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error inesperado al actualizar'));

            const response = await request(app)
                .put('/tipo-medicamento/1')
                .send({ categoria_medicamento: 'Gotas' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error inesperado al actualizar' });
        });
    });

    describe('DELETE /tipo-medicamento/:id', () => {
        test('debe eliminar la categoría exitosamente (status 200)', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app).delete('/tipo-medicamento/1');

            expect(pool.query).toHaveBeenCalledWith('DELETE FROM tipo_medicamento WHERE id = ?', ['1']);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ mensaje: 'Categoría de medicamento eliminada exitosamente' });
        });

        test('debe retornar 404 si no encuentra la categoría para eliminar', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const response = await request(app).delete('/tipo-medicamento/99');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ mensaje: 'Tipo de medicamento no encontrado' });
        });

        test('debe retornar 400 si la categoría tiene medicamentos asociados (ER_ROW_IS_REFERENCED_2)', async () => {
            const errorForanea = new Error('Foránea');
            errorForanea.code = 'ER_ROW_IS_REFERENCED_2';
            
            pool.query.mockRejectedValueOnce(errorForanea);

            const response = await request(app).delete('/tipo-medicamento/1');

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ 
                error: 'No se puede eliminar esta categoría porque hay medicamentos registrados que pertenecen a ella.' 
            });
        });

        test('debe retornar 500 ante cualquier otro error de BD al eliminar', async () => {
            pool.query.mockRejectedValueOnce(new Error('Fallo al eliminar'));

            const response = await request(app).delete('/tipo-medicamento/1');

            expect(response.status).toBe(500);
        });
    });
});