import request from 'supertest';
import express from 'express';
import router from '../rol_usuario.js';

//Aquí se simula el módulo de la BD
jest.mock('../../db.js');
import pool from '../../db.js';

//Se crea un app de Express mínima para solo hacer los test
const app = express();
app.use(express.json());
app.use('/rol_usuario', router);

describe('Pruebas de Caja Blanca - Rol Usuario', () =>{

    beforeEach(() => {
        jest.resetAllMocks(); //Para borrar los historiales de llamadas y mocks de test previos, y evitar falsos negativos
    });

    //GET / búsqueda general
    test('GET / debe retornar la búsqueda general de los roles de usuario', async () => {
        const mock = [
            {id_rol: 1, id_usuario: 1},
            {id_rol: 2, id_usuario: 2}
        ];
        pool.query
            .mockResolvedValueOnce([mock])  // Array que creamos para simular datos

        const res = await request(app).get('/rol_usuario');

        expect(res.statusCode).toBe(200); //Acá se evalúa que la consula sea exitosa
    });

    //POST
    //Este tipo de test es para aquellas tablas con más campos
    test('POST / debe rechazar, si faltan campos requeridos', async () => {
        const res = await request(app)
            .post('/rol_usuario')
            .send({ id_rol: null}); 
        expect(res.statusCode).toBe(400);
        expect(pool.query).not.toHaveBeenCalled(); //No debe tocar la BD
    });

    test('POST / debe rechazar rol duplicado para el mismo usuario', async () => {
        pool.query.mockResolvedValueOnce([[{ id_rol: 1, id_usuario: 1 }]]);
        const res = await request(app).post('/rol_usuario').send({
            id_rol: 1,
            id_usuario: 1
        });
        expect(res.statusCode).toBe(400);

        //Con este añadido, se puede validar la coherencia del test, cambiando el valor para que falle []
        expect(pool.query).toHaveBeenCalledWith(
            'SELECT * FROM rol_usuario WHERE id_rol = ? and id_usuario = ?',
            [1, 1] 
        ); //Acá va la consulta, tal cual en el backend
    });

    test('POST / debe asignar rol al usuario exitosamente', async () => {
        pool.query
            .mockResolvedValueOnce([[]]) //No existe -> Array vacío, para que se asuma que la BD simulada no tiene datos
            .mockResolvedValueOnce([{ affectedRows: 1 }]); //Insert OK
        const res = await request(app).post('/rol_usuario').send({
            id_rol: 1,
            id_usuario: 1
        });
        expect(res.statusCode).toBe(201);
    });

    /*
    Al ser rol_usuario una tabla intermedia, su estructura cambia un poco:
    - Ya no se puede actualizar, sino mas bien, se elimina una asignacion y se crea una nueva, pero no se edita
    - Adicionalmente, para eliminar, se necesita si o si los datos de ambos campos (id_rol y id_usuario) -> Esto para
        evitar eliminar todos los usuarios que tienen asignado un mismo rol
    */

    //DELETE/:id
    test('DELETE / debe retornar 404 si no existe el rol asignado al usuario', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
        const res = await request(app).delete('/rol_usuario/1/1');
        expect(res.statusCode).toBe(404);
    });

    test('DELETE / debe eliminar exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = await request(app).delete('/rol_usuario/1/1');
        expect(res.statusCode).toBe(200);
    });
});

describe('Manejo de Errores de Base de Datos (Catch)', () => {

    test('GET / debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));
        const res = await request(app).get('/rol_usuario');
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Fallo de conexión');
    });

    test('POST / debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));

        //Solo para que se silencie el console.error que sale, ya que en si el test está bien, porque arroja el status 500 y es lo ideal
        const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});

        const res = await request(app).post('/rol_usuario').send({
            id_rol: 1,
            id_usuario: 1
        });
        expect(res.statusCode).toBe(500);

        silencio.mockRestore(); //Aca restaura el console.error
    });

    test('DELETE /:id debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).delete('/rol_usuario/1/1');
        expect(res.statusCode).toBe(500);
    });
});
