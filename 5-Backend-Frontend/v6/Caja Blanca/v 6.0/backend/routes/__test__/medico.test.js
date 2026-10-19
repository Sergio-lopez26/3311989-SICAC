import request from 'supertest';
import express from 'express';
import router from '../medico.js';

//Aquí se simula el módulo de la BD
jest.mock('../../db.js');
import pool from '../../db.js';

//Se crea un app de Express mínima para solo hacer los test
const app = express();
app.use(express.json());
app.use('/medico', router);

describe('Pruebas de Caja Blanca - Medico', () =>{

    beforeEach(() => {
        jest.resetAllMocks(); //Para borrar los historiales de llamadas y mocks de test previos, y evitar falsos negativos
    });

    //GET / búsqueda general
    test('GET / debe retornar la búsqueda general de los médicos', async () => {
        const mock = [
            {
                id: 1, id_usuario: 1, id_tipo_documento: 1, numero_documento: '1111222333', email: 'test@a.com',  
                nombres: 'test medico', apellidos: 'tests medicos', matricula_profesional: 'TEST-01-26',  
                numero_celular: '3203123456', estado_medico: 'activo'
            },
            {
                id: 1, id_usuario: 2, id_tipo_documento: 1, numero_documento: '2222333444', email: 'prueba@a.com', 
                nombres: 'pruebas medica', apellidos: 'pruebas medicas', matricula_profesional: 'PRUEBA-02-26',  
                numero_celular: '3207891234', estado_medico: 'activo'
            },
        ];
        pool.query
            .mockResolvedValueOnce([mock])  // Array que creamos para simular datos

        const res = await request(app).get('/medico');

        expect(res.statusCode).toBe(200); //Acá se evalúa que la consula sea exitosa
    });

    test('GET /:id debe retornar 404 si no existe el medico', async () => {
        pool.query.mockResolvedValueOnce([[]]); // Array vacío
        const res = await request(app).get('/medico/1');
        expect(res.statusCode).toBe(404);
    });

    test('GET /:id debe retornar el paciente si existe', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1 }]]);
        const res = await request(app).get('/medico/1');
        expect(res.statusCode).toBe(200);
    });

    //POST
    //Este tipo de test es para aquellas tablas con más campos
    test('POST / debe rechazar, si faltan campos requeridos', async () => {
        const res = await request(app)
            .post('/medico')
            .send({
                numero_documento: null
            }); 
        expect(res.statusCode).toBe(400);
        expect(pool.query).not.toHaveBeenCalled(); //No debe tocar la BD
    });

    test('POST / debe rechazar médico duplicado', async () => {
        pool.query.mockResolvedValueOnce([[{ id_tipo_documento: 1, numero_documento: '1111222333', matricula_profesional: 'TEST-01-26' }]]);
        const res = await request(app).post('/medico').send({
            id_usuario: 1, id_tipo_documento: 1, numero_documento: '1111222333', email: 'test@a.com', password: '12345678', 
            nombres: 'test medico', apellidos: 'tests medicos', matricula_profesional: 'TEST-01-26',  
            numero_celular: '3203123456', estado_medico: 'activo'
        });
        expect(res.statusCode).toBe(400);

        //Con este añadido, se puede validar la coherencia del test, cambiando el valor para que falle []
        expect(pool.query).toHaveBeenCalledWith(
            'SELECT id FROM medico WHERE (id_tipo_documento = ? and numero_documento = ?) or matricula_profesional = ?',
            [1, '1111222333', 'TEST-01-26'] 
        ); //Acá va la consulta, tal cual en el backend
    });

    test('POST / debe rechazar si el usuario ya existe como paciente', async () => {
        pool.query.mockResolvedValueOnce([[]]); //Array vacío
        pool.query.mockResolvedValueOnce([[{ id: 1 }]]); //Simulamos que existe ya un id
        const res = await request(app).post('/medico').send({
            id_usuario: 1, id_tipo_documento: 1, numero_documento: '1111222333', email: 'test@a.com', password: '12345678', 
            nombres: 'test medico', apellidos: 'tests medicos', matricula_profesional: 'TEST-01-26',  
            numero_celular: '3203123456', estado_medico: 'activo'
        });
        expect(res.statusCode).toBe(400);

        //Con este añadido, se puede validar la coherencia del test, cambiando el valor de las llamadas [] para que falle
        expect(pool.query.mock.calls[1][0]).toBe(
        'SELECT id FROM paciente WHERE id_usuario = ?', //Esta consulta es la misma del back, aunque la segunda del post, de ahi que colocamos el [1]
        );
        expect(pool.query.mock.calls[1][1]).toEqual([1]); //toEqual([id])
    });

    //Estos son para en caso falte llenar ciertos campos con sus respectivas validaciones individuales
    test('POST / debe rechazar, si los nombres no cumplen con las validaciones', async () => {
        const res = await request(app)
            .post('/medico')
            .send({ nombres: 123}); //Poniendo números, se rechaza el envío, ya que es un campo con validaciones

        expect(res.statusCode).toBe(400);
        expect(pool.query).not.toHaveBeenCalled(); //No debe tocar la BD
    });

    test('POST / debe rechazar, si los apellidos no cumplen con las validaciones', async () => {
        const res = await request(app)
            .post('/medico')
            .send({ apellidos: 123}); //Poniendo números, se rechaza el envío, ya que es un campo con validaciones

        expect(res.statusCode).toBe(400);
        expect(pool.query).not.toHaveBeenCalled(); //No debe tocar la BD
    });
    //

    test('POST / debe crear médico exitosamente', async () => {
        pool.query
            .mockResolvedValueOnce([[]]) //No existe -> Array vacío, para que se asuma que la BD simulada no tiene datos
            .mockResolvedValueOnce([{ affectedRows: 1 }]); //Insert OK
        const res = await request(app).post('/medico').send({
            id_usuario: 1, id_tipo_documento: 1, numero_documento: '1111222333', email: 'test@a.com', password: '12345678', 
            nombres: 'test medico', apellidos: 'tests medicos', matricula_profesional: 'TEST-01-26',  
            numero_celular: '3203123456', estado_medico: 'activo'
        });
        expect(res.statusCode).toBe(201);
    });

    //PUT/id
    test('PUT / debe rechazar si hay campos vacios', async () => {
        const res = await request(app)
            .put('/medico/1')
            .send({ numero_documento: null, email: 'test@a.com' });

        expect(res.statusCode).toBe(400);
        expect(pool.query).not.toHaveBeenCalled(); 
    });

    test('PUT / debe retornar 404 si no hay una contraseña encontrada', async () => {
        pool.query.mockResolvedValueOnce([[]]);
        const res = await request(app).put('/medico/1').send({
            id_usuario: 1, id_tipo_documento: 1, numero_documento: '1111222333', email: 'test@a.com', password: '12345678', 
            nombres: 'test medico', apellidos: 'tests medicos', matricula_profesional: 'TEST-01-26',  
            numero_celular: '3203123456', estado_medico: 'activo'
        });
        expect(res.statusCode).toBe(404);
    });

    test('PUT / debe retornar 404 si no existe el médico', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1 }]]);
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
        const res = await request(app).put('/médico/1').send({
            id_usuario: 1, id_tipo_documento: 1, numero_documento: '1111222333', email: 'test@a.com', password: '12345678', 
            nombres: 'test medico', apellidos: 'tests medicos', matricula_profesional: 'TEST-01-26',  
            numero_celular: '3203123456', estado_medico: 'activo'
        });
        expect(res.statusCode).toBe(404);
    });

    test('PUT / debe retornar 404 si no existe el médico y no se cambia la contraseña', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1 }]]);
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
        const res = await request(app).put('/medico/1').send({
            id_usuario: 1, id_tipo_documento: 1, numero_documento: '1111222333', email: 'test@a.com', password: '********', 
            nombres: 'test medico', apellidos: 'tests medicos', matricula_profesional: 'TEST-01-26',  
            numero_celular: '3203123456', estado_medico: 'activo'
        });
        expect(res.statusCode).toBe(404);
    });

    test('PUT / debe actualizar exitosamente', async () => {
        pool.query.mockResolvedValueOnce([[{ id_usuario: 1, id_tipo_documento: 1}]]);
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = await request(app).put('/medico/1').send({
            id_usuario: 1, id_tipo_documento: 1, numero_documento: '1111222333', email: 'test@a.com', password: '12345678', 
            nombres: 'test medico', apellidos: 'tests medicos', matricula_profesional: 'TEST-01-26',  
            numero_celular: '3203123456', estado_medico: 'activo'
        });

        expect(res.statusCode).toBe(200);
    });

    //DELETE/:id
    test('DELETE / debe retornar 404 si no existe el médico', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
        const res = await request(app).delete('/medico/1');
        expect(res.statusCode).toBe(404);
    });

    test('DELETE / debe eliminar exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = await request(app).delete('/medico/1');
        expect(res.statusCode).toBe(200);
    });
});

describe('Manejo de Errores de Base de Datos (Catch)', () => {

    test('GET / debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));
        const res = await request(app).get('/medico');
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Fallo de conexión');
    });

    test('GET/:id / debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));
        const res = await request(app).get('/medico/1');
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Fallo de conexión');
    });

    test('POST / debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));

        //Solo para que se silencie el console.error que sale, ya que en si el test está bien, porque arroja el status 500 y es lo ideal
        const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});

        const res = await request(app).post('/medico').send({
            id_usuario: 1, id_tipo_documento: 1, numero_documento: '1111222333', email: 'test@a.com', password: '12345678', 
            nombres: 'test medico', apellidos: 'tests medicos', matricula_profesional: 'TEST-01-26',  
            numero_celular: '3203123456', estado_medico: 'activo'
        });
        expect(res.statusCode).toBe(500);

        silencio.mockRestore(); //Aca restaura el console.error
    });

    test('PUT /:id debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).put('/medico/1').send({
            id_usuario: 1, id_tipo_documento: 1, numero_documento: '1111222333', email: 'test@a.com', password: '12345678', 
            nombres: 'test medico', apellidos: 'tests medicos', matricula_profesional: 'TEST-01-26',  
            numero_celular: '3203123456', estado_medico: 'activo'
        });
        expect(res.statusCode).toBe(500);
    });

    test('DELETE /:id debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).delete('/medico/1');
        expect(res.statusCode).toBe(500);
    });
});
