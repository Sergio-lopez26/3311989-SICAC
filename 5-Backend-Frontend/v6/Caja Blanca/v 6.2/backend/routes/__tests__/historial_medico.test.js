import request from 'supertest';
import express from 'express';
import pool from '../../db.js';
import router from '../historial_medico.js';

// Simulamos la base de datos db.js
jest.mock('../../db.js', () => ({
  query: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/historial-medico', router);

describe('Pruebas para las rutas de Historial Médico', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /historial-medico/paciente/:id', () => {
    test('debe devolver el historial médico cuando el paciente existe', async () => {
      const mockHistorial = {
        id: 1,
        id_paciente: '101',
        antecedentes_medicos: 'Sin alergias previas',
      };

      // Simulamos que la consulta devuelve un arreglo con el historial
      pool.query.mockResolvedValueOnce([[mockHistorial]]);

      const response = await request(app).get('/historial-medico/paciente/101');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM historial_medico WHERE id_paciente = ?',
        ['101']
      );
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockHistorial);
    });

    test('debe devolver un status 404 cuando no se encuentra el historial', async () => {
      // Simulamos resultado vacío
      pool.query.mockResolvedValueOnce([[]]);

      const response = await request(app).get('/historial-medico/paciente/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ mensaje: 'Historial no encontrado' });
    });

    test('debe devolver un status 500 cuando ocurre un error en la BD', async () => {
      pool.query.mockRejectedValueOnce(new Error('Error de conexión con la BD'));

      const response = await request(app).get('/historial-medico/paciente/101');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error de conexión con la BD' });
    });
  });

  describe('POST /historial-medico', () => {
    test('debe crear un nuevo historial médico exitosamente (status 201)', async () => {
      const nuevoHistorial = {
        id_paciente: 101,
        antecedentes_medicos: 'Hipertensión',
      };

      // Simulamos la respuesta de inserción en MySQL
      pool.query.mockResolvedValueOnce([{ insertId: 5 }]);

      const response = await request(app)
        .post('/historial-medico')
        .send(nuevoHistorial);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO historial_medico (id_paciente, antecedentes_medicos) VALUES (?, ?)',
        [101, 'Hipertensión']
      );
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: 5,
        id_paciente: 101,
        antecedentes_medicos: 'Hipertensión',
      });
    });

    test('debe devolver un status 400 cuando la entrada es duplicada (ER_DUP_ENTRY)', async () => {
      const errorDuplicado = new Error('Duplicate entry');
      errorDuplicado.code = 'ER_DUP_ENTRY';

      pool.query.mockRejectedValueOnce(errorDuplicado);

      const response = await request(app)
        .post('/historial-medico')
        .send({ id_paciente: 101, antecedentes_medicos: 'Diabetes' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'El paciente ya tiene un historial médico.',
      });
    });

    test('debe devolver un status 500 ante cualquier otro error de la BD', async () => {
      pool.query.mockRejectedValueOnce(new Error('Error del servidor'));

      const response = await request(app)
        .post('/historial-medico')
        .send({ id_paciente: 102, antecedentes_medicos: 'Asma' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error del servidor' });
    });
  });
});

