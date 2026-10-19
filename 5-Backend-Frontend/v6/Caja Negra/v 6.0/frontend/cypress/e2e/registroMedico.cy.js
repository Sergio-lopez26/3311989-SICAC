describe('Pruebas de Caja Negra - Registro Medico (UI)', () => {

    // Registrar el handler del confirm UNA VEZ, antes de todos los tests
    beforeEach(() => {
        cy.on('window:confirm', () => true); // Aceptar cualquier confirm
        cy.on('window:alert', () => true); // Aceptar cualquier alert
        cy.visit('/');
        //Invocamos el comando que se creo en /cypress/support/commands.js
        cy.login('andrejur055@gmail.com', 'encriptaraqui01');
        cy.visit('/Registro_Medico');
        cy.contains('button', 'Registrar nuevo usuario aquí').click();

        const letras = Date.now().toString(36).replace(/[0-9]/g, ''); //Reemplazo de los números
        const lemail = letras + 'medico@gmail.com'
        cy.intercept('POST', '/api/usuario').as('crearU');

        cy.get('input[id="email"]').type(lemail);
        cy.get('input[id="password"]').type('123456789', { force:true });
        cy.get('input[id="confirmarPassword"]').type('123456789', { force:true });
        
        cy.contains('button', 'Registrarse').click();
        cy.wait('@crearU').its('response.statusCode').should('eq', 201);
    });

    // ============================================
    // CASOS BÁSICO
    // ============================================
    it('CP-UI-01: Debe cargar la página de registro de usuarios (Medico)', () => {
        cy.url().should('include', '/Registro_Medico');
    });

    // ============================================
    // CASO DE REGISTRO
    // ============================================
    it('CP-UI-02: NO debe crear un medico con un campo obligatorio vacío', () => {
        cy.contains('table tbody td', 'medico@gmail.com').click();
        cy.contains('button', 'Registrar').click();
        
        cy.get('select').then(($select) => {
        expect($select[0].validationMessage).to.not.be.empty
        });
    });

    it('CP-UI-03: NO debe crear un medico duplicado', () => {
        cy.intercept('POST', '/api/medico').as('crearM');
        //Acá es para que se de clic en el usuario creado dentro de la tabla
        cy.contains('table tbody td', 'medico@gmail.com').click();
        
        cy.get('select[id="id_tipo_documento"]').contains('option', 'CC').then(($option) =>{
            //Esto es para obtener el ID mapeado de esta opcion
            cy.get('select[id="id_tipo_documento"]').select($option.val(), { force: true });
        });
        cy.get('input[id="numero_documento"]').type('798456123', { force: true });
        cy.get('input[id="nombres"]').type('Test A', { force: true });
        cy.get('input[id="apellidos"]').type('Testa B', { force: true });
        cy.get('input[id="matricula_profesional"]').type('OD-19543-COL', { force: true });
        cy.get('input[id="numero_celular"]').type('3102345678', { force: true });

        cy.get('button[type="submit"][id="btnRegistrar"]').click();
        cy.wait('@crearM').its('response.statusCode').should('eq', 400);

        // El sistema NO debe avanzar y debe mostrar una alerta de error
        cy.on('window:alert', () => true);

        cy.url().should('include', '/Registro_Medico');
    });

    it('CP-UI-04: Debe crear un nuevo medico correctamente', () => {
        const documento = Date.now().toString();
        const letras = Date.now().toString();
        const matricula = 'OD' + letras;

        cy.intercept('POST', '/api/medico').as('crearM');

        cy.contains('table tbody td', 'medico@gmail.com').click();

        cy.get('select[id="id_tipo_documento"]').contains('option', 'CC').then(($option) =>{
            //Esto es para obtener el ID mapeado de esta opcion
            cy.get('select[id="id_tipo_documento"]').select($option.val(), { force: true });
        });
        cy.get('input[id="numero_documento"]').type(documento, { force: true });
        cy.get('input[id="nombres"]').type('Test A', { force: true });
        cy.get('input[id="apellidos"]').type('Testa B', { force: true });
        cy.get('input[id="matricula_profesional"]').type(matricula, { force: true });
        cy.get('input[id="numero_celular"]').type('3102345678', { force: true });
        
        cy.get('button[type="submit"][id="btnRegistrar"]').click();
        cy.wait('@crearM').its('response.statusCode').should('eq', 201);

        //Clic en Continuar
        cy.get('button[type="button"][id="btnExitoM"]').click();
        cy.visit('/Registro_Medico');
    });
});

