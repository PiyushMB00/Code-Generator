const fs = require('fs');
const content = fs.readFileSync('components.js');
let decoded = '';
for (let i = 0; i < content.length; i++) {
    if (content[i] >= 32 && content[i] <= 126 || content[i] === 10 || content[i] === 13 || content[i] === 9) {
        decoded += String.fromCharCode(content[i]);
    }
}
fs.writeFileSync('components_recovered.js', decoded);
console.log('Recovery script complete.');
