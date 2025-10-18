# Project Images

## 🚨 IMPORTANT - Replace These Images

When setting up a new project, you **MUST** replace the following images with your own:

### Required Images

1. **`logo.png`** - Your project logo
   - Used in: Navbar, emails, metadata
   - Recommended size: 512x512px or larger
   - Format: PNG with transparency preferred
   - Current: Placeholder (replace immediately)

2. **`icon.png`** - Your project favicon/icon
   - Used in: Browser tab, PWA icon, bookmarks
   - Recommended size: 512x512px
   - Format: PNG
   - Current: Placeholder (replace immediately)

### Protected Files

These files are marked as **protected** in `.gitattributes`:
- `logo.png` - merge=theirs (your version kept)
- `icon.png` - merge=theirs (your version kept)

This means when you update from the boilerplate upstream, your custom images will **NEVER** be overwritten.

### Boilerplate Images

- **`stripe.svg`** - Stripe logo (boilerplate managed, do not modify)

---

## 📦 Quick Setup

1. Create your logo and icon images
2. Replace `logo.png` and `icon.png` in this directory
3. Update `src/site-config.js` if using different paths
4. Commit your changes

```bash
# Example
cp /path/to/my-logo.png public/images/logo.png
cp /path/to/my-icon.png public/images/icon.png
git add public/images/
git commit -m "Add project branding images"
```

---

## 🎨 Design Tips

**Logo (`logo.png`):**
- Clear and readable at small sizes
- Works on both light and dark backgrounds
- Square or landscape orientation
- High contrast colors

**Icon (`icon.png`):**
- Simple, recognizable symbol
- Works at 16x16px (browser tab size)
- Square aspect ratio (1:1)
- Solid background or transparency

---

See `.github/SETUP_NEW_PROJECT.md` for complete setup instructions.
