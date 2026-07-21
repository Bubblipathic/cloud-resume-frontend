describe('The Error Page (404)', () => {

    it('Catches unknown routes and displays the custom 404 UI', () => {
        // 1. Visit a garbage URL. 
        // We MUST tell Cypress not to fail the test when AWS returns the 404 status code.
        cy.visit('/this-page-is-definitely-fake.html', { failOnStatusCode: false })

        // 2. Verify your custom 404 page rendered correctly
        cy.get('h1').contains('404').should('be.visible')
        cy.contains('h2', 'Lost in the Cloud?').should('be.visible')
        
        // 3. Verify the layout styling applied
        cy.contains('Source: Amazon S3').should('be.visible')
    })

    it('Allows the user to safely navigate back to the home page', () => {
        cy.visit('/this-page-is-definitely-fake.html', { failOnStatusCode: false })

        // 1. Click the main Call-to-Action button
        cy.contains('a', 'Back to Home Base').click()

        // 2. Verify it successfully escaped the error state
        cy.url().should('include', '/index.html')
    })

})