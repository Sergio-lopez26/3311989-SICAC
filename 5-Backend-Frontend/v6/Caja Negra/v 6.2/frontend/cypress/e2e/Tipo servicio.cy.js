// Ruta de la pantalla dentro de la aplicación (se accede con el rol Administrador)
const RUTA = '/Gestionar_TipoServicio';

// Usuario administrador de pruebas (el mismo que usa roles.cy.js)
const ADMIN = { email: 'andrejur055@gmail.com', password: 'encriptaraqui01' };

// El backend solo acepta letras (con o sin tildes) en el nombre del tipo de servicio,
// por eso el nombre único se arma convirtiendo cada dígito de Date.now() en una letra
const nombreUnico = () =>
  'Cypress ' + String(Date.now()).split('').map((d) => String.fromCharCode(97 + Number(d))).join('');

describe('Pruebas de Caja Negra - Tipos de Servicio (UI)', () => {

  // 🔑 Registrar los handlers UNA VEZ, antes de todos los tests
  beforeEach(() => {
    cy.on('window:confirm', () => true); // Aceptar cualquier confirm
    cy.on('window:alert', () => true); // Aceptar cualquier alert
    cy.visit('/');
    // Estas páginas son de administrador: se inicia sesión con el comando cy.login de /cypress/support/commands.js (el mismo que usa roles.cy.js)
    cy.login(ADMIN.email, ADMIN.password);

    // Mientras la lista carga, la tabla muestra la fila "No se encontraron...", que no es un registro real.
    // Por eso se espera la respuesta del GET y que aparezca al menos un registro (el ID de cada registro va en un <th>)
    cy.intercept('GET', '**/api/tipo_servicio').as('getTipos');
    cy.visit(RUTA);
    cy.wait('@getTipos');
    cy.get('#ttiposervicio tbody tr th').should('exist');
  });

  // ============================================
  // CASOS BÁSICOS
  // ============================================
  it('CP-UI-01: Debe cargar la página de tipos de servicio', () => {
    cy.url().should('include', RUTA);
  });

  it('CP-UI-02: Debe mostrar el título "Tipos de Servicio"', () => {
    cy.contains('h1', 'Tipos de Servicio').should('be.visible');
  });

  // Se espera la respuesta del GET (200) y se verifica que la tabla muestre registros
  it('CP-UI-03: La lista debe cargar los datos desde el backend', () => {
    cy.intercept('GET', '**/api/tipo_servicio').as('getTipos');
    cy.visit(RUTA);
    cy.wait('@getTipos').its('response.statusCode').should('eq', 200);
    // Se cuentan solo las filas con registros (la fila de "No se encontraron..." no tiene <th>)
    cy.get('#ttiposervicio tbody tr th').should('have.length.greaterThan', 0);
  });

  // ============================================
  // CASOS DE CREACIÓN
  // ============================================
  it('CP-UI-04: Debe crear un tipo de servicio correctamente', () => {
    const nombre = nombreUnico();

    cy.intercept('POST', '**/api/tipo_servicio').as('crearTipo');

    cy.contains('button', 'Nuevo').click();
    cy.get('#formTipoServicio2 #tipo_servicio').type(nombre);
    cy.get('#formTipoServicio2 #descripcion').type('Creado desde Cypress');
    cy.get('#formTipoServicio2 #precio_actual').type('50000');
    cy.get('#formTipoServicio2').contains('button', 'Registrar').click();

    cy.wait('@crearTipo').its('response.statusCode').should('eq', 201);
    cy.get('#registro').should('be.visible').and('contain', '¡Registro Exitoso!');

    // Al continuar, la lista se recarga y debe aparecer el nuevo registro
    cy.get('#btnExito').click();
    cy.contains('#ttiposervicio tbody tr', nombre).should('be.visible');
  });

  it('CP-UI-05: NO debe crear un tipo de servicio con los campos vacíos', () => {
    cy.intercept('POST', '**/api/tipo_servicio').as('crearTipo');

    cy.contains('button', 'Nuevo').click();
    cy.get('#formTipoServicio2').contains('button', 'Registrar').click();

    // El navegador bloquea el envío por los campos required, no se llama al backend
    cy.get('#formTipoServicio2 #tipo_servicio:invalid').should('exist');
    cy.get('@crearTipo.all').should('have.length', 0);
    cy.get('#registro').should('not.be.visible');
  });

  // El backend rechaza (400) nombres con números; la pantalla debe avisar con un alert y no mostrar el modal de éxito
  it('CP-UI-06: NO debe crear un tipo de servicio con números en el nombre', () => {
    // Se reemplaza window.alert de la página por un espía, para poder revisar el mensaje de error que muestra la pantalla
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alerta');
    });
    cy.intercept('POST', '**/api/tipo_servicio').as('crearTipo');

    cy.contains('button', 'Nuevo').click();
    cy.get('#formTipoServicio2 #tipo_servicio').type('Limpieza123');
    cy.get('#formTipoServicio2 #precio_actual').type('50000');
    cy.get('#formTipoServicio2').contains('button', 'Registrar').click();

    cy.wait('@crearTipo').its('response.statusCode').should('eq', 400);
    cy.get('@alerta').should('have.been.calledWithMatch', /solo debe contener letras/);
    cy.get('#registro').should('not.be.visible');
  });

  // El backend rechaza (400) un nombre repetido; la pantalla debe avisar con un alert y no mostrar el modal de éxito
  it('CP-UI-07: NO debe crear un tipo de servicio con un nombre que ya existe', () => {
    // Se reemplaza window.alert de la página por un espía, para poder revisar el mensaje de error que muestra la pantalla
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alerta');
    });
    cy.intercept('POST', '**/api/tipo_servicio').as('crearTipo');

    // Se toma el nombre del primer registro de la tabla
    cy.get('#ttiposervicio tbody tr').first().find('td').first().invoke('text').then((existente) => {
      cy.contains('button', 'Nuevo').click();
      cy.get('#formTipoServicio2 #tipo_servicio').type(existente);
      cy.get('#formTipoServicio2 #precio_actual').type('50000');
      cy.get('#formTipoServicio2').contains('button', 'Registrar').click();

      cy.wait('@crearTipo').its('response.statusCode').should('eq', 400);
      cy.get('@alerta').should('have.been.calledWithMatch', /Ya existe un tipo de servicio/);
    });
  });

  // ============================================
  // CASOS DE EDICIÓN
  // ============================================
  it('CP-UI-08: Debe abrir la edición de un tipo de servicio', () => {
    cy.get('#ttiposervicio tbody tr').first().click();

    // El formulario aparece con los datos del registro elegido
    cy.get('#formTipoServicio').should('be.visible');
    cy.get('#formTipoServicio #tipo_servicio').should('not.have.value', '');
  });

  // Se cambia solo la descripción del primer registro, se espera el PUT (200) y el modal de actualizado
  it('CP-UI-09: Debe actualizar un tipo de servicio correctamente', () => {
    cy.intercept('PUT', '**/api/tipo_servicio/*').as('actualizarTipo');

    cy.get('#ttiposervicio tbody tr').first().click();
    cy.get('#formTipoServicio #descripcion').clear().type('Actualizado desde Cypress');
    cy.get('#btnActualizar').click();

    cy.wait('@actualizarTipo').its('response.statusCode').should('eq', 200);
    cy.get('#actualiza').should('be.visible').and('contain', '¡Tipo de Servicio Actualizado!');

    cy.get('#btnCerrarV').click();
    cy.get('#formTipoServicio').should('not.exist');
  });

  // Cancelar debe ocultar el formulario sin guardar nada
  it('CP-UI-10: Debe cerrar el formulario al presionar Cancelar', () => {
    cy.get('#ttiposervicio tbody tr').first().click();
    cy.get('#formTipoServicio').should('be.visible');

    cy.get('#btnCancelar').click();
    cy.get('#formTipoServicio').should('not.exist');
  });

  // ============================================
  // CASOS DE BÚSQUEDA
  // ============================================
  // Se busca por el nombre de un registro existente y todas las filas que queden deben contenerlo
  it('CP-UI-11: Debe filtrar la lista al buscar por nombre', () => {
    cy.get('#ttiposervicio tbody tr').first().find('td').first().invoke('text').then((nombre) => {
      cy.get('input[placeholder^="Buscar"]').type(nombre);

      // Debe quedar al menos un registro; si no, el each de abajo pasaría sin comprobar nada
      cy.get('#ttiposervicio tbody tr th').should('exist');

      // Todas las filas que quedan deben contener el texto buscado
      cy.get('#ttiposervicio tbody tr').each(($fila) => {
        expect($fila.text().toLowerCase()).to.contain(nombre.toLowerCase());
      });
    });
  });

  // Un texto que no coincide con ningún registro debe mostrar el mensaje de lista vacía
  it('CP-UI-12: Debe mostrar un mensaje si la búsqueda no tiene resultados', () => {
    cy.get('input[placeholder^="Buscar"]').type('zzzzzzzzzz');
    cy.contains('No se encontraron tipos de servicio con ese criterio de búsqueda.').should('be.visible');
  });

});