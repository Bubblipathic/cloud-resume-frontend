describe('The Projects Page', () => {

    beforeEach(() => {
        // 1. Mock the AWS Counter so we don't spam DynamoDB
        cy.intercept('POST', '**/counter', { 
            statusCode: 200, 
            body: { number: 999 } 
        }).as('awsApi');

        // 2. Mock the GitHub API with custom test data
        cy.intercept('GET', 'https://api.github.com/users/Bubblipathic/repos*', {
            statusCode: 200,
            body: [
                {
                    name: "cloud-resume-challenge",
                    html_url: "https://github.com/Bubblipathic/cloud-resume",
                    description: "My serverless AWS project.",
                    language: "Python",
                    updated_at: "2026-07-21T10:00:00Z",
                    fork: false
                },
                {
                    name: "portfolio-website",
                    html_url: "https://github.com/Bubblipathic/portfolio",
                    description: "Front-end HTML and Tailwind.",
                    language: "HTML",
                    updated_at: "2026-06-15T10:00:00Z",
                    fork: false
                },
                {
                    name: "bubblipathic", // Your JS is programmed to hide this!
                    html_url: "https://github.com/Bubblipathic/bubblipathic",
                    description: "Profile readme",
                    language: "Markdown",
                    updated_at: "2026-07-20T10:00:00Z",
                    fork: false
                },
                {
                    name: "forked-homework", // Your JS is programmed to hide forks!
                    html_url: "https://github.com/Bubblipathic/forked-homework",
                    description: "Forked from someone else.",
                    language: "Java",
                    updated_at: "2026-07-19T10:00:00Z",
                    fork: true
                }
            ]
        }).as('getGithub');
    });

    it('Displays the unique page headers', () => {
        cy.visit('/projects.html');
        cy.get('main').contains('h2', 'My Projects').should('be.visible');
        cy.get('main').contains('A collection of my finest work').should('be.visible');
    });

    it('Fetches and filters GitHub projects correctly', () => {
        cy.visit('/projects.html');
        cy.wait('@getGithub');

        // Out of the 4 mocked repos, 1 is a fork and 1 is named "bubblipathic".
        // Your JavaScript should filter those out, leaving exactly 2 cards rendered.
        cy.get('#github-projects a').should('have.length', 2);

        // Verify the content of the first rendered valid repo
        cy.get('#github-projects a').first().within(() => {
            cy.contains('cloud resume challenge').should('be.visible'); // Tests your .replace(/-/g, ' ') logic
            cy.contains('My serverless AWS project.').should('be.visible');
            cy.contains('Python').should('be.visible');
        });
    });

    it('Handles GitHub API failures gracefully', () => {
        // Override the default mock to simulate a GitHub outage (500 Server Error)
        cy.intercept('GET', 'https://api.github.com/users/Bubblipathic/repos*', {
            statusCode: 500,
            body: { message: "Internal Server Error" }
        }).as('githubFailure');

        cy.visit('/projects.html');
        cy.wait('@githubFailure');

        // Verify your catch block triggers and displays the fallback error text
        cy.contains('Failed to load projects. Please check my GitHub profile directly!').should('be.visible');
    });

    it('Uses sessionStorage to prevent duplicate GitHub API calls', () => {
        cy.visit('/projects.html');
        cy.wait('@getGithub'); // Initial load triggers the API
        
        // Assert the cards loaded
        cy.get('#github-projects a').should('have.length', 2);

        // Simulate navigating away and coming back (or refreshing)
        cy.reload();

        // Assert the cards are still there, pulled from cache
        cy.get('#github-projects a').should('have.length', 2);

        // Assert the GitHub API was only called EXACTLY ONCE total
        cy.get('@getGithub.all').should('have.length', 1);
    });

});