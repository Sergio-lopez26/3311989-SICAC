// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//Esto será utilizado en cada una de las rutas con protección que requieren logueo previo como Admin
Cypress.Commands.add('login', (email, password) => {
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
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })