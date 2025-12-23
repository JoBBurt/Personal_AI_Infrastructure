# Webflow Element Mapping Reference

Complete mapping from HTML/CSS to Webflow Designer elements and properties.

## Element Presets

### Layout Elements

| HTML | Webflow Preset | Usage | Notes |
|------|---------------|-------|-------|
| `<section>` | `Section` | Main page sections | Top-level container |
| `<div>` | `DivBlock` | Generic container | Most common element |
| `<header>` | `Section` + `tag: "header"` | Page header | Set semantic tag |
| `<footer>` | `Section` + `tag: "footer"` | Page footer | Set semantic tag |
| `<main>` | `Section` + `tag: "main"` | Main content | Set semantic tag |
| `<article>` | `Section` + `tag: "article"` | Article wrapper | Set semantic tag |
| `<aside>` | `Section` + `tag: "aside"` | Sidebar content | Set semantic tag |
| `<nav>` | `NavbarWrapper` | Navigation | Complete navbar component |

### Flex Containers

| CSS Display | Webflow Preset | Direction |
|------------|----------------|-----------|
| `flex; flex-direction: column` | `VFlex` | Vertical |
| `flex; flex-direction: row` | `HFlex` | Horizontal |
| `grid` | `Grid` | CSS Grid |

### Typography Elements

| HTML | Webflow Preset | Notes |
|------|---------------|-------|
| `<h1>` | `Heading` (level: 1) | Page title |
| `<h2>` | `Heading` (level: 2) | Section title |
| `<h3>` | `Heading` (level: 3) | Subsection title |
| `<h4>` | `Heading` (level: 4) | Card title |
| `<h5>` | `Heading` (level: 5) | Small heading |
| `<h6>` | `Heading` (level: 6) | Smallest heading |
| `<p>` | `Paragraph` | Body text |
| `<span>` | `TextBlock` | Inline text |
| `<blockquote>` | `Blockquote` | Quote block |
| Rich text container | `RichText` | CMS content |

### Interactive Elements

| HTML | Webflow Preset | Notes |
|------|---------------|-------|
| `<a>` (text) | `TextLink` | Inline link |
| `<a>` (block) | `LinkBlock` | Clickable container |
| `<button>` | `Button` | Button element |
| `<a class="btn">` | `LinkBlock` | Styled as button |

### Media Elements

| HTML | Webflow Preset | Notes |
|------|---------------|-------|
| `<img>` | `Image` | Static image |
| `<video>` | `Video` | Video player |
| `<iframe>` (YouTube) | `YouTube` | YouTube embed |
| Background image | DivBlock with bg-image | Set in styles |

### Form Elements

| HTML | Webflow Preset | Notes |
|------|---------------|-------|
| `<form>` | `FormForm` | Form container |
| `<input type="text">` | `FormTextInput` | Text input |
| `<input type="email">` | `FormTextInput` | Email input |
| `<input type="password">` | `FormTextInput` | Password input |
| `<textarea>` | `FormTextarea` | Multi-line text |
| `<select>` | `FormSelect` | Dropdown |
| `<input type="checkbox">` | `FormCheckboxInput` | Checkbox |
| `<input type="radio">` | `FormRadioInput` | Radio button |
| `<input type="file">` | `FormFileUploadWrapper` | File upload |
| `<button type="submit">` | `FormButton` | Submit button |
| `<label>` | `FormBlockLabel` | Form label |

### Navigation Components

| Component | Webflow Preset | Contains |
|-----------|---------------|----------|
| Full navbar | `NavbarWrapper` | Brand, menu, links |
| Dropdown menu | `DropdownWrapper` | Toggle, list |
| Tabs | `TabsWrapper` | Menu, content |
| Slider/Carousel | `SliderWrapper` | Slides, nav |
| Lightbox | `LightboxWrapper` | Trigger, content |
| Pagination | `Pagination` | Page numbers |

### CMS Elements

| Usage | Webflow Element | Notes |
|-------|----------------|-------|
| Dynamic list | `DynamoWrapper` | Collection list |
| CMS item template | Collection item | Inside DynamoWrapper |

---

## Style Property Mapping

### Display & Layout

| CSS Property | Webflow PropertyMap Key | Example Value |
|--------------|------------------------|---------------|
| `display` | `display` | `flex`, `grid`, `block`, `none` |
| `flex-direction` | `flexDirection` | `column`, `row` |
| `justify-content` | `justifyContent` | `center`, `space-between`, `flex-start` |
| `align-items` | `alignItems` | `center`, `stretch`, `flex-start` |
| `flex-wrap` | `flexWrap` | `wrap`, `nowrap` |
| `gap` | `gap` | `16px`, `2rem` |
| `grid-template-columns` | `gridTemplateColumns` | `repeat(3, 1fr)` |

### Spacing

| CSS Property | Webflow PropertyMap Key | Example Value |
|--------------|------------------------|---------------|
| `padding` | `padding` | `20px`, `20px 40px` |
| `padding-top` | `paddingTop` | `80px` |
| `padding-right` | `paddingRight` | `40px` |
| `padding-bottom` | `paddingBottom` | `80px` |
| `padding-left` | `paddingLeft` | `40px` |
| `margin` | `margin` | `0 auto` |
| `margin-top` | `marginTop` | `24px` |
| `margin-bottom` | `marginBottom` | `24px` |

### Sizing

| CSS Property | Webflow PropertyMap Key | Example Value |
|--------------|------------------------|---------------|
| `width` | `width` | `100%`, `300px` |
| `max-width` | `maxWidth` | `1200px` |
| `min-width` | `minWidth` | `320px` |
| `height` | `height` | `100vh`, `400px` |
| `max-height` | `maxHeight` | `600px` |
| `min-height` | `minHeight` | `100vh` |

### Typography

| CSS Property | Webflow PropertyMap Key | Example Value |
|--------------|------------------------|---------------|
| `font-family` | `fontFamily` | `Inter, system-ui, sans-serif` |
| `font-size` | `fontSize` | `16px`, `1.5rem` |
| `font-weight` | `fontWeight` | `400`, `600`, `bold` |
| `line-height` | `lineHeight` | `1.6`, `24px` |
| `letter-spacing` | `letterSpacing` | `-0.02em` |
| `text-align` | `textAlign` | `center`, `left`, `right` |
| `text-decoration` | `textDecoration` | `none`, `underline` |
| `text-transform` | `textTransform` | `uppercase`, `capitalize` |
| `color` | `color` | `#0a0a0a`, `rgba(0,0,0,0.8)` |

### Colors & Backgrounds

| CSS Property | Webflow PropertyMap Key | Example Value |
|--------------|------------------------|---------------|
| `background-color` | `backgroundColor` | `#ffffff` |
| `background-image` | `backgroundImage` | `url(...)`, `linear-gradient(...)` |
| `background-size` | `backgroundSize` | `cover`, `contain` |
| `background-position` | `backgroundPosition` | `center`, `top left` |
| `opacity` | `opacity` | `0.8`, `1` |

### Borders

| CSS Property | Webflow PropertyMap Key | Example Value |
|--------------|------------------------|---------------|
| `border` | `border` | `1px solid #e3e3e3` |
| `border-width` | `borderWidth` | `1px` |
| `border-style` | `borderStyle` | `solid`, `dashed` |
| `border-color` | `borderColor` | `#e3e3e3` |
| `border-radius` | `borderRadius` | `8px`, `50%` |
| `border-top` | `borderTop` | `1px solid #e3e3e3` |

### Effects

| CSS Property | Webflow PropertyMap Key | Example Value |
|--------------|------------------------|---------------|
| `box-shadow` | `boxShadow` | `0 4px 20px rgba(0,0,0,0.1)` |
| `transform` | `transform` | `translateY(-4px)` |
| `transition` | `transition` | `all 0.3s ease` |
| `overflow` | `overflow` | `hidden`, `auto` |

### Positioning

| CSS Property | Webflow PropertyMap Key | Example Value |
|--------------|------------------------|---------------|
| `position` | `position` | `relative`, `absolute`, `fixed` |
| `top` | `top` | `0`, `20px` |
| `right` | `right` | `0` |
| `bottom` | `bottom` | `0` |
| `left` | `left` | `0` |
| `z-index` | `zIndex` | `100`, `1000` |

---

## Common Patterns

### Centered Container

```typescript
const containerStyle = webflow.createStyle('container');
containerStyle.setProperties({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 40px',
  width: '100%'
});
```

### Flex Center (Both Axes)

```typescript
const flexCenterStyle = webflow.createStyle('flex-center');
flexCenterStyle.setProperties({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});
```

### Card with Hover Effect

```typescript
const cardStyle = webflow.createStyle('card');
cardStyle.setProperties({
  padding: '32px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e3e3e3',
  transition: 'all 0.3s ease'
});
// Note: Hover states require custom CSS or interactions
```

### Full-Screen Hero

```typescript
const heroStyle = webflow.createStyle('hero');
heroStyle.setProperties({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative'
});
```

### 3-Column Grid

```typescript
const gridStyle = webflow.createStyle('grid-3col');
gridStyle.setProperties({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '24px'
});
```

### Button Primary

```typescript
const btnPrimaryStyle = webflow.createStyle('btn-primary');
btnPrimaryStyle.setProperties({
  display: 'inline-block',
  padding: '16px 40px',
  backgroundColor: '#116dff',
  color: '#ffffff',
  borderRadius: '8px',
  fontWeight: '500',
  fontSize: '1rem',
  textDecoration: 'none',
  transition: 'all 0.2s ease'
});
```

---

## Responsive Breakpoints

Webflow uses these breakpoints:

| Name | Width | Designer API |
|------|-------|--------------|
| Desktop (default) | 992px+ | Base styles |
| Tablet | 768-991px | Tablet variant |
| Mobile Landscape | 480-767px | Mobile L variant |
| Mobile Portrait | 0-479px | Mobile P variant |

**Note:** Designer API primarily sets desktop styles. Use custom CSS with media queries for responsive overrides:

```css
/* In custom code head */
@media (max-width: 991px) {
  .grid-3col {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 767px) {
  .grid-3col {
    grid-template-columns: 1fr !important;
  }
}
```

---

## Limitations

### Not Supported via Designer API

- Pseudo-classes (`:hover`, `:focus`, `:active`) - Use custom CSS
- Media queries - Use custom CSS
- CSS animations (`@keyframes`) - Use Webflow interactions or custom CSS
- Component properties - Not yet available
- Cross-page access - Limited to current page

### Workarounds

**Hover effects:** Add via custom CSS:
```css
.btn-primary:hover {
  background-color: #0d5dd6;
  transform: translateY(-2px);
}
```

**Responsive grids:** Add via custom CSS:
```css
@media (max-width: 767px) {
  .grid-3col {
    grid-template-columns: 1fr;
  }
}
```
