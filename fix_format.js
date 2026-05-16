const fs = require('fs');
let html = fs.readFileSync('course.html', 'utf8');

// Fix broken template literal interpolations
html = html.replace(/\$\s+\{/g, '${');

// Fix broken HTML tags with spaces after <
html = html.replace(/<\s+([a-zA-Z\/])/g, '<$1');

// Fix broken HTML comments
html = html.replace(/<\s+!\s*--/g, '<!--');

fs.writeFileSync('course.html', html);
console.log('Fixed format');
