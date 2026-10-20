import request from 'supertest';
import express from 'express';

//Aquí se simula el módulo de la BD
jest.mock('../../db.js');
import pool from '../../db.js';

import bcrypt from 'bcrypt'; //Se importa el bcrypt
jest.mock('bcrypt');

//Aquí vamos a simular el email con que enviamos el cod de validación desde la ruta
jest.mock('../../utils/mailer.js', () => {
    return{
        enviarCodigoRecuperacion: jest.fn() //Retornamos el await en la ruta, para envio del código simulado
    }
});
import emailSimulado from '../../utils/mailer.js';

import router from '../usuario.js'; //Lo dejamos acá abajo para, que primero se cargue el mailer y luego la ruta

//Se crea un app de Express mínima para solo hacer los test
const app = express();

app.use(express.json());
app.use('/usuario', router);

describe('Pruebas de Caja Blanca - Usuario', () =>{

    beforeEach(() => {
        jest.resetAllMocks(); //Para borrar los historiales de llamadas y mocks de test previos, y evitar falsos negativos
    });

    //GET
    //GET / búsqueda general -> Sin mostrar password (por seguridad en el backend)
    test('GET / debe retornar la búsqueda general de los usuarios', async () => {
        const mock = [
            {id: 1, email: 'a@a.net'},
            {id: 2, email: 'b@b.net'}
        ];
        pool.query
            .mockResolvedValueOnce([mock])  // Array que creamos

        const res = await request(app).get('/usuario');

        expect(res.statusCode).toBe(200); //Acá se evalúa que la consula sea exitosa
        expect(res.body).toEqual(mock); //Este es para que se iguale la consulta del backend con la BD simulada
        expect(res.body[0].password).toBeUndefined(); 
    });

    //POST
    //Este tipo de test es para aquellas tablas con más campos
    test('POST / debe rechazar, si faltan campos requeridos', async () => {
        const res = await request(app)
            .post('/usuario')
            .send({ email: null, password: '123456789'}); //Con el email vacío el sistema debe rechar el envío, ya que es un campo requerido y no null

        expect(res.statusCode).toBe(400);
        expect(pool.query).not.toHaveBeenCalled(); //No debe tocar la BD
    });

    test('POST / debe rechazar email duplicado', async () => {
        pool.query.mockResolvedValueOnce([[{ email: 'test@a.com', password: '123456789', id_paciente: 1 }]]); //Ya existe, por que le decimos a la simulacion que hay un email que es test@a.com
        const res = await request(app).post('/usuario').send({
            email: 'test@a.com', //Acá se colocan los campos
            password: '123456789'
        });
        expect(res.statusCode).toBe(400);

        //Con este añadido, se puede validar la coherencia del test, cambiando el valor para que falle []
        expect(pool.query).toHaveBeenCalledWith(
            `SELECT u.id, u.email, p.id AS id_paciente 
            FROM usuario u 
            LEFT JOIN paciente p ON u.id = p.id_usuario 
            WHERE u.email = ?`,
            ['test@a.com'] 
        ); //Acá va la consulta, tal cual en el backend
    });

    test('POST / debe rechazar si el formato de email no es valido', async () => {
        pool.query.mockResolvedValueOnce([[]]);
        const res = await request(app).post('/usuario').send({
            email: 'test@a', //Acá se colocan los campos
            password: '123456789'
        });
        expect(res.statusCode).toBe(400);
    });

    test('POST / debe crear usuario exitosamente', async () => {
        pool.query
            .mockResolvedValueOnce([[]]) //No existe -> Array vacío, para que se asuma que la BD simulada no tiene datos
            .mockResolvedValueOnce([{ affectedRows: 1 }]); //Insert OK
        const res = await request(app).post('/usuario').send({
            email: 'test@a.com',
            password: '123456789'
        });
        expect(res.statusCode).toBe(201);
    });

    test('POST / debe rechazar usuario, si ya esta registrado pero no ha completado su registro como paciente', async () => {
        pool.query
            .mockResolvedValueOnce([[{ email: 'test@a.com', password: '123456789', id_paciente: null }]]); 
        const res = await request(app).post('/usuario').send({
            email: 'test@a.com',
            password: '123456789'
        });
        expect(res.statusCode).toBe(200);
    });

    // POST/login
    test('POST/Login / debe rechazar si no está digitado el email/contraseña', async () => {
        pool.query.mockResolvedValueOnce([[{ email: 'test@a.com', password: '123456789' }]]);
        const res = await request(app).post('/usuario/login').send({
            email: null, //Acá se colocan los campos
            password: '123456789'
        });
        expect(res.statusCode).toBe(400);
    });

    test('POST/Login / debe rechazar si el email no existe', async () => {
        pool.query.mockResolvedValueOnce([[]]);
        const res = await request(app).post('/usuario/login').send({
            email: 'test@aa.com', //Acá se colocan los campos
            password: '12345678910'
        });
        expect(res.statusCode).toBe(401);
    });

    test('POST/Login / debe rechazar si la contraseña con hash de Laravel no coincide con la registrada', async () => {
        pool.query.mockResolvedValueOnce([[{ email: 'test@a.com', password: '$2y$10$hashSimuladoLaravel' }]]);
        bcrypt.compare.mockResolvedValueOnce(false);
        const res = await request(app).post('/usuario/login').send({
            email: 'test@aa.com', //Acá se colocan los campos
            password: '12345678910'
        });
        expect(res.statusCode).toBe(401);
    });

    test('POST/Login / debe rechazar si la contraseña plana no coincide con la registrada', async () => {
        pool.query.mockResolvedValueOnce([[{ email: 'test@a.com', password: '12345678' }]]);
        bcrypt.compare.mockResolvedValueOnce(false);
        const res = await request(app).post('/usuario/login').send({
            email: 'test@aa.com', //Acá se colocan los campos
            password: '12345678910'
        });
        expect(res.statusCode).toBe(401);
    });

    test('POST/Login / el usuario existe pero no está registrado como paciente ni como medico', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1, email: 'test@a.com', password: '123456789' }]]);
        pool.query.mockResolvedValueOnce([[{ rol: null, nombre_paciente: null, apellido_paciente: null, nombre_medico: null, apellido_medico: null }]]);
        const res = await request(app).post('/usuario/login').send({
            email: 'test@a.com', //Acá se colocan los campos
            password: '123456789'
        });
        
        expect(res.statusCode).toBe(200);
    });

    test('POST/Login / debe loguearse el usuario (paciente) con las credenciales correctas', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1, email: 'test@a.com', password: '123456789' }]]);
        pool.query.mockResolvedValueOnce([[{ 
            rol: 'paciente', 
            nombre_paciente: 'Test', 
            apellido_paciente: 'Nuevo', 
            nombre_medico: null, 
            apellido_medico: null 
        }]]);
        const res = await request(app).post('/usuario/login').send({
            email: 'test@a.com', //Acá se colocan los campos
            password: '123456789'
        });
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            mensaje: 'Ingreso exitoso',
            usuario: {
                id: 1,
                email: 'test@a.com',
                rol: 'paciente',
                nombre_completo: 'Test Nuevo',
            }
        });
    });

    test('POST/Login / debe loguearse el usuario (medico) con las credenciales correctas', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1, email: 'test@a.com', password: '123456789' }]]);
        pool.query.mockResolvedValueOnce([[{ 
            rol: 'medico', 
            nombre_paciente: null, 
            apellido_paciente: null, 
            nombre_medico: 'Test', 
            apellido_medico: 'Nuevo' 
        }]]);
        const res = await request(app).post('/usuario/login').send({
            email: 'test@a.com', //Acá se colocan los campos
            password: '123456789'
        });
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            mensaje: 'Ingreso exitoso',
            usuario: {
                id: 1,
                email: 'test@a.com',
                rol: 'medico',
                nombre_completo: 'Test Nuevo',
            }
        });
    });

    test('POST/Login / debe loguearse el usuario con rol (test solo para prueba de algo que no sucedera desde el frontend)', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1, email: 'test@a.com', password: '123456789' }]]);
        pool.query.mockResolvedValueOnce([[{ 
            rol: 'medico', 
            nombre_paciente: null, 
            apellido_paciente: null, 
            nombre_medico: null, 
            apellido_medico: null 
        }]]);
        const res = await request(app).post('/usuario/login').send({
            email: 'test@a.com', //Acá se colocan los campos
            password: '123456789'
        });
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            mensaje: 'Ingreso exitoso',
            usuario: {
                id: 1,
                email: 'test@a.com',
                rol: 'medico',
                nombre_completo: 'Usuario',
            }
        });
    });

    test('POST/Login / debe asignarse sin_rol al usuario que no tiene rol alguno asignado', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1, email: 'test@a.com', password: '123456789' }]]);
        pool.query.mockResolvedValueOnce([[{ 
            rol: null, 
            nombre_paciente: 'Test', 
            apellido_paciente: 'Nuevo', 
            nombre_medico: null, 
            apellido_medico: null 
        }]]);
        const res = await request(app).post('/usuario/login').send({
            email: 'test@a.com', //Acá se colocan los campos
            password: '123456789'
        });
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            mensaje: 'Ingreso exitoso',
            usuario: {
                id: 1,
                email: 'test@a.com',
                rol: 'sin_rol',
                nombre_completo: 'Test Nuevo',
            }
        });
    });

    test('POST/Login / el usuario existe y tiene múltiples roles', async () => {
        const mock = [
            {
                rol: 'paciente', 
                nombre_paciente: 'Test', 
                apellido_paciente: 'Tests', 
                nombre_medico: null, 
                apellido_medico: null 
            },
            {
                rol: 'medico', 
                nombre_paciente: null, 
                apellido_paciente: null, 
                nombre_medico: 'Test', 
                apellido_medico: 'Tests' 
            }
        ];

        pool.query.mockResolvedValueOnce([[{ id: 1, email: 'test@a.com', password: '123456789' }]]);
        pool.query.mockResolvedValueOnce([mock]);
        const res = await request(app).post('/usuario/login').send({
            email: 'test@a.com', //Acá se colocan los campos
            password: '123456789'
        });
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            ElegirRol: true,
            mensaje: 'El usuario cuenta con múltiples roles asignados',
            usuarioReal: {
                id: 1,
                email: 'test@a.com',
                nombre_completo: 'Test Tests',
                roles: ['paciente', 'medico']
            }
        });
    });

    //Estos son para en caso se haya olvidado el password/contraseña y se desee recuperar
    //POST/verifica_email
    test('POST/Verifica email / debe rechazar si no está digitado el email', async () => {
        pool.query.mockResolvedValueOnce([[]]);
        const res = await request(app).post('/usuario/verifica_email').send({
            email: null
        });
        expect(res.statusCode).toBe(400);
    });

    test('POST/Verifica email / debe retornar 404 si el email no está registrado', async () => {
        pool.query.mockResolvedValueOnce([[]]);
        const res = await request(app).post('/usuario/verifica_email').send({
            email: 'test@a.com'
        });
        expect(res.statusCode).toBe(404);
    });

    test('POST/Verifica email / si el email está registrado se enviará el codigo de validacion', async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1, email: 'test@a.com', password: '123456789' }]]);
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
        //Se simula el envío exitoso del codigo
        emailSimulado.enviarCodigoRecuperacion.mockResolvedValueOnce(true);
        const res = await request(app).post('/usuario/verifica_email').send({
            email: 'test@a.com'
        });
        expect(res.statusCode).toBe(200);
    });

    //POST/validar codigo
    test('POST/Validar codigo / debe rechazar si no está digitado el codigo de validación previamente enviado', async () => {
        pool.query.mockResolvedValueOnce([[]]);
        const res = await request(app).post('/usuario/validar_codigo').send({
            email: 'test@a.com',
            codigo: null
        });
        expect(res.statusCode).toBe(400);
    });

    test('POST/Validar codigo / debe rechazar si no se ha solicitado un codigo de validaacion para el email', async () => {
        pool.query.mockResolvedValueOnce([[{ 
            id: 1, 
            email: 'test@a.com', 
            password: '123456789',
            reset_code: null,
            reset_expira: null
        }]]);
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
        const res = await request(app).post('/usuario/validar_codigo').send({
            email: 'test@a.com',
            codigo: '123456'
        });
        expect(res.statusCode).toBe(400);
    });

    test('POST/Validar codigo / debe rechazar si el email no existe', async () => {
        pool.query.mockResolvedValueOnce([[]]);
        const res = await request(app).post('/usuario/validar_codigo').send({
            email: 'test@a.com',
            codigo: '123456'
        });
        expect(res.statusCode).toBe(400);
    });

    test('POST/Validar codigo / debe rechazar si el codigo de validación expiró', async () => {
        const fechaPasada = new Date(Date.now() - 15 * 60 * 1000); //15 minutos pasados
        pool.query.mockResolvedValueOnce([[{
            id: 1, 
            email: 'test@a.com', 
            reset_code: '123456',
            reset_expira: fechaPasada
        }]]);
        const res = await request(app).post('/usuario/validar_codigo').send({
            email: 'test@a.com',
            codigo: '123456'
        });
        expect(res.statusCode).toBe(400);
    });

    test('POST/Validar codigo / debe rechazar si el codigo de validacion no es el enviado', async () => {
        const fechaFalta = new Date(Date.now() + 15 * 60 * 1000); //15 minutos faltan
        pool.query.mockResolvedValueOnce([[{
            id: 1, 
            email: 'test@a.com', 
            reset_code: '$123456',
            reset_expira: fechaFalta
        }]]);
        bcrypt.compare.mockResolvedValueOnce(false); //Con esto se hace la comparacion del codigo sea falsa, ya que en teoría el codigo se encripta
        const res = await request(app).post('/usuario/validar_codigo').send({
            email: 'test@a.com',
            codigo: '123456'
        });
        expect(res.statusCode).toBe(400);
    });

    test('POST/Validar codigo / si el codigo de validacion es correcto', async () => {
        const fechaFalta = new Date(Date.now() + 15 * 60 * 1000);
        pool.query.mockResolvedValueOnce([[{
            id: 1, 
            email: 'test@a.com', 
            reset_code: '123456',
            reset_expira: fechaFalta
        }]]);
        bcrypt.compare.mockResolvedValueOnce(true); //Con esto ya si la comparación es verdadera, ya que en teoría el codigo se encripta
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = await request(app).post('/usuario/validar_codigo').send({
            email: 'test@a.com',
            codigo: '123456'
        });
        expect(res.statusCode).toBe(200);
    });
    //

    //PUT/id
    test('PUT / debe retornar 404 si no existe el usuario', async () => {
        pool.query
            .mockResolvedValueOnce([{ affectedRows: 0 }]);
        const res = await request(app).put('/usuario/1').send({ email: 'X@x.com', password: '123456789' });
        expect(res.statusCode).toBe(404); //Si colocamos 200. fallaria el test, porque el rol si existiria
    });

    test('PUT / debe rechazar si faltan campos para actualizar', async () => {
        const res = await request(app)
            .put('/usuario/1')
            .send({}); //Dejamos vacío

        expect(res.statusCode).toBe(400);
        expect(pool.query).not.toHaveBeenCalled(); 
    });

    test('PUT / debe actualizar exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = await request(app).put('/usuario/1').send({
            email: 'test@a.com',
            password: '123456789'
        });

        expect(res.statusCode).toBe(200);
    });

    //Este es para en caso se haya olvidado el password/contraseña y se va a cambiar despues de los pasos correspondientes de recuperacion
    //PUT/reset password
    test('PUT/Reset password / debe rechazar si no se ha ingresado el email y el nuevo password', async () => {
        const res = await request(app).put('/usuario/reset_password').send({}); //Dejamos vacío

        expect(res.statusCode).toBe(400);
        expect(pool.query).not.toHaveBeenCalled(); 
    });

    test('PUT/Reset password / debe rechazar si el nuevo password/contraseña es inferior a 8 caractéres', async () => {
        const res = await request(app).put('/usuario/reset_password').send({
            email: 'test@a.com',
            codigo: '123456',
            password: '1234567'
        });

        expect(res.statusCode).toBe(400);
        expect(pool.query).not.toHaveBeenCalled(); 
    });

    test('PUT/Reset password / debe retornar 404 si el usuario no es encontrado o el tiempo expiró', async () => {
        pool.query.mockResolvedValueOnce([[]]);
        const res = await request(app).put('/usuario/reset_password').send({
            email: 'test@a.com',
            password: '12345678'
        });

        expect(res.statusCode).toBe(404);
        expect(pool.query).toHaveBeenCalled(); //se quita el not, solo para validar la llamada
    });

    test('PUT/Reset password / debe rechazar si no se valido el codigo de validación', async () => {
        pool.query.mockResolvedValueOnce([[{
            id: 1,
            reset_verificado: 0
        }]]);
        const res = await request(app).put('/usuario/reset_password').send({
            email: 'test@a.com',
            password: '12345678'
        });

        expect(res.statusCode).toBe(401);
        expect(pool.query).toHaveBeenCalled(); //se quita el not, solo para validar la llamada
    });

    test('PUT/Reset password / debe actualizar la contraseña/password', async () => {
        pool.query.mockResolvedValueOnce([[{
            id: 1,
            reset_verificado: 1
        }]]);
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = await request(app).put('/usuario/reset_password').send({
            email: 'test@a.com',
            password: '12345678'
        });

        expect(res.statusCode).toBe(200);
        expect(pool.query).toHaveBeenCalledTimes(2); //Esto para constatar llamada a Select y Update de la BD
    });
    //

    //DELETE/:id
    test('DELETE / debe retornar 404 si no existe el rol', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
        const res = await request(app).delete('/usuario/1');
        expect(res.statusCode).toBe(404);
    });

    test('DELETE / debe eliminar exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = await request(app).delete('/usuario/1');
        expect(res.statusCode).toBe(200);
    });
});

describe('Manejo de Errores de Base de Datos (Catch)', () => {

    test('GET / debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));
        const res = await request(app).get('/usuario');
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Fallo de conexión');
    });

    test('POST / debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));

        //Solo para que se silencie el console.error que sale, ya que en si el test está bien, porque arroja el status 500 y es lo ideal
        const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});

        const res = await request(app).post('/usuario').send({
            email: 'test@a.com',
            password: '123456789'
        });
        expect(res.statusCode).toBe(500);

        silencio.mockRestore(); //Aca restaura el console.error
    });

    test('POST/login / debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));

        //Solo para que se silencie el console.error que sale, ya que en si el test está bien, porque arroja el status 500 y es lo ideal
        const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});

        const res = await request(app).post('/usuario/login').send({
            email: 'test@a.com',
            password: '123456789'
        });
        expect(res.statusCode).toBe(500);

        silencio.mockRestore(); //Aca restaura el console.error
    });

    test('POST/verifica email / debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));

        //Solo para que se silencie el console.error que sale, ya que en si el test está bien, porque arroja el status 500 y es lo ideal
        const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});

        const res = await request(app).post('/usuario/verifica_email').send({
            email: 'test@a.com'
        });
        expect(res.statusCode).toBe(500);

        silencio.mockRestore(); //Aca restaura el console.error
    });

    test('POST/validar codigo / debe capturar error de BD por verificar el email y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));

        //Solo para que se silencie el console.error que sale, ya que en si el test está bien, porque arroja el status 500 y es lo ideal
        const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});

        const res = await request(app).post('/usuario/validar_codigo').send({ 
            email: 'test@a.com', 
            codigo: '123456'
        });
        expect(res.statusCode).toBe(500);

        silencio.mockRestore(); //Aca restaura el console.error
    });

    test('PUT /:id debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).put('/usuario/1').send({
            email: 'test@a.com',
            password: '123456789'
        });
        expect(res.statusCode).toBe(500);
    });

    test('PUT/reset password / debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        //Solo para que se silencie el console.error que sale, ya que en si el test está bien, porque arroja el status 500 y es lo ideal
        const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});
        const res = await request(app).put('/usuario/reset_password').send({
            email: 'test@a.com',
            password: '123456789'
        });
        expect(res.statusCode).toBe(500);
    });

    test('DELETE /:id debe capturar error de BD y retornar 500', async () => {
        pool.query.mockRejectedValueOnce(new Error('Fallo'));
        const res = await request(app).delete('/usuario/1');
        expect(res.statusCode).toBe(500);
    });
});
