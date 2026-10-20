// Ruta de la pantalla dentro de la aplicación (se accede con el rol Administrador)
const RUTA = '/Gestionar_Servicios';

// Usuario administrador de pruebas (el mismo que usa roles.cy.js)
const ADMIN = { email: 'andrejur055@gmail.com', password: 'encriptaraqui01' };

// ID de un diagnóstico que ya existe en la base de datos (cada servicio se asocia a un diagnóstico)
const ID_DIAGNOSTICO = 1;

describe('Pruebas de Caja Negra - Servicios (UI)', () => {

  // 🔑 Registrar los handlers UNA VEZ, antes de todos los tests
  beforeEach(() => {
    cy.on('window:confirm', () => true); // Aceptar cualquier confirm
    cy.on('window:alert', () => true); // Aceptar cualquier alert
    cy.visit('/');
    // Estas páginas son de administrador: se inicia sesión con el comando cy.login de /cypress/support/commands.js (el mismo que usa roles.cy.js)
    cy.login(ADMIN.email, ADMIN.password);

    // Mientras la lista carga, la tabla muestra la fila "No se encontraron...", que no es un registro real.
    // Por eso se espera la respuesta de los dos GET (servicios y tipos) y que aparezca al menos un registro
    // (las filas con registros tienen varias celdas; la del mensaje tiene una sola)
    cy.intercept('GET', '**/api/servicio').as('getServicios');
    cy.intercept('GET', '**/api/tipo_servicio').as('getTipos');
    cy.visit(RUTA);
    cy.wait(['@getServicios', '@getTipos']);
    cy.get('#tservicios tbody tr td:nth-child(2)').should('exist');
  });

  // ============================================
  // CASOS BÁSICOS
  // ============================================
  it('CP-UI-01: Debe cargar la página de servicios', () => {
    cy.url().should('include', RUTA);
  });

  it('CP-UI-02: Debe mostrar el título "Servicios"', () => {
    cy.contains('h1', 'Servicios').should('be.visible');
  });

  // Se espera la respuesta del GET (200) y se verifica que la tabla muestre registros
  it('CP-UI-03: La lista debe cargar los datos desde el backend', () => {
    cy.intercept('GET', '**/api/servicio').as('getServicios');
    cy.visit(RUTA);
    cy.wait('@getServicios').its('response.statusCode').should('eq', 200);
    // Se cuentan solo las filas con registros (la fila de "No se encontraron..." tiene una sola celda)
    cy.get('#tservicios tbody tr td:nth-child(2)').should('have.length.greaterThan', 0);
  });

  // ============================================
  // CASOS DE CREACIÓN
  // ============================================
  it('CP-UI-04: Debe crear un servicio correctamente', () => {
    const nombre = 'Cypress Servicio ' + Date.now();

    cy.intercept('POST', '**/api/servicio').as('crearServicio');

    cy.contains('button', 'Nuevo').click();
    cy.get('#formServicio2 #id_tipo_servicio').select(1); // 0 es el texto "Seleccione...", 1 es el primer tipo real
    cy.get('#formServicio2 #id_diagnostico').type(String(ID_DIAGNOSTICO));
    cy.get('#formServicio2 #nombre_servicio').type(nombre);
    cy.get('#formServicio2 #procedimiento').type('Procedimiento de prueba');
    cy.get('#formServicio2').contains('button', 'Registrar').click();

    cy.wait('@crearServicio').its('response.statusCode').should('eq', 201);
    cy.get('#registro').should('be.visible').and('contain', '¡Registro Exitoso!');

    // Al continuar, la lista se recarga y debe aparecer el nuevo servicio
    cy.get('#btnExito').click();
    cy.contains('#tservicios tbody tr', nombre).should('be.visible');
  });

  it('CP-UI-05: NO debe crear un servicio con los campos vacíos', () => {
    cy.intercept('POST', '**/api/servicio').as('crearServicio');

    cy.contains('button', 'Nuevo').click();
    cy.get('#formServicio2').contains('button', 'Registrar').click();

    // El navegador bloquea el envío por los campos required, no se llama al backend
    cy.get('#formServicio2 #nombre_servicio:invalid').should('exist');
    cy.get('@crearServicio.all').should('have.length', 0);
    cy.get('#registro').should('not.be.visible');
  });

  // Al elegir un tipo de servicio, el formulario muestra el precio del catálogo como referencia (el backend es quien lo aplica al guardar)
  it('CP-UI-06: Debe mostrar el precio de referencia al elegir un tipo de servicio', () => {
    cy.contains('button', 'Nuevo').click();
    cy.contains('Precio de referencia del catálogo').should('not.exist');

    cy.get('#formServicio2 #id_tipo_servicio').select(1);
    cy.contains('Precio de referencia del catálogo').should('be.visible');
  });

  // El diagnóstico no existe: el servicio no debe registrarse, la pantalla debe avisar con un alert y no mostrar el modal de éxito
  it('CP-UI-07: NO debe crear un servicio con un diagnóstico que no existe', () => {
    // Se reemplaza window.alert de la página por un espía, para poder revisar el mensaje de error que muestra la pantalla
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alerta');
    });
    cy.intercept('POST', '**/api/servicio').as('crearServicio');

    cy.contains('button', 'Nuevo').click();
    cy.get('#formServicio2 #id_tipo_servicio').select(1);
    cy.get('#formServicio2 #id_diagnostico').type('999999');
    cy.get('#formServicio2 #nombre_servicio').type('Cypress diagnostico inexistente');
    cy.get('#formServicio2').contains('button', 'Registrar').click();

    // No debe registrarse: el backend responde con error y la pantalla avisa con una alerta
    cy.wait('@crearServicio').its('response.statusCode').should('not.eq', 201);
    cy.get('@alerta').should('have.been.called');
    cy.get('#registro').should('not.be.visible');
  });

  // ============================================
  // CASOS DE EDICIÓN
  // ============================================
  it('CP-UI-08: Debe abrir la edición de un servicio', () => {
    cy.get('#tservicios tbody tr').first().click();

    // El formulario aparece con los datos del registro elegido
    cy.get('#formServicio').should('be.visible');
    cy.get('#formServicio #nombre_servicio').should('not.have.value', '');
    cy.get('#formServicio #precio_aplicado').should('not.have.value', '');
  });

  // Se cambia solo el procedimiento del primer servicio, se espera el PUT (200) y el modal de actualizado
  it('CP-UI-09: Debe actualizar un servicio correctamente', () => {
    cy.intercept('PUT', '**/api/servicio/*').as('actualizarServicio');

    cy.get('#tservicios tbody tr').first().click();
    cy.get('#formServicio #procedimiento').clear().type('Actualizado desde Cypress');
    cy.get('#btnActualizar').click();

    cy.wait('@actualizarServicio').its('response.statusCode').should('eq', 200);
    cy.get('#actualiza').should('be.visible').and('contain', '¡Servicio Actualizado!');

    cy.get('#btnCerrarV').click();
    cy.get('#formServicio').should('not.exist');
  });

  // Cancelar debe ocultar el formulario sin guardar nada
  it('CP-UI-10: Debe cerrar el formulario al presionar Cancelar', () => {
    cy.get('#tservicios tbody tr').first().click();
    cy.get('#formServicio').should('be.visible');

    cy.get('#btnCancelar').click();
    cy.get('#formServicio').should('not.exist');
  });

  // ============================================
  // CASOS DE BÚSQUEDA
  // ============================================
  // Se busca por el nombre de un servicio existente y todas las filas que queden deben contenerlo
  it('CP-UI-11: Debe filtrar la lista al buscar por nombre del servicio', () => {
    // La columna "Servicio" es la segunda celda de cada fila
    cy.get('#tservicios tbody tr').first().find('td').eq(1).invoke('text').then((nombre) => {
      cy.get('input[placeholder^="Buscar"]').type(nombre);

      // Debe quedar al menos un registro; si no, el each de abajo pasaría sin comprobar nada
      cy.get('#tservicios tbody tr td:nth-child(2)').should('exist');

      cy.get('#tservicios tbody tr').each(($fila) => {
        expect($fila.text().toLowerCase()).to.contain(nombre.toLowerCase());
      });
    });
  });

  // Un texto que no coincide con ningún servicio debe mostrar el mensaje de lista vacía
  it('CP-UI-12: Debe mostrar un mensaje si la búsqueda no tiene resultados', () => {
    cy.get('input[placeholder^="Buscar"]').type('zzzzzzzzzz');
    cy.contains('No se encontraron servicios con ese criterio de búsqueda.').should('be.visible');
  });

});