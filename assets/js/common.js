document.addEventListener("DOMContentLoaded", function () {

  // 1. Fetch the Header
  fetch("header.html")
    .then((response) => {
      if (!response.ok) throw new Error("Header file not found!");
      return response.text();
    })
    .then((data) => {
      // 2. Inject HTML
      const placeholder = document.getElementById("header-placeholder");
      if (placeholder) {
        placeholder.innerHTML = data;
      } else {
        console.error("Error: <div id='header-placeholder'></div> is missing.");
        return;
      }

      // 3. Define Elements (After injection)
      const menuBtn = document.getElementById("menuBtn");
      const navMenu = document.getElementById("navMenu");
      const headerWrapper = document.getElementById("headerWrapper");

      // 4. Toggle Menu Logic (Mobile)
      if (menuBtn && navMenu) {
        menuBtn.addEventListener("click", function (e) {
          e.stopPropagation(); // Prevent immediate closing
          navMenu.classList.toggle("active");
          
          // Toggle icon between ☰ and ✕ (Optional visual cue)
          if (navMenu.classList.contains("active")) {
            menuBtn.innerHTML = "✕"; 
          } else {
            menuBtn.innerHTML = "☰";
          }
        });

        // Close menu when clicking anywhere else on body
        document.addEventListener("click", function (e) {
          if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            navMenu.classList.remove("active");
            menuBtn.innerHTML = "☰";
          }
        });
      }

      // 5. Scroll Logic (Hide Header)
      let lastScrollTop = 0;
      window.addEventListener("scroll", function () {
        let scrollTop = window.scrollY || document.documentElement.scrollTop;

        if (headerWrapper) {
          if (scrollTop > lastScrollTop && scrollTop > 50) {
            // Scrolling Down -> Hide Header
            headerWrapper.classList.add("hide-header");
            // Also close mobile menu if open
            if (navMenu) {
              navMenu.classList.remove("active");
              if (menuBtn) menuBtn.innerHTML = "☰";
            }
          } else {
            // Scrolling Up -> Show Header
            headerWrapper.classList.remove("hide-header");
          }
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
      });

    })
    .catch((error) => console.error("Error loading header:", error));
});










// Wait for DOM and GSAP to be ready
document.addEventListener("DOMContentLoaded", () => {
    // Early return if GSAP isn't available
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error('GSAP or ScrollTrigger not available');
        return;
    }

    const footerContainer = document.getElementById('common-footer');
    if (!footerContainer) {
        console.warn('Footer container element not found');
        return;
    }

    // --- Dynamic Loading Logic (Kept mostly the same) ---
    const loadFooter = async () => {
        try {
            // Determine correct path based on current location
            const isServicesPage = window.location.pathname.includes('/services/');
            const footerPath = isServicesPage ? '../footer.html' : 'footer.html';
            
            console.log('Attempting to load footer from:', footerPath);
            
            const response = await fetch(footerPath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            footerContainer.innerHTML = html;
            if (window.CMS && typeof window.CMS.applyFooter === "function") { window.CMS.applyFooter(footerContainer); }

        } catch (err) {
            console.error('Error loading footer, using fallback:', err);
            // Fallback content
            const isServicesPage = window.location.pathname.includes('/services/');
            const basePath = isServicesPage ? '../' : './';

            footerContainer.innerHTML = `
                <div class="footer-fallback" style="text-align: center; padding: 20px; color: #333;">
                    <h4>Energy Concepts</h4>
                    <p><a href="${basePath}index.html">Home</a> | <a href="#">Contact</a></p>
                    <p class="copyright">© ${new Date().getFullYear()} Energy Concepts. All rights reserved.</p>
                </div>
            `;
            if (window.CMS && typeof window.CMS.applyFooter === "function") { window.CMS.applyFooter(footerContainer); }
        } finally {
            // Run animations after content is loaded
            initializeFooterAnimations();
        }
    };

    // --- NEW Animation Logic for Energy Concepts Footer ---
    const initializeFooterAnimations = () => {
        // Selectors for the NEW footer design
        const footer = document.querySelector('.ec-footer');
        const columns = document.querySelectorAll('.ec-footer__col');
        const separator = document.querySelector('.ec-footer__separator');
        const bottomText = document.querySelector('.ec-footer__bottom');
        
        if (!footer) {
            console.warn("'.ec-footer' not found, skipping animations.");
            return;
        }

        // 1. Fade in the background/container
        gsap.fromTo(footer, 
            { opacity: 0 },
            {
                opacity: 1,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: footer,
                    start: "top 80%", // Animation starts when top of footer hits 80% of viewport
                    toggleActions: "play none none reverse"
                }
            }
        );

        // 2. Stagger slide up the columns (Brand, Links, Contact)
        if (columns.length > 0) {
            gsap.fromTo(columns,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.2, // 0.2s delay between each column
                    ease: "back.out(1.7)", // Slight bounce effect
                    scrollTrigger: {
                        trigger: footer,
                        start: "top 80%"
                    }
                }
            );
        }

        // 3. Expand the separator line
        if (separator) {
            gsap.fromTo(separator,
                { width: 0 },
                {
                    width: "100%",
                    duration: 0.8,
                    delay: 0.2,
                    ease: "power2.inOut",
                    scrollTrigger: {
                        trigger: footer,
                        start: "top 80%"
                    }
                }
            );
        }

        // 4. Fade in copyright text
        if (bottomText) {
            gsap.fromTo(bottomText,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    delay: 0.4,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: footer,
                        start: "top 95%"
                    }
                }
            );
        }
    };

    // Start the process
    loadFooter();
});