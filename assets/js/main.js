document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Initialize All Modules ---
    
    initHeroAnimation();        // NEW: Hero Section
    initServicesLoader();       // NEW: Dynamic Services Grid/Slider
    initQuoteAnimation();       // EXISTING: Quote Split Text
    initInteractiveClients();   // EXISTING: Client Logos
    initGSAPAnimations();       // EXISTING: Trust/Testimonials


    /**
     * [NEW] Hero Section Animation
     */
    function initHeroAnimation() {
        if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
            console.warn("GSAP not loaded. Hero animation skipped.");
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        const heroSection = document.querySelector('.hero-mod');
        
        if (heroSection) {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: heroSection,
                    start: "top 80%", 
                    toggleActions: "play none none none"
                }
            });

            tl.fromTo(".gs-reveal", 
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out" }
            );
        }
    }

    /**
     * [UPDATED] Services Loader 
     * Fetches JSON -> Builds Grid -> Initializes Mobile Slider
     */
    /**
     * [UPDATED] Services Loader 
     * Handles both EMOJIS (from your JSON) and IMAGES
     */
    async function initServicesLoader() {
        const gridContainer = document.getElementById('services-grid');
        if (!gridContainer) return;

        try {
            // 1. Fetch Data
            const response = await fetch('assets/data/services-data.json');
            if (!response.ok) throw new Error('Failed to fetch services');
            const servicesData = await response.json();

            // 2. Build DOM Elements
            servicesData.forEach(service => {
                const article = document.createElement('article');
                article.className = 'serv-mod__card gs-serv-card'; 
                
                // LOGIC: Check if 'icon' exists in JSON. If yes, use it. If not, try 'homePageImage'.
                let iconHtml = '';
                if (service.icon) {
                    // It's an Emoji/Text Icon
                    iconHtml = `<span style="font-size: 2.5rem; line-height: 1;">${service.icon}</span>`;
                } else if (service.homePageImage) {
                    // It's an Image URL
                    iconHtml = `<img src="${service.homePageImage}" alt="${service.title}" class="serv-mod__icon" style="width:100%; height:100%; object-fit:contain;">`;
                }

                article.innerHTML = `
                    <div class="serv-mod__icon-wrap">
                        ${iconHtml}
                    </div>
                    <h3 class="serv-mod__card-title">${service.title}</h3>
                    <p class="serv-mod__card-desc">${service.homePageDescription}</p>
                    <a href="${service.link || '#'}" class="serv-mod__btn">Read More &rarr;</a>
                `;
                
                gridContainer.appendChild(article);
            });

            // 3. Initialize Mobile Slider Logic
            setupMobileSlider(gridContainer);

            // 4. Trigger Animations
            if (typeof ScrollTrigger !== "undefined") {
                ScrollTrigger.refresh();
                initServiceGridAnimations();
            }

        } catch (error) {
            console.warn('Services load failed:', error);
        }
    }

    /**
     * [NEW] Mobile Slider Logic
     * Adds Auto-scroll and Buttons only for Mobile View
     */
    function setupMobileSlider(track) {
        
        // 1. Create Navigation Buttons Programmatically
        const navContainer = document.createElement('div');
        navContainer.className = 'serv-mod__nav-controls';
        navContainer.innerHTML = `
            <button class="serv-nav-btn prev" aria-label="Previous">&#10094;</button>
            <button class="serv-nav-btn next" aria-label="Next">&#10095;</button>
        `;
        
        // Insert buttons after the grid
        track.parentNode.appendChild(navContainer);

        const btnPrev = navContainer.querySelector('.prev');
        const btnNext = navContainer.querySelector('.next');
        let autoSlideInterval;

        // 2. Scroll Function
        const scrollAmount = () => {
            // Use the width of the first card to determine scroll distance
            const card = track.querySelector('.serv-mod__card');
            return card ? card.offsetWidth + 16 : 300; // 16 is gap
        };

        const slideNext = () => {
            if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
                // If at end, smooth scroll back to start
                track.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
            }
        };

        const slidePrev = () => {
            track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
        };

        // 3. Event Listeners
        btnNext.addEventListener('click', () => {
            stopAutoSlide();
            slideNext();
            startAutoSlide(); // Restart timer after interaction
        });

        btnPrev.addEventListener('click', () => {
            stopAutoSlide();
            slidePrev();
            startAutoSlide();
        });

        // 4. Touch Interaction (Pause on Touch)
        track.addEventListener('touchstart', stopAutoSlide, { passive: true });
        track.addEventListener('touchend', startAutoSlide);
        track.addEventListener('mouseenter', stopAutoSlide); // Pause on hover (Desktop)
        track.addEventListener('mouseleave', startAutoSlide);

        // 5. Auto Slide Logic
        function startAutoSlide() {
            // Only auto-slide on mobile screens (less than 1024px)
            if (window.innerWidth < 1024) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = setInterval(slideNext, 3000);
            }
        }

        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }

        // Initialize
        startAutoSlide();
        
        // Handle Resize
        window.addEventListener('resize', () => {
            stopAutoSlide();
            startAutoSlide();
        });
    }

    /**
     * [EXISTING] Service Grid Animations
     */
    function initServiceGridAnimations() {
        if (typeof gsap === "undefined") return;

        gsap.from(".serv-mod__main-title", {
            y: 30, opacity: 0, duration: 0.8,
            scrollTrigger: { trigger: ".serv-mod", start: "top 80%" }
        });

        gsap.to(".gs-serv-card", {
            y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power2.out",
            scrollTrigger: { trigger: "#services-grid", start: "top 75%" }
        });
        
        gsap.set(".gs-serv-card", { y: 50, opacity: 0 });
    }

    /**
     * [EXISTING] Quote Text Animation
     */
    function initQuoteAnimation() {
        const quoteEl = document.querySelector('.quote-text');
        if (!quoteEl) return;

        const text = quoteEl.textContent;
        quoteEl.textContent = '';
        const fragment = document.createDocumentFragment();
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            fragment.appendChild(span);
        });
        quoteEl.appendChild(fragment);

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const spans = quoteEl.querySelectorAll('span');
                    spans.forEach((span, i) => setTimeout(() => span.classList.add('visible'), i * 30));
                    obs.unobserve(quoteEl);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(quoteEl);
    }

    /**
     * [EXISTING] Interactive Clients
     */
    function initInteractiveClients() {
        const logos = document.querySelectorAll('.slide img');
        logos.forEach(logo => logo.addEventListener('click', () => console.log(`Clicked logo: ${logo.alt}`)));
    }

    /**
     * [EXISTING] Centralized GSAP Animations
     */
    function initGSAPAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        if (document.querySelector('.trust-section')) {
            gsap.from(".trust-section__header", {
                y: 50, opacity: 0, duration: 1, ease: "power3.out",
                scrollTrigger: { trigger: ".trust-section", start: "top 80%" }
            });
            gsap.from(".trust-section__visual", {
                x: -50, opacity: 0, duration: 1.2, ease: "power2.out",
                scrollTrigger: { trigger: ".trust-section__visual", start: "top 75%" }
            });
            gsap.from(".trust-section__feature", {
                y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: "back.out(1.2)",
                scrollTrigger: { trigger: ".trust-section__features-grid", start: "top 85%" }
            });
        }

        if (document.querySelector('.testimonial-card-unique')) {
            gsap.from(".testimonial-card-unique", {
                opacity: 0, y: 50, duration: 0.8, ease: "power2.out", stagger: 0.2,
                scrollTrigger: { trigger: ".testimonials-section", start: "top 80%" }
            });
        }
    }
});



document.addEventListener('DOMContentLoaded', () => {
    // Check if GSAP is loaded
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        const formElements = document.querySelectorAll('.pm-heading, .pm-input-group, .pm-textarea-group, .pm-btn-submit');
        const card = document.querySelector('.pm-info-card');

        // 1. Form Animation: Elements slide UP and Fade In
        gsap.from(formElements, {
            scrollTrigger: {
                trigger: ".pm-form-container",
                start: "top 85%", 
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1, // Creates the cascading effect
            ease: "power2.out",
            clearProps: "all" // Cleans up inline styles after animation for responsiveness
        });

        // 2. Card Animation: Slides in from the Right
        gsap.from(card, {
            scrollTrigger: {
                trigger: ".pm-content-grid",
                start: "top 80%",
            },
            x: 60,
            opacity: 0,
            duration: 1,
            delay: 0.2, // Waits slightly for form to start
            ease: "power3.out",
            clearProps: "all"
        });
    } else {
        console.warn("GSAP not loaded.");
    }
});