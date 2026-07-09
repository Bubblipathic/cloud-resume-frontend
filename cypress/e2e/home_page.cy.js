describe('The Home Page', () => {

    // This will run before each "it" block in this file
    beforeEach(() => {
        cy.visit('/') 
    })

    // T0001: Verify if the main structural elements rendered
    it('Loads the page and displays the main structural elements', () => {
        cy.get('header').should('be.visible')
        cy.get('main').should('be.visible')
        cy.get('footer').should('be.visible')
    })

    // T0002: Verify if clicking the logo navigates to the home page
    it('Clicking the logo navigates to the home page', () => {
        cy.contains('a', 'Jay Reario').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/index.html')
    })

    // T0003: Verify if clicking resume link navigates to the resume page
    it('Clicking the resume link navigates to the resume page', () => {
        cy.contains('a', 'Resume').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/resume.html')
    })

    // T0004: Verify if clicking projects link navigates to the projects page
    it('Clicking the projects link navigates to the projects page', () => {
        cy.contains('a', 'Projects').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/projects.html')
    })

    // T0005: Verify if clicking contact link navigates to the contact page
    it('Clicking the contact link navigates to the contact page', () => {
        cy.contains('a', 'Contact').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/contact.html')
    })
})