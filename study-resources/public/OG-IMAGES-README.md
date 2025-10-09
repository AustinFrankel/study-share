# Open Graph Images Guide

## Current Status
The application currently references placeholder SVG files for Open Graph images:
- `/og-image.svg` - Main OG image (1200x630)
- `/twitter-image.svg` - Twitter card image (1200x675)

## Why PNG is Better
While SVG files are provided as placeholders, **PNG format is strongly recommended** for Open Graph images because:
1. Better compatibility across social platforms (Facebook, LinkedIn, Twitter)
2. Guaranteed rendering consistency
3. Some platforms don't support SVG for OG images

## Recommended: Create PNG Versions

### Option 1: Convert SVG to PNG (Quick)
Use any of these free tools:
- [CloudConvert](https://cloudconvert.com/svg-to-png) - Online converter
- ImageMagick: `convert og-image.svg -resize 1200x630 og-image.png`
- Inkscape: Export SVG as PNG at 1200x630px

### Option 2: Design Custom Images (Recommended)
Create professional Open Graph images with:

**Tools:**
- [Canva](https://www.canva.com/) - Free templates for social media
- [Figma](https://www.figma.com/) - Design tool with OG templates
- [Adobe Express](https://www.adobe.com/express/) - Quick social graphics

**Specifications:**
- **Main OG Image**: 1200x630px (Facebook, LinkedIn)
- **Twitter Card**: 1200x675px (1.91:1 ratio)
- **File format**: PNG or JPG
- **Max file size**: < 5MB (ideally < 300KB)

**Design Tips:**
1. Include your logo
2. Use high contrast text (white on dark or vice versa)
3. Keep critical content in center 1200x600px "safe zone"
4. Include your domain/branding
5. Test on multiple devices

## Required Images

Create these files in `/public/`:

```bash
public/
├── og-image.png          # Default OG image (1200x630)
├── twitter-image.png     # Twitter card (1200x675)
├── og-live.png          # Live countdown page (1200x630)
├── twitter-live.png     # Live countdown Twitter (1200x675)
└── logo.png             # Site logo for schema markup
```

## Testing Your Images

After creating PNG versions:

1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **LinkedIn Inspector**: https://www.linkedin.com/post-inspector/

## Current References in Code

These files reference OG images:
- `/src/app/layout.tsx` - Main site metadata
- `/src/app/live/layout.tsx` - Live page specific images
- `/src/app/resource/[id]/layout.tsx` - Dynamic resource pages

## Quick Start

1. Convert the SVG placeholders to PNG:
   ```bash
   # If you have ImageMagick installed
   convert public/og-image.svg -resize 1200x630 public/og-image.png
   convert public/twitter-image.svg -resize 1200x675 public/twitter-image.png
   ```

2. Or download free templates from Canva and customize them

3. Upload all PNG files to `/public/` directory

4. Test your links with the social media debugger tools above

## Example: Good OG Image
- Clear branding ("StudyShare")
- Descriptive subtitle ("Student Study Resources")
- Relevant icon/graphic (📚 book emoji or custom icon)
- Gradient or solid background for contrast
- Domain name for attribution

Your social share previews will look much more professional!
