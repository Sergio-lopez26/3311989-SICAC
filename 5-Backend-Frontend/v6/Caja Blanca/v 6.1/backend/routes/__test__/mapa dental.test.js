import request from 'supertest';
import express from 'express';
import router from '../mapa_dental.js';

//Aquí se simula el módulo de la BD
jest.mock('../../db.js');
import pool from '../../db.js';

//Se crea un app de Express mínima para solo hacer los test
const app = express();
app.use(express.json());
app.use('/mapa-dental', router);

describe('Pruebas de Caja Blanca - Mapa Dental', () => {

  beforeEach(() => {
    jest.resetAllMocks(); //Para borrar los historiales de llamadas y mocks de test previos, y evitar falsos negativos
  });

  //GET / búsqueda general
  test('GET / debe devolver la lista de mapas dentales', async () => {
    const rows = [{
      id: 1,
      id_historial_medico: 1,
      nombre_estandar: 'Mapa inicial',
      observacion_inicial: 'Sin novedades',
      estado_mapa_dental: 'Activo',
      nombre_paciente: 'Ana Perez'
    }];

    pool.query.mockResolvedValueOnce([rows]); //Array que creamos para simular datos

    const res = await request(app).get('/mapa-dental');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(rows); //Se compara lo que devuelve el backend con la BD simulada
  });

  //GET /historial/:id_historial_medico -> Esta ruta es propia de mapa dental, lista los mapas de un paciente según su historial
  test('GET /historial/:id_historial_medico debe devolver los mapas de ese historial', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, id_historial_medico: 3 }]]);

    const res = await request(app).get('/mapa-dental/historial/3');

    expect(res.statusCode).toBe(200);
    expect(pool.query.mock.calls[0][1]).toEqual(['3']); //Verifica que el id de la URL llegue como parámetro de la consulta
  });

  //POST
  test('POST / debe rechazar si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/mapa-dental')
      .send({ nombre_estandar: 'Mapa inicial' }); //Faltan id_historial_medico y estado_mapa_dental

    expect(res.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled(); //No debe tocar la BD
  });

  //Al crear el mapa, el backend crea también sus 32 piezas con estado "Sano" (segundo INSERT)
  test('POST / debe crear mapa dental exitosamente', async () => {
    pool.query
      .mockResolvedValueOnce([{ insertId: 7 }]) //Insert del mapa OK, y devuelve el id nuevo
      .mockResolvedValueOnce([{ affectedRows: 32 }]); //Insert de las piezas OK

    const res = await request(app).post('/mapa-dental').send({
      id_historial_medico: 1,
      nombre_estandar: 'Mapa inicial',
      observacion_inicial: 'Sin novedades',
      estado_mapa_dental: 'Activo'
    });

    expect(res.statusCode).toBe(201);
    expect(pool.query).toHaveBeenCalledTimes(2);

    //Con este añadido se valida que se hayan generado las 32 piezas, ligadas al id del mapa recién creado
    const piezas = pool.query.mock.calls[1][1][0];
    expect(piezas).toHaveLength(32);
    expect(piezas.every((pieza) => pieza[0] === 7)).toBe(true);

    //Se valida cuadrante y posición de una pieza de cada cuadrante: [id_mapa, fdi, cuadrante, posicion, estado_inicial, estado_actual]
    expect(piezas.find((pieza) => pieza[1] === 18)).toEqual([7, 18, 1, 8, 'Sano', 'Sano']);
    expect(piezas.find((pieza) => pieza[1] === 21)).toEqual([7, 21, 2, 1, 'Sano', 'Sano']);
    expect(piezas.find((pieza) => pieza[1] === 38)).toEqual([7, 38, 3, 8, 'Sano', 'Sano']);
    expect(piezas.find((pieza) => pieza[1] === 41)).toEqual([7, 41, 4, 1, 'Sano', 'Sano']);
  });

  //Si no se envía la observación inicial, el backend la guarda como texto vacío
  test('POST / debe guardar la observación vacía si no se envía', async () => {
    pool.query
      .mockResolvedValueOnce([{ insertId: 7 }]) //Insert del mapa OK
      .mockResolvedValueOnce([{ affectedRows: 32 }]); //Insert de las piezas OK

    const res = await request(app).post('/mapa-dental').send({
      id_historial_medico: 1,
      nombre_estandar: 'Mapa inicial',
      estado_mapa_dental: 'Activo'
    });

    expect(res.statusCode).toBe(201);
    //El tercer parámetro del INSERT del mapa es la observación inicial
    expect(pool.query.mock.calls[0][1][2]).toBe('');
  });

  //PUT/id
  test('PUT / debe rechazar si faltan campos para actualizar', async () => {
    const res = await request(app)
      .put('/mapa-dental/1')
      .send({ nombre_estandar: 'Mapa inicial' }); //Faltan los demás campos

    expect(res.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('PUT / debe retornar 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app).put('/mapa-dental/999').send({
      id_historial_medico: 1,
      nombre_estandar: 'Mapa inicial',
      observacion_inicial: 'Actualizado',
      estado_mapa_dental: 'Activo'
    });

    expect(res.statusCode).toBe(404);
  });

  test('PUT / debe actualizar exitosamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).put('/mapa-dental/1').send({
      id_historial_medico: 1,
      nombre_estandar: 'Mapa inicial',
      observacion_inicial: 'Actualizado',
      estado_mapa_dental: 'Activo'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Mapa dental actualizado exitosamente');
  });

  //Si no se envía la observación inicial al actualizar, el backend la guarda como texto vacío
  test('PUT / debe guardar la observación vacía si no se envía', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).put('/mapa-dental/1').send({
      id_historial_medico: 1,
      nombre_estandar: 'Mapa inicial',
      estado_mapa_dental: 'Activo'
    });

    expect(res.statusCode).toBe(200);
    //El tercer parámetro del UPDATE es la observación inicial
    expect(pool.query.mock.calls[0][1][2]).toBe('');
  });

  //DELETE/:id
  test('DELETE / debe retornar 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app).delete('/mapa-dental/999');

    expect(res.statusCode).toBe(404);
  });

  test('DELETE / debe eliminar exitosamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).delete('/mapa-dental/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Mapa dental eliminado exitosamente');
  });

  describe('Manejo de Errores de Base de Datos (Catch)', () => {
    test('GET / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

      const res = await request(app).get('/mapa-dental');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Fallo de conexión');
    });

    test('GET /historial/:id_historial_medico debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));

      const res = await request(app).get('/mapa-dental/historial/3');

      expect(res.statusCode).toBe(500);
    });

    test('POST / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));

      //Solo para que se silencie el console.error que sale, ya que en si el test está bien, porque arroja el status 500 y es lo ideal
      const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});

      const res = await request(app).post('/mapa-dental').send({
        id_historial_medico: 1,
        nombre_estandar: 'Mapa inicial',
        observacion_inicial: 'Sin novedades',
        estado_mapa_dental: 'Activo'
      });

      expect(res.statusCode).toBe(500);

      silencio.mockRestore(); //Aca restaura el console.error
    });

    //Este es el caso en que el mapa sí se crea, pero falla el INSERT de las piezas
    test('POST / debe capturar error de BD al crear las piezas y retornar 500', async () => {
      pool.query
        .mockResolvedValueOnce([{ insertId: 7 }]) //El mapa se crea bien
        .mockRejectedValueOnce(new Error('Fallo piezas')); //Falla la segunda consulta

      const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});

      const res = await request(app).post('/mapa-dental').send({
        id_historial_medico: 1,
        nombre_estandar: 'Mapa inicial',
        observacion_inicial: 'Sin novedades',
        estado_mapa_dental: 'Activo'
      });

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Fallo piezas');

      silencio.mockRestore();
    });

    test('PUT / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));

      const res = await request(app).put('/mapa-dental/1').send({
        id_historial_medico: 1,
        nombre_estandar: 'Mapa inicial',
        observacion_inicial: 'Actualizado',
        estado_mapa_dental: 'Activo'
      });

      expect(res.statusCode).toBe(500);
    });

    test('DELETE / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));

      const res = await request(app).delete('/mapa-dental/1');

      expect(res.statusCode).toBe(500);
    });
  });
});