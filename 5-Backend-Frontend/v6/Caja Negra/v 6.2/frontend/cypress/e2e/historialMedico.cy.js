describe('Pruebas Completas - Componente HistorialMedico', () => {

  beforeEach(() => {
    // 1. Interceptar todas las peticiones iniciales usando comodines para evitar fallos por rutas exactas
    cy.intercept('GET', '**/api/paciente*', {
      statusCode: 200,
      body: [
        { id: 1, primer_nombre: "Carlos", segundo_nombre: "Andres", primer_apellido: "Gomez", segundo_apellido: "Ruiz", numero_documento: "102030", tipo_sangre: "O+" },
        { id: 2, primer_nombre: "Maria", segundo_nombre: null, primer_apellido: "Lopez", segundo_apellido: null, numero_documento: "908070", tipo_sangre: "A+" }
      ]
    }).as('getPacientes');

    cy.intercept('GET', '**/api/tipo_diagnostico*', {
      statusCode: 200,
      body: [{ id: 1, nombre_diagnostico: "Migraña" }, { id: 2, nombre_diagnostico: "Gastritis" }]
    }).as('getTiposDiag');

    cy.intercept('GET', '**/api/medicamento*', {
      statusCode: 200,
      body: [{ id: 1, nombre_medicamento: "Ibuprofeno 400mg" }]
    }).as('getMedicamentos');

    cy.intercept('GET', '**/api/tipo_medicamento*', {
      statusCode: 200,
      body: [{ id: 1, categoria_medicamento: "Analgésico" }]
    }).as('getTiposMed');

    // Citas del médico simuladas. Solo Carlos (id: 1) tiene una cita 'Programada'
    cy.intercept('GET', '**/api/cita/*', {
      statusCode: 200,
      body: [
        { id: 100, id_paciente: 1, estado_cita: "Programada", fecha_cita: "2023-11-20T00:00:00", hora_inicio: "08:00", hora_fin: "08:30", tipo_cita: "General" },
        { id: 101, id_paciente: 2, estado_cita: "Atendida", fecha_cita: "2023-11-19T00:00:00", hora_inicio: "09:00", hora_fin: "09:30", tipo_cita: "Control" }
      ]
    }).as('getCitas');

    // 2. Proceso de Login simulado
    cy.visit('/');
    cy.get('input[type="email"]').type('carlos.ruiz@gmail.com');
    cy.get('input[type="password"]').type('clave002');
    cy.get('button[type="submit"]').click();

    cy.window().should((win) => {
      expect(win.localStorage.getItem('usuario')).to.not.be.null;
    });

    // 3. Visitar la ruta del componente actualizada
    cy.visit('/Historial_Medico');
    
    // 4. Validar que la interfaz principal cargó correctamente
    cy.get('.titulo-principal').should('be.visible').and('contain', 'Consulta Médica');
  });

  it('CP01. Debe buscar y seleccionar un paciente, mostrando sus datos y citas disponibles', () => {
    // Buscar paciente "Carlos"
    cy.get('input[placeholder*="Buscar paciente"]').type('Carlos');
    cy.get('.buscador-lista .list-group-item').should('have.length', 1);
    
    // Seleccionar paciente
    cy.contains('.list-group-item', 'Carlos Andres Gomez Ruiz').click();

    // Validar tarjeta del paciente seleccionado
    cy.get('.card-paciente-seleccionado').should('be.visible');
    cy.get('.card-paciente-seleccionado').should('contain', 'Carlos Andres Gomez Ruiz');
    cy.get('.card-paciente-seleccionado').should('contain', '102030');

    // Validar que el select de citas tiene la cita programada de Carlos
    cy.get('#id_cita').find('option').should('have.length', 2); // La opción por defecto + la cita real
    cy.get('#id_cita').should('contain', '2023-11-20 | 08:00 - 08:30 (General) - Programada');
  });

  it('CP02. Debe mostrar mensaje de citas vacías si el paciente no tiene citas "Programadas"', () => {
    cy.get('input[placeholder*="Buscar paciente"]').type('Maria');
    cy.contains('.list-group-item', 'Maria Lopez').click();

    // Como la cita de María está "Atendida", el arreglo queda vacío.
    // El select mostrará 2 opciones: "Seleccione la cita..." y "El paciente no tiene citas..."[cite: 4]
    cy.get('#id_cita').find('option').should('have.length', 2);
    cy.get('#id_cita').should('contain', 'El paciente no tiene citas registradas');
  });
  it('CP03. Debe llenar el formulario de diagnóstico y enviarlo exitosamente (POST)', () => {
    // Interceptar el guardado del historial
    cy.intercept('POST', '**/api/diagnostico*', { statusCode: 200 }).as('postDiagnostico');

    // Seleccionar paciente
    cy.get('input[placeholder*="Buscar paciente"]').type('Carlos');
    cy.contains('.list-group-item', 'Carlos Andres Gomez Ruiz').click();

    // Llenar el formulario
    cy.get('#id_cita').select('100');
    cy.get('#motivo').type('Dolor de cabeza intenso');
    cy.get('#id_tipo_diagnostico').select('1'); // Selecciona Migraña
    cy.get('#observaciones').type('El paciente requiere reposo en habitación oscura.');
    cy.get('#tratamiento_sugerido').type('Tomar analgésico y dormir.');
    cy.get('#medicamento').select('1'); // Selecciona Ibuprofeno
    
    // El campo dosis se habilita tras seleccionar un medicamento
    cy.get('#dosis').should('not.be.disabled').type('1 pastilla cada 8 horas');

    // Interceptar alerta de éxito
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alertaExito');
    });

    // Guardar
    cy.contains('button', 'Guardar Registro').click();

    // Validar la petición enviada
    cy.wait('@postDiagnostico').its('request.body').should('deep.include', {
      id_paciente: 1,
      motivo: 'Dolor de cabeza intenso',
      id_cita: "100",
      id_tipo_diagnostico: "1",
      medicamento: "1",
      dosis: "1 pastilla cada 8 horas"
    });

    // Validar alerta y reseteo del formulario
    cy.get('@alertaExito').should('have.been.calledWith', 'Diagnóstico registrado y cita marcada como Atendida exitosamente.');
    cy.get('.card-paciente-seleccionado').should('not.exist'); // Se ejecuta la función cancelar()
  });

  it('CP04. Debe permitir agregar un Nuevo Tipo de Diagnóstico desde el Modal', () => {
    cy.intercept('POST', '**/api/tipo_diagnostico*', { 
      statusCode: 200, body: { id: 3 } 
    }).as('postNuevoDiag');

    cy.get('input[placeholder*="Buscar paciente"]').type('Carlos');
    cy.contains('.list-group-item', 'Carlos Andres Gomez Ruiz').click();

    // Abrir modal
    cy.get('button[data-bs-target="#modalNuevoDiagnostico"]').click();
    cy.get('#modalNuevoDiagnostico').should('be.visible');

    // Llenar datos en el modal
    cy.get('#modalNuevoDiagnostico input[type="text"]').type('Fiebre Amarilla');
    cy.get('#modalNuevoDiagnostico textarea').type('Enfermedad viral transmitida por mosquitos.');
    
    // Guardar
    cy.get('#modalNuevoDiagnostico button[type="submit"]').click();

    // Validar payload
    cy.wait('@postNuevoDiag').its('request.body').should('deep.equal', {
      nombre_diagnostico: 'Fiebre Amarilla',
      descripcion: 'Enfermedad viral transmitida por mosquitos.'
    });
  });

  it('CP05. Debe permitir agregar un Nuevo Medicamento desde el Modal', () => {
    cy.intercept('POST', '**/api/medicamento*', { 
      statusCode: 200, body: { id: 5 } 
    }).as('postNuevoMed');

    cy.get('input[placeholder*="Buscar paciente"]').type('Carlos');
    cy.contains('.list-group-item', 'Carlos Andres Gomez Ruiz').click();

    // Abrir modal
    cy.get('button[data-bs-target="#modalNuevoMedicamento"]').click();
    cy.get('#modalNuevoMedicamento').should('be.visible');

    // Llenar datos en el modal
    cy.get('#modalNuevoMedicamento select').select('1'); // Selecciona categoría Analgésico
    cy.get('#modalNuevoMedicamento input[type="text"]').type('Acetaminofen 500mg');
    
    // Guardar
    cy.get('#modalNuevoMedicamento button[type="submit"]').click();

    // Validar payload
    cy.wait('@postNuevoMed').its('request.body').should('deep.equal', {
      id_tipo_medicamento: "1",
      nombre_medicamento: 'Acetaminofen 500mg'
    });
  });
});