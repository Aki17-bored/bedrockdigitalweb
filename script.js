// Initialize Locomotive Scroll & GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const locoScroll = new LocomotiveScroll({
    el: document.querySelector("#main"),
    smooth: true,
    multiplier: 1.2, // Faster smooth scroll speed
    lerp: 0.1,
    smartphone: {
        smooth: true,
        multiplier: 1.2,
        lerp: 0.1
    },
    tablet: {
        smooth: true,
        multiplier: 1.2,
        lerp: 0.1
    }
});

// Sync Locomotive Scroll with GSAP ScrollTrigger
locoScroll.on("scroll", () => {
    ScrollTrigger.update();
    // One-time refresh after scroll starts to handle dynamic height adjustments from loading sections
    if (!window.scrollRefreshed) {
        ScrollTrigger.refresh();
        window.scrollRefreshed = true;
    }
});

ScrollTrigger.scrollerProxy("#main", {
    scrollTop(value) {
        return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: document.querySelector("#main").style.transform ? "transform" : "fixed"
});

ScrollTrigger.addEventListener("refresh", () => locoScroll.update());

// --- Navbar Color Toggle Logic ---
if (document.querySelector("#barter-services") && document.querySelector("#ready")) {
    ScrollTrigger.create({
        trigger: "#barter-services",
        endTrigger: "#ready",
        start: "top 5%",
        end: "bottom 5%",
        scroller: "#main",
        toggleClass: { targets: "#nav", className: "dark-nav" },
    });
}


// --- Cursor Logic ---
function initCursor() {
    const cursor = document.querySelector("#cursor");
    if (!cursor) return;

    // Auto-center cursor element accurately using GSAP so it handles width transitions safely
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    window.addEventListener("mousemove", (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: "power2.out"
        });
    });

    // Hover scale effect for links and buttons to show 'View'
    const interactables = document.querySelectorAll("a, button, .btn, .icon, .read-more-btn, .card-btn, .tag, .map-pin");
    interactables.forEach(item => {
        item.addEventListener("mouseenter", () => {
            const isNav = item.closest("#nav");

            if (isNav) {
                cursor.classList.add("active"); // Just a standard small expansion, no text
            } else {
                cursor.classList.add("view-active"); // Custom class for view scaling
                const textEl = cursor.querySelector(".cursor-text");
                if (textEl) textEl.textContent = "VIEW";
            }
        });

        item.addEventListener("mouseleave", () => {
            cursor.classList.remove("active", "view-active");
            const textEl = cursor.querySelector(".cursor-text");
            if (textEl) textEl.textContent = "";
        });
    });
}

// Advanced cursor and click redirection for Project Card Rows
function initProjectCards() {
    const projectImages = document.querySelectorAll(".project-card-img");
    const cursor = document.querySelector("#cursor");
    if (!cursor) return;
    const cursorText = cursor.querySelector(".cursor-text");

    projectImages.forEach(imgBox => {
        imgBox.addEventListener("mouseenter", () => {
            cursor.classList.add("view-active");
            if (cursorText) cursorText.textContent = "VIEW";
        });
        imgBox.addEventListener("mouseleave", () => {
            cursor.classList.remove("view-active");
            if (cursorText) cursorText.textContent = "";
        });

        // Make images clickable to open URL
        imgBox.addEventListener("click", () => {
            const row = imgBox.closest(".project-card-row");
            const url = row ? row.getAttribute("data-url") : null;
            if (url) {
                window.open(url, "_blank");
            }
        });
    });
}

// --- Marquee Animation ---
gsap.to(".marque-text h1", {
    x: "-100%",
    repeat: -1,
    duration: 15, // Slowed down from 5s for better readability
    ease: "none",
});

function initPreloader() {
    const typewriterElement = document.getElementById("typewriter");
    if (!typewriterElement) {
        // If not on homepage, just fade in navigation and trigger ScrollTrigger update
        gsap.set("#nav", { opacity: 1, y: 0 });
        setTimeout(() => {
            locoScroll.update();
            ScrollTrigger.refresh();
        }, 100);
        return;
    }

    // Check if preloader has already played in this session
    const hasPreloaderPlayed = sessionStorage.getItem("preloaderPlayed");
    if (hasPreloaderPlayed) {
        typewriterElement.innerHTML = "Built Different.<br>Built Digital.";
        const blinkCursor = document.querySelector(".cursor-blink");
        if (blinkCursor) blinkCursor.style.display = "none";
        
        // Render all elements immediately
        gsap.set(["#nav", ".hero-description", ".hero-cta", "#marquee", "#about", "#why-barter", "#barter-services", "#projects", "#ready", "#contact", "#footer-wrapper"], { opacity: 1, y: 0 });
        gsap.set(".loader", { scale: 1.8, xPercent: -50, yPercent: -50, opacity: 1, y: 0 });
        
        setTimeout(() => {
            locoScroll.update();
            ScrollTrigger.refresh();
        }, 100);
        return;
    }
    
    // Mark as played for this session
    sessionStorage.setItem("preloaderPlayed", "true");

    // Hide everything else initially
    gsap.set(["#nav", ".hero-description", ".hero-cta", ".loader", "#marquee", "#about", "#why-barter", "#barter-services", "#projects", "#ready", "#contact", "#footer-wrapper"], { opacity: 0, y: 20 });
    
    // Scale container initial state so it can animate in properly
    gsap.set(".loader", { scale: 0, xPercent: -50, yPercent: -50 });
    
    // We want to type "Built Different." first, then "<br>", then "Built Digital."
    const parts = [
        "Built Different.",
        "<br>",
        "Built Digital."
    ];
    
    let currentPart = 0;
    let currentChar = 0;
    
    function typeWriter() {
        if (currentPart < parts.length) {
            if (parts[currentPart] === "<br>") {
                typewriterElement.innerHTML += "<br>";
                currentPart++;
                setTimeout(typeWriter, 400); // pause after first line
            } else {
                if (currentChar < parts[currentPart].length) {
                    typewriterElement.innerHTML += parts[currentPart].charAt(currentChar);
                    currentChar++;
                    // randomize typing speed slightly for realism
                    let typeSpeed = Math.random() * 50 + 30; 
                    setTimeout(typeWriter, typeSpeed); 
                } else {
                    currentPart++;
                    currentChar = 0;
                    setTimeout(typeWriter, 100);
                }
            }
        } else {
            // Finished typing, start the main animations
            setTimeout(() => {
                document.querySelector(".cursor-blink").style.display = "none";
                loaderAnimation();
            }, 800);
        }
    }
    
    // Start typing after a short delay
    setTimeout(typeWriter, 500);
}

function loaderAnimation() {
    const tl = gsap.timeline();

    // Fade in Nav
    tl.to("#nav", {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
    });

    // Fade in description and cta
    tl.to([".hero-description", ".hero-cta"], {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
    }, "-=0.5");

    // Pop in cubes
    tl.to(".loader", {
        scale: 1.8,
        xPercent: -50,
        yPercent: -50,
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "back.out(1.2)"
    }, "-=0.8");

    // Fade in the rest of the page
    tl.to(["#about", "#why-barter", "#barter-services", "#projects", "#ready", "#contact", "#footer-wrapper"], {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        onComplete: () => {
            locoScroll.update();
            ScrollTrigger.refresh();
            console.log("LocoScroll & ScrollTrigger Refreshed after Preloader");
        }
    }, "-=0.5");
}

function initScrollAnimations() {
    // Reveal Project Rows sequentially
    gsap.utils.toArray(".project-card-row").forEach(row => {
        gsap.from(row, {
            scrollTrigger: {
                trigger: row,
                scroller: "#main",
                start: "top 85%",
            },
            y: 80,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    // Reveal Services
    if (document.querySelector("#barter-services") && document.querySelectorAll(".service-col").length > 0) {
        gsap.from(".service-col", {
            scrollTrigger: {
                trigger: "#barter-services",
                scroller: "#main",
                start: "top 80%",
            },
            x: -50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });
    }

    // Scroll-to-reveal footer animation
    gsap.fromTo("#footer", 
        { yPercent: -100 }, 
        {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
                trigger: "#footer-wrapper",
                scroller: "#main",
                start: "top bottom",
                end: "bottom bottom",
                scrub: true
            }
        }
    );

    // Pin the footer wrapper when it is fully revealed to prevent it from going above the viewport
    ScrollTrigger.create({
        trigger: "#footer-wrapper",
        scroller: "#main",
        start: "bottom bottom",
        end: "max",
        pin: true,
        pinSpacing: false
    });
}

// --- Hero Slider Logic ---
function initHeroSlider() {
    const slides = document.querySelectorAll(".hero-slide");
    if (slides.length === 0) return;

    let currentSlide = 0;

    function nextSlide() {
        slides[currentSlide].classList.remove("active");
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add("active");
    }

    setInterval(nextSlide, 5000);
}


// --- Eye Tracking Logic ---
let eyesCached = [];

function updateEyeCoordinates() {
    if (!locoScroll || !locoScroll.scroll) return;
    eyesCached = [];
    const eyes = document.querySelectorAll(".eye");
    const scrollY = locoScroll.scroll.instance.scroll.y || 0;
    
    eyes.forEach(eye => {
        const line = eye.querySelector(".line");
        if (line) {
            const rect = eye.getBoundingClientRect();
            eyesCached.push({
                line: line,
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2 + scrollY
            });
        }
    });
}

function initEyeTracking() {
    const eyes = document.querySelectorAll(".eye");
    if (eyes.length === 0) return;

    // Calculate coordinates after a short delay so preloader/layout settles
    setTimeout(updateEyeCoordinates, 800);

    // Update coordinates on resize
    window.addEventListener("resize", updateEyeCoordinates);

    // Update coordinates on ScrollTrigger refreshes (e.g. dynamic layout changes)
    ScrollTrigger.addEventListener("refresh", updateEyeCoordinates);

    window.addEventListener("mousemove", (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const scrollY = locoScroll && locoScroll.scroll ? (locoScroll.scroll.instance.scroll.y || 0) : 0;

        eyesCached.forEach(eye => {
            // Get relative viewport Y by subtracting the current scroll value from cached absolute page Y
            const eyeX = eye.x;
            const eyeY = eye.y - scrollY;

            const dX = mouseX - eyeX;
            const dY = mouseY - eyeY;
            const eyeAngle = Math.atan2(dY, dX) * (180 / Math.PI);

            gsap.to(eye.line, {
                rotate: eyeAngle - 180,
                duration: 0.2,
                ease: "power2.out"
            });
        });
    });
}

// --- Navigation Scroll Logic ---
function initNavScroll() {
    document.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href) return;

            const currentPage = window.location.pathname.split('/').pop() || 'index.html';

            // Scroll to top if clicking Home link while already on homepage
            if (currentPage === 'index.html' && (href === 'index.html' || href === '/')) {
                e.preventDefault();
                locoScroll.scrollTo(0, {
                    duration: 1000,
                    easing: [0.25, 0.0, 0.35, 1.0]
                });
                return;
            }

            // Check if it's an anchor link
            const hashIndex = href.indexOf('#');
            if (hashIndex === -1) return; // Not an anchor link

            const path = href.substring(0, hashIndex);
            const hash = href.substring(hashIndex);

            const targetPage = path.split('/').pop() || 'index.html';

            // If the link points to a hash on a different page, allow default browser navigation
            if (targetPage !== currentPage && path !== '') {
                return;
            }

            e.preventDefault();

            if (hash !== '#') {
                const targetElement = document.querySelector(hash);
                if (targetElement) {
                    locoScroll.scrollTo(targetElement, {
                        offset: -50, // Slight offset for nav bar space
                        duration: 1000,
                        easing: [0.25, 0.0, 0.35, 1.0]
                    });
                }
            } else {
                // Scroll to top if href is just '#'
                locoScroll.scrollTo(0, {
                    duration: 1000,
                    easing: [0.25, 0.0, 0.35, 1.0]
                });
            }
        });
    });
}

// --- Contact Form Submission via FormSubmit ---
function initContactForm() {
    const form = document.querySelector("#contact-form");
    const submitBtn = document.querySelector("#contact-submit");
    if (!form || !submitBtn) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Show loading state on button
        const btnText = submitBtn.querySelector(".btn-text");
        const originalText = btnText.textContent;
        btnText.textContent = "SENDING...";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";

        // Create FormData object and send to FormSubmit
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Add formsubmit config fields
        data["_subject"] = "New Bedrock Digital Inquiry!";
        data["_honey"] = ""; // Honeypot field for spam prevention

        fetch("https://formsubmit.co/ajax/bedrockdigitalofficialll@gmail.com", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(json => {
            if (json.success === "true" || json.success === true) {
                // SUCCESS — show success toast
                showToast(true);
                form.reset();
            } else {
                throw new Error(json.message || "Submission failed");
            }
        })
        .catch((error) => {
            // FAILURE — show error toast
            console.error("FormSubmit error:", error);
            showToast(false);
        })
        .finally(() => {
            // Restore button state
            btnText.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = "1";
        });
    });

    function showToast(success) {
        const toast = document.createElement("div");
        toast.className = "contact-success-toast";
        toast.innerHTML = success
            ? `<div class="toast-content">
                <i class="ri-checkbox-circle-fill" style="color:#5c8a00"></i>
                <div class="toast-text">
                    <h4>Message Sent!</h4>
                    <p>We'll get back to you within 24 hours.</p>
                </div>
               </div>`
            : `<div class="toast-content">
                <i class="ri-error-warning-fill" style="color:#e53935"></i>
                <div class="toast-text">
                    <h4>Sending Failed</h4>
                    <p>Please try again or email us directly.</p>
                </div>
               </div>`;
        document.body.appendChild(toast);

        gsap.fromTo(toast,
            { opacity: 0, y: 50, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
        );

        setTimeout(() => {
            gsap.to(toast, {
                opacity: 0, y: -20, scale: 0.95,
                duration: 0.4, ease: "power3.in",
                onComplete: () => toast.remove()
            });
        }, 5000);
    }
}

// --- Nav Hide/Show on Scroll Direction ---
function initNavScrollDirection() {
    const nav = document.querySelector("#nav");
    let lastScrollY = 0;
    let isNavHidden = false;

    locoScroll.on("scroll", (instance) => {
        const currentScrollY = instance.scroll.y;

        // Toggle 'scrolled' class to enable premium frosted glass transition
        if (currentScrollY > 50) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }

        if (currentScrollY > 150) {
            if (currentScrollY > lastScrollY) {
                // Scrolling down -> hide navbar
                if (!isNavHidden) {
                    isNavHidden = true;
                    gsap.to(nav, { y: "-120%", duration: 0.3, ease: "power2.out", overwrite: "auto" });
                }
            } else {
                // Scrolling up -> show navbar
                if (isNavHidden) {
                    isNavHidden = false;
                    gsap.to(nav, { y: "0%", duration: 0.3, ease: "power2.out", overwrite: "auto" });
                }
            }
        } else {
            // Near the top -> always show navbar
            if (isNavHidden) {
                isNavHidden = false;
                gsap.to(nav, { y: "0%", duration: 0.3, ease: "power2.out", overwrite: "auto" });
            }
        }

        lastScrollY = currentScrollY;
    });
}

// --- Mobile Reveal on Scroll (Intersection Observer — Mobile Only) ---
function initMobileReveal() {
    // Only run on mobile/tablet viewports — desktop is completely unaffected
    if (window.innerWidth > 768) return;

    const revealTargets = document.querySelectorAll(
        ".mob-reveal, .mob-reveal-left, .mob-reveal-stagger"
    );

    if (revealTargets.length === 0) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    // Unobserve after reveal so it only fires once
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,      // Trigger when 12% of element is visible
            rootMargin: "0px 0px -40px 0px"  // Slight bottom offset for natural feel
        }
    );

    revealTargets.forEach((el) => observer.observe(el));

    // Re-check on resize (in case user rotates device)
    window.addEventListener("resize", () => {
        if (window.innerWidth <= 768) {
            revealTargets.forEach((el) => {
                if (!el.classList.contains("is-visible")) {
                    observer.observe(el);
                }
            });
        }
    });
}

// --- View All Work Reveal Logic ---
function initViewAllWork() {
    const viewAllBtn = document.querySelector(".view-all-btn");
    const hiddenProjects = document.querySelectorAll(".project-card-row.hidden-project");

    if (viewAllBtn && hiddenProjects.length > 0) {
        viewAllBtn.addEventListener("click", () => {
            const isExpanded = viewAllBtn.classList.toggle("expanded");

            hiddenProjects.forEach(project => {
                if (isExpanded) {
                    // Remove class and make visible so it animates in smoothly with GSAP
                    project.classList.remove("hidden-project");
                    project.style.display = "flex";
                    gsap.fromTo(project,
                        { opacity: 0, y: 50 },
                        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
                    );
                } else {
                    project.classList.add("hidden-project");
                    project.style.display = "none";
                }
            });

            // Update button text and dot state
            const dot = '<div class="dot"></div>';
            if (isExpanded) {
                viewAllBtn.innerHTML = 'SHOW LESS ' + dot;
            } else {
                viewAllBtn.innerHTML = 'VIEW ALL WORK ' + dot;
                // Scroll back to the top of the projects section so user isn't disoriented
                locoScroll.scrollTo(document.querySelector("#projects"), {
                    offset: -50,
                    duration: 800
                });
            }

            // Sync heights with Locomotive Scroll and ScrollTrigger
            setTimeout(() => {
                locoScroll.update();
                ScrollTrigger.refresh();
            }, 300);
        });
    }
}

// --- Contact Button Text Rotation ---
function initContactButtonRotation() {
    const contactBtns = document.querySelectorAll(".contact-btn");
    if (contactBtns.length === 0) return;

    const texts = ["Let's Go", "Connect Now", "Contact Now", "Hurry! Hurry!"];
    let currentIndex = 0;

    setInterval(() => {
        currentIndex = (currentIndex + 1) % texts.length;
        contactBtns.forEach(btn => {
            gsap.to(btn, {
                opacity: 0,
                y: -6,
                duration: 0.2,
                onComplete: () => {
                    btn.textContent = texts[currentIndex];
                    gsap.fromTo(btn, 
                        { opacity: 0, y: 6 }, 
                        { opacity: 1, y: 0, duration: 0.2 }
                    );
                }
            });
        });
    }, 2800);
}

// --- Mobile Menu Toggle Logic ---
function initMobileMenu() {
    const toggleBtn = document.querySelector(".nav-menu-toggle");
    const mobileMenu = document.querySelector("#mobile-menu");
    const mobileLinks = document.querySelectorAll(".mobile-link");

    if (!toggleBtn || !mobileMenu) return;

    let isMenuOpen = false;

    // Use GSAP timeline for smooth entry/exit of menu links
    const menuTl = gsap.timeline({ paused: true });

    menuTl.to(mobileMenu, {
        opacity: 1,
        pointerEvents: "all",
        duration: 0.4,
        ease: "power2.out"
    });

    menuTl.fromTo(mobileLinks, 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power3.out" },
        "-=0.2"
    );

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        toggleBtn.classList.toggle("active", isMenuOpen);
        mobileMenu.classList.toggle("active", isMenuOpen);

        const nav = document.querySelector("#nav");
        if (nav) {
            nav.classList.toggle("menu-active", isMenuOpen);
            if (isMenuOpen) {
                gsap.to(nav, { y: "0%", duration: 0.3, ease: "power2.out", overwrite: "auto" });
            }
        }

        if (isMenuOpen) {
            menuTl.play();
            if (typeof locoScroll !== 'undefined' && locoScroll) {
                locoScroll.stop();
            }
        } else {
            menuTl.reverse();
            if (typeof locoScroll !== 'undefined' && locoScroll) {
                locoScroll.start();
            }
        }
    }

    toggleBtn.addEventListener("click", toggleMenu);

    // Close menu when clicking on any link
    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (isMenuOpen) {
                toggleMenu();
            }
        });
    });
}

// --- Global Initialize ---
window.addEventListener("load", function () {
    // Refresh Locomotive and ScrollTrigger first
    setTimeout(() => {
        locoScroll.update();
        ScrollTrigger.refresh();
        console.log("LocoScroll & ScrollTrigger Refreshed");
    }, 500);

    initPreloader();
    initCursor();
    initProjectCards();
    initEyeTracking();
    initHeroSlider();
    initNavScroll();
    initNavScrollDirection();
    initScrollAnimations();
    initContactForm();
    initViewAllWork();
    initMobileReveal(); // Mobile-only reveal on scroll
    initContactButtonRotation(); // Rotating Contact button text
    initMobileMenu();

    // Scroll to hash on load if present
    const hash = window.location.hash;
    if (hash) {
        setTimeout(() => {
            const target = document.querySelector(hash);
            if (target) {
                locoScroll.scrollTo(target, {
                    offset: -50,
                    duration: 1000,
                    easing: [0.25, 0.0, 0.35, 1.0]
                });
            }
        }, 800);
    }

    // Logo Click -> Scroll to top
    const logoEl = document.querySelector(".clay-logo");
    if (logoEl) {
        logoEl.addEventListener("click", () => {
            locoScroll.scrollTo(0, {
                duration: 1000,
                easing: [0.25, 0.0, 0.35, 1.0]
            });
        });
    }
});
