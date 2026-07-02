// Wait for the HTML to fully load before running any scripts
window.addEventListener('DOMContentLoaded', (event) => {
    
    // 1. RUN THE VISITOR COUNTER
    getVisitorCount();

    // 2. SET THE DYNAMIC COPYRIGHT YEAR
    setCopyrightYear();

    // 3. SETUP THE MOBILE MENU TOGGLE
    setupMobileMenu();

    // 4. FETCH GITHUB PROJECTS AND DISPLAY THEM
    fetchGitHubProjects();

});

// ==========================================
// FEATURE 1: Visitor Counter
// ==========================================
async function getVisitorCount() {
    const apiUrl = "https://qgrl762mc0.execute-api.ap-southeast-1.amazonaws.com/counter";
    const counterElement = document.getElementById("counter");
    
    // STEP 1: Check if we already fetched the count during this visit
    let savedCount = sessionStorage.getItem("visitorCount");

    if (savedCount) {
        // We already incremented the DB this session, just show the saved number!
        console.log("Count retrieved from session storage.");
        counterElement.innerText = savedCount;
        return; // Exit the function early
    }

    // STEP 2: If no count is saved, reach out to the API to increment and get the new number
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        const count = data.number;

        // Display the number
        counterElement.innerText = count; 
        
        // Save the number to Session Storage so it doesn't increment on refresh!
        sessionStorage.setItem("visitorCount", count);

    } catch (error) {
        console.error("Error fetching the visitor count:", error);
        counterElement.innerText = "Offline";
    }
}
// ==========================================
// FEATURE 2: Dynamic Copyright Year
// ==========================================
function setCopyrightYear() {
    // new Date().getFullYear() looks at the user's computer clock and grabs the 4-digit year.
    const currentYear = new Date().getFullYear();
    
    // Find the empty <span id="year"> and inject the number into it.
    document.getElementById("year").innerText = currentYear;
}

// ==========================================
// FEATURE 3: Mobile Hamburger Menu
// ==========================================
function setupMobileMenu() {
    // 1. Grab the button and the hidden menu using their IDs
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    // 2. Tell the button to listen for a "click" from the user's mouse/finger
    menuBtn.addEventListener('click', () => {
        // 3. When clicked, toggle the word 'hidden' on and off in the menu's class list!
        mobileMenu.classList.toggle('hidden');
    });
}


// ==========================================
// FEATURE 4: Automate GitHub Projects
// ==========================================
async function fetchGitHubProjects() {
    const container = document.getElementById('github-projects');
    if (!container) return; // Stop if we aren't on the projects page

    // Later in the Cloud Resume Challenge (Chunk 3), you will build a backend using AWS API Gateway and Lambda where you can store your GitHub username as an environment variable.
    
    const username = "Bubblipathic"; // <-- PUT YOUR USERNAME HERE
    const url = `https://api.github.com/users/${username}/repos?sort=updated&direction=desc`;

    try {
        const response = await fetch(url);
        const repos = await response.json();

        // Clear the "Fetching..." text
        container.innerHTML = "";

        // Create a list of repository names you want to HIDE from your portfolio
        // Replace "another-repo-to-hide"
        const hiddenRepos = ["bubblipathic", "another-repo-to-hide"];

        // Loop through each repository and create a card
        repos.forEach(repo => {
            // Skip forks or specific repos you don't want to show
            if (repo.fork) return; 

            // Skip any repos that match the names in our hidden list
            if (hiddenRepos.includes(repo.name)) return;

            // Format the date to look nice (e.g., "Oct 10, 2025")
            const date = new Date(repo.updated_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });

            // Set a color for the language badge (default to gray if none)
            let badgeColor = "bg-stone-200 text-stone-800";
            if (repo.language === "Python") badgeColor = "bg-blue-100 text-blue-800";
            if (repo.language === "HTML") badgeColor = "bg-orange-100 text-orange-800";
            if (repo.language === "Java") badgeColor = "bg-red-100 text-red-800";

            // Build the HTML for the card
            const cardHTML = `
                <a href="${repo.html_url}" target="_blank" class="group flex flex-col justify-between bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div>
                        <div class="flex justify-between items-start mb-4 gap-2">
                            <h3 class="font-bold text-xl text-stone-800 leading-tight group-hover:text-teal-700 transition-colors line-clamp-2">
                                ${repo.name.replace(/-/g, ' ')}
                            </h3>
                            <span class="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${badgeColor}">
                                ${repo.language || 'Code'}
                            </span>
                        </div>
                        <p class="text-stone-600 text-sm mb-6 leading-relaxed line-clamp-3">
                            ${repo.description || 'No description provided.'}
                        </p>
                    </div>
                    <div class="text-xs text-stone-400 font-semibold uppercase tracking-wider">
                        Updated ${date}
                    </div>
                </a>
            `;

            // Inject the card into the grid
            container.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("Error fetching GitHub repos:", error);
        container.innerHTML = `<p class="text-red-500 col-span-full">Failed to load projects. Please check my GitHub profile directly!</p>`;
    }
}