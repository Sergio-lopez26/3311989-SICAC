describe('Pruebas de Caja Negra - Login (UI)', () => {

    //Antes de cada prueba, simplemente vamos a la página de login
    beforeEach(() => {
        cy.on('window:confirm', () => true); // Aceptar cualquier confirm
        cy.on('window:alert', () => true); // Aceptar cualquier alert
        cy.visit('/') 
    });

    // ============================================
    // CASOS BÁSICOS
    // ============================================
    it('CP-UI-01: Debe cargar la página de login', () => {
        cy.url().should('include', '/');
    });

    it('CP-UI-02: Debe mostrar el título "Iniciar Sesion"', () => {
        cy.contains('h1', 'Iniciar Sesión').should('be.visible');
    });

    // ============================================
    // CASOS DE INGRESO
    // ============================================

    it('CP-UI-03: Login exitoso con credenciales válidas', () => {
        // Digitar credenciales correctas
        cy.get('input[type="email"]').type('andrejur055@gmail.com')
        cy.get('input[type="password"]').type('encriptaraqui01')

        // Ingresar
        cy.get('button[type="submit"]').click()

        //Clic en Continuar
        cy.get('button[type="button"][id="btnCerrarV"]').click()

        // Comprobar que redirige a la página interna (dashboard)
        cy.url().should('include', '/Menu_Administrador')
        cy.contains('Bienvenido a SICAC, ').should('be.visible')
    });

    it('CP-UI-04: Validación de campos obligatorios vacíos', () => {
        // No se escribe nada y se hace clic en Ingresar
        cy.get('button[type="submit"]').click()

        // Comprobar que el navegador o la app exigen rellenar los datos
        // Mensajes nativos de HTML5 "Rellene este campo"
        cy.get('input[type="email"]').then(($input) => {
        expect($input[0].validationMessage).to.not.be.empty
        })
    });

    it('CP-UI-05: Login exitoso si el usuario tiene mas de 1 rol con credenciales válidas', () => {
        // Digitar credenciales correctas
        cy.get('input[type="email"]').type('laura.martinez@gmail.com') //Asignarle rol de Admin
        cy.get('input[type="password"]').type('clave001')

        // Ingresar
        cy.get('button[type="submit"]').click()

        cy.contains('Su cuenta posee múltiples roles de acceso. ').should('be.visible')
        //Clic en el Rol a elegir --> Toca con contains, por lo de que pueden haber varias opciones
        cy.contains('button[type="button"]','Paciente').click()

        //Clic en Continuar y forzar cierre del segundo modal que se abre
        cy.get('button[type="button"][id="btnCerrarV"]').should('be.visible').click({ force: true });
        
        // Comprobar que redirige a la página interna (dashboard)
        cy.url().should('include', '/Menu_Paciente')
        cy.contains('Bienvenido a SICAC, ').should('be.visible')
    });

    it('CP-UI-06: Login fallido si el usuario no está registrado como paciente o medico', () => {
        // Digitar credenciales correctas
        cy.get('input[type="email"]').type('ejemplo@gmail.com') //Toca crear este usuario previamente, sin registrar como médico o como paciente
        cy.get('input[type="password"]').type('123456789')

        // Ingresar
        cy.get('button[type="submit"]').click()

        cy.contains('Detectamos que ya tiene una cuenta de usuario creada, ').should('be.visible')
        //Clic en Sí
        cy.get('button[type="button"][id="btnCancelar"]').click()

        // Comprobar que redirige a la página interna (dashboard)
        cy.url().should('include', '/Registro_Paciente')
        cy.contains('Registro de Usuario').should('be.visible')
    });

    it('CP-UI-07: Error al ingresar credenciales incorrectas', () => {
        // Digitar credenciales falsas
        cy.get('input[type="email"]').type('andrejur055@gmail.com')
        cy.get('input[type="password"]').type('123456789')

        // Ingresar
        cy.get('button[type="submit"]').click()

        // El sistema NO debe avanzar y debe mostrar una alerta de error
        cy.on('window:alert', () => true);

        cy.url().should('include', '/'); // Se mantiene en la misma página
    });
});