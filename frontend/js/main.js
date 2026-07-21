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

    // 5. SETUP THE CONTACT FORM HANDLER
    setupContactForm();

});

// ==========================================
// FEATURE 1: Visitor Counter (with Session Storage Caching)
// ==========================================
async function getVisitorCount() {
    const awsCounterApiUrl = "https://qgrl762mc0.execute-api.ap-southeast-1.amazonaws.com/counter";
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
        const response = await fetch(awsCounterApiUrl, {
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
// FEATURE 4: Automate GitHub Projects (with Session Storage Caching)
// ==========================================
async function fetchGitHubProjects() {
    const container = document.getElementById('github-projects');
    if (!container) return; // Stop if we aren't on the projects page

    const username = "Bubblipathic";
    const gitApiUrl = `https://api.github.com/users/${username}/repos?sort=updated&direction=desc`;
    const cacheKey = `github_repos_${username}`;

    // Helper function to render the UI from repository data
    function displayRepos(repos) {
        // Clear the "Fetching..." text
        container.innerHTML = "";

        const hiddenRepos = ["bubblipathic", "another-repo-to-hide"];

        repos.forEach(repo => {
            if (repo.fork) return; 
            if (hiddenRepos.includes(repo.name)) return;

            const date = new Date(repo.updated_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });

            let badgeColor = "bg-stone-200 text-stone-800";
            if (repo.language === "Python") badgeColor = "bg-blue-100 text-blue-800";
            if (repo.language === "HTML") badgeColor = "bg-orange-100 text-orange-800";
            if (repo.language === "Java") badgeColor = "bg-red-100 text-red-800";

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
            container.innerHTML += cardHTML;
        });
    }

    try {
        // 1. Check if we already have the data cached in this tab session
        const cachedData = sessionStorage.getItem(cacheKey);

        if (cachedData) {
            console.log("Loading GitHub data from sessionStorage cache...");
            const repos = JSON.parse(cachedData);
            displayRepos(repos);
            return; // Exit early, no network call needed!
        }

        // 2. If no cache exists, make the network request to GitHub
        console.log("Cache miss. Fetching fresh data from GitHub API...");
        const response = await fetch(gitApiUrl);
        
        if (!response.ok) {
            throw new Error(`GitHub API returned status: ${response.status}`);
        }

        const repos = await response.json();

        // 3. Save the stringified array into sessionStorage for next time
        sessionStorage.setItem(cacheKey, JSON.stringify(repos));

        // 4. Render the UI
        displayRepos(repos);

    } catch (error) {
        console.error("Error fetching GitHub repos:", error);
        container.innerHTML = `<p class="text-red-500 col-span-full">Failed to load projects. Please check my GitHub profile directly!</p>`;
    }
}


// ==========================================
// FEATURE 5: Contact Form Submission
// ==========================================
function setupContactForm() {
    const contactForm = document.querySelector('form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (event) => {
        // 1. Prevent the page from reloading / posting to localhost
        event.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = "Sending...";
        submitBtn.disabled = true;

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // Note: Ensured the /contact endpoint path is included
        const awsEmailApiUrl = "https://n5z7ta453e.execute-api.ap-southeast-1.amazonaws.com/contact";

        try {
            const response = await fetch(awsEmailApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                contactForm.reset();
                submitBtn.innerHTML = "Message Sent! ✓";
                submitBtn.classList.replace('bg-amber-600', 'bg-green-600');
            } else {
                throw new Error("Server rejected the request");
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            submitBtn.innerHTML = "Error Sending. Try Again.";
            submitBtn.classList.replace('bg-amber-600', 'bg-red-600');
        }

        setTimeout(() => {
            if (submitBtn.innerHTML.includes("Error")) {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.classList.replace('bg-red-600', 'bg-amber-600');
            }
        }, 3000);
    });
}