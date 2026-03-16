document.addEventListener("DOMContentLoaded", () => {
    
    // =========================================================================
    // 1. Lenis Smooth Scrolling Setup
    // =========================================================================
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0, 0);

    // Smooth Anchor Scrolling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            lenis.scrollTo(targetId, {
                offset: -80,
                duration: 1.2
            });
        });
    });


    // =========================================================================
    // 2. Navigation State
    // =========================================================================
    const navbar = document.getElementById('navbar');
    
    lenis.on('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    
    if(mobileMenuToggle && navLinksContainer) {
        mobileMenuToggle.addEventListener('click', () => {
            const icon = mobileMenuToggle.querySelector('i');
            navbar.classList.toggle('menu-open');
            if (navbar.classList.contains('menu-open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('menu-open');
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // =========================================================================
    // 3. Three.js Medical Particles Background
    // =========================================================================
    const initThreeJS = () => {
        const canvas = document.getElementById('hero-canvas');
        if(!canvas || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        // Transparent background
        scene.background = null; 

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 100;

        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create Particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 800; // Adjust for density
        const posArray = new Float32Array(particlesCount * 3);
        const colorArray = new Float32Array(particlesCount * 3);

        const color1 = new THREE.Color('#0F4C81'); // Primary
        const color2 = new THREE.Color('#2EC4B6'); // Secondary
        const color3 = new THREE.Color('#38BDF8'); // Accent
        const colors = [color1, color2, color3];

        for(let i = 0; i < particlesCount * 3; i+=3) {
            // Position
            posArray[i] = (Math.random() - 0.5) * 400; // x
            posArray[i+1] = (Math.random() - 0.5) * 400; // y
            posArray[i+2] = (Math.random() - 0.5) * 200; // z

            // Colors
            const randColor = colors[Math.floor(Math.random() * colors.length)];
            colorArray[i] = randColor.r;
            colorArray[i+1] = randColor.g;
            colorArray[i+2] = randColor.b;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

        // Create material with circular point rendering
        // Creating a circular texture programmably
        const circleCanvas = document.createElement('canvas');
        circleCanvas.width = 32;
        circleCanvas.height = 32;
        const context = circleCanvas.getContext('2d');
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(16, 16, 16, 0, Math.PI * 2);
        context.fill();
        const particleTexture = new THREE.CanvasTexture(circleCanvas);

        const material = new THREE.PointsMaterial({
            size: 2.5,
            vertexColors: true,
            map: particleTexture,
            transparent: true,
            opacity: 0.8,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const particlesMesh = new THREE.Points(particlesGeometry, material);
        scene.add(particlesMesh);

        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX);
            mouseY = (event.clientY - windowHalfY);
        });

        // Animation Loop
        const clock = new THREE.Clock();

        const tick = () => {
            const elapsedTime = clock.getElapsedTime();

            // Rotate entire system slowly
            particlesMesh.rotation.y = elapsedTime * 0.05;
            particlesMesh.rotation.z = elapsedTime * 0.02;

            // Parallax based on mouse
            targetX = mouseX * 0.001;
            targetY = mouseY * 0.001;
            
            particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
            particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

            renderer.render(scene, camera);
            window.requestAnimationFrame(tick);
        };
        tick();

        // Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };

    initThreeJS();

    // =========================================================================
    // 4. GSAP Animations
    // =========================================================================
    
    gsap.registerPlugin(ScrollTrigger);

    // Hero Entry Animation Sequence
    const heroTl = gsap.timeline();
    
    heroTl.from(".logo", { y: -20, opacity: 0, duration: 0.8, ease: "power3.out" })
          .from(".nav-link, .nav-btn", { y: -20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }, "-=0.6")
          .from(".hero-badge", { y: 30, opacity: 0, duration: 0.8, ease: "power4.out" }, "-=0.2")
          .from(".hero-title", { y: 50, opacity: 0, duration: 1, ease: "power4.out" }, "-=0.6")
          .from(".hero-subtitle", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.7")
          .from(".hero-buttons .btn", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.5)" }, "-=0.5")
          .from(".floating-icons .float-icon", { scale: 0, opacity: 0, duration: 1, stagger: 0.2, ease: "elastic.out(1, 0.5)" }, "-=0.8");

    // Section Titles Scroll Reveal
    gsap.utils.toArray('.section-reveal').forEach(elem => {
        gsap.fromTo(elem, 
            { y: 50, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power3.out"
            }
        );
    });

    // Services Stagger Animation
    gsap.fromTo(".service-anim", 
        { y: 60, opacity: 0 },
        {
            scrollTrigger: {
                trigger: ".services-grid",
                start: "top 80%",
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out"
        }
    );

    // Why Choose Us Stagger Animation
    gsap.fromTo(".fb-anim", 
        { scale: 0.9, opacity: 0, y: 30 },
        {
            scrollTrigger: {
                trigger: ".features-animated-grid",
                start: "top 80%",
            },
            scale: 1,
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.2)"
        }
    );

    // Number Counter Animation
    const counters = document.querySelectorAll(".counter");

    const startCounter = (counter) => {
        const target = +counter.getAttribute("data-target");
        let count = 0;

        const speed = target / 100;

        const update = () => {
            count += speed;

            if (count < target) {
                counter.innerText = Math.floor(count);
                requestAnimationFrame(update);
            } else {
                counter.innerText = target;
            }
        };

        update();
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounter(entry.target);
            }
        });
    }, { threshold: 0.8 });

    counters.forEach(counter => {
        observer.observe(counter);
    });

    // About Image Parallax
    gsap.to(".about-img", {
        scrollTrigger: {
            trigger: ".about-container",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        },
        y: 20, /* Slight parallax movement inside wrapper */
        scale: 1.05
    });

    // =========================================================================
    // 5. Accordion Logic for Services
    // =========================================================================
    const accordions = document.querySelectorAll('.accordion-header');
    
    accordions.forEach(acc => {
        acc.addEventListener('click', function() {
            const parent = this.parentElement;
            const body = this.nextElementSibling;
            
            // Close other accordions
            const activeItems = document.querySelectorAll('.accordion-item.active');
            activeItems.forEach(item => {
                if(item !== parent) {
                    item.classList.remove('active');
                    item.querySelector('.accordion-body').style.maxHeight = null;
                }
            });
            
            // Toggle clicked accordion
            parent.classList.toggle('active');
            if (parent.classList.contains('active')) {
                body.style.maxHeight = body.scrollHeight + "px";
            } else {
                body.style.maxHeight = null;
            }
        });
    });

    // =========================================================================
    // 6. WhatsApp Booking Form Logic & Multi-Select
    // =========================================================================
    const waForm = document.getElementById('whatsappForm');
    const multiSelect = document.getElementById('customMultiSelect');
    
    // Custom Multi-Select Logic
    let selectedTestsSet = new Set();
    
    if (multiSelect) {
        const searchInput = document.getElementById('multiselectSearch');
        const tagsContainer = document.getElementById('multiselectTags');
        const checkboxes = document.querySelectorAll('.multiselect-option input[type="checkbox"]');
        const errorMsg = document.getElementById('multiselectError');
        
        const updateTags = () => {
            document.querySelectorAll('.multiselect-tag').forEach(tag => tag.remove());
            
            selectedTestsSet.forEach(value => {
                const tag = document.createElement('div');
                tag.className = 'multiselect-tag';
                tag.innerHTML = `${value} <span class="multiselect-tag-remove" data-value="${value}">×</span>`;
                tagsContainer.insertBefore(tag, searchInput);
            });

            document.querySelectorAll('.multiselect-tag-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const val = btn.getAttribute('data-value');
                    selectedTestsSet.delete(val);
                    const cb = document.querySelector(`.multiselect-option input[value="${val}"]`);
                    if(cb) cb.checked = false;
                    updateTags();
                    if (selectedTestsSet.size > 0 && errorMsg) errorMsg.style.display = 'none';
                });
            });
        };

        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) {
                    selectedTestsSet.add(cb.value);
                } else {
                    selectedTestsSet.delete(cb.value);
                }
                updateTags();
                searchInput.value = '';
                document.querySelectorAll('.multiselect-option').forEach(opt => opt.style.display = 'flex');
                if (selectedTestsSet.size > 0 && errorMsg) errorMsg.style.display = 'none';
            });
        });

        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.multiselect-option').forEach(opt => {
                const text = opt.textContent.toLowerCase();
                if (text.includes(term)) {
                    opt.style.display = 'flex';
                } else {
                    opt.style.display = 'none';
                }
            });
        });

        searchInput.addEventListener('focus', () => {
            multiSelect.classList.add('open');
            tagsContainer.classList.add('active');
            if (errorMsg) errorMsg.style.display = 'none';
        });

        document.addEventListener('click', (e) => {
            if (!multiSelect.contains(e.target)) {
                multiSelect.classList.remove('open');
                tagsContainer.classList.remove('active');
            }
        });
    }

    if (waForm) {
        waForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (selectedTestsSet.size === 0) {
                const errorMsg = document.getElementById('multiselectError');
                if (errorMsg) errorMsg.style.display = 'block';
                return;
            }

            const name = document.getElementById('waName').value.trim();
            const age = document.getElementById('waAge').value.trim();
            const gender = document.getElementById('waGender').value;
            const phone = document.getElementById('waPhone').value.trim();
            const date = document.getElementById('waDate').value;
            const address = document.getElementById('waAddress').value.trim();
            const message = document.getElementById('waMessage').value.trim();

            const selectedTests = Array.from(selectedTestsSet).join(', ');

            // Format message natively precisely as user requested
            let whatsappText = `Patient Name: ${name}\n`;
            whatsappText += `Age: ${age}\n`;
            whatsappText += `Gender: ${gender}\n`;
            whatsappText += `Mobile Number: ${phone}\n`;
            whatsappText += `Address: ${address}\n\n`;
            whatsappText += `Selected Services: ${selectedTests}\n\n`;
            whatsappText += `Preferred Date: ${date}\n\n`;
            whatsappText += `Additional Message: ${message !== "" ? message : "None"}`;

            const encodedText = encodeURIComponent(whatsappText);
            const phoneNumber = "919440920756"; 
            window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
        });
    }

    // =========================================================================
    // 7. Specialist Booking Form Logic
    // =========================================================================
    const specForm = document.getElementById('specialistForm');
    const specDoctor = document.getElementById('specDoctor');
    const specDate = document.getElementById('specDate');
    const specDateInfo = document.getElementById('specDateInfo');
    
    // For Custom Multi Select on Specialist Form
    const specMultiSelectWrapper = document.getElementById('specMultiSelect');
    
    if (specForm && specDoctor && specMultiSelectWrapper) {
        let specSelectedTestsSet = new Set();
        const specSearchInput = document.getElementById('specSearch');
        const specTagsContainer = document.getElementById('specTags');
        const specDropdown = document.getElementById('specDropdown');
        const specErrorMsg = document.getElementById('specError');

        const doctorsServicesData = {
            "DR. C.H. Tulasi Ram": [
                "All Joint Pains", "Spine Injuries", "Bone Fractures", 
                "Total Knee Replacement", "Total Hip Replacement", "Arthroscopy", "Physiotherapy"
            ],
            "Jaya Chandra": [
                "CBC+ESR", "CBC", "HbA1c", "Lipid Profile", "Liver Function Test", 
                "Renal Function Test", "FBS", "PPBS", "Urine Routine", 
                "Electrolytes (Sodium, Potassium, Calcium, Chloride)", "X-ray Chest", "ECG", "Thyroid T3"
            ]
        };

        const updateSpecTags = () => {
            specTagsContainer.querySelectorAll('.multiselect-tag').forEach(tag => tag.remove());
            specSelectedTestsSet.forEach(value => {
                const tag = document.createElement('div');
                tag.className = 'multiselect-tag';
                tag.innerHTML = `${value} <span class="multiselect-tag-remove" data-value="${value}">×</span>`;
                specTagsContainer.insertBefore(tag, specSearchInput);
            });
            specTagsContainer.querySelectorAll('.multiselect-tag-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const val = btn.getAttribute('data-value');
                    specSelectedTestsSet.delete(val);
                    const cb = specDropdown.querySelector(`input[value="${val}"]`);
                    if(cb) cb.checked = false;
                    updateSpecTags();
                    if(specSelectedTestsSet.size > 0 && specErrorMsg) specErrorMsg.style.display = 'none';
                });
            });
        };

        const bindSpecCheckboxes = () => {
            specDropdown.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.addEventListener('change', () => {
                    if (cb.checked) specSelectedTestsSet.add(cb.value);
                    else specSelectedTestsSet.delete(cb.value);
                    updateSpecTags();
                    specSearchInput.value = '';
                    specDropdown.querySelectorAll('.multiselect-option').forEach(opt => opt.style.display = 'flex');
                    if(specSelectedTestsSet.size > 0 && specErrorMsg) specErrorMsg.style.display = 'none';
                });
            });
        };

        // On Doctor select
        specDoctor.addEventListener('change', function() {
            const doc = this.value;
            specSelectedTestsSet.clear();
            updateSpecTags();
            specMultiSelectWrapper.style.display = 'block';
            
            // Build Dropdown Details
            const items = doctorsServicesData[doc] || [];
            specDropdown.innerHTML = '';
            items.forEach(item => {
                const label = document.createElement('label');
                label.className = 'multiselect-option';
                label.innerHTML = `<input type="checkbox" value="${item}"> <span>${item}</span>`;
                specDropdown.appendChild(label);
            });
            bindSpecCheckboxes();

            // Handle date constraint
            specDate.value = ''; // Reset
            if (doc === 'DR. C.H. Tulasi Ram') {
                specDateInfo.textContent = "(Fridays Only)";
                // We add an event listener to validate Fridays, or restrict native if possible
                // Min is today
                specDate.min = new Date().toISOString().split('T')[0];
            } else {
                specDateInfo.textContent = "";
                specDate.min = new Date().toISOString().split('T')[0];
            }
        });

        // Date limitation validation
        specDate.addEventListener('input', function() {
            if (specDoctor.value === 'DR. C.H. Tulasi Ram') {
                const dt = new Date(this.value);
                if (dt.getDay() !== 5) { // 5 is Friday
                    alert("DR. C.H. Tulasi Ram is only available on Fridays. Please select a Friday.");
                    this.value = '';
                }
            }
        });

        // Search logic
        specSearchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            specDropdown.querySelectorAll('.multiselect-option').forEach(opt => {
                const text = opt.textContent.toLowerCase();
                opt.style.display = text.includes(term) ? 'flex' : 'none';
            });
        });

        specSearchInput.addEventListener('focus', () => {
            specMultiSelectWrapper.classList.add('open');
            specTagsContainer.classList.add('active');
            if(specErrorMsg) specErrorMsg.style.display = 'none';
        });

        document.addEventListener('click', (e) => {
            if (!specMultiSelectWrapper.contains(e.target)) {
                specMultiSelectWrapper.classList.remove('open');
                specTagsContainer.classList.remove('active');
            }
        });

        // Submission logic
        specForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (specSelectedTestsSet.size === 0) {
                if (specErrorMsg) specErrorMsg.style.display = 'block';
                return;
            }

            const name = document.getElementById('specName').value.trim();
            const age = document.getElementById('specAge').value.trim();
            const gender = document.getElementById('specGender').value;
            const phone = document.getElementById('specPhone').value.trim();
            const address = document.getElementById('specAddress').value.trim();
            const doctor = specDoctor.value;
            const date = document.getElementById('specDate').value;
            const message = document.getElementById('specMessage').value.trim();

            const selectedTests = Array.from(specSelectedTestsSet).join(', ');

            let whatsappText = `Patient Name: ${name}\n`;
            whatsappText += `Age: ${age}\n`;
            whatsappText += `Gender: ${gender}\n`;
            whatsappText += `Mobile Number: ${phone}\n`;
            whatsappText += `Address: ${address}\n\n`;
            whatsappText += `Doctor Selected: ${doctor}\n\n`;
            whatsappText += `Selected Services: ${selectedTests}\n\n`;
            whatsappText += `Preferred Date: ${date}\n\n`;
            whatsappText += `Additional Message: ${message !== "" ? message : "None"}`;

            const encodedText = encodeURIComponent(whatsappText);
            const phoneNumber = "919440920756"; 
            window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
        });
    }

});
