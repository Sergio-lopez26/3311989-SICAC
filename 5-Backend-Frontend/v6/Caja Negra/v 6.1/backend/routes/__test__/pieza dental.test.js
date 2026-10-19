import request from 'supertest';
import express from 'express';
import router from '../pieza_dental.js';

//Aquí se simula el módulo de la BD
jest.mock('../../db.js');
import pool from '../../db.js';

//Se crea un app de Express mínima para solo hacer los test
const app = express();
app.use(express.json());
app.use('/pieza-dental', router);

describe('Pruebas de Caja Blanca - Pieza Dental', () => {

  beforeEach(() => {
    jest.resetAllMocks(); //Para borrar los historiales de llamadas y mocks de test previos, y evitar falsos negativos
  });

  //GET / búsqueda general
  test('GET / debe devolver la lista de piezas dentales', async () => {
    const rows = [
      { id: 1, id_mapa: 1, nomenclatura_fdi: 18, cuadrante: 1, posicion: 8, estado_inicial: 'Sano', estado_actual: 'Sano' },
      { id: 2, id_mapa: 1, nomenclatura_fdi: 17, cuadrante: 1, posicion: 7, estado_inicial: 'Sano', estado_actual: 'Sano' }
    ];

    pool.query.mockResolvedValueOnce([rows]); //Array que creamos para simular datos

    const res = await request(app).get('/pieza-dental');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(rows); //Se compara lo que devuelve el backend con la BD simulada
  });

  //GET /mapa/:id_mapa -> Esta ruta es propia de pieza dental, lista las piezas de un mapa dental puntual
  test('GET /mapa/:id_mapa debe devolver las piezas de ese mapa', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, id_mapa: 4 }]]);

    const res = await request(app).get('/pieza-dental/mapa/4');

    expect(res.statusCode).toBe(200);
    expect(pool.query.mock.calls[0][1]).toEqual(['4']); //Verifica que el id de la URL llegue como parámetro de la consulta
  });

  //POST
  test('POST / debe rechazar si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/pieza-dental')
      .send({ id_mapa: 1 }); //Faltan los demás campos

    expect(res.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled(); //No debe tocar la BD
  });

  test('POST / debe rechazar pieza repetida en el mismo mapa', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1 }]]); //Ya existe

    const res = await request(app).post('/pieza-dental').send({
      id_mapa: 1,
      nomenclatura_fdi: 18,
      cuadrante: 1,
      posicion: 8,
      estado_inicial: 'Sano',
      estado_actual: 'Sano'
    });

    expect(res.statusCode).toBe(400);

    //Con este añadido, se puede validar la coherencia del test, cambiando el valor para que falle
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT id FROM pieza_dental WHERE id_mapa = ? and nomenclatura_fdi = ?',
      [1, 18]
    ); //Acá va la consulta, tal cual en el backend
  });

  test('POST / debe crear pieza dental exitosamente', async () => {
    pool.query
      .mockResolvedValueOnce([[]]) //No existe -> Array vacío
      .mockResolvedValueOnce([{ affectedRows: 1 }]); //Insert OK

    const res = await request(app).post('/pieza-dental').send({
      id_mapa: 1,
      nomenclatura_fdi: 18,
      cuadrante: 1,
      posicion: 8,
      estado_inicial: 'Sano',
      estado_actual: 'Caries'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.mensaje).toBe('Pieza dental registrada exitosamente');
  });

  //En el POST, el estado_actual no es obligatorio: si no se envía, toma el valor del estado_inicial
  test('POST / debe usar el estado inicial como estado actual si no se envía', async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).post('/pieza-dental').send({
      id_mapa: 1,
      nomenclatura_fdi: 18,
      cuadrante: 1,
      posicion: 8,
      estado_inicial: 'Sano'
    });

    expect(res.statusCode).toBe(201);
    expect(pool.query.mock.calls[1][1]).toEqual([1, 18, 1, 8, 'Sano', 'Sano']); //El último valor es el estado_actual
  });

  //PUT/id
  test('PUT / debe rechazar si faltan campos para actualizar', async () => {
    const res = await request(app)
      .put('/pieza-dental/1')
      .send({ id_mapa: 1 }); //Faltan los demás campos

    expect(res.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('PUT / debe retornar 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app).put('/pieza-dental/999').send({
      id_mapa: 1,
      nomenclatura_fdi: 18,
      cuadrante: 1,
      posicion: 8,
      estado_inicial: 'Sano',
      estado_actual: 'Caries'
    });

    expect(res.statusCode).toBe(404);
  });

  test('PUT / debe actualizar exitosamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).put('/pieza-dental/1').send({
      id_mapa: 1,
      nomenclatura_fdi: 18,
      cuadrante: 1,
      posicion: 8,
      estado_inicial: 'Sano',
      estado_actual: 'Caries'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Pieza dental actualizada exitosamente');
  });

  //DELETE/:id
  test('DELETE / debe retornar 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app).delete('/pieza-dental/999');

    expect(res.statusCode).toBe(404);
  });

  test('DELETE / debe eliminar exitosamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).delete('/pieza-dental/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Pieza dental eliminada exitosamente');
  });

  describe('Manejo de Errores de Base de Datos (Catch)', () => {
    test('GET / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

      const res = await request(app).get('/pieza-dental');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Fallo de conexión');
    });

    test('GET /mapa/:id_mapa debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));

      const res = await request(app).get('/pieza-dental/mapa/4');

      expect(res.statusCode).toBe(500);
    });

    test('POST / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));

      //Solo para que se silencie el console.error que sale, ya que en si el test está bien, porque arroja el status 500 y es lo ideal
      const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});

      const res = await request(app).post('/pieza-dental').send({
        id_mapa: 1,
        nomenclatura_fdi: 18,
        cuadrante: 1,
        posicion: 8,
        estado_inicial: 'Sano',
        estado_actual: 'Sano'
      });

      expect(res.statusCode).toBe(500);

      silencio.mockRestore(); //Aca restaura el console.error
    });

    test('PUT / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));

      const res = await request(app).put('/pieza-dental/1').send({
        id_mapa: 1,
        nomenclatura_fdi: 18,
        cuadrante: 1,
        posicion: 8,
        estado_inicial: 'Sano',
        estado_actual: 'Caries'
      });

      expect(res.statusCode).toBe(500);
    });

    test('DELETE / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));

      const res = await request(app).delete('/pieza-dental/1');

      expect(res.statusCode).toBe(500);
    });
  });
});