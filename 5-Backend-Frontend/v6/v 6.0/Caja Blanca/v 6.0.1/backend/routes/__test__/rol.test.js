import request from 'supertest';
import express from 'express';
import router from '../rol.js';

//Aquí se simula el módulo de la BD
jest.mock('../../db.js');
import pool from '../../db.js';

//Se crea un app de Express mínima para solo hacer los test
const app = express();
app.use(express.json());
app.use('/rol', router);

describe('Pruebas de Caja Blanca - Rol', () =>{

    beforeEach(() => {
        jest.resetAllMocks(); //Para borrar los historiales de llamadas y mocks de test previos, y evitar falsos negativos
    });

    //GET
    //Esto es para paginación -> Lo cual no implementamos
    /*test('GET / sin búsqueda, debe retornar lista paginada', async () => {
        //Se configura el mock: 1ra llamada devuelve rows. 2nda devuelve total
        pool.query
            .mockResolvedValueOnce([[{ rol: 'Test', nombreProveedor: 'Test' }]])
            .mockResolvedValueOnce([[{ total: 10 }]]);
    
        const res = await request(app).get('/rol');

        expect(res.statusCode).toBe(200);
        expect(res.body.proveedores).toHaveLength(1);
        expect(res.body.pagination.totalPages).toBe(2);
        expect(pool.query).toHaveBeenCalledTimes(2);
    });*/

    //GET / búsqueda general
    test('GET / debe retornar la búsqueda general de los roles', async () => { //El tema es que nuestro get es general, no específico
        const mock = [
            {id: 1, rol: 'test'},
            {id: 2, rol: 'nuevo'}
        ];
        pool.query
            .mockResolvedValueOnce([mock])  // Array que creamos para simular datos

        const res = await request(app).get('/rol');

        expect(res.statusCode).toBe(200); //Acá se evalúa que la consula sea exitosa
    });

    //GET / búsqueda con where -> La cual no tenemos para esta "ruta", pero lo dejaré para ejemplo y uso en rutas que si lo tengan
    /*test('GET / con búsqueda debe construir query con WHERE', async () => {
        pool.query
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[{ total: 0 }]]);


        await request(app).get('/rol?search=test');


        const queryEjecutada = pool.query.mock.calls[0][0];
        expect(queryEjecutada).toContain('WHERE');
        expect(queryEjecutada).toContain('rol LIKE ?');
    });*/

    //GET /:id -> Ya que en el frontend, usamos el filter para consultas especificas, aun así el ejemplo para rutas que si lo tengan incluido en backend
    /*test('GET /:id debe retornar 404 si no existe el rol', async () => {
        pool.query.mockResolvedValueOnce([[]]); // Array vacío
        const res = await request(app).get('/rol/paciente');
        expect(res.statusCode).toBe(404);
    });*/

    /*Lo mismo un GET especifico -> Ejemplo para cuando se requiera
    test('GET /:id debe retornar el rol si existe', async () => {
        pool.query.mockResolvedValueOnce([[{ rol: '1' }]]);
        const res = await request(app).get('/rol/1');
        expect(res.statusCode).toBe(200);
        expect(res.body.rol).toBe('1');
    });*/

    //POST
    //Este tipo de test es para aquellas tablas con más campos
    test('POST / debe rechazar, si faltan campos requeridos', async () => {
        const res = await request(app)
            .post('/rol')
            .send({ rol: null}); //Con el rol vacío el sistema debe rechar el envío, ya que es un campo requerido y no null

        expect(res.statusCode).toBe(400);
        expect(pool.query).not.toHaveBeenCalled(); //No debe tocar la BD
    });

    //En cambio este otro test si aplica para rol, ya que tenemos en el backend validaciones
    test('POST / debe rechazar, si el rol no cumple con las validaciones', async () => {
        const res = await request(app)
            .post('/rol')
            .send({ rol: 123}); //Poniendo números, se rechaza el envío, ya que es un campo con validaciones

        expect(res.statusCode).toBe(400);
        expect(pool.query).not.toHaveBeenCalled(); //No debe tocar la BD
    });

    test('POST / debe rechazar rol duplicado', async () => {
        pool.query.mockResolvedValueOnce([[{ rol: 'test' }]]); //Ya existe, por que le decimos a la simulacion que hay un rol que es test
        const res = await request(app).post('/rol').send({
            rol: 'test' //Acá se colocan los campos
        });
        expect(res.statusCode).toBe(400);

        //Con este añadido, se puede validar la coherencia del test, cambiando el valor para que falle []
        expect(pool.query).toHaveBeenCalledWith(
            'SELECT rol FROM rol WHERE rol = ?',
            ['test'] 
        ); //Acá va la consulta, tal cual en el backend
    });

    test('POST / debe crear rol exitosamente', async () => {
        pool.query
            .mockResolvedValueOnce([[]]) //No existe -> Array vacío, para que se asuma que la BD simulada no tiene datos
            .mockResolvedValueOnce([{ affectedRows: 1 }]); //Insert OK
        const res = await request(app).post('/rol').send({
            rol: 'paciente'
        });
        expect(res.statusCode).toBe(201);
    });

    //PUT/id
    test('PUT / debe retornar 404 si no existe el rol', async () => {
        pool.query
            .mockResolvedValueOnce([{ affectedRows: 0 }]);
        const res = await request(app).put('/rol/1').send({ rol: 'X' });
        expect(res.statusCode).toBe(404); //Si colocamos 200. fallaria el test, porque el rol si existiria
    });

    test('PUT / debe rechazar si falta el campo rol para actualizar', async () => {
        const res = await request(app)
            .put('/rol/1')
            .send({}); //Dejamos vacío

        expect(res.statusCode).toBe(400);
        //expect(res.body).toEqual({ error: 'Falta el campo rol para actualizar' });
        expect(pool.query).not.toHaveBeenCalled(); 
    });

    test('PUT / debe actualizar exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = await request(app).put('/rol/1').send({
            rol: 'test'
        });

        expect(res.statusCode).toBe(200);
    });

    //DELETE/:id
    test('DELETE / debe retornar 404 si no existe el rol', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
        const res = await request(app).delete('/rol/1');
        expect(res.statusCode).toBe(404);
    });

    test('DELETE / debe eliminar exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = await request(app).delete('/rol/1');
        expect(res.statusCode).toBe(200);
    });
});

describe('Manejo de Errores de Base de Datos (Catch)', () => {

    test('GET / debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));
        const res = await request(app).get('/rol');
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Fallo de conexión');
    });

    //Va a fallar porque nuestro GET es general
    /*test('GET /:rol debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).get('/rol/1');
        expect(res.statusCode).toBe(500);
    });*/

    test('POST / debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));

        //Solo para que se silencie el console.error que sale, ya que en si el test está bien, porque arroja el status 500 y es lo ideal
        const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});

        const res = await request(app).post('/rol').send({
            rol: 'test'
        });
        expect(res.statusCode).toBe(500);

        silencio.mockRestore(); //Aca restaura el console.error
    });

    test('PUT /:id debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).put('/rol/1').send({
            rol: 'test'
        });
        expect(res.statusCode).toBe(500);
    });

    test('DELETE /:id debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).delete('/rol/1');
        expect(res.statusCode).toBe(500);
    });
});
