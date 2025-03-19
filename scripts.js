window.addEventListener("scroll", () => {
    if (window.scrollY > window.innerHeight * 0.1) { // Triggers earlier
        document.body.classList.add("scrolled");
    } else {
        document.body.classList.remove("scrolled");
    }
});
