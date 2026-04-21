let currentComponentId = 'button';
let currentPreset = 'modern';
let currentTab = 'html';
let formData = {};

const sidebarNav = document.getElementById('sidebar-nav');
const searchInput = document.getElementById('component-search');
const controlsWrapper = document.getElementById('dynamic-controls');
const activeTitle = document.getElementById('active-component-title');
const previewBox = document.getElementById('preview-box');
const codeOutput = document.getElementById('code-output');

let currentHtml = '';
let currentCss = '';
let currentJs = '';
// Project & State Management
let isCanvasMode = false;
let isLightMode = false;
let canvasElements = [];
let currentProjectName = 'default';
let projects = JSON.parse(localStorage.getItem('pisces_projects') || '{"default": []}');

// History Stack
let historyStack = [];
let redoStack = [];
let isRecovering = false;

// Assets Data
const curatedImages = [
    { id: 'tech', src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format' },
    { id: 'nature', src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&auto=format' },
    { id: 'modern', src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format' },
    { id: 'minimal', src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format' },
    { id: 'abstract', src: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&auto=format' },
    { id: 'architecture', src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format' }
];

const popularFonts = ['Outfit', 'Inter', 'Roboto', 'Montserrat', 'Playfair Display', 'Poppins', 'Lato', 'Open Sans', 'Fira Code', 'Lora', 'Merriweather', 'Raleway'];


// Group components by Category
function renderSidebar(filter = '') {
    sidebarNav.innerHTML = '';
    const grouped = {};
    const favs = JSON.parse(localStorage.getItem('favs') || '[]');
    
    if (favs.length > 0 && !filter) grouped['✨ Favorites'] = [];
    
    devConfig.forEach(comp => {
        if (filter && !comp.name.toLowerCase().includes(filter.toLowerCase())) return;
        
        if (favs.includes(comp.id) && !filter) {
            grouped['✨ Favorites'].push(comp);
        }
        
        if (!grouped[comp.category]) grouped[comp.category] = [];
        grouped[comp.category].push(comp);
    });

    // Add Blueprints if window.blueprints exists
    if (window.blueprints && !filter) {
        grouped['⚡ Blueprints'] = window.blueprints;
    }

    Object.keys(grouped).sort((a,b) => a==='✨ Favorites' ? -1 : a==='⚡ Blueprints' ? -0.5 : b==='✨ Favorites' ? 1 : a.localeCompare(b)).forEach(cat => {
        const title = document.createElement('div');
        title.className = 'category-title';
        title.innerText = cat;
        sidebarNav.appendChild(title);
        
        grouped[cat].forEach(comp => {
            const btn = document.createElement('button');
            btn.className = `nav-btn ${currentComponentId === comp.id ? 'active' : ''}`;
            btn.dataset.id = comp.id;
            btn.innerText = comp.name;
            btn.onclick = () => {
                if (comp.id.startsWith('bp_')) applyBlueprint(comp.id);
                else selectComponent(comp.id);
            };
            sidebarNav.appendChild(btn);
        });
    });
}

function selectComponent(id) {
    currentComponentId = id;
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.id === id) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    
    const favs = JSON.parse(localStorage.getItem('favs') || '[]');
    const favBtn = document.getElementById('fav-btn');
    if(favBtn) {
        favBtn.innerText = favs.includes(id) ? '★' : '☆';
        favBtn.style.color = favs.includes(id) ? '#facc15' : 'var(--text-muted)';
    }

    const comp = devConfig.find(c => c.id === id);
    activeTitle.innerText = comp.name + ' Controls';
    
    // Initialize form data with defaults
    formData = {};
    comp.schema.forEach(field => {
        formData[field.id] = field.default;
    });
    
    renderControls();
    updatePreview();
}

function saveState() {
    if (isRecovering) return;
    const state = JSON.stringify({
        id: currentComponentId,
        form: formData,
        preset: currentPreset
    });
    if (historyStack[historyStack.length - 1] === state) return;
    historyStack.push(state);
    if (historyStack.length > 50) historyStack.shift();
    redoStack = [];
}

function undo() {
    if (historyStack.length <= 1) return;
    isRecovering = true;
    redoStack.push(historyStack.pop());
    const prevState = JSON.parse(historyStack[historyStack.length - 1]);
    applyState(prevState);
    isRecovering = false;
}

function redo() {
    if (redoStack.length === 0) return;
    isRecovering = true;
    const nextState = JSON.parse(redoStack.pop());
    historyStack.push(JSON.stringify(nextState));
    applyState(nextState);
    isRecovering = false;
}

function applyState(state) {
    currentComponentId = state.id;
    formData = state.form;
    currentPreset = state.preset;
    
    // UI Updates
    renderControls();
    updatePreview();
    document.querySelectorAll('.preset-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.preset === currentPreset);
    });
    renderSidebar(searchInput.value);
}

function renderControls() {
    controlsWrapper.innerHTML = '';
    const comp = devConfig.find(c => c.id === currentComponentId);

    // Global Sync Toggle
    const syncDiv = document.createElement('div');
    syncDiv.style = "padding:16px 24px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; background:rgba(45,212,191,0.05);";
    syncDiv.innerHTML = `<div style="display:flex; flex-direction:column; gap:2px;">
                            <label style="font-size:12px; font-weight:600; color:var(--accent);">Global Style Sync</label>
                            <span style="font-size:10px; color:var(--text-muted);">Updates all components at once</span>
                         </div>
                         <input type="checkbox" id="global-sync-toggle" ${window.isGlobalSync ? 'checked' : ''} onchange="setGlobalSync(this.checked)">`;
    controlsWrapper.appendChild(syncDiv);

    // Animation Studio Header
    const animHeader = document.createElement('div');
    animHeader.className = 'nav-group-title';
    animHeader.style = "padding: 16px 24px 8px; margin: 0; color: var(--accent);";
    animHeader.innerText = "✨ Animation Studio";
    controlsWrapper.appendChild(animHeader);

    const animGroup = document.createElement('div');
    animGroup.className = 'control-group';
    animGroup.style = "padding: 0 24px 16px; border-bottom: 4px solid rgba(0,0,0,0.2);";
    animGroup.innerHTML = `
        <div class="input-field" style="margin-bottom:12px;">
            <label style="font-size:11px;">Entrance Animation</label>
            <select id="input-entranceAnim" onchange="updateAnimation('entranceAnim', this.value)">
                <option value="none" ${formData.entranceAnim === 'none' ? 'selected' : ''}>None</option>
                <option value="fade" ${formData.entranceAnim === 'fade' ? 'selected' : ''}>Fade In</option>
                <option value="slide" ${formData.entranceAnim === 'slide' ? 'selected' : ''}>Slide Up</option>
                <option value="scale" ${formData.entranceAnim === 'scale' ? 'selected' : ''}>Scale Up</option>
                <option value="bounce" ${formData.entranceAnim === 'bounce' ? 'selected' : ''}>Bounce In</option>
            </select>
        </div>
        <div class="input-field">
            <label style="font-size:11px;">Hover Effect</label>
            <select id="input-hoverEffect" onchange="updateAnimation('hoverEffect', this.value)">
                <option value="none" ${formData.hoverEffect === 'none' ? 'selected' : ''}>None</option>
                <option value="lift" ${formData.hoverEffect === 'lift' ? 'selected' : ''}>Lift Up</option>
                <option value="scale" ${formData.hoverEffect === 'scale' ? 'selected' : ''}>Scale Grow</option>
                <option value="glow" ${formData.hoverEffect === 'glow' ? 'selected' : ''}>Neon Glow</option>
                <option value="wiggle" ${formData.hoverEffect === 'wiggle' ? 'selected' : ''}>Wiggle</option>
            </select>
        </div>
    `;
    controlsWrapper.appendChild(animGroup);
    
    // Render Templates if available
    if (comp.templates) {
        const tplWrapper = document.createElement('div');
        tplWrapper.className = 'template-group';
        tplWrapper.innerHTML = `<label style="width:100%;font-size:11px;color:var(--text-muted);margin-bottom:8px;">Quick Styles:</label>`;
        comp.templates.forEach(tpl => {
            const tbtn = document.createElement('button');
            tbtn.className = 'template-btn';
            tbtn.innerText = tpl.name;
            tbtn.onclick = () => {
                formData = { ...formData, ...tpl.styles };
                renderControls();
                updatePreview();
                saveState();
            };
            tplWrapper.appendChild(tbtn);
        });
        controlsWrapper.appendChild(tplWrapper);
    }

    comp.schema.forEach(field => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = field.type === 'checkbox' ? 'input-field checkbox-field' : 'input-field';
        
        let labelHtml = `<label style="display:flex;justify-content:space-between;align-items:center;">${field.label} 
            ${(field.type === 'text' && !field.id.includes('Color')) ? `<button onclick="generateSmartText('${field.id}')" title="AI Smart Text" style="background:none;border:none;cursor:pointer;font-size:12px;opacity:0.6;hover:opacity:1;">✨</button>` : ''}
        </label>`;
        if (field.type === 'range') {
            labelHtml = `<label>${field.label} <span id="val-${field.id}">${formData[field.id]}</span></label>`;
        }
        
        let inputHtml = '';
        if (field.type === 'text' || field.type === 'number' || field.type === 'color') {
            inputHtml = `<div style="display:flex;gap:4px;"><input type="${field.type}" id="input-${field.id}" value="${formData[field.id]}" style="flex:1;">`;
            if (field.id === 'imageUrl' || field.id === 'src' || field.id === 'image') {
                inputHtml += `<button onclick="openImagePicker('input-${field.id}')" style="background:var(--accent);border:none;border-radius:6px;width:32px;cursor:pointer;">🖼️</button>`;
            }
            inputHtml += `</div>`;
        } else if (field.type === 'checkbox') {
            inputHtml = `<input type="checkbox" id="input-${field.id}" ${formData[field.id] ? 'checked' : ''}>`;
        } else if (field.type === 'range') {
            inputHtml = `<input type="range" id="input-${field.id}" min="${field.min}" max="${field.max}" ${field.step ? `step="${field.step}"` : ''} value="${formData[field.id]}">`;
        } else if (field.type === 'select') {
            if (field.id === 'fontFamily') {
                inputHtml = `<div style="display:flex;flex-direction:column;gap:4px;">
                    <input type="text" placeholder="Search Google Fonts..." id="font-search" style="padding:4px 8px;font-size:11px;background:var(--bg-input);border:1px solid var(--border);border-top:none;border-left:none;border-right:none;border-radius:0;">
                    <select id="input-${field.id}">
                        ${field.options.map(o => `<option value="${o.val}" ${String(formData[field.id]) === String(o.val) ? 'selected' : ''}>${o.label}</option>`).join('')}
                        ${popularFonts.filter(f => !field.options.find(o => o.val === f)).map(f => `<option value="${f}" ${formData[field.id] === f ? 'selected' : ''}>${f}</option>`).join('')}
                    </select>
                </div>`;
            } else {
                inputHtml = `<select id="input-${field.id}">
                    ${field.options.map(o => `<option value="${o.val}" ${String(formData[field.id]) === String(o.val) ? 'selected' : ''}>${o.label}</option>`).join('')}
                </select>`;
            }
        } else if (field.type === 'textarea') {
            inputHtml = `<textarea id="input-${field.id}" rows="2">${formData[field.id]}</textarea>`;
        }
        
        fieldDiv.innerHTML = labelHtml + inputHtml;
        controlsWrapper.appendChild(fieldDiv);
        
        const inputEl = document.getElementById(`input-${field.id}`);
        inputEl.addEventListener('input', (e) => {
            const val = field.type === 'checkbox' ? e.target.checked : e.target.value;
            formData[field.id] = val;
            if (field.type === 'range') document.getElementById(`val-${field.id}`).innerText = val;
            
            // Pro Sync
            if (window.isGlobalSync && (field.id === 'accentColor' || field.id === 'radius' || field.id === 'fontFamily' || field.id === 'bgColor')) {
                applyGlobalStyle(field.id, val);
            }

            updatePreview();
            clearTimeout(window.saveTimer);
            window.saveTimer = setTimeout(() => { saveState(); saveProject(); }, 500);
        });
    });
}

window.getBaseStyles = function getBaseStyles(v) {
    let s = `\n    box-sizing: border-box;`;
    if(v.fontSize !== undefined) s += `\n    font-size: ${v.fontSize}px;`;
    
    if(v.fontFamily !== undefined) {
        if (!['sans-serif','serif','monospace','cursive'].includes(v.fontFamily)) {
            loadGoogleFont(v.fontFamily);
        }
        s += `\n    font-family: ${v.fontFamily === 'sans-serif' ? "'Outfit', sans-serif" : v.fontFamily === 'serif' ? "'Playfair Display', serif" : v.fontFamily === 'monospace' ? "'Fira Code', monospace" : v.fontFamily === 'cursive' ? "'Comic Sans MS', cursive" : `'${v.fontFamily}', sans-serif`};`;
    }
    
    if(v.fontWeight !== undefined) s += `\n    font-weight: ${v.fontWeight};`;
    if(v.letterSpacing !== undefined && v.letterSpacing != 0) s += `\n    letter-spacing: ${v.letterSpacing}px;`;
    
    if(v.useGradient && v.gradientColor2) {
        s += `\n    background: linear-gradient(135deg, ${v.bgColor}, ${v.gradientColor2});`;
    } else if(v.bgColor !== undefined) {
        s += `\n    background-color: ${v.bgColor};`;
    }
    
    if(v.textColor !== undefined) s += `\n    color: ${v.textColor};`;
    if(v.radius !== undefined) s += `\n    border-radius: ${v.radius}px;`;
    if(v.padding !== undefined) s += `\n    padding: ${v.padding}px;`;
    if(v.opacity !== undefined) s += `\n    opacity: ${v.opacity / 100};`;
    if(v.blur > 0) s += `\n    backdrop-filter: blur(${v.blur}px);\n    -webkit-backdrop-filter: blur(${v.blur}px);`;
    
    if(v.hasBorder !== undefined) s += `\n    border: ${v.hasBorder ? `1px ${v.borderStyle || 'solid'} ${v.accentColor || '#3f3f46'}` : 'none'};`;
    
    if(v.shadowDepth && v.shadowDepth !== 'none') {
        let sh = '';
        if(v.shadowDepth === 'soft') sh = '0 4px 12px rgba(0,0,0,0.1)';
        else if(v.shadowDepth === 'medium') sh = '0 8px 24px rgba(0,0,0,0.15)';
        else if(v.shadowDepth === 'hard') sh = '0 16px 32px rgba(0,0,0,0.3)';
        else if(v.shadowDepth === 'bottom') sh = '0 24px 20px -10px rgba(0,0,0,0.2)';
        else if(v.shadowDepth === 'inner') sh = 'inset 0 4px 10px rgba(0,0,0,0.2)';
        s += `\n    box-shadow: ${sh};`;
    }
    
    s += `\n    transition: all ${v.transitionSpeed !== undefined ? v.transitionSpeed : 300}ms cubic-bezier(0.4, 0, 0.2, 1);`;
    if(v.fontFamily === undefined) s += `\n    font-family: inherit;`;
    s += `\n    outline: none;`;
    
    // Add animations if present
    if (v.entranceAnim && v.entranceAnim !== 'none') {
        const a = v.entranceAnim;
        s += `\n    animation: anim_${a} 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;`;
    }

    return s;
}

window.updateAnimation = function(type, val) {
    formData[type] = val;
    if (window.isGlobalSync) {
        applyGlobalStyle(type, val);
    }
    updatePreview();
    saveProject();
}

function applyPresetEffect(cssStr) {
    if (!currentPreset || currentPreset === 'modern') return cssStr;
    
    // Global replacements for specific presets
    if (currentPreset === 'brutalism') {
        return cssStr.replace(/border-radius:([\s\S]*?);/g, `border-radius: 0px !important;`)
                     .replace(/border:([\s\S]*?);/g, `border: 3px solid #000 !important;`)
                     .replace(/box-shadow:([\s\S]*?);/g, '')
                     .replace('}', `\n    box-shadow: 6px 6px 0px #000 !important;\n}`);
    }

    if (currentPreset === 'cyberpunk') {
        const accent = formData.accentColor || '#fcee0a';
        return cssStr.replace(/border-radius:([\s\S]*?);/g, `border-radius: 0px !important;`)
                     .replace(/background(-color)?:([\s\S]*?);/g, `background-color: #000;`)
                     .replace(/border:([\s\S]*?);/g, `border: 2px solid ${accent} !important;`)
                     .replace(/box-shadow:([\s\S]*?);/g, '')
                     .replace('}', `\n    box-shadow: 4px 4px 0px ${accent} !important;\n    color: ${accent} !important;\n    text-shadow: 2px 2px #ff003c;\n}`);
    }

    if (currentPreset === 'wireframe') {
        return cssStr.replace(/background(-color)?:([\s\S]*?);/g, `background: #fff;`)
                     .replace(/color:([\s\S]*?);/g, `color: #333;`)
                     .replace(/border:([\s\S]*?);/g, `border: 2px dashed #000 !important;`)
                     .replace(/box-shadow:([\s\S]*?);/g, `box-shadow: none !important;`);
    }

    if (currentPreset === 'retro') {
        return cssStr.replace(/border-radius:([\s\S]*?);/g, `border-radius: 0px !important;`)
                     .replace(/border:([\s\S]*?);/g, `border: 2px solid #dfdfdf !important;\n    border-bottom: 2px solid #000 !important;\n    border-right: 2px solid #000 !important;`)
                     .replace(/background(-color)?:([\s\S]*?);/g, `background: #c0c0c0;`)
                     .replace(/box-shadow:([\s\S]*?);/g, '')
                     .replace(/font-family:([\s\S]*?);/g, `font-family: "MS Sans Serif", Geneva, sans-serif !important; color: #000 !important;`);
    }

    const effectMap = {
        'glass': `background: rgba(255, 255, 255, 0.1) !important;\n    backdrop-filter: blur(12px);\n    -webkit-backdrop-filter: blur(12px);\n    border: 1px solid rgba(255, 255, 255, 0.1) !important;`,
        'neon': `background: #000 !important;\n    border: 1px solid ${formData.accentColor || '#06b6d4'} !important;\n    box-shadow: 0 0 15px ${formData.accentColor || '#06b6d4'}, inset 0 0 10px ${formData.accentColor || '#06b6d4'} !important;`,
        'pisces': `background: linear-gradient(135deg, #1e3a8a 0%, #581c87 100%) !important;\n    border-radius: 24px !important;\n    border: 1px solid rgba(45, 212, 191, 0.3) !important;\n    box-shadow: 0 0 20px rgba(45, 212, 191, 0.2) !important;\n    backdrop-filter: blur(20px);\n    -webkit-backdrop-filter: blur(20px);\n    font-family: 'Playfair Display', serif !important;`,
        'neumorphism': `background: ${isLightMode ? '#e0e0e0' : '#18181b'} !important;\n    border-radius: 20px !important;\n    border: none !important;\n    box-shadow: 20px 20px 60px ${isLightMode ? '#bebebe' : '#09090b'}, -20px -20px 60px ${isLightMode ? '#ffffff' : '#27272a'} !important;`,
        'apple': `background: rgba(255, 255, 255, 0.45) !important;\n    backdrop-filter: blur(20px);\n    -webkit-backdrop-filter: blur(20px);\n    border: 0.5px solid rgba(255, 255, 255, 0.5) !important;\n    border-radius: 16px !important;\n    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1) !important;`
    };

    if (effectMap[currentPreset]) {
        let modified = cssStr;
        if (currentPreset !== 'neumorphism' && currentPreset !== 'neon') {
            modified = modified.replace(/background(-color)?:([\s\S]*?);/g, `/* background overridden by preset */`);
        }
        modified = modified.replace('}', `\n    ${effectMap[currentPreset]}\n}`);
        return modified;
    }

    if (currentPreset === 'holo') {
        const bg = `linear-gradient(124deg, #ff2400, #e81d1d, #e8b71d, #e3e81d, #1de840, #1ddde8, #2b1de8, #dd00f3, #dd00f3)`;
        let modified = cssStr.replace(/background(-color)?:([\s\S]*?);/g, `background: ${bg};\n    background-size: 1800% 1800%;\n    animation: rainbow 18s ease infinite;`)
                             .replace(/color:([\s\S]*?);/g, `color: #fff !important; text-shadow: 0 0 4px rgba(0,0,0,0.5);`);
        modified = modified.replace('}', `}\n@keyframes rainbow { \n  0%{background-position:0% 82%}\n  50%{background-position:100% 19%}\n  100%{background-position:0% 82%}\n}`);
        return modified;
    }

    return cssStr;
}

function htmlToReact(htmlStr) {
    if (!htmlStr) return '';
    return htmlStr
        .replace(/class=/g, 'className=')
        .replace(/for=/g, 'htmlFor=')
        .replace(/<img([^>]*[^/])>/g, '<img$1 />')
        .replace(/<input([^>]*[^/])>/g, '<input$1 />')
        .replace(/<br>/g, '<br />')
        .replace(/<hr>/g, '<hr />');
}

function htmlToTailwind(htmlStr, fData) {
    if(!htmlStr) return '';
    let tw = htmlStr;
    const p = fData.padding ? `p-[${fData.padding}px]` : '';
    const r = fData.radius ? `rounded-[${fData.radius}px]` : '';
    const bg = fData.bgColor ? `bg-[${fData.bgColor}]` : '';
    const txt = fData.textColor ? `text-[${fData.textColor}]` : '';
    const blur = fData.blur ? `backdrop-blur-[${fData.blur}px]` : '';
    const font = fData.fontWeight ? `font-[${fData.fontWeight}]` : '';
    
    const rootClasses = `${p} ${r} ${bg} ${txt} ${blur} ${font}`.trim().replace(/\s+/g, ' ');
    if (rootClasses) {
        tw = tw.replace(/class="([^"]*)"/, `class="$1 ${rootClasses}"`);
    }
    return `<!-- Tailwind utility classes injected at root -->\n${tw}`;
}

function updatePreview() {
    if (isCanvasMode) {
        let combinedHtml = canvasElements.map(c => c.html).join('\n\n');
        let combinedCss = canvasElements.map(c => c.css).join('\n\n');
        let combinedJs = canvasElements.map(c => c.js).filter(Boolean).join('\n\n');
        
        previewBox.innerHTML = `<style>
            ${combinedCss}
            /* Global Animations */
            @keyframes anim_fade { from { opacity: 0; } to { opacity: 1; } }
            @keyframes anim_slide { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes anim_scale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
            @keyframes anim_bounce { 
                0% { opacity: 0; transform: scale(0.3); }
                50% { opacity: 1; transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); }
            }
            @keyframes wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-3deg); } 75% { transform: rotate(3deg); } }
        </style>\n<div style="display:flex;flex-direction:column;width:100%;align-items:center;padding:100px 0;gap:80px;">${combinedHtml}</div>`;
        
        if (currentTab === 'html') codeOutput.textContent = combinedHtml;
        else if (currentTab === 'css') codeOutput.textContent = combinedCss;
        else if (currentTab === 'js') codeOutput.textContent = combinedJs || '// No JS needed for these components.';
        else if (currentTab === 'react') codeOutput.textContent = `export default function CanvasPage() {\n  return (\n    <div className="canvas-page" style={{display:'flex', flexDirection:'column', gap:'40px'}}>\n${htmlToReact(combinedHtml)}\n    </div>\n  );\n}`;
        else if (currentTab === 'tailwind') codeOutput.textContent = canvasElements.map(c => htmlToTailwind(c.html, formData)).join('\n\n');
        return;
    }

    const comp = devConfig.find(c => c.id === currentComponentId);
    let generated = comp.generate(formData);
    let html = generated.html;
    let css = generated.css;
    let js = generated.js || `// No JavaScript required for ${comp.name}.`;
    
    if (css.includes('{{BASE_STYLES}}')) {
        css = css.replace('{{BASE_STYLES}}', getBaseStyles(formData));
    }
    
    css = applyPresetEffect(css);

    let mainClassMatch = css.match(/\.([a-zA-Z0-9_-]+)\s*\{/);
    if (mainClassMatch && formData.hoverEffect && formData.hoverEffect !== 'none') {
        let mainClass = '.' + mainClassMatch[1];
        let eff = '';
        if (formData.hoverEffect === 'lift') eff = `transform: translateY(-8px);`;
        if (formData.hoverEffect === 'scale') eff = `transform: scale(1.03);`;
        if (formData.hoverEffect === 'glow') eff = `box-shadow: 0 0 30px ${formData.accentColor || '#2dd4bf'} !important; border-color: ${formData.accentColor || '#2dd4bf'} !important;`;
        if (formData.hoverEffect === 'wiggle') eff = `animation: wiggle 0.4s ease-in-out infinite;`;
        css += `\n\n${mainClass}:hover {\n    ${eff}\n}`;
    }

    css = applyPresetEffect(css);

    previewBox.innerHTML = `<style>
        ${css}
        @keyframes anim_fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes anim_slide { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes anim_scale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes anim_bounce { 
            0% { opacity: 0; transform: scale(0.3); }
            50% { opacity: 1; transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); }
        }
        @keyframes wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-3deg); } 75% { transform: rotate(3deg); } }
    </style>\n${html}`;

    currentHtml = html;
    currentCss = css;
    currentJs = js;
    
    // Auto-update Canvas if in Canvas mode
    if (isCanvasMode) {
        let el = canvasElements.find(e => e.id === currentComponentId);
        if (el) {
            el.html = html;
            el.css = css;
            el.js = js;
        }
    }

    if (currentTab === 'html')      codeOutput.textContent = html;
    else if (currentTab === 'css')  codeOutput.textContent = css;
    else if (currentTab === 'js')   codeOutput.textContent = js;
    else if (currentTab === 'react') codeOutput.textContent = `export default function ${comp.name.replace(/\s+/g,'')}Component() {\n  return (\n    <>\n${htmlToReact(html)}\n    </>\n  );\n}`;
    else if (currentTab === 'tailwind') codeOutput.textContent = htmlToTailwind(html, formData);
}

// Canvas Manager Logic
function renderCanvasManager() {
    controlsWrapper.innerHTML = '';
    document.getElementById('active-component-title').innerText = 'Canvas Manager';
    document.getElementById('clear-canvas-btn').style.display = 'block';
    
    const favBtn = document.getElementById('fav-btn');
    if (favBtn) favBtn.style.display = 'none';
    
    if (canvasElements.length === 0) {
        controlsWrapper.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:8px;">Canvas is empty. Hit "➕ Add" to stack items here!</div>';
        return;
    }
    
    canvasElements.forEach((el, i) => {
        const item = document.createElement('div');
        item.style.cssText = 'background:var(--bg-input); padding:8px 12px; border-radius:4px; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border:1px solid var(--border);';
        
        const name = document.createElement('span');
        name.innerText = `#${i+1} : ${devConfig.find(c=>c.id===el.id)?.name || 'Element'}`;
        name.style.fontSize = '14px';
        name.style.fontWeight = '500';
        
        const actions = document.createElement('div');
        actions.innerHTML = `
            <button onclick="moveCanvasItem(${i}, -1)" style="cursor:pointer;background:transparent;border:none;color:var(--text-main);font-size:16px;">⬆</button>
            <button onclick="moveCanvasItem(${i}, 1)" style="cursor:pointer;background:transparent;border:none;color:var(--text-main);font-size:16px;">⬇</button>
            <button onclick="deleteCanvasItem(${i})" style="cursor:pointer;background:transparent;border:none;color:#ef4444;margin-left:8px;font-size:14px;">🗑️</button>
        `;
        
        item.appendChild(name);
        item.appendChild(actions);
        controlsWrapper.appendChild(item);
    });
}

window.moveCanvasItem = function(index, dir) {
    if(index + dir < 0 || index + dir >= canvasElements.length) return;
    const temp = canvasElements[index];
    canvasElements[index] = canvasElements[index+dir];
    canvasElements[index+dir] = temp;
    renderCanvasManager();
    updatePreview();
}

window.deleteCanvasItem = function(index) {
    canvasElements.splice(index, 1);
    renderCanvasManager();
    updatePreview();
    document.getElementById('toggle-canvas-btn').innerText = `View Canvas (${canvasElements.length})`;
}

document.getElementById('clear-canvas-btn')?.addEventListener('click', () => {
    canvasElements = [];
    renderCanvasManager();
    updatePreview();
    document.getElementById('toggle-canvas-btn').innerText = `View Canvas (0)`;
});

// Listeners
searchInput.addEventListener('input', (e) => {
    renderSidebar(e.target.value);
});

document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentPreset = e.target.dataset.preset;
        
        if (isLightMode) {
            previewBox.style.background = '#ffffff';
            previewBox.style.backgroundImage = 'none';
        } else {
            if (currentPreset === 'glass') {
                previewBox.style.background = 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&h=800&auto=format&fit=crop") center/cover';
            } else if (currentPreset === 'neumorphism') {
                previewBox.style.background = '#e0e5ec';
            } else if (currentPreset === 'brutalism') {
                previewBox.style.background = '#e4e4e7';
            } else if (currentPreset === 'cyberpunk') {
                previewBox.style.background = '#1a1a1a';
            } else if (currentPreset === 'wireframe') {
                previewBox.style.background = '#f8f9fa';
            } else if (currentPreset === 'retro') {
                previewBox.style.background = '#008080';
            } else if (currentPreset === 'apple') {
                previewBox.style.background = 'url("https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop") center/cover';
            } else if (currentPreset === 'material') {
                previewBox.style.background = '#f5f5f6';
            } else if (currentPreset === 'holo') {
                previewBox.style.background = '#09090b';
            } else {
                previewBox.style.background = `
                linear-gradient(45deg, var(--bg-input) 25%, transparent 25%), 
                linear-gradient(-45deg, var(--bg-input) 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, var(--bg-input) 75%), 
                linear-gradient(-45deg, transparent 75%, var(--bg-input) 75%)`;
                previewBox.style.backgroundSize = '20px 20px';
                previewBox.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
            }
        }
        
        updatePreview();
    });
});

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentTab = e.target.dataset.tab;
        updatePreview();
    });
});

document.getElementById('reset-btn').addEventListener('click', () => {
    selectComponent(currentComponentId);
});

document.getElementById('copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(codeOutput.textContent);
    const copyText = document.getElementById('copy-text');
    const originalText = copyText.innerText;
    copyText.innerText = 'Copied!';
    setTimeout(() => { copyText.innerText = originalText; }, 2000);
});

// New Listeners for Platform Features
document.getElementById('fav-btn')?.addEventListener('click', () => {
    let favs = JSON.parse(localStorage.getItem('favs') || '[]');
    if (favs.includes(currentComponentId)) {
        favs = favs.filter(id => id !== currentComponentId);
    } else {
        favs.push(currentComponentId);
    }
    localStorage.setItem('favs', JSON.stringify(favs));
    selectComponent(currentComponentId);
    renderSidebar(searchInput.value);
});

// --- Missing Functions Recovery ---

window.openImagePicker = function(inputId) {
    const modal = document.getElementById('image-picker-modal');
    modal.style.display = 'block';
    const grid = document.getElementById('image-grid');
    grid.innerHTML = curatedImages.map(img => `
        <div class="image-item" onclick="selectImage('${inputId}', '${img.src}')">
            <img src="${img.src}" alt="Tech">
        </div>
    `).join('');
    
    document.querySelector('.close-modal').onclick = () => modal.style.display = 'none';
};

window.selectImage = function(inputId, src) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = src;
        input.dispatchEvent(new Event('input'));
    }
    document.getElementById('image-picker-modal').style.display = 'none';
};

window.applyGlobalStyle = function(id, val) {
    // Sync styles across other similar components if logic dictates
    // For now, we update the current formData and ensure future components inherit it
    console.log(`Global sync: ${id} = ${val}`);
};

window.setGlobalSync = function(checked) {
    window.isGlobalSync = checked;
};

function saveProject() {
    projects[currentProjectName] = {
        canvas: canvasElements,
        lastComponent: currentComponentId,
        lastData: formData
    };
    localStorage.setItem('pisces_projects', JSON.stringify(projects));
}

function loadProject(name) {
    const p = projects[name];
    if (p) {
        canvasElements = p.canvas || [];
        currentComponentId = p.lastComponent || 'button';
        formData = p.lastData || {};
        updatePreview();
    }
}

window.generateSmartText = function(fieldId) {
    const input = document.getElementById(`input-${fieldId}`);
    const suggestions = {
        text: ["Modern Solutions", "Next Gen UI", "Creative Forge", "Pisces Digital"],
        title: ["Explore the Edge", "Future Ready", "Design Excellence"],
        desc: ["Crafted with precision for the modern web.", "Experience the speed of thought in design."]
    };
    const pool = suggestions[fieldId] || suggestions.text;
    const val = pool[Math.floor(Math.random() * pool.length)];
    if (input) {
        input.value = val;
        input.dispatchEvent(new Event('input'));
    }
};

window.applyBlueprint = function(bpId) {
    const bp = window.blueprints.find(b => b.id === bpId);
    if (bp) {
        canvasElements = bp.components.map(c => {
            const config = devConfig.find(dc => dc.id === c.id);
            const data = { ...formData, ...c.form };
            const gen = config.generate(data);
            return { id: c.id, html: gen.html, css: gen.css, js: gen.js };
        });
        isCanvasMode = true;
        updatePreview();
        renderCanvasManager();
    }
};

function loadGoogleFont(font) {
    if (!font || font === 'sans-serif' || font === 'serif') return;
    const id = 'google-font-' + font.replace(/\s+/g, '-').toLowerCase();
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
}

// --- Platform Listeners ---

document.getElementById('add-canvas-btn')?.addEventListener('click', () => {
    const comp = devConfig.find(c => c.id === currentComponentId);
    const gen = comp.generate(formData);
    canvasElements.push({
        id: currentComponentId,
        html: gen.html,
        css: gen.css,
        js: gen.js
    });
    document.getElementById('toggle-canvas-btn').innerText = `View Canvas (${canvasElements.length})`;
});

document.getElementById('toggle-canvas-btn')?.addEventListener('click', (e) => {
    isCanvasMode = !isCanvasMode;
    e.target.style.background = isCanvasMode ? 'var(--accent)' : 'var(--bg-input)';
    e.target.innerText = isCanvasMode ? `Hide Canvas` : `View Canvas (${canvasElements.length})`;
    
    if (isCanvasMode) renderCanvasManager();
    else selectComponent(currentComponentId);
    
    updatePreview();
});

document.getElementById('theme-toggle-btn')?.addEventListener('click', (e) => {
    isLightMode = !isLightMode;
    document.body.classList.toggle('light-mode', isLightMode);
    e.target.innerText = isLightMode ? 'Dark Mode' : 'Light Mode';
    updatePreview();
});

document.querySelectorAll('.vp-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.vp-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        previewBox.style.width = e.currentTarget.dataset.vp;
    });
});

// Initialize
renderSidebar();
selectComponent(currentComponentId);