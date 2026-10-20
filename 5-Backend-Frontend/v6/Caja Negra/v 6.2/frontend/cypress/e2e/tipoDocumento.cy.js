describe('Pruebas de Caja Negra - Tipos Documento (UI)', () => {

    // Registrar el handler del confirm UNA VEZ, antes de todos los tests
    beforeEach(() => {
        cy.on('window:confirm', () => true); // Aceptar cualquier confirm
        cy.on('window:alert', () => true); // Aceptar cualquier alert
        cy.visit('/');
        //Invocamos el comando que se creo en /cypress/support/commands.js
        cy.login('andrejur055@gmail.com', 'encriptaraqui01');
        cy.visit('/Gestionar_TiposDocumento');
    });

    // ============================================
    // CASOS BÁSICOS
    // ============================================
    it('CP-UI-01: Debe cargar la página de tipos de documento', () => {
        cy.url().should('include', '/Gestionar_TiposDocumento');
    });

    it('CP-UI-02: Debe mostrar el título "Tipos de Documento"', () => {
        cy.contains('h1', 'Tipos de Documento').should('be.visible');
    });

    // ============================================
    // CASOS DE CREACIÓN
    // ============================================
    it('CP-UI-03: Debe crear un nuevo tipo de documento correctamente', () => {
        //Como tenemos campos con validaciones, es mejor que en vez de número se escriban letras
        const letras = Date.now().toString(36).replace(/[0-9]/g, ''); //Reemplazo de los números
        const tsigla = 'CP' + letras;
        const tDocTest = 'Cypress T ' + letras;

        cy.intercept('POST', '/api/tipo_documento').as('crearTDoc');
        //Clic en Nuevo
        cy.contains('button', 'Nuevo').click();

        cy.get('input[id="sigla"]').type(tsigla);
        cy.get('input[id="nombre_documento"]').type(tDocTest);
        
        cy.contains('button', 'Registrar').click();
        cy.wait('@crearTDoc').its('response.statusCode').should('eq', 201);

        //Clic en Continuar
        cy.get('button[type="button"][id="btnExito"]').click();

        //cy.visit('/Gestionar_TiposDocumento');

        cy.contains(tDocTest).should('be.visible');
    });

    it('CP-UI-04: NO debe crear un tipo de documento con un campo vacío', () => {
        //Clic en Nuevo
        cy.contains('button', 'Nuevo').click();

        cy.contains('button', 'Registrar').click();
        
        cy.get('input[type="text"]').then(($input) => {
        expect($input[0].validationMessage).to.not.be.empty
        });
    });

    it('CP-UI-05: NO debe crear un tipo de documento duplicado', () => {
        cy.intercept('POST', '/api/tipo_documento').as('crearTDoc');
        //Clic en Nuevo
        cy.contains('button', 'Nuevo').click();

        cy.get('input[id="sigla"]').type('CC');
        cy.get('input[id="nombre_documento"]').type('No Crear');

        cy.contains('button', 'Registrar').click();
        cy.wait('@crearTDoc').its('response.statusCode').should('eq', 400);

        // El sistema NO debe avanzar y debe mostrar una alerta de error
        cy.on('window:alert', () => true);

        cy.url().should('include', '/Gestionar_TiposDocumento');
    });

    // ============================================
    // CASO DE ACTUALIZACIÓN
    // ============================================
    it('CP-UI-06: Debe abrir la edición de un tipo de documento y actualizarlo', () => {
        //Hacemos clic en el tipo de documento "Cypres T" de la tabla
        cy.contains('table tbody td', 'Cypress T').click();

        cy.get('input[id="nombre_documento"]').type(' A');
        cy.contains('button', 'Actualizar').click();

        //Clic en Continuar
        cy.get('button[type="button"][id="btnCerrarV"]').click();
        
        cy.visit('/Gestionar_TiposDocumento');
        
        //Verificar que ahora hay un input visible (edición inline o modal)
        cy.get('input').should('be.visible');
    });
    
    // ============================================
    // CASO DE ELIMINACIÓN -->Si se pudo :)
    // ============================================
    it('CP-UI-07: Debe eliminar un tipo de documento existente', () => {
        const tDoc = 'Cypress Test';

        // Interceptamos las peticiones que vamos a usar
        cy.intercept('POST', '/api/tipo_documento').as('crearTDoc');
        cy.intercept('DELETE', '/api/tipo_documento/**').as('borrarTDoc');

        //Crear el tipo de documento
        cy.contains('button', 'Nuevo').click();

        cy.get('input[id="sigla"]').type('CT');
        cy.get('input[id="nombre_documento"]').type(tDoc);
        
        cy.contains('button', 'Registrar').click();
        cy.wait('@crearTDoc').its('response.statusCode').should('eq', 201);

        //Clic en Continuar
        cy.get('button[type="button"][id="btnExito"]').click();
        cy.visit('/Gestionar_TiposDocumento');
        
        //Eliminar tipo de documento previamente creado
        //Seleccionar el tipo de documento creado
        cy.contains('table tbody td', 'Cypress Test').click();

        //Clic en Eliminar
        cy.contains('button', 'Eliminar').click();
        cy.get('button[type="button"][id="btnSi"]').click();

        //Esperar a que el DELETE se complete
        cy.wait('@borrarTDoc').its('response.statusCode').should('be.oneOf', [200, 204]);
        cy.get('button[type="button"][id="btnExitoE"]').click();

        cy.visit('/Gestionar_TiposDocumento');      

        //Verificar que ya no esté este rol
        cy.contains(tDoc).should('not.exist');
    });

});

