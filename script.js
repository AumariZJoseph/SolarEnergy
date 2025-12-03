// Optimized: Use requestIdleCallback for non-critical initialization
(function() {
'use strict';

// Mobile Navigation Toggle - moved to top for faster interaction
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }));
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
// Hero Slideshow Functionality
const slides = document.querySelectorAll('.hero-slide');
const indicators = document.querySelectorAll('.hero-slide-indicators .indicator');
let currentSlide = 0;
let slideInterval;
let touchStartX = 0;
let touchEndX = 0;
let isTransitioning = false;

// Branding Header Background Slideshow Variables (defined early for synchronization)
const brandingSlidesBg = document.querySelectorAll('.branding-slide-bg');
let currentBrandingSlideBg = 0;
let brandingSlideIntervalBg;

function showSlide(index) {
    // Remove active class from all slides and indicators
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Add active class to current slide and indicator
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    if (indicators[index]) {
        indicators[index].classList.add('active');
    }
    
    currentSlide = index;
}

function nextSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
    setTimeout(() => {
        isTransitioning = false;
    }, 1500); // Match transition duration
}

function prevSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
    setTimeout(() => {
        isTransitioning = false;
    }, 1500);
}

function startSlideshow() {
    // Clear any existing intervals
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }
    if (brandingSlideIntervalBg) {
        clearInterval(brandingSlideIntervalBg);
        brandingSlideIntervalBg = null;
    }
    // Change slides every 5 seconds (4 seconds on mobile for better engagement)
    // Both slideshows will change together
    const intervalTime = window.innerWidth <= 768 ? 4000 : 5000;
    slideInterval = setInterval(() => {
        nextSlide();
        // Also advance branding slideshow if it exists
        if (brandingSlidesBg && brandingSlidesBg.length > 0) {
            nextBrandingSlideBg();
        }
    }, intervalTime);
}

function stopSlideshow() {
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }
    if (brandingSlideIntervalBg) {
        clearInterval(brandingSlideIntervalBg);
        brandingSlideIntervalBg = null;
    }
}

function restartSlideshow() {
    stopSlideshow();
    startSlideshow();
}

// Initialize slideshow
if (slides.length > 0) {
    // Ensure first slide is active
    showSlide(0);
    
    // Get slideshow element
    const heroSlideshow = document.querySelector('.hero-slideshow');
    
    // Fallback function to check if slideshow is in view
    function isSlideshowInView() {
        if (!heroSlideshow) return false;
        const rect = heroSlideshow.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.top < windowHeight && rect.bottom > 0;
    }
    
    // Start the automatic slideshow immediately
    // Use a small delay to ensure DOM is fully ready
    setTimeout(() => {
        startSlideshow();
    }, 100);
    
    // Add click handlers to indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            if (index !== currentSlide) {
                isTransitioning = false; // Reset transition flag
                showSlide(index);
                // Also sync branding slideshow if it exists
                if (brandingSlidesBg && brandingSlidesBg.length > 0) {
                    // Use the same index, or wrap if branding has different number of slides
                    const brandingIndex = index % brandingSlidesBg.length;
                    showBrandingSlideBg(brandingIndex);
                }
                restartSlideshow();
            }
        });
    });
    
    // Pause on hover (desktop only) - will pause both slideshows together
    if (heroSlideshow) {
        // Only add hover events for non-touch devices
        if (window.matchMedia('(hover: hover)').matches) {
            heroSlideshow.addEventListener('mouseenter', () => {
                stopSlideshow(); // This stops both slideshows
            });
            heroSlideshow.addEventListener('mouseleave', () => {
                // Only restart if slideshow is still in view
                if (isSlideshowInView()) {
                    startSlideshow(); // This starts both slideshows
                }
            });
        }
        
        // Touch/swipe support for mobile
        heroSlideshow.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        heroSlideshow.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }
    
    // Handle swipe gestures
    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for swipe
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                nextSlide();
                // Also advance branding slideshow if it exists
                if (brandingSlidesBg && brandingSlidesBg.length > 0) {
                    nextBrandingSlideBg();
                }
            } else {
                // Swipe right - previous slide
                prevSlide();
                // Also go back on branding slideshow if it exists
                if (brandingSlidesBg && brandingSlidesBg.length > 0) {
                    const prev = (currentBrandingSlideBg - 1 + brandingSlidesBg.length) % brandingSlidesBg.length;
                    showBrandingSlideBg(prev);
                }
            }
            restartSlideshow();
        }
    }
    
    // Pause slideshows when page is not visible (saves resources) - affects both slideshows
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopSlideshow(); // This stops both slideshows
        } else {
            // Only restart if slideshow is in view
            if (isSlideshowInView()) {
                startSlideshow(); // This starts both slideshows
            }
        }
    });
    
    // Use Intersection Observer to detect when slideshow enters/exits viewport
    if ('IntersectionObserver' in window && heroSlideshow) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Slideshow is in view - ensure it's running
                    if (!slideInterval) {
                        startSlideshow();
                    }
                } else {
                    // Slideshow is out of view - stop it to save resources
                    stopSlideshow();
                }
            });
        }, {
            threshold: 0.1 // Trigger when at least 10% is visible
        });
        
        // Start observing after a small delay to ensure initial start works
        setTimeout(() => {
            observer.observe(heroSlideshow);
        }, 100);
    }
    
    // Restart slideshows on window resize (to adjust timing for mobile/desktop) - affects both
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (isSlideshowInView()) {
                restartSlideshow(); // This restarts both slideshows
            }
        }, 250);
    });
    
    // Ensure slideshows restart when scrolling back into view (fallback) - affects both
    let scrollTimer;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            if (isSlideshowInView() && !slideInterval) {
                startSlideshow(); // This starts both slideshows
            }
        }, 300);
    }, { passive: true });
}

// Branding Header Background Slideshow Functions
function showBrandingSlideBg(index) {
    brandingSlidesBg.forEach(slide => slide.classList.remove('active'));
    if (brandingSlidesBg[index]) {
        brandingSlidesBg[index].classList.add('active');
    }
    currentBrandingSlideBg = index;
}

function nextBrandingSlideBg() {
    const next = (currentBrandingSlideBg + 1) % brandingSlidesBg.length;
    showBrandingSlideBg(next);
}

// Initialize branding header background slideshow
if (brandingSlidesBg.length > 0) {
    showBrandingSlideBg(0);
    
    // If there's no hero slideshow, start the branding slideshow independently
    if (slides.length === 0) {
        // Start the branding slideshow independently on pages without hero slideshow
        setTimeout(() => {
            const intervalTime = window.innerWidth <= 768 ? 4000 : 5000;
            brandingSlideIntervalBg = setInterval(() => {
                nextBrandingSlideBg();
            }, intervalTime);
        }, 100);
    }
    
    // Pause on hover (desktop only) - will pause both slideshows together if hero exists, or just branding if not
    const brandingHeader = document.querySelector('.branding-header');
    if (brandingHeader && window.matchMedia('(hover: hover)').matches) {
        brandingHeader.addEventListener('mouseenter', () => {
            if (slides.length > 0) {
                stopSlideshow(); // This stops both slideshows
            } else {
                // Only branding slideshow exists, stop it independently
                if (brandingSlideIntervalBg) {
                    clearInterval(brandingSlideIntervalBg);
                    brandingSlideIntervalBg = null;
                }
            }
        });
        brandingHeader.addEventListener('mouseleave', () => {
            if (slides.length > 0) {
                // Hero slideshow exists, check if it's in view
                const heroSlideshow = document.querySelector('.hero-slideshow');
                if (heroSlideshow) {
                    const rect = heroSlideshow.getBoundingClientRect();
                    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                    if (rect.top < windowHeight && rect.bottom > 0) {
                        startSlideshow(); // This starts both slideshows
                    }
                }
            } else {
                // Only branding slideshow exists, restart it independently
                if (!brandingSlideIntervalBg) {
                    const intervalTime = window.innerWidth <= 768 ? 4000 : 5000;
                    brandingSlideIntervalBg = setInterval(() => {
                        nextBrandingSlideBg();
                    }, intervalTime);
                }
            }
        });
    }
    
    // Pause slideshow when page is not visible (for pages without hero slideshow)
    if (slides.length === 0) {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (brandingSlideIntervalBg) {
                    clearInterval(brandingSlideIntervalBg);
                    brandingSlideIntervalBg = null;
                }
            } else {
                if (!brandingSlideIntervalBg) {
                    const intervalTime = window.innerWidth <= 768 ? 4000 : 5000;
                    brandingSlideIntervalBg = setInterval(() => {
                        nextBrandingSlideBg();
                    }, intervalTime);
                }
            }
        });
        
        // Restart slideshow on window resize (for pages without hero slideshow)
        let brandingResizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(brandingResizeTimer);
            brandingResizeTimer = setTimeout(() => {
                if (brandingSlideIntervalBg) {
                    clearInterval(brandingSlideIntervalBg);
                }
                const intervalTime = window.innerWidth <= 768 ? 4000 : 5000;
                brandingSlideIntervalBg = setInterval(() => {
                    nextBrandingSlideBg();
                }, intervalTime);
            }, 250);
        });
    }
}

// Mobile Navigation Toggle - moved to top, already handled above

// FAQ Accordion Functionality
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all other FAQ items
        faqItems.forEach(otherItem => {
            otherItem.classList.remove('active');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            otherAnswer.style.maxHeight = '0';
        });
        
        // Toggle current item
        if (!isActive) {
            item.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    });
});

// Smooth Scrolling for Navigation Links
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

// Navbar Background Change on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'var(--white)';
        navbar.style.backdropFilter = 'none';
    }
});

// Scroll Animation for Elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('loaded');
        }
    });
}, observerOptions);

// Observe elements for scroll animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.service-card, .tip-card, .faq-item, .contact-info, .contact-form');
    animateElements.forEach(el => {
        el.classList.add('loading');
        observer.observe(el);
    });
});

// Contact Form Handling with Web3Forms
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = this.querySelector('input[name="name"]').value;
        const email = this.querySelector('input[name="email"]').value;
        const message = this.querySelector('textarea[name="message"]').value;
        
        // Basic validation
        if (!name || !email || !message) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        // Get submit button
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Add subject field for Web3Forms
        formData.append('subject', 'New Contact Form Message from ' + name);
        formData.append('from_name', name);
        
        // Submit to Web3Forms
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Thank you for your message! We will get back to you soon.', 'success');
                contactForm.reset();
            } else {
                showNotification('Sorry, there was an error sending your message. Please try again or contact us directly at solarenergyservicesslu@gmail.com', 'error');
            }
        })
        .catch(error => {
            console.error('Form submission error:', error);
            showNotification('Sorry, there was an error sending your message. Please try again or contact us directly at solarenergyservicesslu@gmail.com', 'error');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--primary-green)' : type === 'error' ? '#dc3545' : 'var(--gray)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Counter Animation for Statistics
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

// Parallax Effect for Hero Section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add loading animation to page elements
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Add staggered animation to service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('loaded');
        }, index * 100);
    });
    
    // Add staggered animation to tip cards
    const tipCards = document.querySelectorAll('.tip-card');
    tipCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('loaded');
        }, index * 100);
    });
});

// Add CSS for notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
    
    .service-card.loaded,
    .tip-card.loaded,
    .faq-item.loaded,
    .contact-info.loaded,
    .contact-form.loaded {
        animation: slideInUp 0.6s ease forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    body.loaded {
        opacity: 1;
    }
    
    body {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
`;

document.head.appendChild(notificationStyles);

// Add scroll-to-top functionality
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollToTopBtn.className = 'scroll-to-top';
scrollToTopBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--primary-green);
    color: white;
    border: none;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

document.body.appendChild(scrollToTopBtn);

// Show/hide scroll-to-top button
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.style.opacity = '1';
        scrollToTopBtn.style.visibility = 'visible';
    } else {
        scrollToTopBtn.style.opacity = '0';
        scrollToTopBtn.style.visibility = 'hidden';
    }
});

// Scroll to top functionality
scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Add hover effect to scroll-to-top button
scrollToTopBtn.addEventListener('mouseenter', () => {
    scrollToTopBtn.style.transform = 'scale(1.1)';
});

scrollToTopBtn.addEventListener('mouseleave', () => {
    scrollToTopBtn.style.transform = 'scale(1)';
});

// Parallax effect for hero background elements
function heroParallax(e) {
    const hero = document.querySelector('.hero-simple');
    if (!hero) return;
    const logo1 = hero.querySelector('.hero-bg-logo1');
    const logo2 = hero.querySelector('.hero-bg-logo2');
    const logo3 = hero.querySelector('.hero-bg-logo3');
    const circle1 = hero.querySelector('.hero-bg-circle');
    const circle2 = hero.querySelector('.hero-bg-circle2');
    const lines = hero.querySelector('.hero-bg-lines');
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = x / rect.width - 0.5;
    const cy = y / rect.height - 0.5;
    if (logo1) logo1.style.transform = `translate(-50%, -50%) scale(1.0) translate(${cx*30}px,${cy*30}px)`;
    if (logo2) logo2.style.transform = `translate(-50%, -50%) scale(0.6) translate(${cx*60}px,${cy*60}px)`;
    if (logo3) logo3.style.transform = `translate(-50%, -50%) scale(0.8) translate(${cx*-40}px,${cy*-40}px)`;
    if (circle1) circle1.style.transform = `translateY(-${cy*20}px) scale(1)`;
    if (circle2) circle2.style.transform = `translateY(${cy*20}px) scale(1)`;
    if (lines) lines.style.backgroundPositionX = `${cx*60}px`;
}
function enableHeroParallax() {
    const hero = document.querySelector('.hero-simple');
    if (!hero) return;
    hero.addEventListener('mousemove', heroParallax);
    hero.addEventListener('mouseleave', () => {
        const logo1 = hero.querySelector('.hero-bg-logo1');
        const logo2 = hero.querySelector('.hero-bg-logo2');
        const logo3 = hero.querySelector('.hero-bg-logo3');
        const circle1 = hero.querySelector('.hero-bg-circle');
        const circle2 = hero.querySelector('.hero-bg-circle2');
        const lines = hero.querySelector('.hero-bg-lines');
        if (logo1) logo1.style.transform = 'translate(-50%, -50%)';
        if (logo2) logo2.style.transform = 'translate(-50%, -50%) scale(0.6)';
        if (logo3) logo3.style.transform = 'translate(-50%, -50%) scale(0.8)';
        if (circle1) circle1.style.transform = '';
        if (circle2) circle2.style.transform = '';
        if (lines) lines.style.backgroundPositionX = '';
    });
}
document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth >= 768) enableHeroParallax();
});

}); // Close the initial DOMContentLoaded event listener

})(); // Close IIFE

// Technical Details Collapsible Functionality
document.addEventListener('DOMContentLoaded', function() {
    const techCollapsibleItems = document.querySelectorAll('.tech-collapsible-item');
    
    techCollapsibleItems.forEach(item => {
        const header = item.querySelector('.tech-collapsible-header');
        
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other technical detail items
            techCollapsibleItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const content = otherItem.querySelector('.tech-collapsible-content');
                    content.style.maxHeight = '0';
                }
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
                const content = item.querySelector('.tech-collapsible-content');
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                item.classList.remove('active');
                const content = item.querySelector('.tech-collapsible-content');
                content.style.maxHeight = '0';
            }
        });
    });
    
    // Open first item by default
    if (techCollapsibleItems.length > 0) {
        const firstItem = techCollapsibleItems[0];
        firstItem.classList.add('active');
        const firstContent = firstItem.querySelector('.tech-collapsible-content');
        firstContent.style.maxHeight = firstContent.scrollHeight + 'px';
    }
});