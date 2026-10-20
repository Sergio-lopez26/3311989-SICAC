import request from 'supertest';
import express from 'express';
import pool from '../../db.js';
import router from '../medicamento.js';

// Simulamos la base de datos db.js
jest.mock('../../db.js', () => ({
    query: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/medicamento', router);

describe('Pruebas para las rutas de Medicamento', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /medicamento', () => {
        test('debe devolver todos los medicamentos con su categoría (status 200)', async () => {
            const mockMedicamentos = [
                { id: 1, id_tipo_medicamento: 2, nombre_medicamento: 'Amoxicilina', categoria_medicamento: 'Antibiótico' }
            ];

            pool.query.mockResolvedValueOnce([mockMedicamentos]);

            const response = await request(app).get('/medicamento');

            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockMedicamentos);
        });

        test('debe devolver 500 en caso de error de BD', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

            const response = await request(app).get('/medicamento');

            expect(response.status).toBe(500);
        });
    });

    describe('GET /medicamento/:id', () => {
        test('debe devolver un medicamento específico (status 200)', async () => {
            const mockMedicamento = { id: 1, id_tipo_medicamento: 2, nombre_medicamento: 'Amoxicilina' };
            pool.query.mockResolvedValueOnce([[mockMedicamento]]);

            const response = await request(app).get('/medicamento/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockMedicamento);
        });

        test('debe devolver 404 si no encuentra el medicamento', async () => {
            pool.query.mockResolvedValueOnce([[]]);

            const response = await request(app).get('/medicamento/99');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ mensaje: 'Medicamento no encontrado' });
        });
        test('debe devolver 500 en caso de error de BD al buscar por ID (cubre línea 37)', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de conexión al buscar por ID'));

            const response = await request(app).get('/medicamento/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error de conexión al buscar por ID' });
        });
    });

    describe('POST /medicamento', () => {
        const payloadValido = { id_tipo_medicamento: 2, nombre_medicamento: 'Ibuprofeno' };

        test('debe registrar un nuevo medicamento exitosamente (status 201)', async () => {
            pool.query.mockResolvedValueOnce([{ insertId: 5 }]);

            const response = await request(app)
                .post('/medicamento')
                .send(payloadValido);

            expect(pool.query).toHaveBeenCalledWith(
                expect.any(String),
                [2, 'Ibuprofeno']
            );
            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                id: 5,
                id_tipo_medicamento: 2,
                nombre_medicamento: 'Ibuprofeno',
                mensaje: 'Medicamento registrado exitosamente'
            });
        });

        test('debe retornar 400 si faltan campos obligatorios', async () => {
            const response = await request(app)
                .post('/medicamento')
                .send({ nombre_medicamento: 'Paracetamol' }); // Falta id_tipo_medicamento

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'El id_tipo_medicamento y el nombre_medicamento son obligatorios.' });
        });

        test('debe retornar 400 si el medicamento ya está registrado (ER_DUP_ENTRY)', async () => {
            const errorDuplicado = new Error('Duplicado');
            errorDuplicado.code = 'ER_DUP_ENTRY';
            
            pool.query.mockRejectedValueOnce(errorDuplicado);

            const response = await request(app)
                .post('/medicamento')
                .send(payloadValido);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: `El medicamento 'Ibuprofeno' ya se encuentra registrado en el sistema.` });
        });
        test('debe devolver 500 ante un error interno de BD que no sea duplicado (cubre línea 67)', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error inesperado al insertar medicamento'));

            const response = await request(app)
                .post('/medicamento')
                .send({ id_tipo_medicamento: 2, nombre_medicamento: 'Loratadina' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error inesperado al insertar medicamento' });
        });
    });

    describe('PUT /medicamento/:id', () => {
        const payloadActualizacion = { id_tipo_medicamento: 3, nombre_medicamento: 'Paracetamol 500mg' };

        test('debe actualizar el medicamento exitosamente (status 200)', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app)
                .put('/medicamento/1')
                .send(payloadActualizacion);

            expect(pool.query).toHaveBeenCalledWith(
                expect.any(String),
                [3, 'Paracetamol 500mg', '1']
            );
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ mensaje: 'Medicamento actualizado exitosamente' });
        });

        test('debe devolver 404 si el medicamento a actualizar no existe', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const response = await request(app)
                .put('/medicamento/99')
                .send(payloadActualizacion);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ mensaje: 'Medicamento no encontrado' });
        });

        test('debe retornar 400 si falta información para actualizar', async () => {
            const response = await request(app)
                .put('/medicamento/1')
                .send({ id_tipo_medicamento: 3 }); 

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Faltan datos para la actualización.' });
        });

        test('debe retornar 400 si el nuevo nombre ya existe (ER_DUP_ENTRY)', async () => {
            const errorDuplicado = new Error('Duplicado');
            errorDuplicado.code = 'ER_DUP_ENTRY';
            
            pool.query.mockRejectedValueOnce(errorDuplicado);

            const response = await request(app)
                .put('/medicamento/1')
                .send(payloadActualizacion);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Ya existe otro medicamento con ese nombre.' });
        });
        test('debe devolver 500 ante un error interno de BD al actualizar (cubre línea 97)', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error inesperado al actualizar'));

            const response = await request(app)
                .put('/medicamento/1')
                .send({ id_tipo_medicamento: 3, nombre_medicamento: 'Salbutamol' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error inesperado al actualizar' });
        });
    });

    describe('DELETE /medicamento/:id', () => {
        test('debe eliminar el medicamento exitosamente (status 200)', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app).delete('/medicamento/1');

            expect(pool.query).toHaveBeenCalledWith('DELETE FROM medicamento WHERE id = ?', ['1']);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ mensaje: 'Medicamento eliminado exitosamente' });
        });

        test('debe retornar 404 si no encuentra el medicamento para eliminar', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const response = await request(app).delete('/medicamento/99');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ mensaje: 'Medicamento no encontrado' });
        });

        test('debe retornar 400 si el medicamento está en uso por una llave foránea (ER_ROW_IS_REFERENCED_2)', async () => {
            const errorForanea = new Error('Foránea');
            errorForanea.code = 'ER_ROW_IS_REFERENCED_2';
            
            pool.query.mockRejectedValueOnce(errorForanea);

            const response = await request(app).delete('/medicamento/1');

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ 
                error: 'No se puede eliminar este medicamento porque ya ha sido recetado en un diagnóstico.' 
            });
        });

        test('debe retornar 500 ante cualquier otro error de BD al eliminar', async () => {
            pool.query.mockRejectedValueOnce(new Error('Fallo al eliminar'));

            const response = await request(app).delete('/medicamento/1');

            expect(response.status).toBe(500);
        });
    });
});