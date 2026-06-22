// Declare state variables at the top to avoid Temporal Dead Zone (TDZ) ReferenceErrors
let isPageLoaded = false;
let portalTimeline;
let preloaderFrameId;
let preloaderRenderer;

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Initialize dynamic Scroll Engine
function initScrollEngine() {
    try {
        const mainElement = document.querySelector("#main");
        if (!mainElement) return;

        if (window.innerWidth > 768) {
            if (!locoScroll) {
                locoScroll = new LocomotiveScroll({
                    el: mainElement,
                    smooth: true,
                    multiplier: 0.45, // Balanced scroll distance per tick
                    lerp: 0.08, // Premium smooth deceleration glide
                    smartphone: {
                        smooth: false
                    },
                    tablet: {
                        smooth: false
                    }
                });

                // Sync Locomotive Scroll with GSAP ScrollTrigger
                locoScroll.on("scroll", () => {
                    try {
                        ScrollTrigger.update();
                        if (!window.scrollRefreshed) {
                            ScrollTrigger.refresh();
                            window.scrollRefreshed = true;
                        }
                    } catch (err) {
                        console.error("Scroll event error:", err);
                    }
                });

                ScrollTrigger.scrollerProxy("#main", {
                    scrollTop(value) {
                        if (arguments.length) {
                            try {
                                if (locoScroll) locoScroll.scrollTo(value, 0, 0);
                            } catch (err) {
                                console.error("scrollTo error:", err);
                            }
                            return;
                        }
                        return (locoScroll && locoScroll.scroll && locoScroll.scroll.instance && locoScroll.scroll.instance.scroll) ? locoScroll.scroll.instance.scroll.y : 0;
                    },
                    getBoundingClientRect() {
                        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
                    },
                    pinType: mainElement.style.transform ? "transform" : "fixed"
                });

                ScrollTrigger.addEventListener("refresh", () => {
                    try {
                        if (locoScroll) locoScroll.update();
                    } catch (err) {
                        console.error("ScrollTrigger refresh error:", err);
                    }
                });
            }
        } else {
            // Mobile viewport: Destroy Locomotive Scroll instance if active to restore native scroll
            if (locoScroll) {
                locoScroll.destroy();
                locoScroll = null;
            }
            // Always reset styling and classes to guarantee native scroll works
            document.documentElement.classList.remove("has-scroll-smooth");
            document.body.classList.remove("has-scroll-smooth");
            mainElement.style.transform = "none";
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
        }
    } catch (e) {
        console.error("Error setting up scroll engine:", e);
    }
}

// Initialize on script load
try {
    initScrollEngine();
} catch (e) {
    console.error("Initial scroll setup failure:", e);
}

// Update scroll engine on window resize with safety debounce
let resizeScrollTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeScrollTimeout);
    resizeScrollTimeout = setTimeout(() => {
        try {
            initScrollEngine();
            ScrollTrigger.refresh();
        } catch (err) {
            console.error("Error updating scroll engine on resize:", err);
        }
    }, 200);
});

// Start preloader as early as possible
try {
    initPortalLoader();
} catch (e) {
    console.error("Error initializing preloader:", e);
}

// --- Navbar Color Toggle Logic ---
try {
    ScrollTrigger.create({
        trigger: "#barter-services",
        endTrigger: "#ready",
        start: "top 5%",
        end: "bottom 5%",
        scroller: (window.innerWidth <= 768 ? window : "#main"),
        toggleClass: { targets: "#nav", className: "dark-nav" },
    });
} catch (e) {
    console.error("Error setting up navbar color toggle ScrollTrigger:", e);
}


// --- Cursor Logic ---
function initCursor() {
    const cursor = document.querySelector("#cursor");

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
try {
    gsap.to(".marque-text h1", {
        x: "-100%",
        repeat: -1,
        duration: 15, // Slowed down from 5s for better readability
        ease: "none",
    });
} catch (e) {
    console.error("Error setting up marquee animation:", e);
}

// --- Portal Preloader System ---
// (State variables isPageLoaded, portalTimeline, preloaderFrameId, and preloaderRenderer declared at the top of script.js)


// Procedural Granite Texture Generator (100% CORS-Safe for local file runs)
function createProceduralGraniteTexture() {
    try {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");
        
        // Base light gray background
        ctx.fillStyle = "#dedde0";
        ctx.fillRect(0, 0, 512, 512);
        
        // Create natural-looking stone cloud/mottling pattern
        for (let i = 0; i < 15; i++) {
            ctx.fillStyle = i % 2 === 0 ? "rgba(205, 204, 207, 0.35)" : "rgba(233, 232, 235, 0.4)";
            const radius = Math.random() * 150 + 80;
            ctx.beginPath();
            ctx.arc(Math.random() * 512, Math.random() * 512, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw fine dark granite mineral grains (charcoal to medium gray)
        for (let i = 0; i < 12000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 2.2 + 0.6;
            const alpha = Math.random() * 0.4 + 0.15;
            const gray = Math.floor(Math.random() * 40) + 30; // 30-70 range
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray + 4}, ${alpha})`;
            ctx.fillRect(x, y, size, size);
        }

        // Bright white/silver mineral speckles/sparkles
        for (let i = 0; i < 6000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 1.8 + 0.5;
            const alpha = Math.random() * 0.6 + 0.2;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(x, y, size, size);
        }

        // Branching mineral veins (random walk for natural organic jaggedness)
        function drawVein(color, startX, startY, segments, length, startWidth) {
            ctx.strokeStyle = color;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            
            let cx = startX;
            let cy = startY;
            let w = startWidth;
            
            for (let s = 0; s < segments; s++) {
                ctx.lineWidth = w;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                
                // Random walk step
                const dx = (Math.random() - 0.5) * length * 2;
                const dy = (Math.random() - 0.5) * length * 2 + (Math.random() > 0.5 ? length : -length);
                cx += dx;
                cy += dy;
                
                // Keep within bounds
                cx = Math.max(0, Math.min(512, cx));
                cy = Math.max(0, Math.min(512, cy));
                
                ctx.lineTo(cx, cy);
                ctx.stroke();
                
                // Random branch
                if (Math.random() < 0.15) {
                    drawVein(color, cx, cy, Math.floor(segments / 2), length * 0.8, w * 0.7);
                }
                
                // Taper width slightly
                w *= 0.92;
                if (w < 0.2) break;
            }
        }

        // Draw 8 white/quartz veins
        for (let i = 0; i < 8; i++) {
            drawVein("rgba(255, 255, 255, 0.45)", Math.random() * 512, Math.random() * 512, 14, 18, Math.random() * 3 + 1);
        }
        
        // Draw 5 dark grey mineral veins
        for (let i = 0; i < 5; i++) {
            drawVein("rgba(70, 70, 78, 0.2)", Math.random() * 512, Math.random() * 512, 12, 16, Math.random() * 2 + 1);
        }
        
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    } catch (e) {
        console.error("Error creating procedural granite texture:", e);
        return null;
    }
}

// Procedural Matte Black Texture Generator (adds micro-bump texture to metallic faces)
function createProceduralBlackTexture() {
    try {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");
        
        // Base dark matte grey background
        ctx.fillStyle = "#151515";
        ctx.fillRect(0, 0, 256, 256);
        
        // Fine micro-grain speckles for brushed / bead-blasted metal relief
        for (let i = 0; i < 8000; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 1.5 + 0.5;
            const alpha = Math.random() * 0.25 + 0.05;
            const shade = Math.random() > 0.5 ? 255 : 0;
            ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${alpha})`;
            ctx.fillRect(x, y, size, size);
        }
        
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    } catch (e) {
        console.error("Error creating procedural black texture:", e);
        return null;
    }
}

// Ultra-premium WebGL preloader cube matching the design precisely (matte black, granite, purple bottom, white bevels)
function initPreloaderWebGL() {
    try {
        const wrapper = document.querySelector(".blueprint-cube-wrapper");
        if (!wrapper) return;

        // Hide the old CSS cube
        const cssCube = wrapper.querySelector(".blueprint-3d-cube");
        if (cssCube) cssCube.style.display = "none";

        // Create WebGL container
        const container = document.createElement("div");
        container.id = "preloader-webgl-container";
        container.style.width = "100%";
        container.style.height = "100%";
        container.style.position = "absolute";
        container.style.top = "0";
        container.style.left = "0";
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";
        wrapper.appendChild(container);

        // Three.js Scene setup
        const scene = new THREE.Scene();
        
        // Perspective camera positioned to show front-left, front-right and bottom faces beautifully
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
        camera.position.set(3.4, 2.7, 3.4);
        camera.lookAt(0, 0, 0);

        // Get initial wrapper sizes to dynamically fit preloader container
        const initialWidth = wrapper.clientWidth || 180;
        const initialHeight = wrapper.clientHeight || 180;

        // Renderer with premium pixel ratios & high performance settings
        preloaderRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        preloaderRenderer.setSize(initialWidth, initialHeight);
        preloaderRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(preloaderRenderer.domElement);

        // Lights setup for premium product render look
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.35); // Lowered to create deep contrast shadows
        scene.add(ambientLight);

        // Bright directional white key light
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
        dirLight.position.set(4, 5, 2);
        scene.add(dirLight);

        // Rim fill light from behind-left to trace the edges of the cube
        const fillLight = new THREE.DirectionalLight(0xa78bfa, 0.65); // Soft brand-tinted fill
        fillLight.position.set(-4, 3, -4);
        scene.add(fillLight);

        // Vibrant brand purple point light for moving highlights
        const pointLight = new THREE.PointLight(0x8b5cf6, 4.0, 12);
        pointLight.position.set(-2, -3.5, 2);
        scene.add(pointLight);

        // Generate procedural textures (CORS-Safe)
        const graniteTex = createProceduralGraniteTexture();
        const blackTex = createProceduralBlackTexture();

        // Elite physical materials
        const matteBlackMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0x131312, 
            roughness: 0.72, 
            metalness: 0.35,
            clearcoat: 0.2,
            clearcoatRoughness: 0.2,
            bumpMap: blackTex,
            bumpScale: 0.002
        });
        
        const graniteMaterial = new THREE.MeshPhysicalMaterial({ 
            map: graniteTex, 
            roughness: 0.24, 
            metalness: 0.12,
            clearcoat: 0.35,
            clearcoatRoughness: 0.05,
            bumpMap: graniteTex,
            bumpScale: 0.004
        });
        
        const purpleMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0x4c1d95, 
            emissive: 0x1d0b3c, // Deep violet inner glow
            emissiveIntensity: 0.6,
            roughness: 0.14, 
            metalness: 0.88, 
            clearcoat: 1.0,
            clearcoatRoughness: 0.04
        });

        // Crisp self-illuminated bevel borders
        const glowingWhiteCoreMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 1.5,
            roughness: 0.1,
            metalness: 0.1
        });

        // Assemblies
        const cubeGroup = new THREE.Group();
        
        // 1. Solid White Core Block (provides the crisp glowing divider borders)
        const coreGeo = new THREE.BoxGeometry(1.68, 1.68, 1.68);
        const coreMesh = new THREE.Mesh(coreGeo, glowingWhiteCoreMaterial);
        cubeGroup.add(coreMesh);

        // 2. Individual face planes offset slightly from center (no Z-fighting, clean spacing)
        const faceGeo = new THREE.PlaneGeometry(1.58, 1.58);

        // Right (+X) - Granite
        const rightFace = new THREE.Mesh(faceGeo, graniteMaterial);
        rightFace.position.x = 0.842;
        rightFace.rotation.y = Math.PI / 2;
        cubeGroup.add(rightFace);

        // Left (-X) - Matte Black
        const leftFace = new THREE.Mesh(faceGeo, matteBlackMaterial);
        leftFace.position.x = -0.842;
        leftFace.rotation.y = -Math.PI / 2;
        cubeGroup.add(leftFace);

        // Top (+Y) - Granite
        const topFace = new THREE.Mesh(faceGeo, graniteMaterial);
        topFace.position.y = 0.842;
        topFace.rotation.x = -Math.PI / 2;
        cubeGroup.add(topFace);

        // Bottom (-Y) - Purple
        const bottomFace = new THREE.Mesh(faceGeo, purpleMaterial);
        bottomFace.position.y = -0.842;
        bottomFace.rotation.x = Math.PI / 2;
        cubeGroup.add(bottomFace);

        // Front (+Z) - Matte Black
        const frontFace = new THREE.Mesh(faceGeo, matteBlackMaterial);
        frontFace.position.z = 0.842;
        cubeGroup.add(frontFace);

        // Back (-Z) - Granite
        const backFace = new THREE.Mesh(faceGeo, graniteMaterial);
        backFace.position.z = -0.842;
        backFace.rotation.y = Math.PI;
        cubeGroup.add(backFace);

        scene.add(cubeGroup);

        // Animation loop
        const clock = new THREE.Clock();
        function animate() {
            preloaderFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            // Premium slow tumbling rotation
            cubeGroup.rotation.x = elapsedTime * 0.42;
            cubeGroup.rotation.y = elapsedTime * 0.52;
            cubeGroup.rotation.z = elapsedTime * 0.16;

            // Elegant slow floating / bobbing translation
            cubeGroup.position.y = Math.sin(elapsedTime * 1.0) * 0.12;

            // Animate point light orbit for sweeping purple specular highlights
            pointLight.position.x = Math.sin(elapsedTime * 0.7) * 4;
            pointLight.position.z = Math.cos(elapsedTime * 0.7) * 4;
            pointLight.position.y = Math.sin(elapsedTime * 0.4) * 3;

            preloaderRenderer.render(scene, camera);
        }
        animate();

        // Responsive resizing support matching parent wrapper size
        const resizeObserver = new ResizeObserver(() => {
            if (preloaderRenderer && wrapper) {
                const w = wrapper.clientWidth || 180;
                const h = wrapper.clientHeight || 180;
                preloaderRenderer.setSize(w, h);
            }
        });
        resizeObserver.observe(wrapper);

    } catch (e) {
        console.error("Failed to initialize preloader WebGL cube:", e);
    }
}

function initPortalLoader() {
    try {
        const loader = document.getElementById("loader-portal");
        if (!loader) {
            // No loader portal. Pre-hide the subpage elements immediately so they can fade in smoothly on load.
            const typewriterElement = document.getElementById("typewriter");
            if (!typewriterElement) {
                const subpageSections = document.querySelectorAll(".subpage-header-section, .subpage-projects-section, .subpage-contact-grid-section, .about-hero-section, .about-pillars-section, .about-process-section, .about-cta-section, #footer-wrapper, #nav");
                if (subpageSections.length > 0) {
                    gsap.set(subpageSections, { opacity: 0, y: 30 });
                }
            }
            return;
        }

        document.body.classList.add("loading");
        
        const percentEl = document.querySelector(".loader-percentage");
        const statusEl = document.querySelector(".loader-status");
        if (!percentEl) return;

        // Set initial states for elements that will animate in once loader completes
        const typewriterElement = document.getElementById("typewriter");
        if (typewriterElement) {
            gsap.set(["#nav", ".hero-description", ".hero-cta", "#hero-3d-canvas-container", "#marquee", "#about", "#why-barter", "#barter-services", "#projects", "#ready", "#contact", "#footer-wrapper"], { opacity: 0, y: 20 });
            gsap.set("#hero-3d-canvas-container", { scale: 0 });
        } else {
            const subpageSections = document.querySelectorAll(".subpage-header-section, .subpage-projects-section, .subpage-contact-grid-section, .about-hero-section, .about-pillars-section, .about-process-section, .about-cta-section, #footer-wrapper, #nav");
            if (subpageSections.length > 0) {
                gsap.set(subpageSections, { opacity: 0, y: 30 });
            }
        }

        let progress = { value: 0 };
        
        // Smooth loader counting animation up to 90%
        portalTimeline = gsap.to(progress, {
            value: 90,
            duration: 0.8, // Speeded up from 2.2 for faster load
            ease: "power1.out",
            onUpdate: () => {
                updateLoaderUI(progress.value);
            },
            onComplete: () => {
                if (isPageLoaded) {
                    finishLoader();
                }
            }
        });

        // Fail-safe: Force finish loader after 1.5 seconds max, in case window load never fires or readyState has issues.
        setTimeout(() => {
            if (!isPageLoaded) {
                console.log("Preloader fail-safe triggered");
                isPageLoaded = true;
                finishLoader();
            }
        }, 1500); // Speeded up from 3500

        // Initialize WebGL preloader cube
        initPreloaderWebGL();
    } catch (e) {
        console.error("Error in initPortalLoader:", e);
        isPageLoaded = true;
        finishLoader();
    }
}

function updateLoaderUI(val) {
    try {
        const percentEl = document.querySelector(".loader-percentage");
        const borderRect = document.querySelector(".blueprint-border-rect");
        if (!percentEl) return;
        
        const roundedVal = Math.floor(val);
        percentEl.textContent = (roundedVal < 10 ? "0" + roundedVal : roundedVal) + "%";
        
        if (borderRect) {
            // Animate strokeDashoffset from 400 (empty) to 0 (completely filled)
            const offset = 400 - (roundedVal / 100) * 400;
            borderRect.style.strokeDashoffset = offset;
        }
    } catch (e) {
        console.error("Error in updateLoaderUI:", e);
    }
}

function finishLoader() {
    try {
        if (portalTimeline) {
            portalTimeline.kill();
        }
        const currentValText = document.querySelector(".loader-percentage");
        const progress = { value: currentValText ? parseFloat(currentValText.textContent) || 90 : 90 };
        const statusEl = document.querySelector(".loader-status");

        gsap.to(progress, {
            value: 100,
            duration: 0.4,
            ease: "power2.out",
            onUpdate: () => {
                updateLoaderUI(progress.value);
            },
            onComplete: () => {
                animatePortalExit();
            }
        });
    } catch (e) {
        console.error("Error in finishLoader:", e);
        animatePortalExit();
    }
}

function animatePortalExit() {
    const loader = document.getElementById("loader-portal");
    const cubeWrapper = document.querySelector(".blueprint-cube-wrapper");
    if (!loader) return;

    try {
        const tl = gsap.timeline({
            onComplete: () => {
                try {
                    if (loader.parentNode) {
                        loader.parentNode.removeChild(loader);
                    } else {
                        loader.remove();
                    }
                    document.body.classList.remove("loading");
                    
                    // Cancel preloader WebGL animation loop and dispose renderer context
                    try {
                        if (preloaderFrameId) cancelAnimationFrame(preloaderFrameId);
                        if (preloaderRenderer) {
                            preloaderRenderer.dispose();
                            const canvasDom = preloaderRenderer.domElement;
                            if (canvasDom && canvasDom.parentNode) {
                                canvasDom.parentNode.removeChild(canvasDom);
                            }
                        }
                        const webglContainer = document.getElementById("preloader-webgl-container");
                        if (webglContainer && webglContainer.parentNode) {
                            webglContainer.parentNode.removeChild(webglContainer);
                        }
                    } catch (err) {
                        console.error("Error during preloader WebGL cleanup:", err);
                    }
                    
                    setTimeout(() => {
                        try {
                            if (locoScroll) {
                                locoScroll.update();
                            }
                            ScrollTrigger.refresh();
                        } catch (err) {
                            console.error("Error in scroll updates after portal exit:", err);
                        }
                    }, 200);

                    const typewriterElement = document.getElementById("typewriter");
                    if (typewriterElement) {
                        startHomepageTypewriterIntro();
                    } else {
                        startSubpageRevealIntro();
                    }
                } catch (err) {
                    console.error("Error in portal exit timeline onComplete:", err);
                    if (loader) {
                        loader.style.display = "none";
                        if (loader.parentNode) loader.parentNode.removeChild(loader);
                    }
                    document.body.classList.remove("loading");
                }
            }
        });

        if (cubeWrapper) {
            tl.to(cubeWrapper, {
                scale: 0.9,
                opacity: 0,
                duration: 0.4,
                ease: "power2.in"
            });
            tl.to([".loader-title", ".loader-status-container"], {
                opacity: 0,
                y: -20,
                duration: 0.3,
                stagger: 0.05,
                ease: "power2.in"
            }, 0);
        }

        // Slide up and fade out the preloader panel to reveal the website
        tl.to(loader, {
            yPercent: -100,
            opacity: 0,
            duration: 0.45, // Speeded up from 0.85
            ease: "power3.inOut"
        }, "-=0.25");
    } catch (e) {
        console.error("Error setting up portal exit animation:", e);
        if (loader) {
            loader.style.display = "none";
            if (loader.parentNode) loader.parentNode.removeChild(loader);
        }
        document.body.classList.remove("loading");
        
        // Fail-safe preloader WebGL cleanup on exit catch
        try {
            if (preloaderFrameId) cancelAnimationFrame(preloaderFrameId);
            if (preloaderRenderer) {
                preloaderRenderer.dispose();
                const canvasDom = preloaderRenderer.domElement;
                if (canvasDom && canvasDom.parentNode) {
                    canvasDom.parentNode.removeChild(canvasDom);
                }
            }
            const webglContainer = document.getElementById("preloader-webgl-container");
            if (webglContainer && webglContainer.parentNode) {
                webglContainer.parentNode.removeChild(webglContainer);
            }
        } catch (err) {
            console.error("Error during preloader WebGL cleanup on catch:", err);
        }
        
        const typewriterElement = document.getElementById("typewriter");
        if (typewriterElement) {
            startHomepageTypewriterIntro();
        } else {
            startSubpageRevealIntro();
        }
    }
}

function startHomepageTypewriterIntro() {
    try {
        const typewriterElement = document.getElementById("typewriter");
        if (!typewriterElement) {
            loaderAnimation();
            return;
        }

        const parts = [
            "Built Different.",
            "<br>",
            "Built Digital."
        ];
        
        let currentPart = 0;
        let currentChar = 0;
        
        const blinkEl = document.querySelector(".cursor-blink");
        if (blinkEl) blinkEl.style.display = "inline-block";

        function typeWriter() {
            try {
                if (currentPart < parts.length) {
                    if (parts[currentPart] === "<br>") {
                        typewriterElement.innerHTML += "<br>";
                        currentPart++;
                        setTimeout(typeWriter, 400); // Slower line break transition
                    } else {
                        if (currentChar < parts[currentPart].length) {
                            typewriterElement.innerHTML += parts[currentPart].charAt(currentChar);
                            currentChar++;
                            let typeSpeed = Math.random() * 60 + 50; // Slower individual character typing (50-110ms)
                            setTimeout(typeWriter, typeSpeed); 
                        } else {
                            currentPart++;
                            currentChar = 0;
                            setTimeout(typeWriter, 200); // Delay between parts
                        }
                    }
                } else {
                    setTimeout(() => {
                        try {
                            if (blinkEl) blinkEl.style.display = "none";
                            loaderAnimation();
                        } catch (err) {
                            console.error("Error finishing typewriter blink:", err);
                            loaderAnimation();
                        }
                    }, 800); // Slower transition to main entrance animations
                }
            } catch (err) {
                console.error("Error in typewriter sequence:", err);
                loaderAnimation();
            }
        }
        
        setTimeout(typeWriter, 300); // Elegant initial delay after portal exit
    } catch (e) {
        console.error("Error in startHomepageTypewriterIntro:", e);
        loaderAnimation();
    }
}

function loaderAnimation() {
    try {
        const tl = gsap.timeline();

        tl.to("#nav", {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
        });

        tl.to([".hero-description", ".hero-cta"], {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        }, "-=0.5");

        tl.to("#hero-3d-canvas-container", {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: "back.out(1.2)"
        }, "-=0.8");

        tl.to(["#marquee", "#about", "#why-barter", "#barter-services", "#projects", "#ready", "#contact", "#footer-wrapper"], {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
            onComplete: () => {
                try {
                    const updateScroll = () => {
                        if (locoScroll) {
                            locoScroll.update();
                        }
                        ScrollTrigger.refresh();
                    };
                    updateScroll();
                    // Additional staggered updates as images render in their container
                    [300, 800, 1500, 2500].forEach(delay => {
                        setTimeout(updateScroll, delay);
                    });
                } catch (err) {
                    console.error("Error updating scroll after loader animation:", err);
                }
            }
        }, "-=0.5");
    } catch (e) {
        console.error("Error in loaderAnimation:", e);
        // Clean CSS fallback in case of GSAP runtime block
        const selectors = ["#nav", ".hero-description", ".hero-cta", "#hero-3d-canvas-container", "#marquee", "#about", "#why-barter", "#barter-services", "#projects", "#ready", "#contact", "#footer-wrapper"];
        selectors.forEach(sel => {
            const els = document.querySelectorAll(sel);
            els.forEach(el => {
                el.style.opacity = "1";
                el.style.transform = "none";
            });
        });
        if (locoScroll) {
            locoScroll.update();
        }
        ScrollTrigger.refresh();
    }
}

function startSubpageRevealIntro() {
    try {
        const subpageSections = document.querySelectorAll(".subpage-header-section, .subpage-projects-section, .subpage-contact-grid-section, .about-hero-section, .about-pillars-section, .about-process-section, .about-cta-section, #footer-wrapper");
        
        const tl = gsap.timeline();
        
        tl.to("#nav", {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
        });

        if (subpageSections.length > 0) {
            tl.to(subpageSections, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
                onComplete: () => {
                    try {
                        if (locoScroll) {
                            locoScroll.update();
                            ScrollTrigger.refresh();
                        }
                    } catch (err) {
                        console.error("Error updating scroll after subpage reveal:", err);
                    }
                }
            }, "-=0.4");
        }
    } catch (e) {
        console.error("Error in startSubpageRevealIntro:", e);
        const selectors = [".subpage-header-section", ".subpage-projects-section", ".subpage-contact-grid-section", ".about-hero-section", ".about-pillars-section", ".about-process-section", ".about-cta-section", "#footer-wrapper", "#nav"];
        selectors.forEach(sel => {
            const els = document.querySelectorAll(sel);
            els.forEach(el => {
                el.style.opacity = "1";
                el.style.transform = "none";
            });
        });
        if (locoScroll) {
            locoScroll.update();
            ScrollTrigger.refresh();
        }
    }
}

function initScrollAnimations() {
    let mm = gsap.matchMedia();

    // ==========================================
    // DESKTOP: Screen widths > 768px
    // ==========================================
    mm.add("(min-width: 769px)", () => {
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

        // Homepage Hero 3D Cube Scroll-Docking Illusion (Desktop only)
        const heroCanvasContainer = document.getElementById("hero-3d-canvas-container");
        if (heroCanvasContainer) {
            const dockingTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: "#hero",
                    start: "top top",
                    end: "bottom top",
                    scroller: "#main",
                    scrub: 1.5
                }
            });

            // Move and scale the hero cube container smoothly into the navbar position
            dockingTimeline.to(heroCanvasContainer, {
                scale: 0.12,
                x: "18vw",
                y: "-40vh",
                ease: "power2.out"
            }, 0);

            // Fade out in the last 20% of the scroll
            dockingTimeline.fromTo(heroCanvasContainer, 
                { opacity: 1 },
                { opacity: 0.1, duration: 0.8, ease: "power1.out" }, 
                0
            );
            dockingTimeline.to(heroCanvasContainer, {
                opacity: 0,
                duration: 0.2,
                ease: "power2.out"
            }, 0.8);

            // Trigger the navbar mini-cube visibility as the hero cube lands
            ScrollTrigger.create({
                trigger: "#hero",
                start: "bottom 40%",
                scroller: "#main",
                onEnter: () => {
                    const navCube = document.getElementById("nav-cube-container");
                    if (navCube) navCube.classList.add("visible");
                    window.navCubeActive = true;
                },
                onLeaveBack: () => {
                    const navCube = document.getElementById("nav-cube-container");
                    if (navCube) navCube.classList.remove("visible");
                    window.navCubeActive = false;
                }
            });
        }
    });

    // ==========================================
    // MOBILE & TABLET: Screen widths <= 768px
    // ==========================================
    mm.add("(max-width: 768px)", () => {
        // Reveal Project Rows sequentially (native scroll)
        gsap.utils.toArray(".project-card-row").forEach(row => {
            gsap.from(row, {
                scrollTrigger: {
                    trigger: row,
                    scroller: window,
                    start: "top 90%",
                },
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            });
        });

        // Reveal Services (native scroll)
        gsap.from(".service-col", {
            scrollTrigger: {
                trigger: "#barter-services",
                scroller: window,
                start: "top 85%",
            },
            x: -30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out"
        });

        // Reset the main 3D canvas container to prevent it from moving up into the mobile menu bar
        const heroCanvasContainer = document.getElementById("hero-3d-canvas-container");
        if (heroCanvasContainer) {
            gsap.set(heroCanvasContainer, {
                clearProps: "all"
            });
        }

        // Mobile footer reveal is handled via native CSS sticky positioning to avoid ScrollTrigger calculation bugs and text clipping
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
    document.querySelectorAll('#nav .links a, .popup-circle-btn').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Allow default behavior for external links or if not anchor
            if (!targetId.startsWith('#')) return;

            e.preventDefault();

            if (locoScroll) {
                if (targetId !== '#') {
                    const targetElement = document.querySelector(targetId);
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
            } else {
                if (targetId !== '#') {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: "smooth" });
                    }
                } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
            }
        });
    });
}

// --- Contact Form Submission via FormSubmit AJAX API ---
function initContactForm() {
    const form = document.querySelector("#contact-form");
    const submitBtn = document.querySelector("#contact-submit");
    if (!form || !submitBtn) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Show loading state on button
        const btnText = submitBtn.querySelector(".btn-text");
        const originalText = btnText ? btnText.textContent : "SEND MESSAGE";
        if (btnText) btnText.textContent = "SENDING...";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";

        // Gather form fields
        const nameVal = document.querySelector("#contact-name") ? document.querySelector("#contact-name").value : "";
        const phoneVal = document.querySelector("#contact-number") ? document.querySelector("#contact-number").value : "";
        const emailVal = document.querySelector("#contact-email") ? document.querySelector("#contact-email").value : "";
        const messageVal = document.querySelector("#contact-message") ? document.querySelector("#contact-message").value : "";

        // Submit asynchronously to bedrockdigitalofficialll@gmail.com via FormSubmit.co AJAX API
        fetch("https://formsubmit.co/ajax/bedrockdigitalofficialll@gmail.com", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                name: nameVal,
                phone: phoneVal,
                email: emailVal,
                message: messageVal,
                _subject: "New Project Enquiry from Bedrock Digital Website"
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success === "true" || data.success === true) {
                showToast(true);
                form.reset();
            } else {
                showToast(false);
            }
        })
        .catch(error => {
            console.error("Submission error:", error);
            showToast(false);
        })
        .finally(() => {
            // Restore button state
            if (btnText) btnText.textContent = originalText;
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
    const isHomePage = !!document.getElementById("hero-3d-canvas-container");

    const handleScrollEffects = (currentScrollY) => {
        // Toggle 'scrolled' class to enable premium frosted glass transition
        if (currentScrollY > 50) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }

        // Keep the navbar persistently visible on scroll-down strictly on the homepage,
        // so the user can see the rotating mini docked cube spin in the header!
        if (currentScrollY > 150 && !isHomePage) {
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
            // Near the top or on homepage -> always show navbar
            if (isNavHidden) {
                isNavHidden = false;
                gsap.to(nav, { y: "0%", duration: 0.3, ease: "power2.out", overwrite: "auto" });
            }
        }

        lastScrollY = currentScrollY;
    };

    if (locoScroll) {
        locoScroll.on("scroll", (instance) => {
            handleScrollEffects(instance.scroll.y);
        });
    } else {
        window.addEventListener("scroll", () => {
            handleScrollEffects(window.scrollY);
        });
    }
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
                if (locoScroll) {
                    locoScroll.scrollTo(document.querySelector("#projects"), {
                        offset: -50,
                        duration: 800
                    });
                } else {
                    document.querySelector("#projects").scrollIntoView({ behavior: "smooth" });
                }
            }

            // Sync heights with Locomotive Scroll and ScrollTrigger
            setTimeout(() => {
                if (locoScroll) locoScroll.update();
                ScrollTrigger.refresh();
            }, 300);
        });
    }
}

// --- Work Page Category Filter ---
function initWorkFilters() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const projectRows = document.querySelectorAll(".project-rows-container .project-card-row");

    if (!filterBtns.length || !projectRows.length) return;

    // --- Read URL query param ?filter= and auto-activate ---
    const urlParams = new URLSearchParams(window.location.search);
    const urlFilter = urlParams.get("filter");
    if (urlFilter) {
        const matchBtn = [...filterBtns].find(b => b.dataset.filter === urlFilter);
        if (matchBtn && !matchBtn.classList.contains("active")) {
            // Defer so GSAP and locoScroll are ready
            setTimeout(() => {
                matchBtn.click();
                // Scroll to the projects section
                const projectsSection = document.getElementById("projects");
                if (projectsSection) {
                    if (locoScroll) {
                        locoScroll.scrollTo(projectsSection, { offset: -80, duration: 1200 });
                    } else {
                        projectsSection.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }
            }, 400);
        }
    }

    // Helper: re-apply alternating .reverse-row to currently visible cards
    function reapplyAlternation() {
        let visibleIndex = 0;
        projectRows.forEach(row => {
            if (row.style.display !== "none") {
                if (visibleIndex % 2 === 0) {
                    row.classList.remove("reverse-row");
                } else {
                    row.classList.add("reverse-row");
                }
                visibleIndex++;
            }
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.filter;

            // Phase 1: Fade out all visible rows
            const visibleRows = [...projectRows].filter(r => r.style.display !== "none");
            if (visibleRows.length > 0) {
                gsap.to(visibleRows, {
                    opacity: 0,
                    y: 20,
                    duration: 0.25,
                    stagger: 0.03,
                    ease: "power2.in",
                    onComplete: () => {
                        // Phase 2: Show/hide rows
                        projectRows.forEach(row => {
                            const cat = row.dataset.category || "";
                            const matches = filter === "all" || cat === filter;
                            row.style.display = matches ? "flex" : "none";
                            row.style.opacity = 0;
                        });

                        reapplyAlternation();

                        // Phase 3: Animate visible rows in
                        const nowVisible = [...projectRows].filter(r => r.style.display !== "none");
                        gsap.to(nowVisible, {
                            opacity: 1,
                            y: 0,
                            duration: 0.55,
                            stagger: 0.07,
                            ease: "power3.out",
                            onComplete: () => {
                                if (locoScroll) locoScroll.update();
                                ScrollTrigger.refresh();
                            }
                        });
                    }
                });
            } else {
                // No visible rows yet — just show directly
                projectRows.forEach(row => {
                    const cat = row.dataset.category || "";
                    const matches = filter === "all" || cat === filter;
                    row.style.display = matches ? "flex" : "none";
                    gsap.set(row, { opacity: 0, y: 30 });
                });
                reapplyAlternation();
                const nowVisible = [...projectRows].filter(r => r.style.display !== "none");
                gsap.to(nowVisible, {
                    opacity: 1,
                    y: 0,
                    duration: 0.55,
                    stagger: 0.07,
                    ease: "power3.out",
                    onComplete: () => {
                        if (locoScroll) locoScroll.update();
                        ScrollTrigger.refresh();
                    }
                });
            }
        });
    });
}

// --- Chatbot Launch Trigger for Project Cards ---
function initChatbotLaunchTrigger() {
    const triggers = document.querySelectorAll(".chatbot-launch-trigger");
    triggers.forEach(trigger => {
        trigger.addEventListener("click", (e) => {
            e.preventDefault();
            const chatWindow = document.getElementById("chat-window");
            const chatToggleBtn = document.getElementById("chat-toggle-btn");
            if (chatWindow && !chatWindow.classList.contains("active")) {
                chatToggleBtn && chatToggleBtn.click();
            }
        });
    });
}

// --- Premium 3D Three.js Animation for Hero Graphic ---
function initHero3DAnimation() {
    const container = document.getElementById("hero-3d-canvas-container");
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    // --- Camera Setup ---
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // --- Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // --- Lighting Design (Premium Studio Feel) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Main Key Light casting premium shadows
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(6, 9, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.normalBias = 0.02;
    scene.add(dirLight);

    // Soft Purple Rim Accent Light to make edges pop spectacularly!
    const rimLight = new THREE.PointLight(0x7c3aed, 3.5, 15); // Brand Purple
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Soft Fill Light from bottom-left
    const fillLight = new THREE.DirectionalLight(0xbabccf, 0.5);
    fillLight.position.set(-5, -3, 3);
    scene.add(fillLight);

    // --- Procedural Canvas Texture Generators ---
    
    // Premium Translucent Glass Texture with bold, crisp black border outlines (exactly like the user's design)
    function createGlassCubeTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");

        // Clear canvas to ensure perfect transparency
        ctx.clearRect(0, 0, 512, 512);

        // Fill inner with translucent white matching brand #f4f3f4 (38% opacity for elite see-through depth)
        ctx.fillStyle = "rgba(244, 243, 244, 0.38)";
        ctx.fillRect(0, 0, 512, 512);

        // Crisp solid black border (bold thick outlines exactly like the attached image!)
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 36; // Thick crisp border outlines
        ctx.strokeRect(0, 0, 512, 512);

        const tex = new THREE.CanvasTexture(canvas);
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        return tex;
    }

    // Initialize Texture
    const glassTex = createGlassCubeTexture();

    // 1. Premium Purple Brand Core Texture (#5d33b0) with bold black border outlines
    function createCorePurpleTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");

        // Solid Bedrock Purple core color (#5d33b0)
        ctx.fillStyle = "#5d33b0";
        ctx.fillRect(0, 0, 512, 512);

        // Soft radial glowing center highlights
        const radGrad = ctx.createRadialGradient(256, 256, 0, 256, 256, 300);
        radGrad.addColorStop(0, "rgba(255, 255, 255, 0.28)");
        radGrad.addColorStop(1, "rgba(0, 0, 0, 0.2)");
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, 512, 512);

        // Crisp solid black border (matches the outer glass-white cubes outlines!)
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 36; // Thick outlines
        ctx.strokeRect(0, 0, 512, 512);

        const tex = new THREE.CanvasTexture(canvas);
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        return tex;
    }

    // Initialize Core Texture
    const corePurpleTex = createCorePurpleTexture();

    // --- Physical Materials ---
    const materialGlass = new THREE.MeshPhysicalMaterial({
        map: glassTex,
        transparent: true,
        roughness: 0.15,
        metalness: 0.05,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        reflectivity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false // Prevents alpha sorting clipping artifacts completely!
    });

    const materialCorePurple = new THREE.MeshPhysicalMaterial({
        map: corePurpleTex,
        roughness: 0.25,
        metalness: 0.35,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        reflectivity: 0.6,
        side: THREE.DoubleSide
    });

    // --- Master Group ---
    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    // --- 27 Cubes Creation ---
    const cubes = [];
    const size = 0.74;       // Cube size (reduced from 0.85 for prominent gaps)
    const step = 0.94;       // Target position step (leaves a beautiful architectural 0.20 gap)
    const geometry = new THREE.BoxGeometry(size, size, size);

    // Shuffle helper to make flying entry random and gorgeous
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    let coreCube = null;

    // Outer boundary material checking
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const isCore = (x === 0 && y === 0 && z === 0);

                let materials;
                
                if (isCore) {
                    // Central core cube has Bedrock Brand Purple material (#5d33b0) with black borders!
                    materials = [
                        materialCorePurple,
                        materialCorePurple,
                        materialCorePurple,
                        materialCorePurple,
                        materialCorePurple,
                        materialCorePurple
                    ];
                } else {
                    // Outer modules use the translucent glass material!
                    materials = [
                        materialGlass,
                        materialGlass,
                        materialGlass,
                        materialGlass,
                        materialGlass,
                        materialGlass
                    ];
                }

                const mesh = new THREE.Mesh(geometry, materials);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                cubeGroup.add(mesh);

                const cubeData = {
                    mesh: mesh,
                    gridX: x,
                    gridY: y,
                    gridZ: z,
                    targetX: x * step,
                    targetY: y * step,
                    targetZ: z * step,
                    isCore: isCore
                };

                if (isCore) {
                    coreCube = cubeData;
                    // Position at center
                    mesh.position.set(0, 0, 0);
                    mesh.scale.set(1, 1, 1);
                } else {
                    // Position randomly far away on a sphere of radius 15-18
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos((Math.random() * 2) - 1);
                    const radius = 14 + Math.random() * 4;

                    mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
                    mesh.position.y = radius * Math.sin(phi) * Math.sin(theta);
                    mesh.position.z = radius * Math.cos(phi);

                    // Random initial rotation
                    mesh.rotation.set(
                        (Math.random() - 0.5) * Math.PI * 3,
                        (Math.random() - 0.5) * Math.PI * 3,
                        (Math.random() - 0.5) * Math.PI * 3
                    );

                    // Scale to 0 initially
                    mesh.scale.set(0, 0, 0);
                    cubes.push(cubeData);
                }
            }
        }
    }

    // --- Animation Timeline Variables ---
    let isAssembled = false;
    let isRotatingLoop = false;
    let clock = new THREE.Clock();
    let lastTime = 0; // For frame-by-frame deltaTime calculation

    // Smooth rotational angles starting exactly at 0 to prevent sudden jumps
    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;

    // Subtle floating state parameters for the core
    let coreFloatY = 0;
    let coreFloatRotX = 0;
    let coreFloatRotY = 0;

    // --- Magnetic Attraction Animation Trigger ---
    function triggerMagneticAssembly() {
        const tl = gsap.timeline({
            delay: 1.5, // Floating core calm float for 1.5s after loader before magnetism activates
            onComplete: () => {
                // All cubes snapped. Pause majestically for 1.0s (deliberate and clean), then smoothly align and start loop
                gsap.delayedCall(1.0, () => {
                    isAssembled = true;
                    
                    // Smoothly transition all cube rotations and positions to absolute perfection
                    cubes.forEach(c => {
                        gsap.to(c.mesh.position, { x: c.targetX, y: c.targetY, z: c.targetZ, duration: 0.6, ease: "power3.out" });
                        gsap.to(c.mesh.rotation, { x: 0, y: 0, z: 0, duration: 0.6, ease: "power3.out" });
                    });
                    
                    gsap.to(coreCube.mesh.position, { x: 0, y: 0, z: 0, duration: 0.6, ease: "power3.out" });
                    gsap.to(coreCube.mesh.rotation, { x: 0, y: 0, z: 0, duration: 0.6, ease: "power3.out" });

                    // Slowly activate infinite rotation loop
                    gsap.delayedCall(0.6, () => {
                        isRotatingLoop = true;
                    });
                });
            }
        });

        // Shuffle external cubes for organic and scattered entry flow
        shuffle(cubes);

        cubes.forEach((cube, index) => {
            // Elegant, slow, deliberate stagger delay so they snap in a gorgeous structured sequence
            const staggerDelay = index * 0.12;

            // 1. Set scale in
            tl.to(cube.mesh.scale, {
                x: 1, y: 1, z: 1,
                duration: 0.6,
                ease: "power2.out"
            }, staggerDelay);

            // 2. Chained bezier movement path (accelerates in, snaps slow and clean)
            const startPos = cube.mesh.position.clone();
            const endPos = new THREE.Vector3(cube.targetX, cube.targetY, cube.targetZ);

            // Control point for a beautiful curved arc entry
            const controlPoint = new THREE.Vector3()
                .addVectors(startPos, endPos)
                .multiplyScalar(0.5)
                .add(new THREE.Vector3(
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 6
                ));

            // Curved GSAP animation (duration set to a slow, majestic 2.0s!)
            const pathObj = { t: 0 };
            const pathTl = gsap.timeline();
            pathTl.to(pathObj, {
                t: 1,
                duration: 2.0,
                ease: "power3.inOut",
                onUpdate: () => {
                    const t = pathObj.t;
                    // Quadratic Bezier Curve formula
                    cube.mesh.position.x = (1 - t) * (1 - t) * startPos.x + 2 * (1 - t) * t * controlPoint.x + t * t * endPos.x;
                    cube.mesh.position.y = (1 - t) * (1 - t) * startPos.y + 2 * (1 - t) * t * controlPoint.y + t * t * endPos.y;
                    cube.mesh.position.z = (1 - t) * (1 - t) * startPos.z + 2 * (1 - t) * t * controlPoint.z + t * t * endPos.z;
                },
                onComplete: () => {
                    // Click overshoot & snapping bounce (slow, premium, and clean lock!)
                    gsap.timeline()
                        .to(cube.mesh.scale, { x: 1.10, y: 1.10, z: 1.10, duration: 0.15, ease: "power2.out" })
                        .to(cube.mesh.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.35, ease: "back.out(1.2)" });
                }
            });

            // Smooth rotation alignment during flight (slowed down to 1.8s for clean rotation)
            pathTl.to(cube.mesh.rotation, {
                x: 0, y: 0, z: 0,
                duration: 1.8,
                ease: "power2.out"
            }, 0.05);

            // Append to main timeline
            tl.add(pathTl, staggerDelay);
        });
    }

    // Trigger the magnetic magnetism assembly after loader animation finishes
    // Triggered at 3.0s to sync beautifully as the header typing settles cleanly
    setTimeout(triggerMagneticAssembly, 3000);

    // --- Render Loop ---
    let frameId;
    let isActive = true; // For optimization

    function animate() {
        if (!isActive) return;
        frameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();
        const deltaTime = elapsedTime - lastTime;
        lastTime = elapsedTime;

        if (!isAssembled) {
            // Scene 1: Floating core animation (slightly faster core floating)
            coreFloatY = Math.sin(elapsedTime * 2.2) * 0.14;
            coreFloatRotX = elapsedTime * 0.35;
            coreFloatRotY = elapsedTime * 0.45;

            if (coreCube) {
                coreCube.mesh.position.y = coreFloatY;
                coreCube.mesh.rotation.x = coreFloatRotX;
                coreCube.mesh.rotation.y = coreFloatRotY;
            }
            
            // Subtly rotate the main camera view to make entry look alive
            camera.position.x = Math.sin(elapsedTime * 0.45) * 0.5;
            camera.position.y = Math.cos(elapsedTime * 0.45) * 0.3;
            camera.lookAt(0, 0, 0);
        } else if (isRotatingLoop) {
            // Scene 6: Infinite rotation loop of the final assembled structure (360 degrees tumbling - starts seamlessly from the snapped position!)
            rotY += deltaTime * 0.42; // Continuous spin left-to-right
            rotX += deltaTime * 0.32; // Continuous spin up-and-down
            rotZ += deltaTime * 0.14; // Continuous twist

            cubeGroup.rotation.y = rotY;
            cubeGroup.rotation.x = rotX;
            cubeGroup.rotation.z = rotZ;
            
            // Subtly adjust point light to create rich moving reflections
            rimLight.position.x = -4 + Math.sin(elapsedTime * 0.8) * 3;
            rimLight.position.z = -3 + Math.cos(elapsedTime * 0.8) * 3;
        }

        renderer.render(scene, camera);
    }

    // --- Mouse Move Micro Interaction (Subtle depth tilt based on cursor) ---
    window.addEventListener("mousemove", (e) => {
        if (!isAssembled) return;
        
        // Normalize mouse positions from -0.5 to 0.5
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;

        // Micro-tilt parent group toward mouse position for stunning 3D parallax depth!
        gsap.to(cubeGroup.position, {
            x: mouseX * 0.6,
            y: -mouseY * 0.6,
            duration: 0.8,
            ease: "power2.out"
        });
    });

    // Start Loop
    animate();

    // --- Responsive Dynamic Sizing ---
    function handleResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    window.addEventListener("resize", handleResize);

    // --- Performance Optimization: Viewport Observer ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isActive = entry.isIntersecting;
            if (isActive) {
                clock.getDelta(); // reset clock delta to avoid jumps
                animate();
            } else {
                cancelAnimationFrame(frameId);
            }
        });
    }, { threshold: 0.05 });
    
    observer.observe(container);
}

// --- Premium 3D Floating Ornaments for Subpage Headers ---
function initSubpage3DOrnaments() {
    const container = document.getElementById("subpage-canvas-container");
    if (!container) return;

    const shapeType = container.getAttribute("data-shape"); // "cube" or "torus"

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    // --- Camera Setup ---
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5.0);

    // --- Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x7c3aed, 2.5, 10);
    rimLight.position.set(-3, 3, -2);
    scene.add(rimLight);

    // --- Materials ---
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.08,
        metalness: 0.1,
        transparent: true,
        opacity: 0.35,
        transmission: 0.9,
        ior: 1.5,
        thickness: 1.5,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const coreMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x4c1d95, // Deep brand purple
        emissive: 0x1d0b3c, // Deep violet inner glow
        emissiveIntensity: 0.9,
        roughness: 0.1,
        metalness: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05
    });

    // --- Group ---
    const group = new THREE.Group();
    scene.add(group);

    // --- Geometries ---
    let outerMesh;
    let midMesh;
    let coreMesh;

    if (shapeType === "combo") {
        // 1. Large Outer Glass Torus Knot
        const torusGeom = new THREE.TorusKnotGeometry(1.05, 0.2, 120, 16);
        outerMesh = new THREE.Mesh(torusGeom, glassMaterial);
        group.add(outerMesh);

        // Add wireframe helper for true 3D outlines
        const torusWire = new THREE.LineSegments(
            new THREE.WireframeGeometry(torusGeom),
            new THREE.LineBasicMaterial({
                color: 0x8b5cf6,
                transparent: true,
                opacity: 0.35
            })
        );
        outerMesh.add(torusWire);

        // 2. Middle Tumbling Glass Cube
        const cubeGeom = new THREE.BoxGeometry(0.85, 0.85, 0.85);
        midMesh = new THREE.Mesh(cubeGeom, glassMaterial);
        group.add(midMesh);

        // Add edge helper for clean cube borders
        const cubeWire = new THREE.LineSegments(
            new THREE.EdgesGeometry(cubeGeom),
            new THREE.LineBasicMaterial({
                color: 0x7c3aed,
                transparent: true,
                opacity: 0.5
            })
        );
        midMesh.add(cubeWire);

        // 3. Inner Glossy Core Sphere
        const coreGeom = new THREE.SphereGeometry(0.34, 32, 32);
        coreMesh = new THREE.Mesh(coreGeom, coreMaterial);
        group.add(coreMesh);
    } else if (shapeType === "cube") {
        // Outer Translucent Glass Cube
        const geom = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        outerMesh = new THREE.Mesh(geom, glassMaterial);
        group.add(outerMesh);

        const cubeWire = new THREE.LineSegments(
            new THREE.EdgesGeometry(geom),
            new THREE.LineBasicMaterial({
                color: 0x8b5cf6,
                transparent: true,
                opacity: 0.5
            })
        );
        outerMesh.add(cubeWire);

        // Inner Brand Purple Core Sphere
        const coreGeom = new THREE.SphereGeometry(0.35, 32, 32);
        coreMesh = new THREE.Mesh(coreGeom, coreMaterial);
        group.add(coreMesh);
    } else {
        // Outer Translucent Glass Torus
        const geom = new THREE.TorusGeometry(0.85, 0.3, 16, 100);
        outerMesh = new THREE.Mesh(geom, glassMaterial);
        group.add(outerMesh);

        const torusWire = new THREE.LineSegments(
            new THREE.WireframeGeometry(geom),
            new THREE.LineBasicMaterial({
                color: 0x8b5cf6,
                transparent: true,
                opacity: 0.4
            })
        );
        outerMesh.add(torusWire);

        // Inner Brand Purple Core Sphere
        const coreGeom = new THREE.SphereGeometry(0.35, 32, 32);
        coreMesh = new THREE.Mesh(coreGeom, coreMaterial);
        group.add(coreMesh);
    }

    // --- Animation State ---
    const clock = new THREE.Clock();
    let frameId;
    let isActive = true;

    function animate() {
        if (!isActive) return;
        frameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Calm floating physics
        group.position.y = Math.sin(elapsedTime * 1.2) * 0.18;
        
        // Tumbling rotations
        if (shapeType === "combo") {
            // Torus Knot rotates slowly
            outerMesh.rotation.y = elapsedTime * 0.22;
            outerMesh.rotation.x = elapsedTime * 0.18;
            outerMesh.rotation.z = elapsedTime * 0.08;

            // Middle Cube rotates faster
            if (midMesh) {
                midMesh.rotation.y = -elapsedTime * 0.45;
                midMesh.rotation.x = elapsedTime * 0.35;
                midMesh.rotation.z = -elapsedTime * 0.15;
            }

            // Inner Sphere floats and spins
            coreMesh.rotation.y = elapsedTime * 0.6;
            coreMesh.position.y = Math.sin(elapsedTime * 2.0) * 0.06;
        } else {
            outerMesh.rotation.y = elapsedTime * 0.38;
            outerMesh.rotation.x = elapsedTime * 0.28;
            
            coreMesh.rotation.y = -elapsedTime * 0.4;
            coreMesh.position.y = Math.sin(elapsedTime * 2.2) * 0.08;
        }

        renderer.render(scene, camera);
    }

    // --- Mouse Move Parallax ---
    window.addEventListener("mousemove", (e) => {
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;

        gsap.to(group.rotation, {
            y: mouseX * 0.8,
            x: mouseY * 0.8,
            duration: 0.8,
            overwrite: "auto",
            ease: "power2.out"
        });
    });

    // --- Resize ---
    function handleResize() {
        if (!container.clientWidth || !container.clientHeight) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener("resize", handleResize);

    // --- Viewport Intersection Observer for high performance ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isActive = entry.isIntersecting;
            if (isActive) {
                clock.getDelta();
                animate();
            } else {
                cancelAnimationFrame(frameId);
            }
        });
    }, { threshold: 0.05 });

    observer.observe(container);
}

// --- Navbar Mini 3D Cube Logic ---
window.navCubeActive = false; // Set dynamically on home page scroll, or always true on subpages

function initNavbarMiniCube() {
    const container = document.getElementById("nav-cube-container");
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    // --- Camera Setup ---
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    // --- Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(64, 64);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(3, 3, 3);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x7c3aed, 2.5, 8);
    rimLight.position.set(-2, 2, -2);
    scene.add(rimLight);

    // --- Materials ---
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        roughness: 0.08,
        metalness: 0.1,
        clearcoat: 1.0,
        transmission: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const coreMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x5d33b0, // Bedrock Digital brand purple
        roughness: 0.1,
        metalness: 0.9,
        clearcoat: 1.0,
        reflectivity: 0.6
    });

    // --- Master Group ---
    const group = new THREE.Group();
    scene.add(group);

    // Outer Glass Cube
    const outerGeom = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const outerMesh = new THREE.Mesh(outerGeom, glassMaterial);
    group.add(outerMesh);

    // Add clean 3D edge wireframe for the outer cube
    const cubeWire = new THREE.LineSegments(
        new THREE.EdgesGeometry(outerGeom),
        new THREE.LineBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.5
        })
    );
    outerMesh.add(cubeWire);

    // Inner Purple Core Cube
    const coreGeom = new THREE.BoxGeometry(0.68, 0.68, 0.68);
    const coreMesh = new THREE.Mesh(coreGeom, coreMaterial);
    group.add(coreMesh);

    // --- Animation State ---
    const clock = new THREE.Clock();
    let frameId;

    const isHomePage = !!document.getElementById("hero-3d-canvas-container");

    if (!isHomePage) {
        // Subpage: Always active and visible
        window.navCubeActive = true;
        container.classList.add("visible");
    }

    function animate() {
        frameId = requestAnimationFrame(animate);

        if (!window.navCubeActive) return;

        const elapsedTime = clock.getElapsedTime();

        // Tumbling continuous rotation
        group.rotation.x = elapsedTime * 0.42;
        group.rotation.y = elapsedTime * 0.55;
        group.rotation.z = elapsedTime * 0.22;

        renderer.render(scene, camera);
    }

    // Start Loop
    animate();

    // --- Resize ---
    function handleResize() {
        renderer.setSize(64, 64);
    }
    window.addEventListener("resize", handleResize);
}

// --- Global Initialize ---
function handlePageLoad() {
    if (isPageLoaded) return; // avoid duplicate execution
    isPageLoaded = true;
    
    const loader = document.getElementById("loader-portal");
    if (loader) {
        try {
            // Complete the loading screen
            finishLoader();
        } catch (e) {
            console.error("Error in finishLoader:", e);
        }
    } else {
        // No loader portal: start content reveals immediately on page load
        try {
            const typewriterElement = document.getElementById("typewriter");
            if (typewriterElement) {
                startHomepageTypewriterIntro();
            } else {
                startSubpageRevealIntro();
            }
        } catch (e) {
            console.error("Error in direct page intro:", e);
        }
    }

    // Set up listeners for all images to update scroll metrics once they load
    try {
        const images = document.querySelectorAll("img");
        images.forEach(img => {
            if (img.complete) return; // already loaded
            img.addEventListener("load", () => {
                try {
                    if (locoScroll) {
                        locoScroll.update();
                        ScrollTrigger.refresh();
                    }
                } catch (err) {
                    console.error("Error updating scroll on image load:", err);
                }
            });
        });
    } catch (e) {
        console.error("Error setting up image load listeners:", e);
    }

    // Refresh Locomotive and ScrollTrigger first at multiple stages to capture lazy-loaded layouts
    const refreshScroll = () => {
        try {
            if (locoScroll) {
                locoScroll.update();
                ScrollTrigger.refresh();
            }
        } catch (e) {
            console.error("Error during scroll refresh phase:", e);
        }
    };

    [100, 400, 800, 1500, 2500].forEach(delay => {
        setTimeout(refreshScroll, delay);
    });

    // If there's a hash, handle scrolling to the target smoothly
    setTimeout(() => {
        try {
            if (window.location.hash) {
                const hashTarget = document.querySelector(window.location.hash);
                if (hashTarget) {
                    if (locoScroll) {
                        locoScroll.scrollTo(hashTarget, {
                            duration: 1200,
                            easing: [0.25, 0.0, 0.35, 1.0]
                        });
                    } else {
                        hashTarget.scrollIntoView({ behavior: "smooth" });
                    }
                }
            }
        } catch (e) {
            console.error("Error scrolling to hash target:", e);
        }
    }, 500);


    // Run all other initializers in safe try-catch blocks to prevent any single setup error from blocking execution
    try { initCursor(); } catch (e) { console.error("Error in initCursor:", e); }
    try { initProjectCards(); } catch (e) { console.error("Error in initProjectCards:", e); }
    try { initEyeTracking(); } catch (e) { console.error("Error in initEyeTracking:", e); }
    try { initHero3DAnimation(); } catch (e) { console.error("Error in initHero3DAnimation:", e); }
    try { initSubpage3DOrnaments(); } catch (e) { console.error("Error in initSubpage3DOrnaments:", e); }
    try { initNavbarMiniCube(); } catch (e) { console.error("Error in initNavbarMiniCube:", e); }
    try { initHeroSlider(); } catch (e) { console.error("Error in initHeroSlider:", e); }
    try { initNavScroll(); } catch (e) { console.error("Error in initNavScroll:", e); }
    try { initNavScrollDirection(); } catch (e) { console.error("Error in initNavScrollDirection:", e); }
    try { initScrollAnimations(); } catch (e) { console.error("Error in initScrollAnimations:", e); }
    try { initContactForm(); } catch (e) { console.error("Error in initContactForm:", e); }
    try { initViewAllWork(); } catch (e) { console.error("Error in initViewAllWork:", e); }
    try { initMobileReveal(); } catch (e) { console.error("Error in initMobileReveal:", e); }
    try { initChatbot(); } catch (e) { console.error("Error in initChatbot:", e); }
    try { initWorkFilters(); } catch (e) { console.error("Error in initWorkFilters:", e); }
    try { initChatbotLaunchTrigger(); } catch (e) { console.error("Error in initChatbotLaunchTrigger:", e); }

    // Logo Click -> Scroll to top
    try {
        const logoEl = document.querySelector(".clay-logo");
        if (logoEl) {
            logoEl.addEventListener("click", () => {
                if (locoScroll) {
                    locoScroll.scrollTo(0, {
                        duration: 1000,
                        easing: [0.25, 0.0, 0.35, 1.0]
                    });
                }
            });
        }
    } catch (e) {
        console.error("Error in logo click:", e);
    }
}

// Handle already-loaded states (e.g. cached or local files)
if (document.readyState === "complete" || document.readyState === "interactive") {
    // Add a tiny delay to ensure all assets have had a frame to mount
    setTimeout(handlePageLoad, 100);
} else {
    window.addEventListener("load", handlePageLoad);
}

// --- Floating Interactive Chatbot Engine ---
function initChatbot() {
    const chatToggleBtn = document.getElementById("chat-toggle-btn");
    const chatCloseBtn = document.getElementById("chat-close-btn");
    const chatWindow = document.getElementById("chat-window");
    const chatMessages = document.getElementById("chat-messages");
    const chatSuggestions = document.getElementById("chat-suggestions");
    const chatInputForm = document.getElementById("chat-input-form");
    const chatInputField = document.getElementById("chat-input-field");

    if (!chatToggleBtn || !chatCloseBtn || !chatWindow || !chatMessages || !chatSuggestions || !chatInputForm || !chatInputField) return;

    let isChatOpen = false;
    let hasWelcomed = false;

    // Chat states for urgent contact form
    const STATE_IDLE = "idle";
    const STATE_AWAITING_NAME = "awaiting_name";
    const STATE_AWAITING_CONTACT = "awaiting_contact";
    const STATE_AWAITING_MESSAGE = "awaiting_message";

    let currentChatState = STATE_IDLE;
    const urgentData = {
        name: "",
        contact: "",
        message: ""
    };

    // Serialize and save chat state to sessionStorage
    function saveChatState() {
        try {
            const messages = [];
            const msgElements = chatMessages.querySelectorAll(".chat-msg");
            msgElements.forEach(el => {
                if (el.id === "chat-typing") return; // Skip typing indicator
                const isHtml = el.querySelector("a, button, div") !== null;
                messages.push({
                    text: isHtml ? el.innerHTML : el.textContent,
                    sender: el.classList.contains("user") ? "user" : "bot",
                    isHtml: isHtml
                });
            });

            const suggestions = [];
            const chipElements = chatSuggestions.querySelectorAll(".chat-chip");
            chipElements.forEach(el => {
                suggestions.push(el.textContent);
            });

            const stateData = {
                isOpen: isChatOpen,
                hasWelcomed: hasWelcomed,
                history: messages,
                suggestions: suggestions,
                currentState: currentChatState,
                urgentData: urgentData
            };

            sessionStorage.setItem("bedrock_chat_state", JSON.stringify(stateData));
        } catch (err) {
            console.error("Error saving chat state:", err);
        }
    }

    // Deserialize and load chat state from sessionStorage
    function loadChatState() {
        try {
            const raw = sessionStorage.getItem("bedrock_chat_state");
            if (!raw) return false;

            const stateData = JSON.parse(raw);
            isChatOpen = !!stateData.isOpen;
            hasWelcomed = !!stateData.hasWelcomed;
            currentChatState = stateData.currentState || STATE_IDLE;
            
            if (stateData.urgentData) {
                urgentData.name = stateData.urgentData.name || "";
                urgentData.contact = stateData.urgentData.contact || "";
                urgentData.message = stateData.urgentData.message || "";
            }

            // Restore window active class
            if (isChatOpen) {
                chatWindow.classList.add("active");
                // Clear notification dot immediately on open
                const notificationDot = chatToggleBtn.querySelector(".chat-notification-dot");
                if (notificationDot) {
                    notificationDot.style.display = "none";
                }
            }

            // Rebuild message logs
            chatMessages.innerHTML = "";
            if (stateData.history && stateData.history.length > 0) {
                stateData.history.forEach(msg => {
                    appendMessage(msg.text, msg.sender, msg.isHtml, false);
                });
                
                // Re-bind click event on reloaded urgent button if present in history
                setTimeout(() => {
                    const urgentMsgBtn = document.getElementById("chatbot-trigger-urgent-msg");
                    if (urgentMsgBtn) {
                        urgentMsgBtn.addEventListener("click", () => {
                            appendMessage("Send Urgent Message", "user");
                            handleUserResponse("Send Urgent Message");
                        });
                    }
                }, 100);
            }

            // Rebuild suggestions
            if (stateData.suggestions) {
                showSuggestions(stateData.suggestions, false);
            }

            return true;
        } catch (err) {
            console.error("Error loading chat state:", err);
            return false;
        }
    }

    // Toggle Chat Window
    chatToggleBtn.addEventListener("click", () => {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            chatWindow.classList.add("active");
            // Clear notification dot
            const notificationDot = chatToggleBtn.querySelector(".chat-notification-dot");
            if (notificationDot) {
                notificationDot.style.display = "none";
            }
            if (!hasWelcomed) {
                sendWelcomeMessage();
                hasWelcomed = true;
            } else {
                saveChatState();
            }
            // Focus on field
            setTimeout(() => chatInputField.focus(), 300);
        } else {
            chatWindow.classList.remove("active");
            saveChatState();
        }
    });

    chatCloseBtn.addEventListener("click", () => {
        isChatOpen = false;
        chatWindow.classList.remove("active");
        saveChatState();
    });

    // Close on escape key
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isChatOpen) {
            isChatOpen = false;
            chatWindow.classList.remove("active");
            saveChatState();
        }
    });

    // Form Submission
    chatInputForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const userText = chatInputField.value.trim();
        if (!userText) return;

        chatInputField.value = "";
        appendMessage(userText, "user");
        handleUserResponse(userText);
    });

    // Helper: Append Message Bubble
    function appendMessage(text, sender, isHtml = false, shouldSave = true) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `chat-msg ${sender}`;
        
        if (isHtml) {
            msgDiv.innerHTML = text;
        } else {
            msgDiv.textContent = text;
        }
        
        chatMessages.appendChild(msgDiv);
        
        // Auto scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (shouldSave) {
            saveChatState();
        }
    }

    // Helper: Show Typing Indicator
    function showTypingIndicator() {
        const indicator = document.createElement("div");
        indicator.id = "chat-typing";
        indicator.className = "chat-msg bot";
        indicator.innerHTML = `
            <div class="chat-typing-dots">
                <span class="chat-dot"></span>
                <span class="chat-dot"></span>
                <span class="chat-dot"></span>
            </div>
        `;
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return indicator;
    }

    // Helper: Clear Typing Indicator
    function clearTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }

    // Helper: Show Suggestion Chips
    function showSuggestions(suggestions, shouldSave = true) {
        chatSuggestions.innerHTML = "";
        suggestions.forEach(text => {
            const chip = document.createElement("div");
            chip.className = "chat-chip";
            chip.textContent = text;
            chip.addEventListener("click", () => {
                appendMessage(text, "user");
                handleUserResponse(text);
            });
            chatSuggestions.appendChild(chip);
        });

        if (shouldSave) {
            saveChatState();
        }
    }

    // Welcoming flow
    function sendWelcomeMessage() {
        const indicator = showTypingIndicator();
        setTimeout(() => {
            clearTypingIndicator(indicator);
            appendMessage("Hey there! Welcome to Bedrock Digital. 🚀 I'm your digital assistant. How can I help you build today?", "bot");
            showSuggestions([
                "What services do you offer?",
                "Show me your recent work",
                "I need to contact you urgently!"
            ]);
        }, 1000);
    }

    // Conversation routing logic
    function handleUserResponse(text) {
        const cleanText = text.toLowerCase().trim();

        // 1. Check Multi-step Conversation States
        if (currentChatState === STATE_AWAITING_NAME) {
            urgentData.name = text;
            currentChatState = STATE_AWAITING_CONTACT;
            saveChatState();
            
            const indicator = showTypingIndicator();
            setTimeout(() => {
                clearTypingIndicator(indicator);
                appendMessage(`Got it, ${urgentData.name}! Please provide your phone number or email address so we can get in touch immediately.`, "bot");
            }, 800);
            return;
        }

        if (currentChatState === STATE_AWAITING_CONTACT) {
            urgentData.contact = text;
            currentChatState = STATE_AWAITING_MESSAGE;
            saveChatState();
            
            const indicator = showTypingIndicator();
            setTimeout(() => {
                clearTypingIndicator(indicator);
                appendMessage("Perfect. What is your urgent message? Describe what you need, and I'll send it directly to our founder.", "bot");
            }, 800);
            return;
        }

        if (currentChatState === STATE_AWAITING_MESSAGE) {
            urgentData.message = text;
            currentChatState = STATE_IDLE; // Reset state
            saveChatState();
            
            const indicator = showTypingIndicator();
            
            // Send payload to FormSubmit via AJAX
            fetch("https://formsubmit.co/ajax/bedrockdigitalofficialll@gmail.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    name: urgentData.name,
                    contact: urgentData.contact,
                    message: urgentData.message,
                    _subject: "URGENT Chatbot Inquiry"
                })
            })
            .then(res => res.json())
            .then(data => {
                clearTypingIndicator(indicator);
                appendMessage(`Your urgent message has been transmitted successfully, ${urgentData.name}! Our founder will review this and reach out to you within 1-2 hours.`, "bot");
                
                // Render direct calling button
                appendMessage(`
                    <div>
                        <p>In the meantime, you can also dial us directly:</p>
                        <a href="tel:+917400274288" class="chat-action-btn call-accent">
                            <i class="ri-phone-fill"></i> Call Founder Directly
                        </a>
                    </div>
                `, "bot", true);
                
                showSuggestions(["Services Menu", "Main Menu"]);
            })
            .catch(err => {
                console.error("Chatbot urgent submit error:", err);
                clearTypingIndicator(indicator);
                appendMessage("I had trouble sending that email, but you can dial our founder directly at +91 74002 74288 or reach out at bedrockdigitalofficialll@gmail.com.", "bot");
                appendMessage(`
                    <div>
                        <a href="tel:+917400274288" class="chat-action-btn call-accent">
                            <i class="ri-phone-fill"></i> Call Founder
                        </a>
                    </div>
                `, "bot", true);
                showSuggestions(["Main Menu"]);
            });
            return;
        }

        // 2. Chatbot Helpers to Prevent Substring Clashes (e.g. "hi" matching "ai", or "main" matching "ai")
        function hasWord(word) {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return regex.test(cleanText);
        }

        function hasAnyWord(words) {
            return words.some(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'i');
                return regex.test(cleanText);
            });
        }

        function hasPhrase(phrase) {
            return cleanText.includes(phrase.toLowerCase().trim());
        }

        function hasAnyPhrase(phrases) {
            return phrases.some(phrase => cleanText.includes(phrase.toLowerCase().trim()));
        }

        const isHome = window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/") || !!document.getElementById("typewriter");
        const isServicesPage = window.location.pathname.includes("services.html");
        const isWorkPage = window.location.pathname.includes("work.html");
        const isAboutPage = window.location.pathname.includes("about.html");
        const isContactPage = window.location.pathname.includes("contact.html");

        // Helper: Close Chat Window smoothly after reading same-page scroll message
        function closeChatDelayed() {
            setTimeout(() => {
                isChatOpen = false;
                chatWindow.classList.remove("active");
                saveChatState();
            }, 1800);
        }

        // --- DIRECT NAVIGATION COMMANDS (EXECUTES INSTANTLY) ---

        // --- Filtered Work navigation (website / digital-marketing / AI) ---
        if (hasAnyPhrase([
            "show website work", "see website projects", "view website work", "websites portfolio", "our websites", "web portfolio", "show web work",
            "our work -> website", "our work-> website", "our work website", "work website", "website work", "projects website"
        ])) {
            if (isWorkPage) {
                appendMessage("You are already on our Work page! Filtering to Websites now...", "bot");
                setTimeout(() => {
                    const btn = document.querySelector('.filter-btn[data-filter="website"]');
                    if (btn) btn.click();
                    const target = document.getElementById("projects");
                    if (target) { if (locoScroll) locoScroll.scrollTo(target, { duration: 1200 }); else target.scrollIntoView({ behavior: "smooth" }); }
                }, 500);
                closeChatDelayed();
            } else {
                saveChatState();
                window.location.href = "work.html?filter=website";
            }
            return;
        }

        if (hasAnyPhrase([
            "show digital marketing work", "see marketing work", "digital marketing portfolio", "marketing campaigns", "show campaigns", "view campaigns", "video campaigns",
            "our work -> digital marketing", "our work-> digital marketing", "our work digital marketing", "work digital marketing", "digital marketing work", "projects digital marketing"
        ])) {
            if (isWorkPage) {
                appendMessage("You are already on our Work page! Filtering to Digital Marketing now...", "bot");
                setTimeout(() => {
                    const btn = document.querySelector('.filter-btn[data-filter="digital-marketing"]');
                    if (btn) btn.click();
                    const target = document.getElementById("projects");
                    if (target) { if (locoScroll) locoScroll.scrollTo(target, { duration: 1200 }); else target.scrollIntoView({ behavior: "smooth" }); }
                }, 500);
                closeChatDelayed();
            } else {
                saveChatState();
                window.location.href = "work.html?filter=digital-marketing";
            }
            return;
        }

        if (hasAnyPhrase([
            "show ai work", "ai projects", "see ai automation", "automation work", "ai portfolio", "show automation", "view ai work",
            "our work -> ai", "our work-> ai", "our work ai", "work ai", "ai work", "projects ai", "projects automation",
            "our work -> ai & automation", "our work-> ai & automation", "our work ai & automation", "work ai & automation"
        ])) {
            if (isWorkPage) {
                appendMessage("You are already on our Work page! Filtering to AI & Automation now...", "bot");
                setTimeout(() => {
                    const btn = document.querySelector('.filter-btn[data-filter="ai-automation"]');
                    if (btn) btn.click();
                    const target = document.getElementById("projects");
                    if (target) { if (locoScroll) locoScroll.scrollTo(target, { duration: 1200 }); else target.scrollIntoView({ behavior: "smooth" }); }
                }, 500);
                closeChatDelayed();
            } else {
                saveChatState();
                window.location.href = "work.html?filter=ai-automation";
            }
            return;
        }

        // --- Work / Portfolio direct navigation trigger ---
        if (hasAnyPhrase(["show me your recent work", "show your work", "show our work", "show work", "view portfolio", "see our work", "see your work", "view work", "recent work"]) || (hasAnyWord(["work", "works", "portfolio", "projects", "portfolio"]) && !hasAnyWord(["services", "pricing", "contact", "about"]))) {
            const isStartProject = hasAnyWord(["start", "contact", "boss", "founder", "contat", "urgently", "urgent"]);
            if (!isStartProject) {
                if (isWorkPage) {
                    appendMessage("You are already on our Work page! Below is our portfolio.", "bot");
                    setTimeout(() => {
                        const target = document.getElementById("projects");
                        if (target) {
                            if (locoScroll) locoScroll.scrollTo(target, { duration: 1200 });
                            else target.scrollIntoView({ behavior: "smooth" });
                        }
                    }, 500);
                    closeChatDelayed();
                } else if (isHome) {
                    appendMessage("Scrolling you to our Work section...", "bot");
                    setTimeout(() => {
                        const target = document.getElementById("projects");
                        if (target) {
                            if (locoScroll) locoScroll.scrollTo(target, { duration: 1200 });
                            else target.scrollIntoView({ behavior: "smooth" });
                        }
                    }, 500);
                    closeChatDelayed();
                } else {
                    saveChatState();
                    window.location.href = "work.html#projects";
                }
                return;
            }
        }

        // --- Web Development direct sub-service trigger ---
        if (hasAnyPhrase(["web development", "web dev", "view web development", "websites", "custom apps"])) {
            if (isServicesPage) {
                appendMessage("You are already on our Services page! Let's view Web Development.", "bot");
                setTimeout(() => {
                    const target = document.getElementById("web-development");
                    if (target) {
                        if (locoScroll) locoScroll.scrollTo(target, { duration: 1200 });
                        else target.scrollIntoView({ behavior: "smooth" });
                    }
                }, 500);
                closeChatDelayed();
            } else {
                saveChatState();
                window.location.href = "services.html#web-development";
            }
            return;
        }

        // --- Digital Marketing direct sub-service trigger ---
        if (hasAnyPhrase(["digital marketing", "marketing growth", "view digital marketing", "seo and growth"])) {
            if (isServicesPage) {
                appendMessage("You are already on our Services page! Let's view Digital Marketing.", "bot");
                setTimeout(() => {
                    const target = document.getElementById("digital-marketing");
                    if (target) {
                        if (locoScroll) locoScroll.scrollTo(target, { duration: 1200 });
                        else target.scrollIntoView({ behavior: "smooth" });
                    }
                }, 500);
                closeChatDelayed();
            } else {
                saveChatState();
                window.location.href = "services.html#digital-marketing";
            }
            return;
        }

        // --- AI & Automation direct sub-service trigger ---
        if (hasAnyPhrase(["ai & automation", "ai automation", "view ai & automation", "chatbots and workflow", "vector db"]) || (hasWord("ai") && hasWord("automation"))) {
            if (isServicesPage) {
                appendMessage("You are already on our Services page! Let's view AI & Automation.", "bot");
                setTimeout(() => {
                    const target = document.getElementById("ai-automation");
                    if (target) {
                        if (locoScroll) locoScroll.scrollTo(target, { duration: 1200 });
                        else target.scrollIntoView({ behavior: "smooth" });
                    }
                }, 500);
                closeChatDelayed();
            } else {
                saveChatState();
                window.location.href = "services.html#ai-automation";
            }
            return;
        }

        // --- General Services direct navigation trigger ---
        if (hasAnyWord(["services", "skills", "capabilities", "offerings"]) || hasPhrase("services menu") || hasPhrase("what services do you offer")) {
            if (isServicesPage) {
                appendMessage("You are already on our Services page! Scrolling to our services list.", "bot");
                setTimeout(() => {
                    const target = document.getElementById("services-list");
                    if (target) {
                        if (locoScroll) locoScroll.scrollTo(target, { duration: 1200 });
                        else target.scrollIntoView({ behavior: "smooth" });
                    }
                }, 500);
                closeChatDelayed();
            } else {
                saveChatState();
                window.location.href = "services.html#services-list";
            }
            return;
        }

        // --- About us direct navigation trigger ---
        if (hasAnyPhrase(["read our story", "read our full story", "about us page", "about page"])) {
            if (isAboutPage) {
                appendMessage("You are already on our About page! Below is our agency story and pillars.", "bot");
                setTimeout(() => {
                    const target = document.getElementById("pillars");
                    if (target) {
                        if (locoScroll) locoScroll.scrollTo(target, { duration: 1200 });
                        else target.scrollIntoView({ behavior: "smooth" });
                    }
                }, 500);
                closeChatDelayed();
            } else if (isHome) {
                appendMessage("Scrolling you to our About section...", "bot");
                setTimeout(() => {
                    const target = document.getElementById("about");
                    if (target) {
                        if (locoScroll) locoScroll.scrollTo(target, { duration: 1200 });
                        else target.scrollIntoView({ behavior: "smooth" });
                    }
                }, 500);
                closeChatDelayed();
            } else {
                saveChatState();
                window.location.href = "about.html#pillars";
            }
            return;
        }

        // --- Home page direct navigation trigger ---
        if (hasPhrase("go home") || hasPhrase("main page") || hasWord("homepage")) {
            if (isHome) {
                appendMessage("You are already on our Homepage! Scrolling to the top.", "bot");
                setTimeout(() => {
                    if (locoScroll) locoScroll.scrollTo(0, { duration: 1000 });
                    else window.scrollTo({ top: 0, behavior: "smooth" });
                }, 500);
                closeChatDelayed();
            } else {
                saveChatState();
                window.location.href = "index.html";
            }
            return;
        }

        // --- Contact page direct navigation trigger ---
        if (hasAnyPhrase(["contact page", "go to contact", "open contact"])) {
            if (isContactPage) {
                appendMessage("You are already on our Contact page! Below is our contact form.", "bot");
                setTimeout(() => {
                    const target = document.getElementById("contact-grid");
                    if (target) {
                        if (locoScroll) locoScroll.scrollTo(target, { duration: 1200 });
                        else target.scrollIntoView({ behavior: "smooth" });
                    }
                }, 500);
                closeChatDelayed();
            } else if (isHome) {
                appendMessage("Scrolling you to our Contact section...", "bot");
                setTimeout(() => {
                    const target = document.getElementById("contact");
                    if (target) {
                        if (locoScroll) locoScroll.scrollTo(target, { duration: 1200 });
                        else target.scrollIntoView({ behavior: "smooth" });
                    }
                }, 500);
                closeChatDelayed();
            } else {
                saveChatState();
                window.location.href = "contact.html#contact-grid";
            }
            return;
        }

        // --- CONVERSATIONAL INPUTS & FALLBACKS (DELAYED WITH TYPING INDICATOR) ---
        const indicator = showTypingIndicator();

        setTimeout(() => {
            clearTypingIndicator(indicator);

            // Exact Button Trigger: Send Urgent Message
            if (cleanText === "send urgent message") {
                currentChatState = STATE_AWAITING_NAME;
                saveChatState();
                appendMessage("Let's get an urgent dispatch sent out. First, what is your name?", "bot");
            }
            
            // Greetings
            else if (hasAnyWord(["hi", "hello", "hey", "yo", "hola", "greetings", "sup", "howdy", "morning", "afternoon", "evening", "gday"])) {
                appendMessage("Hey there! Welcome to Bedrock Digital. 🚀 I'm your digital assistant. How can I help you build today?", "bot");
                showSuggestions([
                    "What services do you offer?",
                    "Show me your recent work",
                    "I need to contact you urgently!"
                ]);
            }

            // How are you / Social
            else if (hasAnyPhrase(["how are you", "how is it going", "how's it going", "how are you doing", "what's up", "you good", "how do you do", "doing good"])) {
                appendMessage("I'm doing fantastic, thanks for asking! 💻 Ready to help you explore our design and development offerings. What can I help you with today?", "bot");
                showSuggestions([
                    "What services do you offer?",
                    "Show me your recent work",
                    "Main Menu"
                ]);
            }

            // Bot Identity
            else if (hasAnyPhrase(["who are you", "what is your name", "what are you", "who am i talking to", "who is this", "are you a bot", "are you a robot", "are you ai", "are you real", "are you human"])) {
                appendMessage("I'm the Bedrock Assistant, a digital helper programmed to guide you through Bedrock Digital's portfolio, services, and contact details. 🤖", "bot");
                showSuggestions([
                    "What can you do?",
                    "What services do you offer?",
                    "Show me your recent work"
                ]);
            }

            // Creator / Who made you
            else if (hasAnyPhrase(["who created you", "who made you", "who built you", "who is your creator", "who programmed you", "who is your developer"])) {
                appendMessage("I was built by the creative engineering team at Bedrock Digital. 🛠️", "bot");
                showSuggestions([
                    "About Bedrock Digital",
                    "Show me your recent work",
                    "Main Menu"
                ]);
            }

            // Capabilities / Help
            else if (hasAnyWord(["help", "capabilities", "features", "commands"]) || hasAnyPhrase(["what can you do", "how can you help", "what is your purpose", "help me"])) {
                appendMessage("I can guide you through our agency's work, tell you about our design & dev services, show you pricing guidelines, or help you send an urgent message to our founder. 🚀", "bot");
                showSuggestions([
                    "What services do you offer?",
                    "Show me your recent work",
                    "I need to contact you urgently!"
                ]);
            }

            // Location / Office
            else if (hasAnyPhrase(["where are you", "where is your office", "where are you located", "where are you based", "what is your location", "office location", "which city"])) {
                appendMessage("Bedrock Digital is a global creative studio. We work with clients worldwide, and our primary development team is based in India. 🌍 We operate remotely to bring top-tier talent to your project.", "bot");
                showSuggestions([
                    "Read our story",
                    "Contact us",
                    "Main Menu"
                ]);
            }

            // Who is Bedrock / Agency info
            else if (hasAnyPhrase(["what is bedrock", "who is bedrock", "tell me about bedrock", "about bedrock", "about us", "about your agency", "company info"])) {
                appendMessage("We are Bedrock Digital, a premium design and engineering studio. We build bespoke high-performance websites, custom mobile apps, brand architectures, and autonomous AI automations.", "bot");
                showSuggestions([
                    "Read our story",
                    "What services do you offer?",
                    "Show me your recent work"
                ]);
            }
            
            // Services Menu / What do you offer
            else if (hasAnyWord(["service", "services", "skills", "capabilities", "offer", "offerings"]) || hasAnyPhrase(["what do you do", "what do you offer", "what services do you offer"])) {
                appendMessage("We focus on creative engineering, digital marketing, and cognitive AI systems. What services are you interested in?", "bot");
                showSuggestions([
                    "Web Development",
                    "Digital Marketing",
                    "AI & Automation"
                ]);
            }
            
            // Pricing / Rates / Budget / Cost
            else if (hasAnyWord(["pricing", "price", "cost", "budget", "rates", "quote", "prices", "fees"]) || hasAnyPhrase(["how much", "what are your prices", "get a quote"])) {
                appendMessage("Every build is custom-tailored to your exact business goals and scale. Let's start a project discussion so we can understand your requirements and give you a detailed quote! 💼", "bot");
                showSuggestions([
                    "Contact us",
                    "I need to contact you urgently!"
                ]);
            }
            
            // Founder / Boss / Call
            else if (hasAnyWord(["founder", "boss", "contact", "reach", "call", "phone", "email", "contat", "connect", "human", "person", "representative"])) {
                appendMessage("For urgent needs, dial us directly or trigger an immediate message dispatch to the founder:", "bot");
                appendMessage(`
                    <div style="display:flex;flex-direction:column;gap:8px;">
                        <a href="tel:+917400274288" class="chat-action-btn call-accent">
                            <i class="ri-phone-fill"></i> Call +91 74002 74288
                        </a>
                        <button id="chatbot-trigger-urgent-msg" class="chat-action-btn" style="text-align:left;">
                            <i class="ri-mail-send-fill"></i> Send Urgent Message
                        </button>
                    </div>
                `, "bot", true);
                
                // Add event listener to the dynamically created button
                setTimeout(() => {
                    const urgentMsgBtn = document.getElementById("chatbot-trigger-urgent-msg");
                    if (urgentMsgBtn) {
                        urgentMsgBtn.addEventListener("click", () => {
                            appendMessage("Send Urgent Message", "user");
                            handleUserResponse("Send Urgent Message");
                        });
                    }
                }, 100);

                showSuggestions(["Main Menu"]);
            }
            
            // Thank you / Appreciation
            else if (hasAnyWord(["thanks", "thank you", "ty", "cheers", "awesome", "perfect", "great", "cool", "ok", "okay", "got it", "understand"])) {
                appendMessage("You're very welcome! Let me know if there's anything else I can help you with today. 😊", "bot");
                showSuggestions([
                    "What services do you offer?",
                    "Show me your recent work",
                    "Main Menu"
                ]);
            }

            // Farewells
            else if (hasAnyWord(["bye", "goodbye", "see ya", "exit", "quit", "close", "later"])) {
                appendMessage("Goodbye! Have an amazing day! Let us know whenever you are ready to build something spectacular. Rocketing out! 🚀", "bot");
                showSuggestions(["Main Menu"]);
            }
            
            // Main menu fallback
            else if (cleanText === "main menu" || cleanText === "go back to main menu" || cleanText === "menu") {
                appendMessage("How can I assist you? Select one of the options below or ask a question:", "bot");
                showSuggestions([
                    "What services do you offer?",
                    "Show me your recent work",
                    "I need to contact you urgently!"
                ]);
            }
            
            // Fallback response
            else {
                appendMessage("I'm still learning, but I can help you check our services, view our work, or connect you directly with the team. What would you like to do?", "bot");
                showSuggestions([
                    "What services do you offer?",
                    "Show me your recent work",
                    "I need to contact you urgently!"
                ]);
            }
        }, 1000);
    }

    // Try loading persistent state from sessionStorage on page start, otherwise run initial welcome
    const loaded = loadChatState();
    if (!loaded) {
        // First load of the tab session: show notification dot & wait for user click to welcome
        const notificationDot = chatToggleBtn.querySelector(".chat-notification-dot");
        if (notificationDot) {
            notificationDot.style.display = "block";
        }
    }
}

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('#nav .links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active-mobile');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active-mobile')) {
                icon.classList.remove('ri-menu-line');
                icon.classList.add('ri-close-line');
            } else {
                icon.classList.remove('ri-close-line');
                icon.classList.add('ri-menu-line');
            }
        });
    }
});

// === Mobile Scroll Visibility Fix ===
// On mobile, GSAP ScrollTrigger can't sync with native scroll properly.
// Use IntersectionObserver to force reveal all animated elements.
(function mobileScrollFix() {
    if (window.innerWidth > 768) return; // Desktop: no change

    // Force all GSAP-animated elements to be visible immediately
    function forceVisible(selector) {
        document.querySelectorAll(selector).forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.visibility = 'visible';
        });
    }

    // Use IntersectionObserver to trigger visibility as user scrolls
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'none';
                entry.target.style.visibility = 'visible';
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    // Observe all animated elements
    const animatedSelectors = [
        '.project-card-row',
        '.mob-reveal',
        '.mob-reveal-stagger > *',
        '.mob-reveal-left',
        '.service-card',
        '.why-item',
        '.campaign-card',
        '.campaign-row',
        '[data-scroll]'
    ];

    animatedSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            revealObserver.observe(el);
        });
    });

    // Also reveal immediately after a short delay as a hard fallback
    setTimeout(() => {
        animatedSelectors.forEach(selector => forceVisible(selector));
    }, 1500);
})();
