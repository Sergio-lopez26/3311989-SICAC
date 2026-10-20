import request from 'supertest';
import express from 'express';
import pool from '../../db.js';
import router from '../tipo_diagnostico.js';

// Simulamos la base de datos db.js
jest.mock('../../db.js', () => ({
    query: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/tipo-diagnostico', router);

describe('Pruebas para las rutas de Tipo de Diagnóstico', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /tipo-diagnostico', () => {
        test('debe devolver todos los tipos de diagnóstico (status 200)', async () => {
            const mockTipos = [
                { id: 1, nombre_diagnostico: 'Caries', descripcion: 'Destrucción del tejido dental' }
            ];

            pool.query.mockResolvedValueOnce([mockTipos]);

            const response = await request(app).get('/tipo-diagnostico');

            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM tipo_diagnostico');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockTipos);
        });

        test('debe devolver 500 en caso de error de BD', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de conexión'));

            const response = await request(app).get('/tipo-diagnostico');

            expect(response.status).toBe(500);
        });
    });

    describe('GET /tipo-diagnostico/:id', () => {
        test('debe devolver un tipo de diagnóstico específico (status 200)', async () => {
            const mockTipo = { id: 1, nombre_diagnostico: 'Caries', descripcion: 'Destrucción del tejido dental' };
            pool.query.mockResolvedValueOnce([[mockTipo]]);

            const response = await request(app).get('/tipo-diagnostico/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockTipo);
        });

        test('debe devolver 404 si no encuentra el tipo de diagnóstico', async () => {
            pool.query.mockResolvedValueOnce([[]]);

            const response = await request(app).get('/tipo-diagnostico/99');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ mensaje: 'Tipo de diagnóstico no encontrado' });
        });
        test('debe devolver 500 en caso de error de BD al buscar por ID (cubre línea 32)', async () => {
            pool.query.mockRejectedValueOnce(new Error('Fallo de base de datos'));

            const response = await request(app).get('/tipo-diagnostico/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Fallo de base de datos' });
        });
    });

    describe('POST /tipo-diagnostico', () => {
        const payloadValido = { nombre_diagnostico: 'Gingivitis', descripcion: 'Inflamación de las encías' };

        test('debe crear un nuevo tipo de diagnóstico exitosamente (status 201)', async () => {
            pool.query.mockResolvedValueOnce([{ insertId: 3 }]);

            const response = await request(app)
                .post('/tipo-diagnostico')
                .send(payloadValido);

            expect(pool.query).toHaveBeenCalledWith(
                expect.any(String),
                ['Gingivitis', 'Inflamación de las encías']
            );
            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                id: 3,
                nombre_diagnostico: 'Gingivitis',
                descripcion: 'Inflamación de las encías',
                mensaje: 'Tipo de diagnóstico creado exitosamente'
            });
        });

        test('debe retornar 400 si faltan campos obligatorios', async () => {
            const response = await request(app)
                .post('/tipo-diagnostico')
                .send({ nombre_diagnostico: 'Gingivitis' }); // Falta descripcion

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'El nombre_diagnostico y la descripcion son obligatorios.' });
        });

        test('debe retornar 400 si el diagnóstico ya está registrado (ER_DUP_ENTRY)', async () => {
            const errorDuplicado = new Error('Duplicado');
            errorDuplicado.code = 'ER_DUP_ENTRY';
            
            pool.query.mockRejectedValueOnce(errorDuplicado);

            const response = await request(app)
                .post('/tipo-diagnostico')
                .send(payloadValido);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: `El diagnóstico 'Gingivitis' ya está registrado.` });
        });
        test('debe devolver 500 ante un error interno de BD que no sea duplicado (cubre línea 62)', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error inesperado al insertar'));

            const response = await request(app)
                .post('/tipo-diagnostico')
                .send({ nombre_diagnostico: 'Asma', descripcion: 'Dificultad respiratoria' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error inesperado al insertar' });
        });
    });

    describe('PUT /tipo-diagnostico/:id', () => {
        const payloadActualizacion = { nombre_diagnostico: 'Periodontitis', descripcion: 'Infección grave de las encías' };

        test('debe actualizar el tipo de diagnóstico exitosamente (status 200)', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app)
                .put('/tipo-diagnostico/1')
                .send(payloadActualizacion);

            expect(pool.query).toHaveBeenCalledWith(
                expect.any(String),
                ['Periodontitis', 'Infección grave de las encías', '1']
            );
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ mensaje: 'Tipo de diagnóstico actualizado exitosamente' });
        });

        test('debe devolver 404 si el tipo de diagnóstico a actualizar no existe', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const response = await request(app)
                .put('/tipo-diagnostico/99')
                .send(payloadActualizacion);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ mensaje: 'Tipo de diagnóstico no encontrado' });
        });

        test('debe retornar 400 si faltan datos para la actualización', async () => {
            const response = await request(app)
                .put('/tipo-diagnostico/1')
                .send({ descripcion: 'Infección grave' }); // Falta nombre_diagnostico

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Faltan datos para la actualización.' });
        });

        test('debe retornar 400 si el nuevo nombre ya existe (ER_DUP_ENTRY)', async () => {
            const errorDuplicado = new Error('Duplicado');
            errorDuplicado.code = 'ER_DUP_ENTRY';
            
            pool.query.mockRejectedValueOnce(errorDuplicado);

            const response = await request(app)
                .put('/tipo-diagnostico/1')
                .send(payloadActualizacion);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Ya existe otro tipo de diagnóstico con ese nombre.' });
        });
        test('debe devolver 500 ante un error interno de BD al actualizar (cubre línea 92)', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error al actualizar registro'));

            const response = await request(app)
                .put('/tipo-diagnostico/1')
                .send({ nombre_diagnostico: 'Alergia', descripcion: 'Reacción alérgica' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error al actualizar registro' });
        });
    });

    describe('DELETE /tipo-diagnostico/:id', () => {
        test('debe eliminar el tipo de diagnóstico exitosamente (status 200)', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app).delete('/tipo-diagnostico/1');

            expect(pool.query).toHaveBeenCalledWith('DELETE FROM tipo_diagnostico WHERE id = ?', ['1']);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ mensaje: 'Tipo de diagnóstico eliminado exitosamente' });
        });

        test('debe retornar 404 si no encuentra el tipo de diagnóstico para eliminar', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const response = await request(app).delete('/tipo-diagnostico/99');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ mensaje: 'Tipo de diagnóstico no encontrado' });
        });

        test('debe retornar 400 si el diagnóstico está en uso por una llave foránea (ER_ROW_IS_REFERENCED_2)', async () => {
            const errorForanea = new Error('Foránea');
            errorForanea.code = 'ER_ROW_IS_REFERENCED_2';
            
            pool.query.mockRejectedValueOnce(errorForanea);

            const response = await request(app).delete('/tipo-diagnostico/1');

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ 
                error: 'No se puede eliminar este tipo de diagnóstico porque ya está asociado a uno o más diagnósticos de pacientes.' 
            });
        });

        test('debe retornar 500 ante cualquier otro error de BD al eliminar', async () => {
            pool.query.mockRejectedValueOnce(new Error('Fallo al eliminar'));

            const response = await request(app).delete('/tipo-diagnostico/1');

            expect(response.status).toBe(500);
        });
    });
});