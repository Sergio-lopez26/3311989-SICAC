import request from 'supertest';
import express from 'express';
import router from '../servicio.js';

//Aquí se simula el módulo de la BD
jest.mock('../../db.js');
import pool from '../../db.js';

//Se crea un app de Express mínima para solo hacer los test
const app = express();
app.use(express.json());
app.use('/servicio', router);

describe('Pruebas de Caja Blanca - Servicio', () => {

  beforeEach(() => {
    jest.resetAllMocks(); //Para borrar los historiales de llamadas y mocks de test previos, y evitar falsos negativos
  });

  //GET / búsqueda general
  test('GET / debe devolver la lista de servicios', async () => {
    const rows = [{
      id: 1,
      id_tipo_servicio: 1,
      id_diagnostico: 1,
      nombre_servicio: 'Limpieza dental',
      procedimiento: 'Profilaxis',
      precio_aplicado: 50000,
      nombre_paciente: 'Ana Perez'
    }];

    pool.query.mockResolvedValueOnce([rows]); //Array que creamos para simular datos

    const res = await request(app).get('/servicio');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(rows); //Se compara lo que devuelve el backend con la BD simulada
  });

  //GET /diagnostico/:id_diagnostico -> Esta ruta es propia de servicio, lista solo los servicios de un diagnóstico
  test('GET /diagnostico/:id_diagnostico debe devolver los servicios de ese diagnóstico', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, id_diagnostico: 5 }]]);

    const res = await request(app).get('/servicio/diagnostico/5');

    expect(res.statusCode).toBe(200);
    expect(pool.query.mock.calls[0][1]).toEqual(['5']); //Verifica que el id de la URL llegue como parámetro de la consulta
  });

  //POST
  test('POST / debe rechazar si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/servicio')
      .send({ nombre_servicio: 'Limpieza dental' }); //Faltan id_tipo_servicio e id_diagnostico

    expect(res.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled(); //No debe tocar la BD
  });

  //Antes de crear el servicio, el backend busca el tipo de servicio para tomar su precio; si no existe, no se crea
  test('POST / debe rechazar si el tipo de servicio no existe', async () => {
    pool.query.mockResolvedValueOnce([[]]); //El catálogo no devuelve nada

    const res = await request(app).post('/servicio').send({
      id_tipo_servicio: 99,
      id_diagnostico: 1,
      nombre_servicio: 'Limpieza dental',
      procedimiento: 'Profilaxis'
    });

    expect(res.statusCode).toBe(404);
    expect(pool.query).toHaveBeenCalledTimes(1); //Solo hizo la búsqueda, no llegó al INSERT
  });

  test('POST / debe crear servicio exitosamente', async () => {
    pool.query
      .mockResolvedValueOnce([[{ precio_actual: 50000 }]]) //El tipo de servicio existe y tiene este precio
      .mockResolvedValueOnce([{ affectedRows: 1 }]); //Insert OK

    const res = await request(app).post('/servicio').send({
      id_tipo_servicio: 1,
      id_diagnostico: 1,
      nombre_servicio: 'Limpieza dental',
      procedimiento: 'Profilaxis'
    });

    expect(res.statusCode).toBe(201);
    //Con este añadido se valida que el precio guardado sea el del catálogo (tipo_servicio), no uno enviado por el cliente
    expect(pool.query.mock.calls[1][1]).toEqual([1, 1, 'Limpieza dental', 'Profilaxis', 50000]);
  });

  //PUT/id
  test('PUT / debe rechazar si faltan campos para actualizar', async () => {
    const res = await request(app)
      .put('/servicio/1')
      .send({ nombre_servicio: 'Limpieza dental' }); //Faltan los demás campos, incluido precio_aplicado

    expect(res.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('PUT / debe retornar 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app).put('/servicio/999').send({
      id_tipo_servicio: 1,
      id_diagnostico: 1,
      nombre_servicio: 'Limpieza dental',
      procedimiento: 'Profilaxis',
      precio_aplicado: 60000
    });

    expect(res.statusCode).toBe(404);
  });

  test('PUT / debe actualizar exitosamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).put('/servicio/1').send({
      id_tipo_servicio: 1,
      id_diagnostico: 1,
      nombre_servicio: 'Limpieza dental',
      procedimiento: 'Profilaxis',
      precio_aplicado: 60000
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Servicio actualizado exitosamente');
  });

  //DELETE/:id
  test('DELETE / debe retornar 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app).delete('/servicio/999');

    expect(res.statusCode).toBe(404);
  });

  test('DELETE / debe eliminar exitosamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).delete('/servicio/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Servicio eliminado exitosamente');
  });

  describe('Manejo de Errores de Base de Datos (Catch)', () => {
    test('GET / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

      const res = await request(app).get('/servicio');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Fallo de conexión');
    });

    test('GET /diagnostico/:id_diagnostico debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));

      const res = await request(app).get('/servicio/diagnostico/5');

      expect(res.statusCode).toBe(500);
    });

    test('POST / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));

      //Solo para que se silencie el console.error que sale, ya que en si el test está bien, porque arroja el status 500 y es lo ideal
      const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});

      const res = await request(app).post('/servicio').send({
        id_tipo_servicio: 1,
        id_diagnostico: 1,
        nombre_servicio: 'Limpieza dental',
        procedimiento: 'Profilaxis'
      });

      expect(res.statusCode).toBe(500);

      silencio.mockRestore(); //Aca restaura el console.error
    });

    test('PUT / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));

      const res = await request(app).put('/servicio/1').send({
        id_tipo_servicio: 1,
        id_diagnostico: 1,
        nombre_servicio: 'Limpieza dental',
        procedimiento: 'Profilaxis',
        precio_aplicado: 60000
      });

      expect(res.statusCode).toBe(500);
    });

    test('DELETE / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));

      const res = await request(app).delete('/servicio/1');

      expect(res.statusCode).toBe(500);
    });
  });
});