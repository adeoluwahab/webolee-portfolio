// Accessible Portfolio JavaScript
// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Smooth scrolling navigation with keyboard support
document.querySelectorAll('.nav-dot').forEach(dot => {
    // Make navigation dots keyboard accessible
    dot.setAttribute('role', 'button');
    dot.setAttribute('tabindex', '0');
    
    // Add descriptive labels
    const sectionId = dot.getAttribute('data-section');
    const sectionName = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    dot.setAttribute('aria-label', `Navigate to ${sectionName} section`);
    
    // Click handler
    dot.addEventListener('click', function() {
        navigateToSection(this);
    });
    
    // Keyboard handler (Enter and Space)
    dot.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigateToSection(this);
        }
    });
});

function navigateToSection(element) {
    const sectionId = element.getAttribute('data-section');
    const section = document.getElementById(sectionId);
    
    if (section) {
        // Announce navigation to screen readers
        announceToScreenReader(`Navigating to ${sectionId} section`);
        
        // Smooth scroll only if user hasn't requested reduced motion
        section.scrollIntoView({ 
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start'
        });
        
        // Set focus to the section for screen readers
        section.setAttribute('tabindex', '-1');
        section.focus();
        
        // Remove tabindex after focus (cleanup)
        setTimeout(() => {
            section.removeAttribute('tabindex');
        }, 100);
    }
}

// Update active navigation dot on scroll with throttling for performance
let scrollTimeout;
window.addEventListener('scroll', function() {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = setTimeout(() => {
        updateActiveNavigation();
    }, 16); // ~60fps throttling
});

function updateActiveNavigation() {
    const sections = ['header', 'about', 'skills', 'projects', 'experience'];
    const navDots = document.querySelectorAll('.nav-dot');
    
    let current = '';
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                current = sectionId;
            }
        }
    });
    
    navDots.forEach(dot => {
        const isActive = dot.getAttribute('data-section') === current;
        dot.classList.toggle('active', isActive);
        
        // Update aria-current for screen readers
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
        
        // Update aria-label to indicate current section
        const sectionName = dot.getAttribute('data-section');
        const capitalizedName = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
        const label = isActive ? 
            `Current section: ${capitalizedName}` : 
            `Navigate to ${capitalizedName} section`;
        dot.setAttribute('aria-label', label);
    });
}

// Accessible hover effects for project cards
document.querySelectorAll('.project-card').forEach(card => {
    // Ensure cards are keyboard focusable if they're interactive
    if (!card.hasAttribute('tabindex')) {
        card.setAttribute('tabindex', '0');
    }
    
    // Add role if it's interactive
    card.setAttribute('role', 'article');
    
    // Mouse events
    card.addEventListener('mouseenter', function() {
        if (!prefersReducedMotion) {
            this.style.transform = 'translateY(-10px) rotateX(5deg)';
            this.style.transition = 'transform 0.3s ease';
        }
    });
    
    card.addEventListener('mouseleave', function() {
        if (!prefersReducedMotion) {
            this.style.transform = 'translateY(0) rotateX(0deg)';
        }
    });
    
    // Keyboard focus events for accessibility
    card.addEventListener('focus', function() {
        if (!prefersReducedMotion) {
            this.style.transform = 'translateY(-10px) rotateX(5deg)';
            this.style.transition = 'transform 0.3s ease';
        }
        // Add focus outline for better visibility
        this.style.outline = '2px solid #007acc';
        this.style.outlineOffset = '2px';
    });
    
    card.addEventListener('blur', function() {
        if (!prefersReducedMotion) {
            this.style.transform = 'translateY(0) rotateX(0deg)';
        }
        this.style.outline = 'none';
    });
});

// Accessible typing effect with skip option
function initTypingEffect() {
    const subtitle = document.querySelector('.subtitle');
    if (!subtitle) return;
    
    const text = subtitle.textContent;
    const skipButton = createSkipAnimationButton();
    
    // Only run animation if user hasn't requested reduced motion
    if (!prefersReducedMotion) {
        subtitle.textContent = '';
        subtitle.setAttribute('aria-live', 'polite');
        
        let i = 0;
        let typingInterval;
        
        function typeWriter() {
            if (i < text.length) {
                subtitle.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typingInterval);
                removeSkipButton(skipButton);
                subtitle.removeAttribute('aria-live');
            }
        }
        
        // Start typing after delay
        setTimeout(() => {
            typingInterval = setInterval(typeWriter, 50);
        }, 1000);
        
        // Skip animation functionality
        skipButton.addEventListener('click', () => {
            clearInterval(typingInterval);
            subtitle.textContent = text;
            removeSkipButton(skipButton);
            subtitle.removeAttribute('aria-live');
        });
    } else {
        // For users who prefer reduced motion, show text immediately
        subtitle.textContent = text;
    }
}

function createSkipAnimationButton() {
    const button = document.createElement('button');
    button.textContent = 'Skip animation';
    button.className = 'skip-animation-btn';
    button.setAttribute('aria-label', 'Skip typing animation');
    button.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        z-index: 1000;
    `;
    
    document.body.appendChild(button);
    return button;
}

function removeSkipButton(button) {
    if (button && button.parentNode) {
        button.parentNode.removeChild(button);
    }
}

// Accessible parallax effect (disabled for reduced motion)
function initParallaxEffect() {
    if (prefersReducedMotion) return;
    
    let ticking = false;
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                const scrolled = window.pageYOffset;
                const parallax = document.body;
                const speed = scrolled * 0.5;
                parallax.style.backgroundPosition = `center ${speed}px`;
                ticking = false;
            });
            ticking = true;
        }
    });
}

// Screen reader announcement function
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    `;
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Initialize all effects when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add skip to content link for keyboard users
    addSkipToContentLink();
    
    // Initialize effects
    initTypingEffect();
    initParallaxEffect();
    updateActiveNavigation(); // Set initial active state
    
    // Listen for changes in motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', function() {
        location.reload(); // Simple way to re-initialize with new preference
    });
});

// Skip to content link for keyboard navigation
function addSkipToContentLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-to-content';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 9999;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}