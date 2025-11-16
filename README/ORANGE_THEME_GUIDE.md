# Panduan Tema Orange Shadcn/UI untuk School Bell System

## Overview

Dokumentasi ini menjelaskan implementasi tema orange dengan gaya shadcn/ui untuk School Bell Management System. Tema ini dirancang untuk memberikan tampilan yang modern, konsisten, dan user-friendly dengan warna orange sebagai aksen utama.

## Struktur File

### CSS Files
- `static/css/shadcn-orange.css` - File utama tema shadcn/ui orange
- `static/css/style.css` - File CSS utama yang diintegrasikan dengan tema orange
- `static/css/pwa.css` - CSS khusus untuk PWA dengan tema orange

### Template Files
- `templates/base.html` - Template base dengan tema orange
- `templates/index.html` - Dashboard dengan tema orange
- `templates/pwa.html` - Interface PWA dengan tema orange

### Konfigurasi
- `static/manifest.json` - PWA manifest dengan tema orange

## Warna Tema

### Primary Colors (Orange)
- `--orange-50: #fff7ed`
- `--orange-100: #ffedd5`
- `--orange-200: #fed7aa`
- `--orange-300: #fdba74`
- `--orange-400: #fb923c`
- `--orange-500: #f97316`
- `--orange-600: #ea580c` (Primary)
- `--orange-700: #c2410c` (Hover)
- `--orange-800: #9a3412` (Active)
- `--orange-900: #7c2d12`
- `--orange-950: #431407`

### Status Colors
- Success: `#10b981`
- Warning: `#f59e0b`
- Error: `#ef4444`
- Info: `#3b82f6`

### Neutral Colors
- Background: `#ffffff`
- Foreground: `#0f172a`
- Muted: `#f8fafc`
- Border: `#e2e8f0`

## Komponen UI

### Buttons
- **Primary Button**: Background orange dengan hover yang lebih gelap
- **Secondary Button**: Background abu-abu muda
- **Outline Button**: Border orange dengan background transparan
- **Ghost Button**: Transparan dengan hover orange

### Cards
- Border radius konsisten (`--radius`)
- Shadow yang halus (`--shadow`, `--shadow-md`, `--shadow-lg`)
- Background putih dengan border yang jelas
- Hover effect dengan transform dan shadow

### Forms
- Input fields dengan border yang konsisten
- Focus states dengan orange ring
- Rounded corners yang konsisten
- Placeholder text dengan warna muted

### Tables
- Header dengan background muted
- Hover effects pada rows
- Border yang konsisten
- Responsive design

### Modals
- Backdrop blur effect
- Rounded corners
- Shadow yang menonjol
- Smooth animations

## Animasi

### Keyframes
- `fadeIn`: Fade in dengan translateY
- `slideIn`: Slide dari kiri
- `scaleIn`: Scale dari kecil ke normal
- `pulse`: Pulse effect untuk status indicators

### Transitions
- Semua interactive elements memiliki `transition: all 0.15s ease-in-out`
- Hover effects dengan transform dan shadow changes
- Smooth color transitions

## Responsive Design

### Breakpoints
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

### Mobile Optimizations
- Touch-friendly buttons (min 44px)
- Safe area support untuk notched devices
- Optimized spacing untuk mobile
- Simplified layouts pada layar kecil

## Dark Mode Support

### Implementation
- CSS variables untuk easy theming
- `@media (prefers-color-scheme: dark)` untuk auto dark mode
- Consistent color mapping untuk dark theme

### Dark Mode Colors
- Background: `#0f172a`
- Card: `#1e293b`
- Border: `#334155`
- Text: `#f8fafc`

## Accessibility

### Contrast Ratios
- Semua text combinations memenuhi WCAG AA
- Interactive elements memiliki contrast yang baik
- Focus states yang jelas

### Screen Reader Support
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support

## Customization

### Mengubah Warna Primary
```css
:root {
    --primary: #your-orange-color;
    --primary-hover: #your-darker-orange;
    --primary-active: #your-darkest-orange;
}
```

### Mengubah Border Radius
```css
:root {
    --radius: 0.75rem; /* Default: 0.5rem */
}
```

### Mengubah Shadows
```css
:root {
    --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Fallbacks
- CSS variables dengan fallback values
- Progressive enhancement
- Graceful degradation

## Performance

### Optimization
- Minimal CSS duplication
- Efficient animations
- Optimized gradients
- Minimal reflows

### Best Practices
- Use `transform` untuk animasi
- Avoid layout thrashing
- Optimize paint operations
- Minimize CSS file size

## Testing

### Manual Testing Checklist
- [ ] All color combinations visible
- [ ] Hover states working
- [ ] Focus states accessible
- [ ] Mobile touch targets
- [ ] Dark mode switching
- [ ] Responsive layouts
- [ ] Animation smoothness

### Automated Testing
- Contrast ratio validation
- Accessibility audit
- Performance metrics
- Cross-browser testing

## Troubleshooting

### Common Issues

#### Colors Not Applying
1. Check CSS import order
2. Verify CSS variables are defined
3. Clear browser cache
4. Check for CSS specificity conflicts

#### Responsive Issues
1. Verify viewport meta tag
2. Check media queries
3. Test with dev tools device simulation
4. Validate HTML structure

#### Animation Performance
1. Use `transform` instead of position changes
2. Add `will-change` property
3. Reduce animation complexity
4. Test on lower-end devices

## Future Enhancements

### Planned Features
- [ ] Theme switcher (multiple color options)
- [ ] Custom color picker
- [ ] Animation preferences
- [ ] High contrast mode
- [ ] Reduced motion preferences

### Technical Debt
- [ ] Consolidate duplicate CSS
- [ ] Optimize bundle size
- [ ] Improve CSS organization
- [ ] Add CSS custom properties for more flexibility

## Contributing

### Adding New Components
1. Follow existing naming conventions
2. Use CSS variables for colors
3. Include responsive design
4. Add accessibility features
5. Document usage examples

### Color Guidelines
- Use orange palette for primary actions
- Reserve green for success states
- Use red for errors/dangers
- Apply blue for informational content
- Maintain consistent contrast ratios

## Resources

### Design Tools
- [Figma](https://figma.com/) template
- [Adobe Color](https://color.adobe.com/) palette
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Documentation
- [Shadcn/UI Documentation](https://ui.shadcn.com/)
- [CSS Variables Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Maintainer**: School Bell Development Team