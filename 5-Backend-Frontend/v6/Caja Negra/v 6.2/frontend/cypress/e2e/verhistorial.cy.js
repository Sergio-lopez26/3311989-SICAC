describe('Pruebas Completas - Componente VerHistorial', () => {
  const API_PACIENTE = 'http://localhost:5000/api/paciente/*';
  const API_HISTORIAL = 'http://localhost:5000/api/historial_medico/paciente/*';
  const API_CITA = 'http://localhost:5000/api/cita/paciente/*';

  beforeEach(() => {
    cy.visit('/');
    cy.get('input[type="email"]').type('laura.martinez@gmail.com');
    cy.get('input[type="password"]').type('clave001');
    cy.get('button[type="submit"]').click();

    cy.window().should((win) => {
      expect(win.localStorage.getItem('usuario')).to.not.be.null;
    });
  });

  it('CP01. Debe cargar el historial médico y diagnósticos correctamente (Flujo Ideal)', () => {
    cy.visit('/Ver_Historial');
    
    cy.get('.titulo-historial').should('contain', 'Mi Historial Médico');
    cy.get('.spinner-border').should('not.exist');
    cy.get('.card-antecedentes').should('be.visible');
    cy.get('.card-diagnosticos').should('be.visible');
  });

  it('CP02. Debe mostrar el estado de carga (Spinner) mientras obtiene los datos', () => {
    cy.intercept('GET', API_HISTORIAL, (req) => {
      req.on('response', (res) => {
        res.setDelay(1000); 
      });
    }).as('getHistorialDelay');

    cy.visit('/Ver_Historial');

    cy.get('.spinner-border').should('be.visible');
    cy.get('.text-muted').should('contain', 'Cargando tu información médica...');

    cy.wait('@getHistorialDelay');
    cy.get('.spinner-border').should('not.exist');
  });

  it('CP03. Debe manejar el caso cuando el paciente NO tiene historial ni citas registradas', () => {
    cy.intercept('GET', API_HISTORIAL, { statusCode: 404, body: {} }).as('getHistorialVacio');
    cy.intercept('GET', API_CITA, { statusCode: 200, body: [] }).as('getCitasVacias');

    cy.visit('/Ver_Historial');
    cy.wait(['@getHistorialVacio', '@getCitasVacias']);

    cy.get('.card-antecedentes').should('contain', 'No hay antecedentes médicos registrados.');
    cy.get('.card-diagnosticos').should('contain', 'Aún no tienes diagnósticos o consultas registradas en el sistema.');
  });

  it('CP04. Debe mostrar un mensaje de alerta si falla la conexión con el servidor (Error 500)', () => {
    cy.intercept('GET', API_PACIENTE, { 
      statusCode: 500, 
      body: { message: 'Internal Server Error' } 
    }).as('getErrorServidor');

    cy.visit('/Ver_Historial');
    cy.wait('@getErrorServidor');

    cy.get('.alert-warning')
      .should('be.visible')
      .and('contain', 'Error al obtener los datos del perfil del paciente.');
  });
});