/**
 * AI Branding Utility
 * Analyzes an image to extract a cohesive color palette and suggest decorative styles.
 */

export const analyzeBrandImage = async (imageSrc) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colorCounts = {};
      let maxCount = 0;
      let dominantColor = '#1e293b'; // Default

      // Sample pixels (every 10th for performance)
      for (let i = 0; i < imageData.length; i += 40) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const rgb = `${r},${g},${b}`;
        
        // Skip too bright or too dark pixels for palette centers
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        if (brightness < 30 || brightness > 230) continue;

        colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
        if (colorCounts[rgb] > maxCount) {
          maxCount = colorCounts[rgb];
          dominantColor = `rgb(${rgb})`;
        }
      }

      const finalColor = dominantColor || 'rgb(255, 255, 255)'; // Default Pure White
      const match = finalColor.match(/\d+/g);
      const [r, g, b] = match ? match.map(Number) : [255, 255, 255];
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;

      // Select Luxury Style Template (Minimalist White 3.0)
      let styleTemplate = 'Pure Minimal';
      if (brightness < 120) {
        styleTemplate = 'Classic Aurum'; // Warm/Goldish
      } else {
        styleTemplate = 'Pure Minimal'; // Clean White
      }

      resolve({
        primaryColor: '#e67e22', // Warm Orange
        secondaryColor: '#3d2b1f', // Coffee Brown
        accentColor: '#f5f5dc', // Beige
        textColor: '#2c1e14', // Deep Warm Brown
        bgColor: '#fffaf0', // Warm White/Cream
        fontFamily: "'Tajawal', sans-serif",
        generatedAt: new Date().toISOString()
      });
    };

    img.onerror = (err) => reject(err);
    img.src = imageSrc; // Re-trigger for base64
  });
};

const calculateBrightness = (rgb) => {
  const match = rgb.match(/\d+/g);
  if (!match) return 128;
  const [r, g, b] = match.map(Number);
  return (r * 299 + g * 587 + b * 114) / 1000;
};
