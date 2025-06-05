// Simple PWA icon generator - creates placeholder icons with 🔥 emoji
// In production, replace these with professionally designed icons

const fs = require('fs');
const path = require('path');

// Ensure icons directory exists
const iconsDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

// Icon sizes required for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple SVG with fire emoji
const createSVG = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#22c55e"/>
  <text x="50%" y="50%" font-size="${size * 0.6}" text-anchor="middle" dominant-baseline="middle" fill="white">🔥</text>
</svg>`;

// Create placeholder icons
console.log('Creating placeholder PWA icons...');
iconSizes.forEach(size => {
    const filename = path.join(iconsDir, `icon-${size}x${size}.svg`);
    fs.writeFileSync(filename, createSVG(size));
    console.log(`Created ${filename}`);
});

// Create special icons
const specialIcons = [
    { name: 'icon-180x180.svg', size: 180 }, // iOS
    { name: 'shortcut-nearby.svg', size: 96 },
    { name: 'shortcut-favorites.svg', size: 96 },
    { name: 'badge-72x72.svg', size: 72 },
    { name: 'action-explore.svg', size: 48 },
    { name: 'action-close.svg', size: 48 }
];

specialIcons.forEach(({ name, size }) => {
    const filename = path.join(iconsDir, name);
    fs.writeFileSync(filename, createSVG(size));
    console.log(`Created ${filename}`);
});

// Create a simple favicon.ico placeholder
const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#22c55e"/>
  <text x="50%" y="50%" font-size="20" text-anchor="middle" dominant-baseline="middle" fill="white">🔥</text>
</svg>`;
fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), faviconSVG);

console.log('\nNote: These are placeholder icons. For production, convert to PNG format and create proper maskable icons.');
console.log('You can use tools like:');
console.log('- https://realfavicongenerator.net/');
console.log('- https://maskable.app/');
console.log('- https://www.pwabuilder.com/imageGenerator');