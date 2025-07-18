window.addEventListener("scroll", () => {
    if (window.scrollY > window.innerHeight * 0.1) { // Triggers earlier
        document.body.classList.add("scrolled");
    } else {
        document.body.classList.remove("scrolled");
    }
});

document.addEventListener("DOMContentLoaded", function () {
    // Get all "Read More" links
    const readMoreLinks = document.querySelectorAll(".read-more");

    readMoreLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const modalId = this.getAttribute("data-modal");
            document.getElementById(modalId).style.display = "flex";
        });
    });

    // Close modal when clicking the X button
    const closeButtons = document.querySelectorAll(".close-modal");
    closeButtons.forEach(button => {
        button.addEventListener("click", function () {
            this.closest(".modal").style.display = "none";
        });
    });

    // Close modal when clicking outside the content box
    window.addEventListener("click", function (e) {
        document.querySelectorAll(".modal").forEach(modal => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
    });
});

// Copy Docker setup to clipboard
document.addEventListener('DOMContentLoaded', () => {
    const dockerButton = document.getElementById('copy-docker-code');
    if (dockerButton) {
        dockerButton.addEventListener('click', () => {
            const dockerCommand = `git clone https://github.com/palatine-hill-techsupport/STACKED-DECK.git
cd STACKED-DECK
docker-compose up -d
docker exec -i mysql_db mysql -u root -proot gamestore < sd_db.sql`;

            navigator.clipboard.writeText(dockerCommand).then(() => {
                dockerButton.textContent = 'Copied!';
                setTimeout(() => {
                    dockerButton.textContent = 'Copy Docker Setup';
                }, 2000);
            }).catch(err => {
                dockerButton.textContent = 'Error';
                console.error('Clipboard copy failed:', err);
            });
        });
    }
});

// Dark mode toggle functionality
document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        themeToggle.textContent = body.classList.contains("dark-mode") ? "☀️" : "🌙";
    });
});

// Modal background functionality
document.querySelectorAll('.read-more').forEach(button => {
  button.addEventListener('click', () => {
    document.body.classList.add('modal-open');
  });
});

document.querySelectorAll('.close-modal').forEach(close => {
  close.addEventListener('click', () => {
    document.body.classList.remove('modal-open');
  });
});
