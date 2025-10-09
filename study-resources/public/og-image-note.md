# OG Image Generation Instructions

The og-image.png and twitter-image.png files need to be created from the existing SVG files.

## Requirements:
- **og-image.png**: 1200x630px (Open Graph standard)
- **twitter-image.png**: 1200x675px (Twitter card standard)

## How to Generate:

### Option 1: Using Online SVG to PNG Converter
1. Go to https://cloudconvert.com/svg-to-png or similar service
2. Upload `og-image.svg` and convert to PNG at 1200x630px
3. Upload `twitter-image.svg` and convert to PNG at 1200x675px
4. Save as `og-image.png` and `twitter-image.png` in this directory

### Option 2: Using Figma/Photoshop
1. Import the SVG files
2. Set canvas size to 1200x630px (OG) and 1200x675px (Twitter)
3. Export as PNG with high quality
4. Save in this directory

### Option 3: Using Command Line (requires ImageMagick)
```bash
# Install ImageMagick first: brew install imagemagick
convert og-image.svg -resize 1200x630 og-image.png
convert twitter-image.svg -resize 1200x675 twitter-image.png
```

## Temporary Workaround:
Until proper PNG images are created, the SVG versions will be used. Modern browsers and social media platforms support SVG, but PNG is recommended for maximum compatibility.

## Content Guidelines:
- Include the StudyShare logo
- Add tagline: "Share & Discover Study Resources"
- Use brand colors (indigo/purple gradient)
- Include visual elements that represent studying/learning
- Keep text readable at small sizes
