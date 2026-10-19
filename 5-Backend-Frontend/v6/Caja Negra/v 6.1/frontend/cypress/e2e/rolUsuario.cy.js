describe('Pruebas de Caja Negra - Roles de Usuario (UI)', () => {

    // Registrar el handler del confirm UNA VEZ, antes de todos los tests
    beforeEach(() => {
        cy.on('window:confirm', () => true); // Aceptar cualquier confirm
        cy.on('window:alert', () => true); // Aceptar cualquier alert
        cy.visit('/');
        //Invocamos el comando que se creo en /cypress/support/commands.js
        cy.login('andrejur055@gmail.com', 'encriptaraqui01');
        cy.visit('/Gestionar_RolUsuario');
    });

    // ============================================
    // CASOS BÁSICOS
    // ============================================
    it('CP-UI-01: Debe cargar la página de roles de usuario', () => {
        cy.url().should('include', '/Gestionar_RolUsuario');
    });

    it('CP-UI-02: Debe mostrar el título "Roles de Usuario"', () => {
        cy.contains('h1', 'Roles de Usuario').should('be.visible');
    });

    // ============================================
    // CASOS DE ASIGNACIÓN
    // ============================================
    it('CP-UI-03: Debe asignar un nuevo rol a un usuario correctamente', () => {
        cy.intercept('POST', '/api/rol_usuario').as('crearRolU');
        //Acá es para que se de clic en el select de Rol Asignado de Carlos, y se elija Administrador
        cy.contains('tr', 'carlos.ruiz@gmail.com').within(() =>{
            cy.get('select').select('Administrador', { force:true });
        });
        
        cy.get('button[type="button"][id="btnSiRU"]').click();
        cy.wait('@crearRolU').its('response.statusCode').should('eq', 201);

        //Clic en Continuar
        cy.get('button[type="button"][id="btnExitoRU"]').click();
        cy.visit('/Gestionar_RolUsuario');
    });

    it('CP-UI-04: NO debe asignar un rol ya asignado al mismo usuario', () => {
        cy.intercept('POST', '/api/rol_usuario').as('crearRolU');
        
        cy.contains('tr', 'carlos.ruiz@gmail.com').within(() =>{
            cy.get('select').select('Medico', { force:true });
        });
        
        cy.get('button[type="button"][id="btnSiRU"]').click();
        cy.wait('@crearRolU').its('response.statusCode').should('eq', 400);

        // El sistema NO debe avanzar y debe mostrar una alerta de error
        cy.on('window:alert', () => true);

        cy.visit('/Gestionar_RolUsuario');
    });
    
    // ============================================
    // CASOS DE NUEVO INGRESO
    // ============================================
    it('CP-UI-05: Debe ingresar con el rol asignado previamente (Administrador)', () => {
        //Salir del usuario actual
        cy.contains('button','Cerrar Sesión').click();

        cy.get('button[type="button"][id="btnSalirA"').click();
        
        cy.get('input[type="email"]').type('carlos.ruiz@gmail.com', { force:true }); //Asignarle rol de Admin
        cy.get('input[type="password"]').type('clave002', { force:true });

        cy.get('button[type="submit"]').click();

        cy.contains('Su cuenta posee múltiples roles de acceso. ').should('be.visible');
        //Clic en el Rol de Administrador
        cy.contains('button[type="button"]','Administrador').click();

        cy.get('button[type="button"][id="btnCerrarV"]').should('be.visible').click({ force: true });

        cy.url().should('include', '/Menu_Administrador');
        cy.visit('/Menu_Administrador');
    });

    // ============================================
    // CASO DE ELIMINACIÓN -->Si se pudo :)
    // ============================================
    it('CP-UI-06: Debe eliminar la asignación de rol previa', () => {
        cy.intercept('DELETE', '/api/rol_usuario/**/**').as('borrarRolU');
        
        //Eliminar asignación del rol
        cy.contains('tr', 'carlos.ruiz@gmail.com').within(() =>{
            cy.get('button').click({ force:true });
        });

        cy.get('button[type="button"][id="btnSiERU"]').click();

        //Esperar a que el DELETE se complete
        cy.wait('@borrarRolU').its('response.statusCode').should('be.oneOf', [200, 204]);
        cy.get('button[type="button"][id="btnExitoERU"]').click();

        cy.visit('/Gestionar_RolUsuario');      
    });

});
