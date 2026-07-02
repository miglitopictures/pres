let currentSlide = 0;
let selectedKw = null;

// - elements-  //
const slidesContainterEl = document.getElementById('slides-container'); 
const counterEl = document.getElementById('slide-counter');
const labelEl = document.getElementById('presentation-label');

labelEl.addEventListener('mouseenter', () => { labelEl.textContent = "leia texto base <-"; });
labelEl.addEventListener('mouseleave', () => { labelEl.textContent = "Ferramentas de Desenhar"; });

function updateCounter() {
    counterEl.textContent = `${currentSlide + 1}/${slides.length}`;
}

function rand(min, max) { return Math.random() * (max - min) + min; }

let clearTimeoutId = null;

// ---- CONTENT RENDERERS REGISTRY ----
const contentRenderers = {
    scatter: (slideEl, kwData) => {
        // Cancel any pending clear before writing new images
        if (clearTimeoutId) { clearTimeout(clearTimeoutId); clearTimeoutId = null; }

        const layer = slideEl.querySelector('.img-layer');
        layer.innerHTML = '';

        kwData.images.forEach((item, i) => {
            const isObject = typeof item === 'object' && item !== null;
            const src = isObject ? item.image : item;
            const href = isObject ? item.href : null;

            const img = document.createElement('img');
            img.className = 'scattered-img';
            img.src = "./images/" + src;
            img.style.left = rand(5, 75) + 'vw';
            img.style.top = rand(5, 65) + 'vh';

            const randomRot = rand(-8, 8);
            img.style.setProperty('--rot', `${randomRot}deg`);
            img.style.zIndex = i + 1;

            if (href) {
                img.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>') 16 16, pointer`;
            } else {
                img.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="18" fill="red"/></svg>') 20 20, pointer`;
            }

            img.addEventListener('click', (e) => {
                e.stopPropagation();
                if (href) {
                    window.open(href, '_blank');
                } else {
                    const clickX = e.clientX;
                    const halfScreen = window.innerWidth / 2;
                    clickX < halfScreen ? goTo(currentSlide - 1) : goTo(currentSlide + 1);
                }
            });

            layer.appendChild(img);

            requestAnimationFrame(() => {
                setTimeout(() => img.classList.add('visible'), i * 60);
            });
        });
    },
    grid: (slideEl, kwData) => {
        // Cancel any pending clear before writing new images
        if (clearTimeoutId) { clearTimeout(clearTimeoutId); clearTimeoutId = null; }

        const layer = slideEl.querySelector('.img-layer');
        layer.innerHTML = '';
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-container';
        layer.appendChild(gridContainer);


        kwData.images.forEach((item, i) => {
            const isObject = typeof item === 'object' && item !== null;
            const src = isObject ? item.image : item;
            const href = isObject ? item.href : null;

            const img = document.createElement('img');
            img.className = 'grid-img';
            img.src = "./images/" + src;
            // img.style.left = rand(5, 75) + 'vw';
            // img.style.top = rand(5, 65) + 'vh';



            if (href) {
                img.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>') 16 16, pointer`;
            } else {
                img.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="18" fill="red"/></svg>') 20 20, pointer`;
            }

            img.addEventListener('click', (e) => {
                e.stopPropagation();
                if (href) {
                    window.open(href, '_blank');
                } else {
                    const clickX = e.clientX;
                    const halfScreen = window.innerWidth / 2;
                    clickX < halfScreen ? goTo(currentSlide - 1) : goTo(currentSlide + 1);
                }
            });

            gridContainer.appendChild(img);

            requestAnimationFrame(() => {
                setTimeout(() => img.classList.add('visible'), i * 60);
            });
        });
    }
};

// ---- CLEAN UP LOGIC ----
function clearActiveContent(slideEl) {
    if (clearTimeoutId) { clearTimeout(clearTimeoutId); clearTimeoutId = null; }
    const layer = slideEl.querySelector('.img-layer');
    
    layer.querySelectorAll('.scattered-img').forEach(img => img.classList.remove('visible'));
    
    clearTimeoutId = setTimeout(() => { 
        layer.innerHTML = ''; 
        clearTimeoutId = null; 
    }, 420);
}

function clearSelection() {
    if (selectedKw) {
        const slideEl = document.querySelector('.slide.active');
        clearActiveContent(slideEl);
        selectedKw.classList.remove('selected');
    }
    selectedKw = null;
    document.body.classList.remove('has-selection');
}

// ---- KEYWORD SELECTION ----
function selectKeyword(el, kwData) {
    const slideEl = document.querySelector('.slide.active');
    
    if (selectedKw === el) {
        clearSelection();
        return;
    }
    
    if (selectedKw) {
        selectedKw.classList.remove('selected');
        clearActiveContent(slideEl);
    }
    
    selectedKw = el;
    el.classList.add('selected');
    document.body.classList.add('has-selection');

    if (kwData.images && kwData.images.length) {
        const layoutType = kwData.type || 'scatter'; 
        
        if (contentRenderers[layoutType]) {
            contentRenderers[layoutType](slideEl, kwData);
        } else {
            console.warn(`Renderer type "${layoutType}" is not configured.`);
        }
    }
}

// ---- RENDER ----
function renderSlides() {
    slidesContainterEl.innerHTML = '';
    slides.forEach((slide, i) => {
        const slideEl = document.createElement('div');
        slideEl.className = 'slide' + (i === currentSlide ? ' active' : '');
        slideEl.dataset.index = i;

        const imgLayer = document.createElement('div');
        imgLayer.className = 'img-layer';
        slideEl.appendChild(imgLayer);

        const titleEl = document.createElement('div');
        titleEl.className = 'title';
        [...slide.title].forEach((ch, idx) => {
            const charEl = document.createElement('span');
            charEl.className = 'title-char';
            charEl.style.setProperty('--char-i', idx);
            charEl.textContent = ch === ' ' ? '\u00A0' : ch;
            titleEl.appendChild(charEl);
        });
        slideEl.appendChild(titleEl);

        const kwWrap = document.createElement('div');
        kwWrap.className = 'keywords';

        slide.keywords.forEach(kw => {
            const kwData = typeof kw === 'string' ? { text: kw } : kw;
            const kwEl = document.createElement('span');
            kwEl.className = 'keyword';
            kwEl.textContent = kwData.text;
            kwEl.addEventListener('click', (e) => {
                e.stopPropagation();
                selectKeyword(kwEl, kwData);
            });
            kwWrap.appendChild(kwEl);
        });

        slideEl.appendChild(kwWrap);
        slidesContainterEl.appendChild(slideEl);
    });
}

function goTo(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentSlide = index;
    clearSelection();
    document.querySelectorAll('.slide').forEach(s => {
        s.classList.toggle('active', Number(s.dataset.index) === currentSlide);
    });
    updateCounter();
}

document.getElementById('prevZone').addEventListener('click', () => goTo(currentSlide - 1));
document.getElementById('nextZone').addEventListener('click', () => goTo(currentSlide + 1));

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(currentSlide - 1);
    if (e.key === 'ArrowRight') goTo(currentSlide + 1);
    if (e.key === 'Escape') clearSelection();
});

renderSlides();
updateCounter();