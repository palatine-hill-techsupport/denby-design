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
