import request from 'supertest';
import express from 'express';
import router from '../tipo_documento.js';

//Aquí se simula el módulo de la BD
jest.mock('../../db.js');
import pool from '../../db.js';

//Se crea un app de Express mínima para solo hacer los test
const app = express();
app.use(express.json());
app.use('/tipo_documento', router);

describe('Pruebas de Caja Blanca - Tipo Documento', () =>{

    beforeEach(() => {
        jest.resetAllMocks(); //Para borrar los historiales de llamadas y mocks de test previos, y evitar falsos negativos
    });

    //GET / búsqueda general
    test('GET / debe retornar la búsqueda general de los tipos de documento', async () => {
        const mock = [
            {id: 1, sigla: 'TT', nombre_documento: 'Test'},
            {id: 2, sigla: 'PR', nombre_documento: 'Prueba'}
        ];
        pool.query
            .mockResolvedValueOnce([mock])  // Array que creamos para simular datos

        const res = await request(app).get('/tipo_documento');

        expect(res.statusCode).toBe(200); //Acá se evalúa que la consula sea exitosa
    });

    //POST
    //Este tipo de test es para aquellas tablas con más campos
    test('POST / debe rechazar, si faltan campos requeridos', async () => {
        const res = await request(app)
            .post('/tipo_documento')
            .send({ sigla: null}); 
        expect(res.statusCode).toBe(400);
        expect(pool.query).not.toHaveBeenCalled(); //No debe tocar la BD
    });

    test('POST / debe rechazar sigla duplicada', async () => {
        pool.query.mockResolvedValueOnce([[{ sigla: 'TT' }]]);
        const res = await request(app).post('/tipo_documento').send({
            sigla: 'TT', //Acá se colocan los campos
            nombre_documento: 'test'
        });
        expect(res.statusCode).toBe(400);

        //Con este añadido, se puede validar la coherencia del test, cambiando el valor para que falle []
        expect(pool.query).toHaveBeenCalledWith(
            'SELECT sigla FROM tipo_documento WHERE sigla = ?',
            ['TT'] 
        ); //Acá va la consulta, tal cual en el backend
    });

    test('POST / debe rechazar, si el nombre del documento no cumple con las validaciones', async () => {
        const res = await request(app)
            .post('/tipo_documento')
            .send({ nombre_documento: 123}); //Poniendo números, se rechaza el envío, ya que es un campo con validaciones

        expect(res.statusCode).toBe(400);
        expect(pool.query).not.toHaveBeenCalled(); //No debe tocar la BD
    });

    test('POST / debe crear tipo de documento exitosamente', async () => {
        pool.query
            .mockResolvedValueOnce([[]]) //No existe -> Array vacío, para que se asuma que la BD simulada no tiene datos
            .mockResolvedValueOnce([{ affectedRows: 1 }]); //Insert OK
        const res = await request(app).post('/tipo_documento').send({
            sigla: 'TT',
            nombre_documento: 'test'
        });
        expect(res.statusCode).toBe(201);
    });

    //PUT/id
    test('PUT / debe rechazar si hay campos vacios', async () => {
        const res = await request(app)
            .put('/tipo_documento/1')
            .send({ sigla: null, nombre_documento: 'test' });

        expect(res.statusCode).toBe(400);
        expect(pool.query).not.toHaveBeenCalled(); 
    });

    test('PUT / debe retornar 404 si no existe el tipo de documento', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
        const res = await request(app).put('/tipo_documento/1').send({ sigla: 'TT', nombre_documento: 'test' });
        expect(res.statusCode).toBe(404);
    });

    test('PUT / debe actualizar exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = await request(app).put('/tipo_documento/1').send({
            sigla: 'TT',
            nombre_documento: 'test'
        });

        expect(res.statusCode).toBe(200);
    });

    //DELETE/:id
    test('DELETE / debe retornar 404 si no existe el tipo de documento', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
        const res = await request(app).delete('/tipo_documento/1');
        expect(res.statusCode).toBe(404);
    });

    test('DELETE / debe eliminar exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = await request(app).delete('/tipo_documento/1');
        expect(res.statusCode).toBe(200);
    });
});

describe('Manejo de Errores de Base de Datos (Catch)', () => {

    test('GET / debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));
        const res = await request(app).get('/tipo_documento');
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Fallo de conexión');
    });

    test('POST / debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));

        //Solo para que se silencie el console.error que sale, ya que en si el test está bien, porque arroja el status 500 y es lo ideal
        const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});

        const res = await request(app).post('/tipo_documento').send({
            sigla: 'TT',
            nombre_documento: 'test'
        });
        expect(res.statusCode).toBe(500);

        silencio.mockRestore(); //Aca restaura el console.error
    });

    test('PUT /:id debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).put('/tipo_documento/1').send({
            sigla: 'TT',
            nombre_documento: 'test'
        });
        expect(res.statusCode).toBe(500);
    });

    test('DELETE /:id debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).delete('/tipo_documento/1');
        expect(res.statusCode).toBe(500);
    });
});
