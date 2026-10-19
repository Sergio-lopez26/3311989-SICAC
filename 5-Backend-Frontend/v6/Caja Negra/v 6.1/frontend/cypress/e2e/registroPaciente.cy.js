describe('Pruebas de Caja Negra - Registro Paciente (UI)', () => {

    // Registrar el handler del confirm UNA VEZ, antes de todos los tests
    beforeEach(() => {
        cy.on('window:confirm', () => true); // Aceptar cualquier confirm
        cy.on('window:alert', () => true); // Aceptar cualquier alert
        cy.visit('/Registro_Inicial');
        const letras = Date.now().toString(36).replace(/[0-9]/g, ''); //Reemplazo de los números
        const lemail = letras + 'paciente@gmail.com'
        cy.intercept('POST', '/api/usuario').as('crearU');

        cy.get('input[id="email"]').type(lemail);
        cy.get('input[id="password"]').type('123456789');
        cy.get('input[id="confirmarPassword"]').type('123456789');
        
        cy.contains('button', 'Registrarse').click();
        cy.wait('@crearU').its('response.statusCode').should('eq', 201);

        //Clic en Continuar
        cy.get('button[type="button"][id="btnExito"]').click();
    });

    // ============================================
    // CASOS BÁSICO
    // ============================================
    it('CP-UI-01: Debe cargar la página de registro de usuarios (Paciente)', () => {
        cy.url().should('include', '/Registro_Paciente');
    });

    // ============================================
    // CASO DE REGISTRO
    // ============================================
    it('CP-UI-02: NO debe crear un paciente con un campo obligatorio vacío', () => {
        cy.contains('button', 'Registrarse').click();
        
        cy.get('select').then(($select) => {
        expect($select[0].validationMessage).to.not.be.empty
        });
    });

    it('CP-UI-03: NO debe crear un paciente duplicado', () => {
        cy.intercept('POST', '/api/paciente').as('crearP');
        
        cy.get('select[id="id_tipo_documento"]').contains('option', 'CC').then(($option) =>{
            //Esto es para obtener el ID mapeado de esta opcion
            cy.get('select[id="id_tipo_documento"]').select($option.val(), { force: true });
        });
        cy.get('input[id="numero_documento"]').type('1023456789', { force: true });
        cy.get('input[id="fecha_nacimiento"]').type('2000-01-01');
        cy.get('input[id="primer_nombre"]').type('Test', { force: true });
        cy.get('input[id="segundo_nombre"]').type('Aa', { force: true });
        cy.get('input[id="primer_apellido"]').type('Testa', { force: true });
        cy.get('input[id="segundo_apellido"]').type('Bb', { force: true });
        cy.get('input[id="numero_celular"]').type('3112345678', { force: true });
        cy.get('select[id="tipo_sangre"]').select('O+', { force: true });
        cy.get('select[id="genero"]').select('Femenino', { force: true });

        cy.contains('button', 'Registrarse').click();
        cy.wait('@crearP').its('response.statusCode').should('eq', 400);

        // El sistema NO debe avanzar y debe mostrar una alerta de error
        cy.on('window:alert', () => true);

        cy.url().should('include', '/Registro_Paciente');
    });

    it('CP-UI-04: Debe crear un nuevo paciente correctamente', () => {
        const documento = Date.now().toString();
        cy.intercept('POST', '/api/paciente').as('crearP');

        cy.get('select[id="id_tipo_documento"]').contains('option', 'CC').then(($option) =>{
            //Esto es para obtener el ID mapeado de esta opcion
            cy.get('select[id="id_tipo_documento"]').select($option.val(), { force: true });
        });
        cy.get('input[id="numero_documento"]').type(documento, { force: true });
        cy.get('input[id="fecha_nacimiento"]').type('2000-01-01');
        cy.get('input[id="primer_nombre"]').type('Test', { force: true });
        cy.get('input[id="segundo_nombre"]').type('Aa', { force: true });
        cy.get('input[id="primer_apellido"]').type('Testa', { force: true });
        cy.get('input[id="segundo_apellido"]').type('Bb', { force: true });
        cy.get('input[id="numero_celular"]').type('3112345678', { force: true });
        cy.get('select[id="tipo_sangre"]').select('O+', { force: true });
        cy.get('select[id="genero"]').select('Femenino', { force: true });
        
        cy.contains('button', 'Registrarse').click();
        cy.wait('@crearP').its('response.statusCode').should('eq', 201);

        //Clic en Continuar
        cy.get('button[type="button"][id="btnExito"]').click();

        cy.url().should('include', '/');
    });
});

