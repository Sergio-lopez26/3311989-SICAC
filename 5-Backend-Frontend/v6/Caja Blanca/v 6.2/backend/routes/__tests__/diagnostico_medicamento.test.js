import request from 'supertest';
import express from 'express';
import pool from '../../db.js';
import router from '../diagnostico_medicamento.js'; 

// Simulamos la base de datos db.js
jest.mock('../../db.js', () => ({
    query: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/diagnostico-medicamento', router);

describe('Pruebas para las rutas de Diagnóstico-Medicamento', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /diagnostico-medicamento/diagnostico/:id_diagnostico', () => {
        test('debe devolver los medicamentos recetados para un diagnóstico (status 200)', async () => {
            const mockMedicamentos = [
                {
                    id_diagnostico: 1,
                    id_medicamento: 5,
                    fecha_medicacion: '2026-10-15',
                    estado_medicacion: 'Recetado',
                    nombre_medicamento: 'Ibuprofeno'
                }
            ];

            pool.query.mockResolvedValueOnce([mockMedicamentos]);

            const response = await request(app).get('/diagnostico-medicamento/diagnostico/1');

            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockMedicamentos);
        });

        test('debe devolver un status 500 si ocurre un error en la BD', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de conexión'));

            const response = await request(app).get('/diagnostico-medicamento/diagnostico/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error de conexión' });
        });
    });

    describe('POST /diagnostico-medicamento', () => {
        const payloadValido = {
            id_diagnostico: 1,
            id_medicamento: 5,
            estado_medicacion: 'Recetado'
        };

        test('debe retornar 400 si faltan campos obligatorios', async () => {
            const response = await request(app)
                .post('/diagnostico-medicamento')
                .send({ id_diagnostico: 1 }); 

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'id_diagnostico, id_medicamento y estado_medicacion son obligatorios.' });
        });

        test('debe asignar el medicamento exitosamente (status 201)', async () => {
            pool.query.mockResolvedValueOnce([{}]);

            const response = await request(app)
                .post('/diagnostico-medicamento')
                .send(payloadValido);

            expect(pool.query).toHaveBeenCalledWith(
                expect.any(String),
                [1, 5, 'Recetado']
            );
            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                ...payloadValido,
                mensaje: 'Medicamento asignado al diagnóstico exitosamente'
            });
        });

        test('debe retornar 400 si se intenta agregar el mismo medicamento al diagnóstico dos veces', async () => {
            const errorDuplicado = new Error('Duplicado');
            errorDuplicado.code = 'ER_DUP_ENTRY';
            
            pool.query.mockRejectedValueOnce(errorDuplicado);

            const response = await request(app)
                .post('/diagnostico-medicamento')
                .send(payloadValido);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Este medicamento ya fue recetado para este diagnóstico.' });
        });

        test('debe retornar 500 ante un error interno de BD', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error interno'));

            const response = await request(app)
                .post('/diagnostico-medicamento')
                .send(payloadValido);

            expect(response.status).toBe(500);
        });
    });

    describe('PUT /diagnostico-medicamento/:id_diagnostico/:id_medicamento', () => {
        test('debe retornar 400 si falta el estado_medicacion', async () => {
            const response = await request(app)
                .put('/diagnostico-medicamento/1/5')
                .send({}); 

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'El estado_medicacion es obligatorio.' });
        });

        test('debe actualizar el estado de la medicación exitosamente (status 200)', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app)
                .put('/diagnostico-medicamento/1/5')
                .send({ estado_medicacion: 'Suspendido' });

            expect(pool.query).toHaveBeenCalledWith(
                expect.any(String),
                ['Suspendido', '1', '5']
            );
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ mensaje: 'Estado de la medicación actualizado exitosamente.' });
        });

        test('debe retornar 404 si el registro de medicación no existe', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const response = await request(app)
                .put('/diagnostico-medicamento/99/99')
                .send({ estado_medicacion: 'Suspendido' });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ mensaje: 'Registro de medicación no encontrado.' });
        });

        test('debe retornar 500 ante un error de BD', async () => {
            pool.query.mockRejectedValueOnce(new Error('Fallo al actualizar'));

            const response = await request(app)
                .put('/diagnostico-medicamento/1/5')
                .send({ estado_medicacion: 'Suspendido' });

            expect(response.status).toBe(500);
        });
    });

    describe('DELETE /diagnostico-medicamento/:id_diagnostico/:id_medicamento', () => {
        test('debe eliminar el medicamento del diagnóstico exitosamente (status 200)', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app).delete('/diagnostico-medicamento/1/5');

            expect(pool.query).toHaveBeenCalledWith(
                expect.any(String),
                ['1', '5']
            );
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ mensaje: 'Medicamento retirado del diagnóstico exitosamente.' });
        });

        test('debe retornar 404 si no encuentra el registro para eliminar', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const response = await request(app).delete('/diagnostico-medicamento/99/99');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ mensaje: 'Registro de medicación no encontrado.' });
        });

        test('debe retornar 500 si falla la consulta de eliminación', async () => {
            pool.query.mockRejectedValueOnce(new Error('Fallo al eliminar'));

            const response = await request(app).delete('/diagnostico-medicamento/1/5');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Fallo al eliminar' });
        });
    });
});