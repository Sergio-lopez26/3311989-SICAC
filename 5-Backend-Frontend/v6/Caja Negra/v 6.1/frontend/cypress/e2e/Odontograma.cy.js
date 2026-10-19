// Ruta de la pantalla dentro de la aplicación (se accede con el rol Administrador)
const RUTA_MAPAS = '/Gestionar_MapaDental';

// Usuario administrador de pruebas (el mismo que usa roles.cy.js)
const ADMIN = { email: 'andrejur055@gmail.com', password: 'encriptaraqui01' };

describe('Pruebas de Caja Negra - Odontograma (UI)', () => {

  // 🔑 Registrar los handlers UNA VEZ, antes de todos los tests
  beforeEach(() => {
    cy.on('window:confirm', () => true); // Aceptar cualquier confirm
    cy.on('window:alert', () => true); // Aceptar cualquier alert

    cy.visit('/');
    // Estas páginas son de administrador: se inicia sesión con el comando cy.login de /cypress/support/commands.js (el mismo que usa roles.cy.js)
    cy.login(ADMIN.email, ADMIN.password);

    // Se entra al odontograma desde la lista de mapas, como lo haría un usuario
    cy.intercept('GET', '**/api/pieza_dental/mapa/*').as('getPiezas');
    cy.visit(RUTA_MAPAS);
    cy.get('#tmapadental tbody tr').first().contains('button', 'Ver').click();
    cy.wait('@getPiezas').its('response.statusCode').should('eq', 200);
  });

  // ============================================
  // CASOS BÁSICOS
  // ============================================
  // La URL debe ser la del odontograma del mapa elegido en la lista
  it('CP-UI-01: Debe cargar la página del odontograma', () => {
    cy.url().should('include', '/Odontograma/');
  });

  it('CP-UI-02: Debe mostrar el título "Odontograma"', () => {
    cy.contains('h1', 'Odontograma').should('be.visible');
  });

  // El odontograma dibuja las 32 piezas permanentes (16 en el maxilar y 16 en la mandíbula)
  it('CP-UI-03: Debe mostrar las 32 piezas dentales', () => {
    cy.get('.diente-btn').should('have.length', 32);
  });

  // La leyenda explica los 9 estados clínicos posibles de una pieza
  it('CP-UI-04: Debe mostrar la leyenda con los 9 estados', () => {
    cy.get('.leyenda-item').should('have.length', 9);
  });

  // ============================================
  // CASOS DE SELECCIÓN Y EDICIÓN DE PIEZAS
  // ============================================
  it('CP-UI-05: Debe mostrar el formulario al hacer clic en una pieza', () => {
    // El panel no existe hasta que se elige una pieza
    cy.get('#formPieza').should('not.exist');

    // /^18$/ busca el botón cuyo texto sea exactamente 18 (así no coincide con otras piezas)
    cy.contains('.diente-btn', /^18$/).click();
    cy.contains('h5', 'Pieza 18').should('be.visible');

    // Cuadrante y posición se calculan solos a partir del código FDI y no se pueden editar
    cy.get('#cuadrante').should('have.value', '1').and('have.attr', 'readonly');
    cy.get('#posicion').should('have.value', '8').and('have.attr', 'readonly');
  });

  // Se cambia el estado actual de la pieza 18 a "Cariado", se guarda y la pieza debe quedar pintada del color de ese estado
  it('CP-UI-06: Debe guardar el estado de una pieza y pintarla con su color', () => {
    cy.contains('.diente-btn', /^18$/).click();
    cy.get('#estado_actual').select('Cariado');
    // El botón dice "Registrar" si la pieza aún no existe y "Actualizar" si ya existe
    cy.get('#formPieza').contains('button', /Registrar|Actualizar/).click();

    cy.get('#guardado').should('be.visible').and('contain', '¡Pieza Guardada!');
    cy.contains('#guardado button', 'Continuar').click();

    // "Cariado" se pinta de rojo (#f28b82)
    cy.contains('.diente-btn', /^18$/).should('have.css', 'background-color', 'rgb(242, 139, 130)');
  });

  // Cerrar debe ocultar el formulario de la pieza sin guardar nada
  it('CP-UI-07: Debe cerrar el formulario al presionar Cerrar', () => {
    cy.contains('.diente-btn', /^18$/).click();
    cy.get('#formPieza').should('be.visible');

    cy.get('#formPieza').contains('button', 'Cerrar').click();
    cy.get('#formPieza').should('not.exist');
  });

  // ============================================
  // NAVEGACIÓN
  // ============================================
  // El botón de volver regresa a la lista de mapas dentales
  it('CP-UI-08: Debe volver a la lista de mapas dentales', () => {
    cy.contains('button', 'Volver a Mapas Dentales').click();
    cy.url().should('include', RUTA_MAPAS);
    cy.contains('h1', 'Mapas Dentales').should('be.visible');
  });

});