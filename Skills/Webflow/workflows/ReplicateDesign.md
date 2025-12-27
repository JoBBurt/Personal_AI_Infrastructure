# ReplicateDesign Workflow

Analyze screenshots and inspect element data to generate comprehensive Webflow implementation - either via **direct MCP execution** or manual instructions.

## Trigger

User provides a screenshot and says:
- "Replicate this design in Webflow"
- "Recreate this in Webflow"
- "Convert this to Webflow"
- "Build this in Webflow"

## Execution Modes

| Mode | When to Use | Output |
|------|-------------|--------|
| **MCP Direct** | User has Designer open with Bridge App | Elements created directly on canvas |
| **Code Generation** | User wants TypeScript for later | Designer API code |
| **Manual Instructions** | No MCP/API setup | Step-by-step Webflow guide |

## Input Requirements

**Required:**
- Screenshot (PNG/JPG) of the design to replicate

**Optional (improves accuracy):**
- Inspect element HTML (outerHTML)
- Computed CSS styles
- Scope specification: "component" or "full-page"

## MCP Direct Execution (Preferred)

If Webflow MCP is available (`mcp__webflow_*` tools), execute directly:

### Prerequisites Check
1. Ask user: "Do you have the Webflow Designer open with the MCP Bridge App running?"
2. If yes → Use MCP tools to create elements directly
3. If no → Fall back to code generation or manual instructions

### MCP Execution Flow
```
1. Analyze screenshot → Extract design tokens
2. Call mcp__webflow_list_sites → Get available sites
3. Call mcp__webflow_get_site → Select target site
4. For each element in design:
   - mcp__webflow_create_style → Create CSS class
   - mcp__webflow_create_element → Add element to canvas
   - mcp__webflow_set_styles → Apply styles
5. Elements appear in real-time on canvas
```

## Workflow Steps

### Step 1: Acknowledge and Gather Input

```
Running the **ReplicateDesign** workflow from the **Webflow** skill...
```

If screenshot provided, proceed. If not, ask:
- "Please share a screenshot of the design you want to replicate."

Ask for optional enhancements:
- "Would you like to provide inspect element data for higher accuracy? (Copy the HTML and computed CSS from browser DevTools)"

### Step 2: Launch Specialized Agents

**CRITICAL: Launch agents in PARALLEL for speed**

For comprehensive replication, use this agent pattern:

```typescript
// Launch designer agent for visual analysis
Task({
  subagent_type: "designer",
  description: "Analyze screenshot design tokens [designer-webflow-1]",
  prompt: `Analyze this website screenshot for Webflow replication.

  Extract and document:
  1. **Color Palette**: All background, text, accent, and border colors (exact hex values)
  2. **Typography**: Font families, sizes, weights, line heights for each text style
  3. **Spacing System**: Padding, margin, and gap values used throughout
  4. **Layout Structure**: Flexbox vs Grid, container widths, alignment
  5. **Component Hierarchy**: DOM tree structure (sections, containers, elements)
  6. **Visual Effects**: Shadows, borders, border-radius, gradients

  Output as structured design tokens JSON.

  Reference: ${PAI_DIR}/Skills/Webflow/ElementMapping.md for Webflow element mapping.
  `
})

// Launch engineer agent for API code generation (if user wants API code)
Task({
  subagent_type: "engineer",
  description: "Generate Webflow Designer API code [engineer-webflow-1]",
  prompt: `Generate Webflow Designer API TypeScript code for this design.

  Using the design tokens from the screenshot, create:
  1. Style definitions with PropertyMap objects
  2. Element creation functions for each component
  3. Complete page builder function
  4. Setup and execution code

  Follow the patterns in: ${PAI_DIR}/Skills/Webflow/workflows/GenerateAPICode.md
  Reference element mappings: ${PAI_DIR}/Skills/Webflow/ElementMapping.md
  `
})

// Optional: Launch researcher if Webflow docs needed
Task({
  subagent_type: "perplexity-researcher",
  description: "Research Webflow API features [perplexity-webflow-1]",
  prompt: "Research the latest Webflow Designer API capabilities for [specific feature]. Find documentation on [element type] creation and styling."
})
```

### Step 2b: Vision Analysis (if not using designer agent)

If handling directly without designer agent, analyze the screenshot to extract:

#### 2.1 Layout Structure
- Overall page structure (header, hero, sections, footer)
- Layout type (flexbox vs grid)
- Container widths and max-widths
- Spacing patterns (padding, margins, gaps)

#### 2.2 Component Identification
Identify component types:
- Navigation bars
- Hero sections
- Cards (portfolio, team, feature, etc.)
- Grids and galleries
- Forms
- Buttons and CTAs
- Footers

#### 2.3 Design Tokens
Extract design system values:
- **Colors**: Background, text, accent, border colors
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Padding, margin, gap values
- **Effects**: Shadows, borders, border-radius

#### 2.4 Element Hierarchy
Map the DOM structure:
```
Section
├── Container
│   ├── Heading
│   ├── Text
│   └── Button
└── ...
```

### Step 3: Design Token Generation

Generate structured JSON:

```json
{
  "designTokens": {
    "colors": {
      "background": {
        "primary": "#ffffff",
        "secondary": "#fafbfc",
        "card": "#ffffff"
      },
      "text": {
        "primary": "#0a0a0a",
        "secondary": "#333333",
        "muted": "#6b7280"
      },
      "brand": {
        "primary": "#116dff",
        "hover": "#0d5dd6"
      }
    },
    "typography": {
      "fontFamily": "Inter, system-ui, sans-serif",
      "scale": {
        "hero": "clamp(2.5rem, 8vw, 8.75rem)",
        "h1": "clamp(2rem, 5vw, 5rem)",
        "h2": "clamp(1.75rem, 4vw, 4rem)",
        "h3": "clamp(1.25rem, 2.5vw, 2.5rem)",
        "body": "1rem",
        "small": "0.875rem"
      }
    },
    "spacing": {
      "section": "80px",
      "container": "40px",
      "component": "24px",
      "element": "16px"
    },
    "effects": {
      "borderRadius": "12px",
      "shadow": "0 4px 20px rgba(0,0,0,0.1)"
    }
  }
}
```

### Step 4: Element Mapping

Map identified elements to Webflow presets:

| Detected Element | Webflow Element | Class Name |
|-----------------|-----------------|------------|
| Page wrapper | Section | `.page-wrapper` |
| Header | Navbar Wrapper | `.site-header` |
| Hero section | Section | `.hero-section` |
| Content container | Div Block | `.container` |
| Main heading | Heading | `.heading-hero` |
| Paragraph | Paragraph | `.body-large` |
| Primary button | Link Block | `.btn .btn-primary` |
| Card | Div Block | `.card` |
| Grid | Grid | `.grid-3col` |
| Image | Image | `.card__image` |
| Footer | Section | `.site-footer` |

### Step 5: Generate Manual Instructions

Output step-by-step Webflow Designer instructions:

---

## Webflow Implementation Instructions

### Phase 1: Design System Setup

#### Color Swatches
Add these colors in Webflow Designer → Style Panel → Color Swatches:

```
Background Colors:
- BG Primary: #ffffff
- BG Secondary: #fafbfc
- BG Card: #ffffff

Text Colors:
- Text Primary: #0a0a0a
- Text Secondary: #333333
- Text Muted: #6b7280

Brand Colors:
- Brand Primary: #116dff
- Brand Hover: #0d5dd6
```

#### Typography Setup
1. Go to Project Settings → Fonts
2. Add Google Font: **Inter** (weights: 400, 500, 600)

#### Base Text Classes
Create these classes with settings:

`.heading-hero`:
- Font: Inter, Weight: 600
- Size: 8.75rem (responsive via custom code)
- Line height: 1.1
- Color: Text Primary

`.body-large`:
- Font: Inter, Weight: 400
- Size: 1.5rem
- Line height: 1.6
- Color: Text Secondary

### Phase 2: Build Components

#### Component: [Name]

**Structure:**
```
[Element tree here]
```

**Styling:**
`.class-name`:
- [CSS properties]

[Repeat for each component]

### Phase 3: Build Page

#### Section 1: [Name]

1. Add Section element
2. Add class: `.[section-name]`
3. Set styles:
   - [Properties]
4. Add children:
   - [Element list]

[Repeat for each section]

### Phase 4: Custom Code

**Head Code:**
```html
<style>
[Custom CSS here]
</style>
```

**Footer Code:**
```html
<script>
[Custom JS here]
</script>
```

---

### Step 6: Generate Designer API Code (Optional)

If user wants programmatic approach, also generate:

```typescript
// Webflow Designer API Code
import webflow from 'webflow-api';

// 1. Create Styles
const heroStyle = webflow.createStyle('hero-section');
heroStyle.setProperties({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#ffffff',
  padding: '40px'
});

// 2. Create Elements
const heroSection = webflow.createElement('Section');
heroSection.setStyles([heroStyle]);

// 3. Add to Canvas
webflow.root.appendChild(heroSection);

// 4. Create Child Elements
const container = webflow.createElement('DivBlock');
const containerStyle = webflow.createStyle('hero-container');
containerStyle.setProperties({
  maxWidth: '900px',
  textAlign: 'center'
});
container.setStyles([containerStyle]);
heroSection.appendChild(container);
```

### Step 7: Output Summary

Provide:
1. **Design Tokens JSON** - for reference
2. **Manual Instructions** - step-by-step guide
3. **Designer API Code** (if requested)
4. **Accuracy estimate** based on input quality

## Output Format

```markdown
# Webflow Replication: [Design Name]

## Design Analysis Summary
- Layout Type: [Flexbox/Grid]
- Components Identified: [List]
- Estimated Accuracy: [75-95%]

## Design Tokens
[JSON block]

## Implementation Instructions

### Phase 1: Design System
[Color, typography, spacing setup]

### Phase 2: Components
[Component build instructions]

### Phase 3: Page Structure
[Section-by-section instructions]

### Phase 4: Custom Code
[CSS and JS snippets]

## Designer API Code (Optional)
[TypeScript code for Webflow Apps]

## Notes & Limitations
- [What may need manual adjustment]
- [Features not captured from screenshot]
```

## Example Reference

See `/Users/jobburt/lifespan-vision-ventures-redesign/WEBFLOW-IMPLEMENTATION-GUIDE.md` for a complete example of the output format and level of detail expected.

## Accuracy Expectations

| Input | Accuracy | Notes |
|-------|----------|-------|
| Screenshot only | 75-85% | Colors may be approximate |
| + HTML structure | 85-90% | Element types accurate |
| + Computed CSS | 90-95% | Exact values |
| + Inspect bundle | 95%+ | Near-perfect |
