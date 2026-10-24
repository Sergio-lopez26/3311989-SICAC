import request from 'supertest';
import express from 'express';
import router from '../tipo_servicio.js';

//Aquí se simula el módulo de la BD
jest.mock('../../db.js');
import pool from '../../db.js';

//Se crea un app de Express mínima para solo hacer los test
const app = express();
app.use(express.json());
app.use('/tipo-servicio', router);

describe('Pruebas de Caja Blanca - Tipo Servicio', () => {

  beforeEach(() => {
    jest.resetAllMocks(); //Para borrar los historiales de llamadas y mocks de test previos, y evitar falsos negativos
  });

  //GET / búsqueda general
  test('GET / debe devolver la lista de tipos de servicio', async () => {
    const rows = [{
      id: 1,
      tipo_servicio: 'Consulta',
      descripcion: 'Consulta general',
      precio_actual: 50000
    }];

    pool.query.mockResolvedValueOnce([rows]); //Array que creamos para simular datos

    const res = await request(app).get('/tipo-servicio');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].tipo_servicio).toBe('Consulta');
  });

  //POST
  test('POST / debe rechazar si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/tipo-servicio')
      .send({ tipo_servicio: 'Consulta' }); //Falta precio_actual

    expect(res.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled(); //No debe tocar la BD
  });

  //Este lo valida el middleware (solo letras con o sin tildes), antes de llegar a la consulta
  test('POST / debe rechazar si el tipo de servicio tiene caracteres inválidos', async () => {
    const res = await request(app)
      .post('/tipo-servicio')
      .send({
        tipo_servicio: 'Consulta123',
        descripcion: 'Consulta general',
        precio_actual: 50000
      });

    expect(res.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('POST / debe rechazar tipo duplicado', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1 }]]); //Ya existe

    const res = await request(app).post('/tipo-servicio').send({
      tipo_servicio: 'Consulta',
      descripcion: 'Consulta general',
      precio_actual: 50000
    });

    expect(res.statusCode).toBe(400);

    //Con este añadido, se puede validar la coherencia del test, cambiando el valor para que falle
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT id FROM tipo_servicio WHERE tipo_servicio = ?',
      ['Consulta']
    ); //Acá va la consulta, tal cual en el backend
  });

  test('POST / debe crear tipo de servicio exitosamente', async () => {
    pool.query
      .mockResolvedValueOnce([[]]) //No existe -> Array vacío
      .mockResolvedValueOnce([{ affectedRows: 1 }]); //Insert OK

    const res = await request(app).post('/tipo-servicio').send({
      tipo_servicio: 'Consulta',
      descripcion: 'Consulta general',
      precio_actual: 50000
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.mensaje).toBe('Tipo de servicio creado exitosamente');
  });

  //Si no se envía la descripción, el backend la guarda como texto vacío
  test('POST / debe guardar la descripción vacía si no se envía', async () => {
    pool.query
      .mockResolvedValueOnce([[]]) //No existe -> Array vacío
      .mockResolvedValueOnce([{ affectedRows: 1 }]); //Insert OK

    const res = await request(app).post('/tipo-servicio').send({
      tipo_servicio: 'Consulta',
      precio_actual: 50000
    });

    expect(res.statusCode).toBe(201);
    //El segundo parámetro del INSERT es la descripción
    expect(pool.query.mock.calls[1][1][1]).toBe('');
  });

  //PUT/id
  test('PUT / debe rechazar si faltan campos para actualizar', async () => {
    const res = await request(app)
      .put('/tipo-servicio/1')
      .send({ tipo_servicio: 'Consulta' }); //Falta precio_actual

    expect(res.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('PUT / debe retornar 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app).put('/tipo-servicio/999').send({
      tipo_servicio: 'Consulta',
      descripcion: 'Actualizado',
      precio_actual: 60000
    });

    expect(res.statusCode).toBe(404);
  });

  test('PUT / debe actualizar exitosamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).put('/tipo-servicio/123').send({
      tipo_servicio: 'Consulta',
      descripcion: 'Actualizado',
      precio_actual: 60000
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Tipo de servicio actualizado exitosamente');
  });

  //Si no se envía la descripción al actualizar, el backend la guarda como texto vacío
  test('PUT / debe guardar la descripción vacía si no se envía', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).put('/tipo-servicio/123').send({
      tipo_servicio: 'Consulta',
      precio_actual: 60000
    });

    expect(res.statusCode).toBe(200);
    //El segundo parámetro del UPDATE es la descripción
    expect(pool.query.mock.calls[0][1][1]).toBe('');
  });

  //DELETE/:id
  test('DELETE / debe retornar 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app).delete('/tipo-servicio/999');

    expect(res.statusCode).toBe(404);
  });

  test('DELETE / debe eliminar exitosamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).delete('/tipo-servicio/123');

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Tipo de servicio eliminado exitosamente');
  });

  describe('Manejo de Errores de Base de Datos (Catch)', () => {
    test('GET / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

      const res = await request(app).get('/tipo-servicio');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Fallo de conexión');
    });

    test('POST / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));

      //Solo para que se silencie el console.error que sale, ya que en si el test está bien, porque arroja el status 500 y es lo ideal
      const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});

      const res = await request(app).post('/tipo-servicio').send({
        tipo_servicio: 'Consulta',
        descripcion: 'Consulta general',
        precio_actual: 50000
      });

      expect(res.statusCode).toBe(500);

      silencio.mockRestore(); //Aca restaura el console.error
    });

    test('PUT / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));

      const res = await request(app).put('/tipo-servicio/123').send({
        tipo_servicio: 'Consulta',
        descripcion: 'Actualizado',
        precio_actual: 60000
      });

      expect(res.statusCode).toBe(500);
    });

    test('DELETE / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));

      const res = await request(app).delete('/tipo-servicio/123');

      expect(res.statusCode).toBe(500);
    });
  });
});