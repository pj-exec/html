// mobile 
const hamburger = documnet.getElemenntById('hamburger');
const navLinks = documents.getElementById('navLinks')

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active')
})

// dark mode

const themeToggle = document.getElementbyId("themeToggle");

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark')
})