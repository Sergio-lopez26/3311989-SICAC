import request from 'supertest';
import express from 'express';
import pool from '../../db.js';
import router from '../diagnostico.js';

// Simulamos la base de datos y la conexión para transacciones
const mockConnection = {
    beginTransaction: jest.fn(),
    query: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn()
};

jest.mock('../../db.js', () => ({
    query: jest.fn(),
    getConnection: jest.fn().mockResolvedValue({
        beginTransaction: jest.fn(),
        query: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn()
    })
}));

const app = express();
app.use(express.json());
app.use('/diagnostico', router);

describe('Pruebas para las rutas de Diagnóstico', () => {
    let connection;

    beforeEach(async () => {
        jest.clearAllMocks();
        // Asignamos el mockConnection al getConnection para tener acceso en las pruebas POST
        pool.getConnection.mockResolvedValue(mockConnection);
        connection = await pool.getConnection();
    });

    describe('GET /diagnostico/cita/:id_cita', () => {
        test('debe devolver el diagnóstico cuando existe para la cita', async () => {
            const mockDiag = { id: 1, id_cita: 10, nombre_diagnostico: 'Caries' };
            pool.query.mockResolvedValueOnce([[mockDiag]]);

            const response = await request(app).get('/diagnostico/cita/10');

            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockDiag);
        });

        test('debe devolver 404 si no encuentra el diagnóstico', async () => {
            pool.query.mockResolvedValueOnce([[]]);

            const response = await request(app).get('/diagnostico/cita/99');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ mensaje: 'Diagnóstico no encontrado para esta cita' });
        });

        test('debe devolver 500 en caso de error de BD', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error BD'));

            const response = await request(app).get('/diagnostico/cita/10');

            expect(response.status).toBe(500);
        });
    });

    describe('GET /diagnostico/paciente/:id_paciente', () => {
        test('debe devolver un arreglo de diagnósticos del paciente', async () => {
            const mockDiags = [{ id: 1, id_cita: 10 }, { id: 2, id_cita: 12 }];
            pool.query.mockResolvedValueOnce([mockDiags]);

            const response = await request(app).get('/diagnostico/paciente/5');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockDiags);
        });

        test('debe devolver 404 si no encuentra diagnósticos', async () => {
            pool.query.mockResolvedValueOnce([[]]);

            const response = await request(app).get('/diagnostico/paciente/99');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ mensaje: 'Diagnósticos no encontrado para este paciente' });
        });
        test('debe devolver 500 si hay un fallo en el servidor', async () =>{
             pool.query.mockRejectedValueOnce(new Error('Error BD'));

            const response = await request(app).get('/diagnostico/paciente/10');

            expect(response.status).toBe(500);
        });
    });

    describe('POST /diagnostico', () => {
        const payloadValido = {
            id_cita: 1,
            id_tipo_diagnostico: 2,
            motivo: 'Dolor de muela',
            observaciones: 'Caries profunda',
            tratamiento_sugerido: 'Endodoncia',
            medicamento: 5,
            dosis: '1 cada 8 horas'
        };

        test('debe retornar 400 si faltan campos obligatorios', async () => {
            const response = await request(app)
                .post('/diagnostico')
                .send({ id_cita: 1 }); // Faltan campos

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Faltan campos obligatorios para el diagnóstico.' });
        });

        test('debe crear diagnóstico, asignar medicamento y actualizar cita (Transacción Exitosa)', async () => {
            // Simulamos el insert del diagnóstico
            connection.query.mockResolvedValueOnce([{ insertId: 100 }]); 
            // Simulamos el insert del medicamento (no retorna insertId importante aquí)
            connection.query.mockResolvedValueOnce([{}]); 
            // Simulamos el update de la cita
            connection.query.mockResolvedValueOnce([{}]); 

            const response = await request(app)
                .post('/diagnostico')
                .send(payloadValido);

            // Verificamos el flujo de la transacción
            expect(pool.getConnection).toHaveBeenCalled();
            expect(connection.beginTransaction).toHaveBeenCalled();
            expect(connection.query).toHaveBeenCalledTimes(3); // Diag, Med, Cita
            expect(connection.commit).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                id_diagnostico: 100,
                mensaje: 'Diagnóstico registrado, medicamento asignado y cita actualizada exitosamente.'
            });
        });

        test('debe retornar 400 y hacer rollback si la cita ya tiene diagnóstico (ER_DUP_ENTRY)', async () => {
            const errorDuplicado = new Error('Duplicado');
            errorDuplicado.code = 'ER_DUP_ENTRY';
            
            // Falla en el primer insert
            connection.query.mockRejectedValueOnce(errorDuplicado);

            const response = await request(app)
                .post('/diagnostico')
                .send(payloadValido);

            expect(connection.rollback).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Ya existe un diagnóstico registrado para esta cita.' });
        });

        test('debe retornar 500 y hacer rollback ante otros errores en la transacción', async () => {
            connection.query.mockRejectedValueOnce(new Error('Error inesperado de BD'));

            const response = await request(app)
                .post('/diagnostico')
                .send(payloadValido);

            expect(connection.rollback).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(response.status).toBe(500);
        });
    });

    describe('PUT /diagnostico/:id', () => {
        const updatePayload = {
            id_tipo_diagnostico: 3,
            motivo: 'Revisión general',
            observaciones: 'Sin novedades',
            tratamiento_sugerido: 'Limpieza'
        };

        test('debe actualizar el diagnóstico exitosamente', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app)
                .put('/diagnostico/100')
                .send(updatePayload);

            expect(pool.query).toHaveBeenCalledWith(
                expect.any(String),
                [3, 'Revisión general', 'Sin novedades', 'Limpieza', '100']
            );
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ mensaje: 'Diagnóstico actualizado exitosamente' });
        });

        test('debe devolver 404 si el diagnóstico no existe (affectedRows === 0)', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const response = await request(app)
                .put('/diagnostico/999')
                .send(updatePayload);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ mensaje: 'Diagnóstico no encontrado' });
        });

        test('debe devolver 500 si falla la BD', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error al actualizar'));

            const response = await request(app)
                .put('/diagnostico/100')
                .send(updatePayload);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error al actualizar' });
        });
        test('debe crear diagnóstico sin medicamento y sin dosis (evalúa ramas condicionales)', async () => {
            const payloadBasico = {
                id_cita: 2,
                id_tipo_diagnostico: 1,
                motivo: 'Control de rutina',
                observaciones: 'Sin novedades',
                tratamiento_sugerido: 'Ninguno'
                // No enviamos 'medicamento' ni 'dosis'
            };

            // Simulamos el insert del diagnóstico
            connection.query.mockResolvedValueOnce([{ insertId: 101 }]); 
            // Simulamos el update de la cita (ya que se salta el insert del medicamento)
            connection.query.mockResolvedValueOnce([{}]); 

            const response = await request(app)
                .post('/diagnostico')
                .send(payloadBasico);

            // Verificamos que query se llame solo 2 veces (Diag y Cita) y NO 3
            expect(connection.query).toHaveBeenCalledTimes(2); 
            expect(connection.commit).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();

            expect(response.status).toBe(201);
            expect(response.body.id_diagnostico).toBe(101);
        });

        test('debe manejar error si falla pool.getConnection() (evalúa connection undefined en catch/finally)', async () => {
            // Simulamos que la conexión a la BD se cae antes de empezar la transacción
            pool.getConnection.mockRejectedValueOnce(new Error('Fallo al obtener conexión'));

            const response = await request(app)
                .post('/diagnostico')
                .send({
                    id_cita: 1, 
                    id_tipo_diagnostico: 2, 
                    motivo: 'Muela rota', 
                    observaciones: 'Dolor severo', 
                    tratamiento_sugerido: 'Extracción'
                });

            // En este caso, rollback no debe llamarse porque 'connection' nunca se creó
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Fallo al obtener conexión' });
        });
    });
});