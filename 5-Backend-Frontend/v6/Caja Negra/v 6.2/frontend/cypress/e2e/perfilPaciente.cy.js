describe('Pruebas de Caja Negra - Perfil Paciente (UI)', () => {

    // Registrar el handler del confirm UNA VEZ, antes de todos los tests
    beforeEach(() => {
        cy.on('window:confirm', () => true); // Aceptar cualquier confirm
        cy.on('window:alert', () => true); // Aceptar cualquier alert
        cy.visit('/');

        cy.get('input[type="email"]').type('laura.martinez@gmail.com');
        cy.get('input[type="password"]').type('clave001');

        cy.get('button[type="submit"]').click();

        cy.contains('Su cuenta posee múltiples roles de acceso. ').should('be.visible');
        
        cy.contains('button[type="button"]','Paciente').click()

        cy.get('button[type="button"][id="btnCerrarV"]').should('be.visible').click({ force: true });
        cy.visit('/Perfil_Paciente');
    });

    // ============================================
    // CASOS BÁSICOS
    // ============================================
    it('CP-UI-01: Debe cargar la página de perfil del paciente', () => {
        cy.url().should('include', '/Perfil_Paciente');
    });

    it('CP-UI-02: Debe mostrar el título "Mi Perfil"', () => {
        cy.contains('h1', 'Mi Perfil').should('be.visible');
    });

    // ============================================
    // CASO DE ACTUALIZACIÓN
    // ============================================
    it('CP-UI-03: Debe abrir la edición del perfil y actualizar un campo', () => {
        cy.intercept('PUT', '/api/paciente/**').as('actualizaPac');
        cy.get('input[id="numero_celular"]').should('not.have.value', '');

        cy.get('input[id="numero_celular"]').clear({ force:true }).type('3102546798', { force: true }); //clear() es para "limpiar" el valor del campo, para despues con type() poner el nuevo valor
        cy.contains('button', 'Actualizar').click();

        cy.wait('@actualizaPac').its('response.statusCode').should('be.oneOf', [200, 204]);
        //Clic en Continuar
        cy.get('button[type="button"][id="btnCerrarV"]').click();
        
        cy.visit('/Perfil_Paciente');
        
        //Verificar que ahora hay un input visible (edición inline o modal)
        cy.get('input[id="numero_celular"]').should('be.visible').and('have.value', '3102546798');
    });

    it('CP-UI-04: Debe actualizar el numero de celular a su valor inicial', () => {
        cy.intercept('PUT', '/api/paciente/**').as('actualizaPac');
        cy.get('input[id="numero_celular"]').should('not.have.value', '');

        cy.get('input[id="numero_celular"]').clear({ force:true }).type('3114567890', { force: true });
        cy.contains('button', 'Actualizar').click();

        cy.wait('@actualizaPac').its('response.statusCode').should('be.oneOf', [200, 204]);
        //Clic en Continuar
        cy.get('button[type="button"][id="btnCerrarV"]').click();
        
        cy.visit('/Perfil_Paciente');
        
        //Verificar que ahora hay un input visible (edición inline o modal)
        cy.get('input[id="numero_celular"]').should('be.visible').and('have.value', '3114567890');
    });
});

