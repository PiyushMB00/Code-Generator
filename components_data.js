const standardControls = [
    { id: 'fontSize', type: 'range', label: 'Font Size (px)', min: 10, max: 48, default: 16 },
    { id: 'fontWeight', type: 'range', label: 'Font Weight', min: 100, max: 900, step: 100, default: 500 },
    { id: 'letterSpacing', type: 'range', label: 'Letter Spac (px)', min: -5, max: 20, default: 0 },
    { id: 'fontFamily', type: 'select', label: 'Font Family', options: [{val: 'sans-serif', label: 'Standard (Sans)'}, {val: 'serif', label: 'Elegant (Serif)'}, {val: 'monospace', label: 'Tech (Mono)'}, {val: 'cursive', label: 'Playful (Cursive)'}], default: 'sans-serif' },
    { id: 'opacity', type: 'range', label: 'Opacity (%)', min: 10, max: 100, default: 100 },
    { id: 'blur', type: 'range', label: 'Glass Blur (px)', min: 0, max: 40, default: 0 },
    { id: 'hasBorder', type: 'checkbox', label: 'Border Toggle', default: false },
    { id: 'borderStyle', type: 'select', label: 'Border Style', options: [{val: 'solid', label: 'Solid'}, {val: 'dashed', label: 'Dashed'}, {val: 'dotted', label: 'Dotted'}, {val: 'double', label: 'Double'}], default: 'solid' },
    { id: 'shadowDepth', type: 'select', label: 'Shadow Depth', options: [{val: 'none', label: 'None'}, {val: 'soft', label: 'Soft'}, {val: 'medium', label: 'Medium'}, {val: 'hard', label: 'Hard'}, {val: 'bottom', label: 'Bottom Drop'}, {val: 'inner', label: 'Inset / Inner'}], default: 'soft' },
    { id: 'useGradient', type: 'checkbox', label: 'Use Gradient', default: false },
    { id: 'bgColor', type: 'color', label: 'Background/Grad 1', default: '#27272a' },
    { id: 'gradientColor2', type: 'color', label: 'Background Grad 2', default: '#3f3f46' },
    { id: 'textColor', type: 'color', label: 'Text Color', default: '#f4f4f5' },
    { id: 'accentColor', type: 'color', label: 'Accent Color', default: '#06b6d4' },
    { id: 'radius', type: 'range', label: 'Border Radius (px)', min: 0, max: 50, default: 8 },
    { id: 'padding', type: 'range', label: 'Padding (px)', min: 0, max: 72, default: 16 },
    { id: 'transitionSpeed', type: 'range', label: 'Anim Speed (ms)', min: 0, max: 1000, default: 300 },
    { id: 'hoverEffect', type: 'select', label: 'Hover Logic', options: [{val: 'none', label: 'None'}, {val: 'lift', label: 'Lift Up'}, {val: 'scale', label: 'Scale Up'}, {val: 'glow', label: 'Pulse Glow'}, {val: 'wiggle', label: 'Wiggle'}], default: 'none' },
    { id: 'entranceAnim', type: 'select', label: 'Entrance Anim', options: [{val: 'none', label: 'None'}, {val: 'fade', label: 'Fade In'}, {val: 'slide', label: 'Slide Up'}, {val: 'zoom', label: 'Zoom In'}, {val: 'bounce', label: 'Bounce'}], default: 'none' }
];

function schema(specifics) {
    return [...specifics, ...standardControls];
}

window.devConfig = [
    {
        id: 'accordion', name: 'Accordion', category: 'A',
        schema: schema([
            { id: 'items', type: 'range', label: 'Items', min: 1, max: 5, default: 3 },
            { id: 'text', type: 'text', label: 'Title Text', default: 'Accordion Item' }
        ]),
        generate: (v) => {
            let html = `<div class="accordion">\n`;
            for(let i=1; i<=v.items; i++) {
                html += `  <div class="acc-item">\n    <div class="acc-header">${v.text} ${i} <span>+</span></div>\n    <div class="acc-content" style="display: ${i===1?'block':'none'}">Content for item ${i}.</div>\n  </div>\n`;
            }
            html += `</div>`;
            return { html, css: `.accordion {\n    width: 100%;\n    max-width: 400px;\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n}\n.acc-item {\n    {{BASE_STYLES}}\n    padding: 0;\n    overflow: hidden;\n}\n.acc-header {\n    padding: ${v.padding}px;\n    cursor: pointer;\n    display: flex;\n    justify-content: space-between;\n    border-bottom: 1px solid rgba(255,255,255,0.05);\n}\n.acc-content {\n    padding: ${v.padding}px;\n    background-color: rgba(0,0,0,0.1);\n}`};
        }
    },
    {
        id: 'alert', name: 'Alert', category: 'A',
        schema: schema([{ id: 'text', type: 'text', label: 'Alert Text', default: 'This is an important alert message.' }]),
        generate: (v) => ({
            html: `<div class="alert">${v.text}</div>`,
            css: `.alert {\n    {{BASE_STYLES}}\n    width: 100%;\n    max-width: 400px;\n    border-left: 4px solid ${v.accentColor};\n}`
        })
    },
    {
        id: 'avatar', name: 'Avatar', category: 'A',
        schema: schema([{ id: 'size', type: 'range', label: 'Size (px)', min: 20, max: 150, default: 60 }]),
        generate: (v) => ({
            html: `<img src="https://i.pravatar.cc/150" class="avatar" alt="Avatar">`,
            css: `.avatar {\n    {{BASE_STYLES}}\n    width: ${v.size}px;\n    height: ${v.size}px;\n    object-fit: cover;\n    border-radius: ${v.radius === 8 ? '50%' : v.radius+'px'};\n    padding: 0;\n}`
        })
    },
    {
        id: 'badge', name: 'Badge', category: 'B',
        schema: schema([{ id: 'text', type: 'text', label: 'Text', default: 'New' }]),
        generate: (v) => ({
            html: `<span class="badge">${v.text}</span>`,
            css: `.badge {\n    {{BASE_STYLES}}\n    display: inline-block;\n    padding: ${v.padding / 2}px ${v.padding}px;\n    border-radius: 9999px;\n}`
        })
    },
    {
        id: 'breadcrumb', name: 'Breadcrumb', category: 'B',
        schema: schema([{ id: 'items', type: 'range', label: 'Links', min: 2, max: 5, default: 3 }]),
        generate: (v) => {
            let html = `<nav class="breadcrumb">\n`;
            for(let i=1; i<=v.items; i++) {
                html += `  <a href="#">Level ${i}</a>${i<v.items ? ' <span>/</span> ' : ''}\n`;
            }
            html += `</nav>`;
            return { html, css: `.breadcrumb {\n    {{BASE_STYLES}}\n    display: flex;\n    gap: 8px;\n}\n.breadcrumb a { color: ${v.accentColor}; text-decoration: none; }\n.breadcrumb span { color: rgba(255,255,255,0.3); }`};
        }
    },
    {
        id: 'button', name: 'Button', category: 'B',
        schema: schema([{ id: 'text', type: 'text', label: 'Text', default: 'Click Me' }]),
        templates: [
            { name: 'Modern Primary', styles: { bgColor: '#06b6d4', textColor: '#ffffff', radius: 8, hasShadow: true, fontWeight: 600 } },
            { name: 'Glass Ghost', styles: { opacity: 40, blur: 10, hasBorder: true, borderStyle: 'solid', accentColor: '#ffffff', textColor: '#ffffff' } },
            { name: '3D Neumorphic', styles: { bgColor: '#e0e5ec', textColor: '#444', radius: 12, shadowDepth: 'hard' } },
            { name: 'Neon Edge', styles: { bgColor: 'transparent', accentColor: '#00ffcc', hasBorder: true, borderStyle: 'solid', textColor: '#00ffcc', entranceAnim: 'fade' } }
        ],
        generate: (v) => ({
            html: `<button class="button">${v.text}</button>`,
            css: `.button {\n    {{BASE_STYLES}}\n    cursor: pointer;\n}\n.button:hover {\n    opacity: 0.9;\n}`
        })
    },
    {
        id: 'buttongroup', name: 'Button Group', category: 'B',
        schema: schema([{ id: 'items', type: 'range', label: 'Buttons', min: 2, max: 5, default: 3 }]),
        generate: (v) => {
             let html = `<div class="btn-group">\n`;
             for(let i=1; i<=v.items; i++) html += `  <button>Btn ${i}</button>\n`;
             html += `</div>`;
             return { html, css: `.btn-group {\n    display: flex;\n    ${v.hasShadow ? 'box-shadow: 0 4px 12px rgba(0,0,0,0.15);':''}\n    border-radius: ${v.radius}px;\n    overflow: hidden;\n}\n.btn-group button {\n    {{BASE_STYLES}}\n    margin: 0;\n    border-radius: 0;\n    box-shadow: none;\n    cursor: pointer;\n    border-right: 1px solid rgba(255,255,255,0.1);\n}\n.btn-group button:last-child { border-right: none; }\n.btn-group button:hover { opacity: 0.8; }`};
        }
    },
    {
        id: 'card', name: 'Card', category: 'C',
        schema: schema([{ id: 'title', type: 'text', label: 'Title', default: 'Card Title' }, { id: 'desc', type: 'text', label: 'Description', default: 'This is a description.' }]),
        templates: [
            { name: 'Glass Deck', styles: { opacity: 20, blur: 15, hasBorder: true, accentColor: '#ffffff22', radius: 16 } },
            { name: 'Brutal Black', styles: { bgColor: '#000000', hasBorder: true, accentColor: '#ffffff', radius: 0, shadowDepth: 'hard' } },
            { name: 'Material Soft', styles: { bgColor: '#ffffff', textColor: '#333333', radius: 4, shadowDepth: 'soft' } }
        ],
        generate: (v) => ({
            html: `<div class="card">\n  <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&h=400&auto=format&fit=crop" class="card-img" alt="Card">\n  <div class="card-body">\n    <h3 class="card-title">${v.title}</h3>\n    <p class="card-desc">${v.desc}</p>\n  </div>\n</div>`,
            css: `.card {\n    {{BASE_STYLES}}\n    width: 300px;\n    padding: 0;\n    overflow: hidden;\n}\n.card-img {\n    width: 100%;\n    height: 180px;\n    object-fit: cover;\n}\n.card-body {\n    padding: ${v.padding}px;\n}\n.card-title {\n    margin: 0 0 8px 0;\n}\n.card-desc {\n    margin: 0;\n    opacity: 0.8;\n}`
        })
    },
    {
        id: 'checkbox', name: 'Checkbox', category: 'C',
        schema: schema([{ id: 'label', type: 'text', label: 'Label', default: 'Accept Terms' }]),
        generate: (v) => ({
            html: `<label class="chk-container">\n  <input type="checkbox" checked>\n  <span class="chk-mark"></span>\n  ${v.label}\n</label>`,
            css: `.chk-container {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    color: ${v.textColor};\n    font-size: ${v.fontSize}px;\n    cursor: pointer;\n    font-family: sans-serif;\n}\n.chk-container input { width: 18px; height: 18px; accent-color: ${v.accentColor}; }`
        })
    },
    {
        id: 'chip', name: 'Chip', category: 'C',
        schema: schema([{ id: 'text', type: 'text', label: 'Text', default: 'Technology' }]),
        generate: (v) => ({
            html: `<div class="chip">\n  ${v.text}\n  <span class="close">×</span>\n</div>`,
            css: `.chip {\n    {{BASE_STYLES}}\n    display: inline-flex;\n    align-items: center;\n    gap: 8px;\n    border-radius: 9999px;\n    padding: ${v.padding/2}px ${v.padding}px;\n}\n.close { cursor: pointer; font-weight: bold; opacity: 0.6; }`
        })
    },
    {
        id: 'divider', name: 'Divider', category: 'D',
        schema: schema([{ id: 'text', type: 'text', label: 'Text', default: 'OR' }]),
        generate: (v) => ({
            html: `<div class="divider">${v.text === '' ? '' : v.text}</div>`,
            css: `.divider {\n    width: 100%;\n    display: flex;\n    align-items: center;\n    color: ${v.textColor};\n    font-size: ${v.fontSize}px;\n    font-family: sans-serif;\n}\n.divider::before, .divider::after {\n    content: '';\n    flex: 1;\n    border-bottom: 1px solid ${v.accentColor};\n    margin: 0 16px;\n}`
        })
    },
    {
        id: 'input', name: 'Input Field', category: 'I',
        schema: schema([{ id: 'placeholder', type: 'text', label: 'Placeholder', default: 'Enter name...' }]),
        generate: (v) => ({
            html: `<input type="text" class="input-field" placeholder="${v.placeholder}">`,
            css: `.input-field {\n    {{BASE_STYLES}}\n    width: 250px;\n}\n.input-field:focus { border-color: ${v.accentColor} !important; }`
        })
    },
    {
        id: 'loader', name: 'Loader (Spinner)', category: 'L',
        schema: schema([{ id: 'size', type: 'range', label: 'Size', min: 20, max: 100, default: 40 }]),
        generate: (v) => ({
            html: `<div class="spinner"></div>`,
            css: `.spinner {\n    width: ${v.size}px;\n    height: ${v.size}px;\n    border: 4px solid ${v.bgColor};\n    border-top: 4px solid ${v.accentColor};\n    border-radius: 50%;\n    animation: spin 1s linear infinite;\n}\n@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`
        })
    },
    {
        id: 'navbar', name: 'Navbar', category: 'N',
        schema: schema([{ id: 'logo', type: 'text', label: 'Logo', default: 'Brand' }]),
        generate: (v) => ({
            html: `<nav class="navbar">\n  <div class="brand">${v.logo}</div>\n  <div class="links">\n    <a href="#">Home</a>\n    <a href="#">About</a>\n    <a href="#">Contact</a>\n  </div>\n</nav>`,
            css: `.navbar {\n    {{BASE_STYLES}}\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    width: 100%;\n}\n.brand { font-weight: bold; font-size: 20px; }\n.links a {\n    color: ${v.textColor};\n    text-decoration: none;\n    margin-left: 16px;\n    opacity: 0.8;\n    transition: 0.2s;\n}\n.links a:hover { opacity: 1; color: ${v.accentColor}; }`
        })
    },
    {
        id: 'progress', name: 'Progress Bar', category: 'P',
        schema: schema([{ id: 'progress', type: 'range', label: 'Progress %', min: 0, max: 100, default: 60 }]),
        generate: (v) => ({
            html: `<div class="progress-track">\n  <div class="progress-fill"></div>\n</div>`,
            css: `.progress-track {\n    ${v.hasShadow ? 'box-shadow: 0 4px 6px rgba(0,0,0,0.1) inset;':''}\n    width: 300px;\n    height: ${v.padding/2 || 8}px;\n    background-color: ${v.bgColor};\n    border-radius: ${v.radius}px;\n    overflow: hidden;\n}\n.progress-fill {\n    width: ${v.progress}%;\n    height: 100%;\n    background-color: ${v.accentColor};\n    transition: width 0.3s;\n}`
        })
    },
    {
        id: 'radio', name: 'Radio Button', category: 'R',
        schema: schema([{ id: 'label', type: 'text', label: 'Label', default: 'Option 1' }]),
        generate: (v) => ({
            html: `<label class="radio-container">\n  <input type="radio" name="radio-group" checked>\n  <span class="radio-mark"></span>\n  ${v.label}\n</label>`,
            css: `.radio-container {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    color: ${v.textColor};\n    font-size: ${v.fontSize}px;\n    cursor: pointer;\n    font-family: sans-serif;\n}\n.radio-container input { width: 18px; height: 18px; accent-color: ${v.accentColor}; }`
        })
    }
];

window.blueprints = [
    {
        id: 'bp_hero', name: 'Hero Section', category: 'Layouts',
        components: [
            { id: 'navbar', form: { logo: 'MySaaS' } },
            { id: 'card', form: { title: 'Welcome to the Future', desc: 'Build faster than ever before.' } }
        ]
    }
];
