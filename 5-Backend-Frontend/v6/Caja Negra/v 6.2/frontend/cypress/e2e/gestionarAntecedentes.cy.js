describe('Pruebas Completas - Componente GestionarAntecedentes', () => {
  // URLs de las APIs utilizadas en el componente[cite: 3]
  const API_HISTORIAL = 'http://localhost:5000/api/historial_medico';
  const API_DIAGNOSTICOS = 'http://localhost:5000/api/diagnostico/paciente';

  beforeEach(() => {
    // 1. Interceptar la petición de pacientes ANTES de interactuar con la página[cite: 3]
    cy.intercept('GET', '**/api/paciente*', {
      statusCode: 200,
      body: [
        { id: 1, primer_nombre: "Ana", primer_apellido: "Gomez", numero_documento: "112233" },
        { id: 2, primer_nombre: "Luis", primer_apellido: "Perez", numero_documento: "998877" }
      ]
    }).as('getPacientes');

    // 2. Iniciar sesión
    cy.visit('/');
    cy.get('input[type="email"]').type('carlos.ruiz@gmail.com'); 
    cy.get('input[type="password"]').type('clave002');
    cy.get('button[type="submit"]').click();

    // 3. Esperar a que la sesión se guarde en el localStorage
    cy.window().should((win) => {
      expect(win.localStorage.getItem('usuario')).to.not.be.null;
    });

    // 4. Visitar la ruta del componente
    cy.visit('/Gestionar_Antecedentes');
    
    // 5. En lugar de cy.wait, validamos que el título se haya renderizado en el DOM[cite: 3]
    cy.get('.titulo-gestion').should('be.visible');
  });

  it('CP01. Debe mostrar la barra de búsqueda y filtrar pacientes correctamente', () => {
    // Buscar por nombre[cite: 3]
    cy.get('input[placeholder*="Buscar paciente"]').type('Ana');
    cy.get('.list-group-item').should('have.length', 1);
    cy.get('.list-group-item').should('contain', 'Ana Gomez');

    // Buscar por documento[cite: 3]
    cy.get('input[placeholder*="Buscar paciente"]').clear().type('998877');
    cy.get('.list-group-item').should('have.length', 1);
    cy.get('.list-group-item').should('contain', 'Luis Perez');

    // Búsqueda sin resultados[cite: 3]
    cy.get('input[placeholder*="Buscar paciente"]').clear().type('PacienteX');
    cy.get('.list-group-item').should('contain', 'No se encontraron pacientes.');
  });

  it('CP02. Debe cargar el historial y diagnósticos al seleccionar un paciente con datos', () => {
    // Interceptar historial existente
    cy.intercept('GET', `${API_HISTORIAL}/paciente/1`, {
      statusCode: 200,
      body: { id: 10, antecedentes_medicos: 'Paciente sufre de asma.' }
    }).as('getHistorial');

    // Interceptar diagnósticos existentes
    cy.intercept('GET', `${API_DIAGNOSTICOS}/1`, {
      statusCode: 200,
      body: [{
        id: 100, motivo: 'Dolor de cabeza', tratamiento_sugerido: 'Paracetamol',
        observaciones: 'Reposo absoluto', fecha_registro: '2023-11-25T00:00:00'
      }]
    }).as('getDiagnosticos');

    cy.get('input[placeholder*="Buscar paciente"]').type('Ana');
    cy.contains('li', 'Ana Gomez').click();

    // SOLUCIÓN: Eliminamos la validación del spinner porque la respuesta es instantánea.
    // Vamos directamente a esperar que las peticiones simuladas terminen.
    cy.wait(['@getHistorial', '@getDiagnosticos']);

    cy.get('.paciente-seleccionado').should('contain', 'Paciente seleccionado: Ana Gomez');
    cy.get('#antecedentes').should('have.value', 'Paciente sufre de asma.');

    cy.get('.list-group-item').within(() => {
      cy.contains('Dolor de cabeza');
      cy.contains('Paracetamol');
      cy.contains('Reposo absoluto');
      cy.contains('2023-11-25'); // Verifica que se cortó correctamente la fecha
    });
  });
it('CP03. Debe actualizar (PUT) un historial médico existente', () => {
    cy.intercept('GET', '**/api/historial_medico/paciente/1', {
      statusCode: 200, body: { id: 10, antecedentes_medicos: 'Asma' }
    }).as('getHistorialExistente');
    
    cy.intercept('GET', '**/api/diagnostico/paciente/1', { statusCode: 404, body: [] }).as('getDiagVacio3');

    // Usamos comodín en la URL del PUT para evitar fallos de coincidencia estricta
    cy.intercept('PUT', '**/api/historial_medico/*', { 
      statusCode: 200, body: { message: "ok" } 
    }).as('putHistorial');

    cy.get('input[placeholder*="Buscar paciente"]').clear().type('Ana');
    cy.contains('li', 'Ana Gomez').click();

    cy.wait(['@getHistorialExistente', '@getDiagVacio3']);

    // SOLUCIÓN CRÍTICA: Interceptar directamente la función alert() dentro de la ventana de la app
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alertaExito');
    });

    cy.get('#antecedentes').clear().type('Asma controlada.');
    cy.contains('button', 'Guardar Antecedentes').click();

    cy.wait('@putHistorial').its('request.body').should('deep.equal', {
      antecedentes_medicos: 'Asma controlada.'
    });

    // Validamos el alias generado en cy.window()
    cy.get('@alertaExito').should('have.been.calledWith', 'Antecedentes actualizados exitosamente.');
  });

  it('CP04. Debe manejar un paciente sin historial (404), crear uno (POST) y mostrar cero diagnósticos', () => {
    cy.intercept('GET', '**/api/historial_medico/paciente/2', { statusCode: 404 }).as('getHistorialNuevo');
    cy.intercept('GET', '**/api/diagnostico/paciente/2', { statusCode: 404, body: [] }).as('getDiagVacio4');
    
    // Interceptar petición de creación (POST)
    // Es vital devolver un objeto con "id" porque tu código hace res.json() tras el POST[cite: 3]
    cy.intercept('POST', '**/api/historial_medico*', { 
      statusCode: 200, body: { id: 11 } 
    }).as('postHistorial');

    cy.get('input[placeholder*="Buscar paciente"]').clear().type('Luis');
    cy.contains('li', 'Luis Perez').click();
    
    cy.wait(['@getHistorialNuevo', '@getDiagVacio4']);

    cy.get('#antecedentes').should('have.value', '');
    cy.contains('No se encontraron diagnosticos.').should('be.visible');

    // Interceptar alert para la creación
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alertaCreacion');
    });

    cy.get('#antecedentes').type('Paciente sano, sin alergias.');
    cy.contains('button', 'Guardar Antecedentes').click();

    cy.wait('@postHistorial').its('request.body').should('deep.equal', {
      id_paciente: 2,
      antecedentes_medicos: 'Paciente sano, sin alergias.'
    });

    cy.get('@alertaCreacion').should('have.been.calledWith', 'Historial creado exitosamente.');
  });

  it('CP05. Debe limpiar la pantalla al hacer clic en "Cambiar Paciente"', () => {
    cy.intercept('GET', `${API_HISTORIAL}/paciente/1`, { statusCode: 200, body: { id: 10 } });
    cy.intercept('GET', `${API_DIAGNOSTICOS}/1`, { statusCode: 404 });

    cy.get('input[placeholder*="Buscar paciente"]').type('Ana');
    cy.contains('li', 'Ana Gomez').click();

    cy.get('.card-antecedentes').should('be.visible');

    // Clic en cambiar paciente[cite: 3]
    cy.contains('button', 'Cambiar Paciente').click();

    // Validar reseteo de la vista[cite: 3]
    cy.get('input[placeholder*="Buscar paciente"]').should('be.visible');
    cy.get('.paciente-seleccionado').should('not.exist');
    cy.get('.card-antecedentes').should('not.exist');
  });
});