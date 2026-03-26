'use strict';

/* ==============================
   PARTICLES BACKGROUND
   ============================== */
(function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    canvas.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        z-index: -1;
        pointer-events: none;
    `;

    let particles = [];
    const PARTICLE_COUNT = 55;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.8 + 0.4;
            this.speedX = (Math.random() - 0.5) * 0.35;
            this.speedY = (Math.random() - 0.5) * 0.35;
            this.opacity = Math.random() * 0.45 + 0.1;
            this.color = Math.random() > 0.5 ? '124, 58, 237' : '6, 182, 212';
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(124, 58, 237, ${0.08 * (1 - dist / 130)})`;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        requestAnimationFrame(animate);
    }

    animate();
})();

/* ==============================
   AOS INIT
   ============================== */
if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 750, easing: 'ease-out-cubic', once: true, offset: 40 });
}

/* ==============================
   THEME TOGGLE
   ============================== */
const themeToggle = document.getElementById('theme-toggle');

function setTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    }
}

const savedTheme = localStorage.getItem('theme');
setTheme(savedTheme === 'light' ? 'light' : 'dark');

if (themeToggle) {
    themeToggle.addEventListener('click', function () {
        const isLight = document.body.classList.contains('light-mode');
        setTheme(isLight ? 'dark' : 'light');
    });
}

/* ==============================
   SIDEBAR TOGGLE
   ============================== */
const sidebar = document.querySelector('[data-sidebar]');
const sidebarBtn = document.querySelector('[data-sidebar-btn]');

if (sidebarBtn && sidebar) {
    sidebarBtn.addEventListener('click', function () {
        sidebar.classList.toggle('active');
    });
}

/* ==============================
   PAGE NAVIGATION & SCROLL SPY
   ============================== */
console.log('--- SCROLLING NAVIGATION INITIALIZING ---');

// Smooth Scrolling for all data-nav-link elements
document.addEventListener('click', function (e) {
    const navLink = e.target.closest('[data-nav-link]');
    if (navLink) {
        const targetId = navLink.getAttribute('data-nav-link');
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            e.preventDefault();
            console.log('Scrolling to:', targetId);
            
            // Highlight the clicked link immediately
            document.querySelectorAll('[data-nav-link]').forEach(l => l.classList.remove('active'));
            navLink.classList.add('active');
            
            targetElement.scrollIntoView({ behavior: 'smooth' });

            // Close mobile sidebar if open
            const sidebar = document.querySelector('[data-sidebar]');
            if (sidebar && window.innerWidth < 1100) {
                sidebar.classList.remove('active');
            }
        }
    }
});

// Scroll Spy: Highlight active section in navbar as you scroll
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('article[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-nav-link]');

    const scrollSpyOptions = {
        threshold: 0.3,
        rootMargin: "-10% 0px -70% 0px" // Focus more on the top portion of the viewport
    };

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                console.log('Active Section Detected:', id);
                
                navLinks.forEach(link => {
                    if (link.getAttribute('data-nav-link') === id) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, scrollSpyOptions);

    sections.forEach(section => scrollSpyObserver.observe(section));
});

document.addEventListener('DOMContentLoaded', function () {
    // Animate skill bars immediately or handled by its own observer
    animateSkillBars();

    // Hero CTA buttons and preview cards
    document.querySelectorAll('.hero-btn[data-nav-link], .preview-card[data-nav-link]').forEach(btn => {
        btn.addEventListener('click', function () {
            const page = this.getAttribute('data-nav-link');
            if (page) scrollToPage(page);
        });
    });
});

/* ==============================
   SKILL BAR ANIMATION
   ============================== */
function animateSkillBars() {
    const fills = document.querySelectorAll('.skill-fill');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const width = target.style.width;
                target.style.width = '0%';
                requestAnimationFrame(() => {
                    setTimeout(() => { target.style.width = width; }, 100);
                });
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.3 });

    fills.forEach(fill => observer.observe(fill));
}

/* ==============================
   TYPING EFFECT
   ============================== */
const typingElement = document.querySelector('.typing-text');
if (typingElement) {
    const titles = [
        'CSE Student @ LPU',
        'Problem Solver',
        'Aspiring Software Engineer',
        'Tech Explorer',
        'Time Management Enthusiast'
    ];
    let titleIndex = 0, charIndex = 0, isDeleting = false;

    function typeEffect() {
        const current = titles[titleIndex];
        typingElement.textContent = isDeleting
            ? current.substring(0, charIndex - 1)
            : current.substring(0, charIndex + 1);

        isDeleting ? charIndex-- : charIndex++;

        if (!isDeleting && charIndex === current.length) {
            isDeleting = true;
            return setTimeout(typeEffect, 2200);
        }
        if (isDeleting && charIndex === 0) {
            isDeleting = false;
            titleIndex = (titleIndex + 1) % titles.length;
            return setTimeout(typeEffect, 500);
        }
        setTimeout(typeEffect, isDeleting ? 45 : 95);
    }
    setTimeout(typeEffect, 1200);
}

/* ==============================
   CONTACT FORM
   ============================== */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const submitBtn = this.querySelector('.submit-btn');
        const originalHTML = submitBtn ? submitBtn.innerHTML : '';

        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
        }

        const formData = new FormData(this);

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                showToast('✅ Message sent! I will reply soon.', '#10b981');
                this.reset();
            } else {
                showToast('❌ Failed to send. Please try again.', '#ef4444');
            }
        } catch (err) {
            showToast('❌ Network error. Please try again.', '#ef4444');
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            }
        }
    });
}

/* ==============================
   TOAST NOTIFICATION
   ============================== */
function showToast(message, color = '#7c3aed') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 28px;
        right: 28px;
        background: ${color};
        color: #fff;
        padding: 14px 28px;
        border-radius: 50px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 9999;
        font-weight: 600;
        font-size: 14px;
        font-family: 'Space Grotesk', sans-serif;
        animation: toastIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        letter-spacing: 0.2px;
    `;
    document.body.appendChild(toast);

    const style = document.getElementById('toast-style');
    if (!style) {
        const s = document.createElement('style');
        s.id = 'toast-style';
        s.textContent = `
            @keyframes toastIn {
                from { transform: translateY(20px) scale(0.95); opacity: 0; }
                to { transform: translateY(0) scale(1); opacity: 1; }
            }
            @keyframes toastOut {
                from { transform: translateY(0) scale(1); opacity: 1; }
                to { transform: translateY(20px) scale(0.95); opacity: 0; }
            }
        `;
        document.head.appendChild(s);
    }

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

/* ==============================
   PROJECT / CERT FALLBACK LINKS
   ============================== */
document.querySelectorAll('.project-link, .cert-card-link, .cert-compact-item').forEach(link => {
    link.addEventListener('click', function (e) {
        if (this.getAttribute('href') === '#') {
            e.preventDefault();
            showToast('🔗 Link coming soon!');
        }
    });
});

/* ==============================
   RESPONSIVE SIDEBAR AUTO-CLOSE
   ============================== */
navigationLinks.forEach(() => {
    if (sidebar && window.innerWidth < 1100) sidebar.classList.remove('active');
});

window.addEventListener('resize', () => {
    if (sidebar && window.innerWidth >= 1100) sidebar.classList.remove('active');
});

/* ==============================
   CURSOR GLOW EFFECT
   ============================== */
(function cursorGlow() {
    const glow = document.createElement('div');
    glow.style.cssText = `
        position: fixed;
        width: 400px;
        height: 400px;
        pointer-events: none;
        z-index: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 70%);
        transition: transform 0.1s ease;
        transform: translate(-50%, -50%);
    `;
    document.body.appendChild(glow);

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function updateGlow() {
        glow.style.left = mouseX + 'px';
        glow.style.top = mouseY + 'px';
        requestAnimationFrame(updateGlow);
    }
    updateGlow();
})();