describe('The Resume Page', () => {

    beforeEach(() => {
        cy.intercept('POST', '**/counter', { statusCode: 200, body: { number: 999 } }).as('mockApi')
        cy.visit('/resume.html') 
    })

    it('Displays the resume header and functional download button', () => {
        cy.get('main').contains('h2', 'My Resume').should('be.visible')

        // Verify the Download PDF button triggers a file download
        cy.contains('a', 'Download PDF')
            .should('be.visible')
            .and('have.attr', 'href', 'assets/resume.pdf')
            .and('have.attr', 'download') 
    })

    it('Embeds the PDF viewer correctly', () => {
        // Verify the iframe is pointing to the correct local asset
        cy.get('iframe[title="Jay Reario Resume PDF"]')
            .should('be.visible')
            .and('have.attr', 'src', 'assets/resume.pdf')
    })
    
    // Notice: No header, footer, or mobile menu tests here! 
    // We already proved those work in our home_page tests.
})