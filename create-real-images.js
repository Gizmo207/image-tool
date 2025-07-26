const fs = require('fs');
const path = require('path');

// Simple 1x1 pixel red PNG in base64
const redPixelPNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

// Simple 1x1 pixel blue PNG in base64  
const bluePixelPNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Simple 2x2 transparent PNG
const transparentPNG = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIHWNgYGBgYGBgAGIDEAADUgBG4gFNPAAAAABJRU5ErkJggg==';

// Simple JPEG header for "corrupt" file
const corruptJPEG = '/9j/4AAQSkZJRgABAQEAAAAAAAD//gA+Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2ODIpLCBkZWZhdWx0IHF1YWxpdHkK/9sAQwAIBgYHBgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0YMiEcITIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/8AAEQgAAQABAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBkQgUQqGxwdHwJDNicoIUKxYWGyQ5MxwjN0E=';

const assetsDir = path.join(__dirname, 'test-assets');

// Create real image files from base64
fs.writeFileSync(path.join(assetsDir, 'small.png'), Buffer.from(redPixelPNG, 'base64'));
fs.writeFileSync(path.join(assetsDir, 'large.png'), Buffer.from(bluePixelPNG, 'base64'));
fs.writeFileSync(path.join(assetsDir, 'transparency.png'), Buffer.from(transparentPNG, 'base64'));
fs.writeFileSync(path.join(assetsDir, 'corrupt.jpg'), Buffer.from(corruptJPEG, 'base64'));

console.log('✅ Real image files created successfully');
console.log('📁 Files created:');
console.log('  - small.png (1x1 red)');
console.log('  - large.png (1x1 blue)');  
console.log('  - transparency.png (2x2 transparent)');
console.log('  - corrupt.jpg (partial JPEG data)');
console.log('  - not-an-image.txt (text file)');
