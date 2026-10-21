describe('Pruebas de la Vista Gestionar Métodos de Pago', () => {

    beforeEach(() => {
        // 1. Simular la autenticación del Administrador en el localStorage para superar la RutaProteccionAdmin
        window.localStorage.setItem('usuario', JSON.stringify({ rol: 'Administrador', token: 'fake-token' }));

        // 2. Interceptar la llamada GET inicial de la API
        cy.intercept('GET', '**/api/metodo_pago', {
            statusCode: 200,
            body: [
                { id: 1, nombre_metodo: 'Efectivo' },
                { id: 2, nombre_metodo: 'Tarjeta de Crédito' }
            ]
        }).as('getMetodosPago');

        // 3. Interceptar la llamada POST para registrar un nuevo método de pago
        cy.intercept('POST', '**/api/metodo_pago', {
            statusCode: 201,
            body: { id: 3, nombre_metodo: 'Transferencia Bancaria' }
        }).as('crearMetodoPago');

        // 4. Interceptar la llamada PUT para actualizar un método de pago
        cy.intercept('PUT', '**/api/metodo_pago/*', {
            statusCode: 200,
            body: { id: 1, nombre_metodo: 'Efectivo Actualizado' }
        }).as('actualizarMetodoPago');

        // 5. Interceptar la llamada DELETE para eliminar un método de pago
        cy.intercept('DELETE', '**/api/metodo_pago/*', {
            statusCode: 200,
            body: { message: 'Eliminado correctamente' }
        }).as('eliminarMetodoPago');

        // 6. Visitar la ruta exacta configurada en App.js para Métodos de Pago
        cy.visit('http://localhost:3000/Metodo_Pago');
    });

    it('Debe cargar la vista de métodos de pago correctamente y mostrar la tabla', () => {
        // Apuntar específicamente al h1 para evitar conflictos con menús desplegables
        cy.get('h1', { timeout: 15000 }).contains('Métodos de Pago').should('be.visible');
        cy.get('table', { timeout: 15000 }).should('be.visible');
        cy.contains('Efectivo').should('be.visible');
        cy.contains('Tarjeta de Crédito').should('be.visible');
    });

    it('Debe permitir abrir el formulario de un nuevo método de pago y registrarlo', () => {
        // Clic en el botón "Nuevo"
        cy.get('button', { timeout: 15000 }).contains('Nuevo').click();
        
        // Verificar que aparezca el formulario de registro
        cy.get('#wrapperForm').should('be.visible');
        cy.get('button[type="submit"]').contains('Registrar').should('be.visible');

        // Llenar el input
        cy.get('input[name="nombre_metodo"]').type('Transferencia Bancaria');

        // Enviar formulario
        cy.get('button[type="submit"]').contains('Registrar').click();

        // Verificar el modal de registro exitoso
        cy.get('#registro').should('be.visible');
        cy.get('#registro').contains('¡Registro Exitoso!').should('be.visible');
        cy.get('#registro button').contains('Continuar').click();
    });

    it('Debe permitir seleccionar un registro, actualizarlo y eliminarlo', () => {
        // Seleccionar un elemento de la tabla para activar el formulario de edición
        cy.contains('Efectivo').click();

        // Verificar que aparezca el formulario con el botón de Actualizar
        cy.get('#wrapperForm').should('be.visible');
        cy.get('button[type="submit"]').contains('Actualizar').should('be.visible');

        // Modificar el texto
        cy.get('input[name="nombre_metodo"]').clear().type('Efectivo Actualizado');

        // Hacer clic en Actualizar
        cy.get('button[type="submit"]').contains('Actualizar').click();

        // Verificar modal de actualización exitosa y hacer clic en Continuar
        cy.get('#actualiza').should('be.visible');
        cy.get('#actualiza').contains('¡Actualizado!').should('be.visible');
        cy.get('#actualiza button').contains('Continuar').click();

        // Volver a seleccionar el registro usando { force: true }
        cy.contains('Efectivo').click({ force: true });

        // Simular confirmación nativa de window.confirm
        cy.on('window:confirm', () => true);

        // Hacer clic en Eliminar usando { force: true } para evitar bloqueos por overlays de Bootstrap
        cy.get('button').contains('Eliminar').click({ force: true });
    });

    it('Debe filtrar los métodos de pago correctamente usando el buscador', () => {
        cy.get('input[placeholder*="Buscar método de pago"]', { timeout: 15000 }).type('Tarjeta de Crédito');
        cy.get('tbody tr').should('have.length', 1);
        cy.contains('Tarjeta de Crédito').should('be.visible');
        cy.contains('Efectivo').should('not.exist');
    });

});