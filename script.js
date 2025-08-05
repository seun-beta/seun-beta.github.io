// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active navigation link highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    const scrollPosition = window.scrollY + 200;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference or default to dark
const currentTheme = localStorage.getItem('theme') || 'dark';
body.setAttribute('data-theme', currentTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update toggle icon
    const icon = themeToggle.querySelector('i');
    if (newTheme === 'light') {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-star';
    }
});

// Initialize theme toggle icon
document.addEventListener('DOMContentLoaded', () => {
    const currentTheme = body.getAttribute('data-theme');
    const icon = themeToggle.querySelector('i');

    if (currentTheme === 'light') {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-star';
    }
});

// Simple fade-in animation for sections
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for animation
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

// Enhanced hover effects for skill tags
document.addEventListener('DOMContentLoaded', () => {
    const skillTags = document.querySelectorAll('.skill-tag');

    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            tag.style.transform = 'translateY(-2px)';
        });

        tag.addEventListener('mouseleave', () => {
            tag.style.transform = 'translateY(0)';
        });
    });
});

// Enhanced hover effects for contact links
document.addEventListener('DOMContentLoaded', () => {
    const contactLinks = document.querySelectorAll('.contact-link');

    contactLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-2px)';
        });

        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateY(0)';
        });
    });
});

// Simple typing effect for hero title
function typeWriter(element, text, speed = 100) {
    const originalHTML = element.innerHTML;
    const textContent = element.textContent || element.innerText;

    element.innerHTML = '';
    element.style.opacity = '0';

    let i = 0;

    function type() {
        if (i < textContent.length) {
            const currentText = textContent.substring(0, i + 1);
            const nameStart = currentText.indexOf('Seunfunmi Adegoke');

            if (nameStart !== -1) {
                const beforeName = currentText.substring(0, nameStart);
                const namePart = currentText.substring(nameStart, i + 1);

                element.innerHTML = `${beforeName}<span class="highlight">${namePart}</span>`;
            } else {
                element.innerHTML = currentText;
            }

            if (i === 0) {
                element.style.opacity = '1';
                element.style.transition = 'opacity 0.3s ease';
            }

            i++;
            setTimeout(type, speed);
        } else {
            element.innerHTML = originalHTML;
        }
    }

    type();
}

// Initialize typing effect
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.style.opacity = '0';

        setTimeout(() => {
            typeWriter(heroTitle, heroTitle.textContent, 80);
        }, 1000);
    }
});

// Add CSS for light theme
const lightThemeStyles = document.createElement('style');
lightThemeStyles.textContent = `
    [data-theme="light"] {
        --bg-color: #ffffff;
        --text-color: #1a1a1a;
        --text-secondary: #4a5568;
        --accent-color: #a855f7;
        --accent-hover: #c084fc;
        --border-color: rgba(0, 0, 0, 0.1);
        --nav-bg: rgba(255, 255, 255, 0.95);
        --skill-bg: rgba(168, 85, 247, 0.1);
        --skill-border: rgba(168, 85, 247, 0.2);
    }
    
    [data-theme="dark"] {
        --bg-color: #0f0f0f;
        --text-color: #e2e8f0;
        --text-secondary: #cbd5e1;
        --accent-color: #a855f7;
        --accent-hover: #c084fc;
        --border-color: rgba(255, 255, 255, 0.1);
        --nav-bg: rgba(15, 15, 15, 0.95);
        --skill-bg: rgba(168, 85, 247, 0.1);
        --skill-border: rgba(168, 85, 247, 0.2);
    }
    
    body {
        background-color: var(--bg-color);
        color: var(--text-color);
    }
    
    .navbar {
        background: var(--nav-bg);
        border-bottom: 1px solid var(--border-color);
    }
    
    .nav-link {
        color: var(--text-color);
    }
    
    .section {
        border-top: 1px solid var(--border-color);
    }
    
    .experience-item {
        border-bottom: 1px solid var(--border-color);
    }
    
    .skill-tag {
        background: var(--skill-bg);
        border: 1px solid var(--skill-border);
    }
    
    .contact-link {
        background: var(--skill-bg);
        border: 1px solid var(--skill-border);
    }
    
    .theme-toggle {
        background: var(--skill-bg);
        border: 1px solid var(--skill-border);
    }
`;
document.head.appendChild(lightThemeStyles); 