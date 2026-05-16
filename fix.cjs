const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Undo the asyncHandler wrap
content = content.replace(/asyncHandler\(async \((req[^)]*)\) => \{/g, 'async ($1) => {');

// The closing parens were NOT modified, so they remain `});`, which is correct without asyncHandler!
// We will just write it back! Wait, I just need to remove asyncHandler entirely! But then I need to handle errors manually or inside a generic middleware?
// Express 5 handles async errors natively. I don't need asyncHandler if it's express 5! Wait, is it express 5? "express": "^4.19.2", so no.

content = content.replace(/const asyncHandler = \[\^\]\+?;/, '');

fs.writeFileSync('server.ts', content);
console.log('Reverted asyncHandler');
