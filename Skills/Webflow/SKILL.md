---
name: Webflow
description: Screenshot-to-Webflow design replication system with DIRECT API execution. Analyzes website screenshots and inspect element data, then executes designs directly in Webflow via MCP. USE WHEN user wants to replicate a website design in Webflow, provides a screenshot for Webflow conversion, asks to recreate a website element or page in Webflow, OR mentions copying a design to Webflow.
---

# Webflow

Screenshot-to-Webflow design replication using Claude's vision capabilities, specialized agents, and **direct MCP execution**.

## MCP Integration (Direct Execution)

**The Webflow MCP server is configured at `~/.claude/.mcp.json`** and provides:

| Capability | MCP Tools | Description |
|------------|-----------|-------------|
| **Designer API** | `mcp__webflow_*` | Create elements, styles, components directly on canvas |
| **Data API** | `mcp__webflow_*` | Manage CMS content, pages, sites |
| **Real-time Sync** | Via Bridge App | Live canvas updates while designing |

### Designer API Requirements

To use Designer API tools (element creation, styling):
1. Open your Webflow site in the Designer
2. Press `E` to open the Apps panel
3. Launch **Webflow MCP Bridge App**
4. Now MCP tools can modify the canvas in real-time

### Quick Start

```
User: "Replicate this hero section in Webflow" [screenshot]

→ Analyze screenshot with vision
→ Extract design tokens
→ Call mcp__webflow_* tools to create elements directly
→ Elements appear on canvas in real-time
```

## Agent Routing

**This skill leverages specialized agents for different aspects of the work:**

| Agent | When to Use | Task Focus |
|-------|-------------|------------|
| **designer** | Design analysis, visual hierarchy, spacing | Analyze screenshot for design tokens, typography, color palette |
| **engineer** | API code generation, technical implementation | Generate Webflow Designer API TypeScript code |
| **perplexity-researcher** | Documentation lookup | Research latest Webflow API features or troubleshoot issues |

### Agent Launch Pattern

```typescript
// For comprehensive design replication, launch agents in PARALLEL:
Task({
  subagent_type: "designer",
  description: "Analyze design tokens [designer-webflow-1]",
  prompt: "Analyze this screenshot and extract: colors, typography, spacing, layout structure, component hierarchy..."
})

Task({
  subagent_type: "engineer",
  description: "Generate Webflow API code [engineer-webflow-1]",
  prompt: "Using these design tokens, generate Webflow Designer API TypeScript code..."
})
```

## Workflow Routing

**When executing a workflow, do BOTH of these:**

1. **Call the notification script** (for observability tracking):
   ```bash
   ~/.claude/Tools/SkillWorkflowNotification WORKFLOWNAME Webflow
   ```

2. **Output the text notification** (for user visibility):
   ```
   Running the **WorkflowName** workflow from the **Webflow** skill...
   ```

| Workflow | Trigger | File |
|----------|---------|------|
| **ReplicateDesign** | "replicate this design", "recreate in webflow", screenshot provided | `workflows/ReplicateDesign.md` |
| **GenerateAPICode** | "generate webflow api code", "designer api" | `workflows/GenerateAPICode.md` |

---

## Examples

**Example 1: Replicate a hero section from screenshot**
```
User: "Replicate this hero section in Webflow" [attaches screenshot]
→ Invokes ReplicateDesign workflow
→ Analyzes screenshot: identifies layout, colors, typography, spacing
→ Generates design tokens JSON
→ Outputs: Manual Webflow instructions + Designer API code
```

**Example 2: Convert full page with inspect element data**
```
User: "Convert this landing page to Webflow" [screenshot + HTML/CSS]
→ Invokes ReplicateDesign workflow
→ Uses inspect data for exact CSS values (90-95% accuracy)
→ Maps all elements to Webflow presets
→ Outputs: Complete page structure with all styles
```

**Example 3: Generate only Designer API code**
```
User: "Just give me the Webflow API code for this card component"
→ Invokes GenerateAPICode workflow
→ Analyzes component structure
→ Outputs: TypeScript code for Webflow Designer Extension
```

---

## Quick Reference

### Input Requirements

| Input | Required | Improves Accuracy |
|-------|----------|-------------------|
| Screenshot (PNG/JPG) | YES | Baseline 75-85% |
| Inspect element HTML | Optional | +10% accuracy |
| Computed CSS styles | Optional | Exact values |
| Target scope | Optional | Focuses output |

### Scope Options

- **component** - Single section: hero, navbar, card, footer
- **full-page** - Complete page layout with multiple sections

### Output Formats

1. **Manual Instructions** - Step-by-step Webflow Designer guide
2. **Designer API Code** - TypeScript for Webflow Apps/Extensions
3. **Design Tokens JSON** - Intermediate representation for reference

---

## Webflow Designer API Quick Reference

### Element Presets (Common)

| HTML Element | Webflow Preset | Usage |
|--------------|----------------|-------|
| `<section>` | `Section` | Main layout containers |
| `<div>` | `DivBlock` | Generic containers |
| `<header>` | `Section` + `tag: "header"` | Semantic header |
| `<nav>` | `NavbarWrapper` | Navigation bars |
| `<h1>`-`<h6>` | `Heading` | Headings (level configurable) |
| `<p>` | `Paragraph` | Text blocks |
| `<span>` | `TextBlock` | Inline text |
| `<a>` | `TextLink` or `LinkBlock` | Links |
| `<img>` | `Image` | Images (requires asset) |
| `<button>` | `Button` | Buttons |
| `<form>` | `FormForm` | Forms |
| `<input>` | `FormTextInput` | Form inputs |
| Flex (vertical) | `VFlex` | Vertical flex container |
| Flex (horizontal) | `HFlex` | Horizontal flex container |
| Grid | `Grid` | CSS Grid |

### Style Properties (PropertyMap)

```typescript
// Common CSS → Webflow PropertyMap
{
  backgroundColor: "#ffffff",
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "500",
  fontFamily: "Inter, system-ui, sans-serif",
  lineHeight: "1.5",
  padding: "20px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: "16px",
  width: "100%",
  maxWidth: "1200px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
}
```

### Designer API Code Pattern

```typescript
// 1. Create style
const heroStyle = webflow.createStyle("hero-section");
heroStyle.setProperties({
  backgroundColor: "#0f172a",
  padding: "80px 20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
});

// 2. Create element
const heroSection = webflow.createElement("Section");
heroSection.setTag("section");
heroSection.setStyles([heroStyle]);

// 3. Add to canvas
webflow.root.appendChild(heroSection);

// 4. Create children
const heading = webflow.createElement("Heading");
heading.setTextContent("Welcome to Our Site");
heroSection.appendChild(heading);
```

---

## Limitations

### What This Skill CANNOT Do

- Direct API execution (requires Webflow App setup)
- Responsive breakpoint generation (desktop-first only)
- Animations and interactions
- CMS content wiring
- Asset upload (images need manual handling)

### What Requires Manual Work

- Fine-tuning responsive behavior
- Adding interactions/animations
- Uploading and linking images
- Semantic HTML tag adjustments
- Component property customization

---

## Webflow Setup Requirements

### For Manual Instructions
- Active Webflow site/workspace (any plan)
- Access to Webflow Designer

### For Designer API Code
- Webflow App registered
- Designer Extension created via `webflow create-extension`
- OAuth authentication configured

---

## Accuracy Expectations

| Input Type | Expected Accuracy | Notes |
|------------|------------------|-------|
| Screenshot only | 75-85% | AI infers values from pixels |
| Screenshot + HTML | 85-90% | Structure is known |
| Screenshot + HTML + CSS | 90-95% | Exact values available |
| Full inspect bundle | 95%+ | Near-perfect replication |

---

## Agent Usage Guidelines

### When to Use Agents

**Use DESIGNER agent when:**
- User provides a complex screenshot with multiple sections
- Design analysis requires visual hierarchy expertise
- Typography and spacing decisions need professional review
- User wants detailed design token extraction

**Use ENGINEER agent when:**
- User explicitly wants Webflow Designer API code
- Complex component structure requires production-ready TypeScript
- User has a Webflow App/Extension setup

**Use PERPLEXITY-RESEARCHER when:**
- Need to look up latest Webflow API documentation
- Troubleshooting specific Webflow features
- Verifying element preset capabilities

### When to Handle Directly (No Agents)

- Simple single-component replication (hero, card, button)
- User just wants manual Webflow instructions
- Quick analysis of design tokens
- User is iterating on feedback

### Agent Launch Example

```typescript
// Full-page replication with parallel agents:
// 1. Designer analyzes visual design
// 2. Engineer generates API code
// Both run simultaneously for speed

Task({
  subagent_type: "designer",
  description: "Extract design system from screenshot [designer-webflow-1]",
  prompt: `Analyze this website screenshot for Webflow implementation.

Extract:
- Complete color palette (backgrounds, text, accents, borders)
- Typography scale (font family, sizes, weights, line heights)
- Spacing system (padding, margin, gap values)
- Layout structure (flex/grid, container widths)
- Component hierarchy (sections → containers → elements)
- Visual effects (shadows, borders, radius)

Output as structured JSON design tokens.
Reference: ~/.claude/skills/Webflow/ElementMapping.md`
})

Task({
  subagent_type: "engineer",
  description: "Generate Webflow Designer API TypeScript [engineer-webflow-1]",
  prompt: `Generate production-ready Webflow Designer API code.

Create TypeScript code that:
1. Defines all styles as PropertyMap objects
2. Creates elements using Webflow presets
3. Builds the complete page structure
4. Includes setup instructions

Follow patterns in: ~/.claude/skills/Webflow/workflows/GenerateAPICode.md
Use mappings from: ~/.claude/skills/Webflow/ElementMapping.md`
})
```

### Synthesizing Agent Results

After agents complete, synthesize their outputs:

1. **Design tokens** from designer agent → Use for manual instructions
2. **API code** from engineer agent → Provide as TypeScript file
3. **Documentation** from researcher → Include relevant links

Output format:
```markdown
## Webflow Replication Complete

### Design Tokens (from Designer Agent)
[JSON design tokens]

### Manual Instructions
[Step-by-step Webflow Designer guide]

### Designer API Code (from Engineer Agent)
[TypeScript code block]

### Accuracy: [75-95%] based on input quality
```
