// Mobile Navigation Hamburger Logic
const hamburger = document.getElementById('hamburger');
const navList = document.getElementById('nav-list');

if (hamburger && navList) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navList.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navList.classList.remove('active');
        });
    });
}

// Update Current Year in Footer
document.getElementById('year').textContent = new Date().getFullYear();

// Contact Form Netlify Submission (AJAX - no page reload)
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Loading state
        btnText.textContent = 'Sending...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';

        const formData = new FormData(contactForm);

        try {
            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            });

            if (response.ok) {
                // Show success, hide form
                contactForm.style.display = 'none';
                formSuccess.style.display = 'block';
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            btnText.textContent = 'Error! Try Again';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.background = 'linear-gradient(135deg, #dc2626, #ef4444)';
        }
    });
}

// Header Scroll Effect
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Scroll Reveal Animations using Intersection Observer
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Unobserve after animating once
        }
    });
}, observerOptions);

// Select elements to animate
const animatableElements = document.querySelectorAll('.fade-in, .fade-up');
animatableElements.forEach(el => observer.observe(el));

// Active Navigation Link Update on Scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
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

// Smooth Scrolling for Internal Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        // Remove active from all
        navLinks.forEach(link => link.classList.remove('active'));
        // Add to clicked
        if(this.classList.contains('nav-link')) {
            this.classList.add('active');
        }

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80; // Adjust according to header height
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
            window.scrollTo({
                 top: offsetPosition,
                 behavior: "smooth"
            });
        }
    });
});

// Lively Reviews Carousel Animation
document.addEventListener("DOMContentLoaded", () => {
    const reviewCards = document.querySelectorAll(".reviews-carousel .review-card");
    if (reviewCards.length > 0) {
        let currentIndex = 0;
        
        setInterval(() => {
            // Remove active class from current
            reviewCards[currentIndex].classList.remove("active");
            
            // Move to next
            currentIndex = (currentIndex + 1) % reviewCards.length;
            
            // Add active class to next
            reviewCards[currentIndex].classList.add("active");
        }, 4000); // Change review every 4 seconds
    }
});
