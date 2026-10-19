describe('Pruebas de Caja Negra - Roles (UI)', () => {

    // Registrar el handler del confirm UNA VEZ, antes de todos los tests
    beforeEach(() => {
        cy.on('window:confirm', () => true); // Aceptar cualquier confirm
        cy.on('window:alert', () => true); // Aceptar cualquier alert
        cy.visit('/');
        //Invocamos el comando que se creo en /cypress/support/commands.js
        cy.login('andrejur055@gmail.com', 'encriptaraqui01');
        cy.visit('/Gestionar_Roles');
    });

    // ============================================
    // CASOS BÁSICOS
    // ============================================
    it('CP-UI-01: Debe cargar la página de roles', () => {
        cy.url().should('include', '/Gestionar_Roles');
    });

    it('CP-UI-02: Debe mostrar el título "Roles"', () => {
        cy.contains('h1', 'Roles').should('be.visible');
    });

    // ============================================
    // CASOS DE CREACIÓN
    // ============================================
    it('CP-UI-03: Debe crear un nuevo rol correctamente', () => {
        //Como tenemos campos con validaciones, es mejor que en vez de número se escriban letras
        const letras = Date.now().toString(36).replace(/[0-9]/g, ''); //Reemplazo de los números
        const rolTest = 'Cypress T ' + letras;

        cy.intercept('POST', '/api/rol').as('crearRol');
        //Clic en Nuevo
        cy.contains('button', 'Nuevo').click();

        cy.get('input[id="rol"]').type(rolTest);
        
        cy.contains('button', 'Registrar').click();
        cy.wait('@crearRol').its('response.statusCode').should('eq', 201);

        //Clic en Continuar
        cy.get('button[type="button"][id="btnExito"]').click();

        //cy.visit('/Gestionar_Roles');

        cy.contains(rolTest).should('be.visible');
    });

    it('CP-UI-04: NO debe crear un rol con el campo vacío', () => {
        //Clic en Nuevo
        cy.contains('button', 'Nuevo').click();

        cy.contains('button', 'Registrar').click();
        
        cy.get('input[type="text"]').then(($input) => {
        expect($input[0].validationMessage).to.not.be.empty
        });
    });

    it('CP-UI-05: NO debe crear un rol duplicado', () => {
        cy.intercept('POST', '/api/rol').as('crearRol');
        //Clic en Nuevo
        cy.contains('button', 'Nuevo').click();

        cy.get('input[id="rol"]').type('Paciente');

        cy.contains('button', 'Registrar').click();
        cy.wait('@crearRol').its('response.statusCode').should('eq', 400);

        // El sistema NO debe avanzar y debe mostrar una alerta de error
        cy.on('window:alert', () => true);

        cy.url().should('include', '/Gestionar_Roles');
    });

    // ============================================
    // CASO DE ACTUALIZACIÓN
    // ============================================
    it('CP-UI-06: Debe abrir la edición de un rol y actualizarlo', () => {
        // Hacemos clic en el rol "Test" de la tabla ->Previamente toca tener ese rol creado
        cy.contains('table tbody td', 'Test').click();

        cy.get('input[id="rol"]').type(' A');
        cy.contains('button', 'Actualizar').click();

        //Clic en Continuar
        cy.get('button[type="button"][id="btnCerrarV"]').click();
        
        cy.visit('/Gestionar_Roles');
        
        //Verificar que ahora hay un input visible (edición inline o modal)
        cy.get('input').should('be.visible');
    });
    
    // ============================================
    // CASO DE ELIMINACIÓN -->Si se pudo :)
    // ============================================
    it('CP-UI-07: Debe eliminar un rol existente', () => {
        const rolUnico = 'Cypress Test';

        // Interceptamos las peticiones que vamos a usar
        cy.intercept('POST', '/api/rol').as('crearRol');
        cy.intercept('DELETE', '/api/rol/**').as('borrarRol');

        //Crear el rol
        cy.contains('button', 'Nuevo').click();

        cy.get('input[id="rol"]').type(rolUnico);
        
        cy.contains('button', 'Registrar').click();
        cy.wait('@crearRol').its('response.statusCode').should('eq', 201);

        //Clic en Continuar
        cy.get('button[type="button"][id="btnExito"]').click();
        cy.visit('/Gestionar_Roles');
        
        //Eliminar rol previamente creado
        //Seleccionar el rol creado
        cy.contains('table tbody td', 'Cypress Test').click();

        //Clic en Eliminar
        cy.contains('button', 'Eliminar').click();
        cy.get('button[type="button"][id="btnSi"]').click();

        //Esperar a que el DELETE se complete
        cy.wait('@borrarRol').its('response.statusCode').should('be.oneOf', [200, 204]);
        cy.get('button[type="button"][id="btnExitoE"]').click();

        cy.visit('/Gestionar_Roles');      

        //Verificar que ya no esté este rol
        cy.contains(rolUnico).should('not.exist');
    });

});

