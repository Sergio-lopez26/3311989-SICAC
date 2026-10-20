// Ruta de la pantalla dentro de la aplicación (se accede con el rol Administrador)
const RUTA = '/Gestionar_MapaDental';

// Usuario administrador de pruebas (el mismo que usa roles.cy.js)
const ADMIN = { email: 'andrejur055@gmail.com', password: 'encriptaraqui01' };

// ID de un historial médico que ya existe en la base de datos (cada mapa dental se asocia a un historial)
const ID_HISTORIAL = 1;

describe('Pruebas de Caja Negra - Mapas Dentales (UI)', () => {

  // 🔑 Registrar los handlers UNA VEZ, antes de todos los tests
  beforeEach(() => {
    cy.on('window:confirm', () => true); // Aceptar cualquier confirm
    cy.on('window:alert', () => true); // Aceptar cualquier alert
    cy.visit('/');
    // Estas páginas son de administrador: se inicia sesión con el comando cy.login de /cypress/support/commands.js (el mismo que usa roles.cy.js)
    cy.login(ADMIN.email, ADMIN.password);

    // Mientras la lista carga, la tabla muestra la fila "No se encontraron...", que no es un registro real.
    // Por eso se espera la respuesta del GET y que aparezca al menos un registro (el ID de cada registro va en un <th>)
    cy.intercept('GET', '**/api/mapa_dental').as('getMapas');
    cy.visit(RUTA);
    cy.wait('@getMapas');
    cy.get('#tmapadental tbody tr th').should('exist');
  });

  // ============================================
  // CASOS BÁSICOS
  // ============================================
  it('CP-UI-01: Debe cargar la página de mapas dentales', () => {
    cy.url().should('include', RUTA);
  });

  it('CP-UI-02: Debe mostrar el título "Mapas Dentales"', () => {
    cy.contains('h1', 'Mapas Dentales').should('be.visible');
  });

  // Se espera la respuesta del GET (200) y se verifica que la tabla muestre registros
  it('CP-UI-03: La lista debe cargar los datos desde el backend', () => {
    cy.intercept('GET', '**/api/mapa_dental').as('getMapas');
    cy.visit(RUTA);
    cy.wait('@getMapas').its('response.statusCode').should('eq', 200);
    // Se cuentan solo las filas con registros (la fila de "No se encontraron..." no tiene <th>)
    cy.get('#tmapadental tbody tr th').should('have.length.greaterThan', 0);
  });

  // ============================================
  // CASOS DE CREACIÓN
  // ============================================
  it('CP-UI-04: Debe crear un mapa dental correctamente', () => {
    const nombre = 'Cypress Mapa ' + Date.now();

    cy.intercept('POST', '**/api/mapa_dental').as('crearMapa');

    cy.contains('button', 'Nuevo').click();
    cy.get('#formMapaDental2 #id_historial_medico').type(String(ID_HISTORIAL));
    cy.get('#formMapaDental2 #nombre_estandar').type(nombre);
    cy.get('#formMapaDental2 #observacion_inicial').type('Creado desde Cypress');
    cy.get('#formMapaDental2 #estado_mapa_dental').select('Activo');
    cy.get('#formMapaDental2').contains('button', 'Registrar').click();

    cy.wait('@crearMapa').its('response.statusCode').should('eq', 201);
    cy.get('#registro').should('be.visible').and('contain', '¡Registro Exitoso!');

    // Al continuar, la lista se recarga y debe aparecer el nuevo mapa
    cy.get('#btnExito').click();
    cy.contains('#tmapadental tbody tr', nombre).should('be.visible');
  });

  it('CP-UI-05: NO debe crear un mapa dental con los campos vacíos', () => {
    cy.intercept('POST', '**/api/mapa_dental').as('crearMapa');

    cy.contains('button', 'Nuevo').click();
    cy.get('#formMapaDental2').contains('button', 'Registrar').click();

    // El navegador bloquea el envío por los campos required, no se llama al backend
    cy.get('#formMapaDental2 #nombre_estandar:invalid').should('exist');
    cy.get('@crearMapa.all').should('have.length', 0);
    cy.get('#registro').should('not.be.visible');
  });

  // El historial no existe: el mapa no debe registrarse, la pantalla debe avisar con un alert y no mostrar el modal de éxito
  it('CP-UI-06: NO debe crear un mapa dental con un historial médico que no existe', () => {
    // Se reemplaza window.alert de la página por un espía, para poder revisar el mensaje de error que muestra la pantalla
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alerta');
    });
    cy.intercept('POST', '**/api/mapa_dental').as('crearMapa');

    cy.contains('button', 'Nuevo').click();
    cy.get('#formMapaDental2 #id_historial_medico').type('999999');
    cy.get('#formMapaDental2 #nombre_estandar').type('Cypress historial inexistente');
    cy.get('#formMapaDental2').contains('button', 'Registrar').click();

    // No debe registrarse: el backend responde con error y la pantalla avisa con una alerta
    cy.wait('@crearMapa').its('response.statusCode').should('not.eq', 201);
    cy.get('@alerta').should('have.been.called');
    cy.get('#registro').should('not.be.visible');
  });

  // ============================================
  // CASOS DE EDICIÓN
  // ============================================
  it('CP-UI-07: Debe abrir la edición de un mapa dental', () => {
    cy.get('#tmapadental tbody tr').first().click();

    // El formulario aparece con los datos del registro elegido
    cy.get('#formMapaDental').should('be.visible');
    cy.get('#formMapaDental #nombre_estandar').should('not.have.value', '');
  });

  // Se cambia solo la observación del primer mapa, se espera el PUT (200) y el modal de actualizado
  it('CP-UI-08: Debe actualizar un mapa dental correctamente', () => {
    cy.intercept('PUT', '**/api/mapa_dental/*').as('actualizarMapa');

    cy.get('#tmapadental tbody tr').first().click();
    cy.get('#formMapaDental #observacion_inicial').clear().type('Actualizado desde Cypress');
    cy.get('#btnActualizar').click();

    cy.wait('@actualizarMapa').its('response.statusCode').should('eq', 200);
    cy.get('#actualiza').should('be.visible').and('contain', '¡Mapa Dental Actualizado!');

    cy.get('#btnCerrarV').click();
    cy.get('#formMapaDental').should('not.exist');
  });

  // Cancelar debe ocultar el formulario sin guardar nada
  it('CP-UI-09: Debe cerrar el formulario al presionar Cancelar', () => {
    cy.get('#tmapadental tbody tr').first().click();
    cy.get('#formMapaDental').should('be.visible');

    cy.get('#btnCancelar').click();
    cy.get('#formMapaDental').should('not.exist');
  });

  // ============================================
  // CASOS DE BÚSQUEDA
  // ============================================
  // Se busca por el nombre de un mapa existente y todas las filas que queden deben contenerlo
  it('CP-UI-10: Debe filtrar la lista al buscar por nombre estándar', () => {
    // La columna "Nombre Estándar" es la tercera celda de cada fila (la primera es el <th> con el ID)
    cy.get('#tmapadental tbody tr').first().find('td').eq(1).invoke('text').then((nombre) => {
      cy.get('input[placeholder^="Buscar"]').type(nombre);

      // Debe quedar al menos un registro; si no, el each de abajo pasaría sin comprobar nada
      cy.get('#tmapadental tbody tr th').should('exist');

      cy.get('#tmapadental tbody tr').each(($fila) => {
        expect($fila.text().toLowerCase()).to.contain(nombre.toLowerCase());
      });
    });
  });

  // Un texto que no coincide con ningún mapa debe mostrar el mensaje de lista vacía
  it('CP-UI-11: Debe mostrar un mensaje si la búsqueda no tiene resultados', () => {
    cy.get('input[placeholder^="Buscar"]').type('zzzzzzzzzz');
    cy.contains('No se encontraron mapas dentales con ese criterio de búsqueda.').should('be.visible');
  });

  // ============================================
  // NAVEGACIÓN AL ODONTOGRAMA
  // ============================================
  // El botón "Ver" de la fila lleva al odontograma de ese mapa
  it('CP-UI-12: Debe abrir el odontograma con el botón "Ver" de la fila', () => {
    cy.get('#tmapadental tbody tr').first().contains('button', 'Ver').click();
    cy.url().should('include', '/Odontograma/');
    cy.contains('h1', 'Odontograma').should('be.visible');
  });

  // Al elegir una fila se abre el formulario, y desde ahí el botón "Ver Odontograma" lleva al odontograma de ese mapa
  it('CP-UI-13: Debe abrir el odontograma con el botón "Ver Odontograma" del formulario', () => {
    cy.get('#tmapadental tbody tr').first().click();
    cy.contains('button', 'Ver Odontograma').click();
    cy.url().should('include', '/Odontograma/');
  });

});