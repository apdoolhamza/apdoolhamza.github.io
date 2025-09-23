// update years
  function calculateRoundedYears(startDateString) {
    const now = new Date();
    const startDate = new Date(startDateString);
    const diffYears = (now - startDate) / (1000 * 60 * 60 * 24 * 365.25);

    return (diffYears % 1) >= 0.5 ? Math.ceil(diffYears) : Math.floor(diffYears);
  }

  function updateAllExperienceElements() {
    const experienceElements = document.querySelectorAll('[data-start]');

    experienceElements.forEach(el => {
      const startDate = el.getAttribute('data-start');
      const years = calculateRoundedYears(startDate);
      el.textContent = `${years}+ year${years !== 1 ? 's' : ''}`;
    });
  }
  // Run when page loads
  window.addEventListener('DOMContentLoaded', updateAllExperienceElements);


//navigation script
document.addEventListener('DOMContentLoaded', function() {
const header = document.getElementById('header');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
// Mobile menu toggle
mobileMenuButton.addEventListener('click', function() {
mobileMenu.classList.toggle('hidden');
// Change icon
const icon = mobileMenuButton.querySelector('i');
if (mobileMenu.classList.contains('hidden')) {
icon.classList.remove('ri-close-line');
icon.classList.add('ri-menu-line');
} else {
icon.classList.remove('ri-menu-line');
icon.classList.add('ri-close-line');
}
});
// Close mobile menu when clicking on a link
const mobileLinks = mobileMenu.querySelectorAll('a');
mobileLinks.forEach(link => {
link.addEventListener('click', function() {
mobileMenu.classList.add('hidden');
const icon = mobileMenuButton.querySelector('i');
icon.classList.remove('ri-close-line');
icon.classList.add('ri-menu-line');
});
});
// Active link highlighting based on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', function() {
let current = '';
sections.forEach(section => {
const sectionTop = section.offsetTop;
const sectionHeight = section.clientHeight;
if (window.scrollY >= (sectionTop - 100)) {
current = section.getAttribute('id');
}
});
navLinks.forEach(link => {
link.classList.remove('active');
if (link.getAttribute('href').substring(1) === current) {
link.classList.add('active');
}
});
});
});


// typing-effect-script
document.addEventListener('DOMContentLoaded', function() {
const typingText = document.getElementById('typing-text');
const texts = ['Full-Stack Web Developer', 'AI/ML Engineer', 'UI/UX Designer'];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;
function type() {
const currentText = texts[textIndex];
if (isDeleting) {
// Deleting text
typingText.textContent = currentText.substring(0, charIndex - 1);
charIndex--;
typingSpeed = 50;
} else {
// Typing text
typingText.textContent = currentText.substring(0, charIndex + 1);
charIndex++;
typingSpeed = 100;
}
// If finished typing the current text
if (!isDeleting && charIndex === currentText.length) {
isDeleting = true;
typingSpeed = 2000; // Pause before deleting
}
// If finished deleting the current text
if (isDeleting && charIndex === 0) {
isDeleting = false;
textIndex = (textIndex + 1) % texts.length;
typingSpeed = 300; // Pause before typing next text
}
setTimeout(type, typingSpeed);
}
// Start the typing effect
setTimeout(type, 1000);
});


// skills-animation-script
document.addEventListener('DOMContentLoaded', function() {
const progressBars = document.querySelectorAll('.progress-value');
// Function to animate progress bars when they come into view
function animateProgressBars() {
progressBars.forEach(bar => {
const rect = bar.getBoundingClientRect();
const isVisible = (rect.top <= window.innerHeight && rect.bottom >= 0);
if (isVisible) {
bar.style.width = bar.style.width || bar.parentElement.getAttribute('data-value') || '0%';
}
});
}
// Initial animation
setTimeout(animateProgressBars, 500);
// Animate on scroll
window.addEventListener('scroll', animateProgressBars);
});


//project-filter-script"
document.addEventListener('DOMContentLoaded', function() {
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
filterButtons.forEach(button => {
button.addEventListener('click', function() {
// Remove active class from all buttons
filterButtons.forEach(btn => {
btn.classList.remove('active');
btn.classList.remove('bg-primary');
btn.classList.remove('text-white');
btn.classList.add('bg-gray-200');
btn.classList.add('text-gray-700');
});
// Add active class to clicked button
this.classList.add('active');
this.classList.add('bg-primary');
this.classList.add('text-white');
this.classList.remove('bg-gray-200');
this.classList.remove('text-gray-700');
const filter = this.getAttribute('data-filter');
// Filter projects
projectCards.forEach(card => {
if (filter === 'all' || card.getAttribute('data-category') === filter) {
card.style.display = 'block';
} else {
card.style.display = 'none';
}
});
});
});
});

        
//testimonial-slider-script
document.addEventListener('DOMContentLoaded', function() {
const track = document.getElementById('testimonial-track');
const prevButton = document.getElementById('prev-testimonial');
const nextButton = document.getElementById('next-testimonial');
const dots = document.querySelectorAll('#testimonial-dots button');
let currentIndex = 0;
let slideWidth = 100; // Percentage
let slidesToShow = 1;
// Update slidesToShow based on screen width
function updateSlidesToShow() {
if (window.innerWidth >= 1024) {
slidesToShow = 3;
} else if (window.innerWidth >= 768) {
slidesToShow = 2;
} else {
slidesToShow = 1;
}
updateSlider();
}
// Update slider position
function updateSlider() {
track.style.transform = `translateX(-${currentIndex * (slideWidth / slidesToShow)}%)`;
// Update dots
dots.forEach((dot, index) => {
if (index === currentIndex) {
dot.classList.add('bg-primary');
dot.classList.remove('bg-gray-300');
} else {
dot.classList.remove('bg-primary');
dot.classList.add('bg-gray-300');
}
});
}
// Previous slide
prevButton.addEventListener('click', function() {
if (currentIndex > 0) {
currentIndex--;
updateSlider();
}
});
// Next slide
nextButton.addEventListener('click', function() {
if (currentIndex < dots.length - 1) {
currentIndex++;
updateSlider();
}
});
// Dot navigation
dots.forEach((dot, index) => {
dot.addEventListener('click', function() {
currentIndex = index;
updateSlider();
});
});
// Initialize slider
updateSlidesToShow();
// Update slider on window resize
window.addEventListener('resize', updateSlidesToShow);
// Auto-play slider
let autoplayInterval = setInterval(() => {
if (currentIndex < dots.length - 1) {
currentIndex++;
} else {
currentIndex = 0;
}
updateSlider();
}, 5000);
// Pause auto-play on hover
track.addEventListener('mouseenter', () => {
clearInterval(autoplayInterval);
});
track.addEventListener('mouseleave', () => {
autoplayInterval = setInterval(() => {
if (currentIndex < dots.length - 1) {
currentIndex++;
} else {
currentIndex = 0;
}
updateSlider();
}, 5000);
});
});

//back-to-top-script        
document.addEventListener('DOMContentLoaded', function() {
const backToTopButton = document.getElementById('back-to-top');
// Show/hide back to top button based on scroll position
window.addEventListener('scroll', function() {
if (window.scrollY > 500) {
backToTopButton.classList.add('visible');
backToTopButton.classList.remove('opacity-0');
backToTopButton.classList.remove('invisible');
} else {
backToTopButton.classList.remove('visible');
backToTopButton.classList.add('opacity-0');
backToTopButton.classList.add('invisible');
}
});
// Scroll to top when button is clicked
backToTopButton.addEventListener('click', function() {
window.scrollTo({
top: 0,
behavior: 'smooth'
});
});
});

        
//smooth-scroll-script
document.addEventListener('DOMContentLoaded', function() {
const links = document.querySelectorAll('a[href^="#"]');
links.forEach(link => {
link.addEventListener('click', function(e) {
e.preventDefault();
const targetId = this.getAttribute('href');
if (targetId === '#') return;
const targetElement = document.querySelector(targetId);
if (targetElement) {
const headerHeight = document.getElementById('header').offsetHeight;
const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
window.scrollTo({
top: targetPosition,
behavior: 'smooth'
});
}
});
});
});
