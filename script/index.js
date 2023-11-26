const loader = document.querySelector('.loader');
    document.onreadystatechange = function() {
        if (document.readyState === "complete") {
    loader.style.display="none";
        } else {
    loader.style.display="flex";
        }
    }

const navLinks = document.querySelectorAll('.headerNavBars a');
const sections = document.querySelectorAll('.section');
const indicators = document.querySelectorAll('.indicator a');
function getActiveSection() {
  let activeSection;
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    const sectionBottom = sectionTop + document.documentElement.scrollHeight;
    if (window.scrollY >= sectionTop && window.scrollY <= sectionBottom) {
      activeSection = section;
    }
  });
  return activeSection;
}
function highlightActiveNav() {
  const activeSection = getActiveSection();
  navLinks.forEach(link => {
    link.classList.remove('activeNavBar');
  });
  indicators.forEach(indicator => {
    indicator.classList.remove('activeIndicator');
  });
  if (activeSection) {
    const correspondingLink = document.querySelector(`.headerNavBars a[href="#${activeSection.id}"]`);
    if (correspondingLink) {
      correspondingLink.classList.add('activeNavBar');
    }
    const correspondingIndicator = document.querySelector(`.indicator a[href="#${activeSection.id}"]`);
    if (correspondingIndicator) {
      correspondingIndicator.classList.add('activeIndicator');
    }}}
document.addEventListener('scroll', highlightActiveNav);
highlightActiveNav();

const menu = document.querySelector('.menu');
const headerNavBars = document.querySelector('.navBarsList');
menu.addEventListener('click',() => {
if (headerNavBars.classList.contains('displayNav')) {
    headerNavBars.classList.remove('displayNav')
} else {
    headerNavBars.classList.add('displayNav')
}
})
document.addEventListener('scroll',()=>{
  headerNavBars.classList.remove('displayNav');
})
const toggle = document.querySelector('.toggle');
const themes = document.querySelector('.themes');
toggle.addEventListener('click',()=> {
if (themes.classList.contains('active')) {
  themes.href="css/light.css";
  toggle.innerHTML = '<i class="fas fa-moon"></i>';
  themes.classList.remove('active');
} else {
  themes.href="css/dark.css";
  toggle.innerHTML = '<i class="fas fa-sun"></i>';
  themes.classList.add('active');
}
})