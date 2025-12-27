# GenerateAPICode Workflow

Generate Webflow Designer API TypeScript code from analyzed designs.

## Trigger

User says:
- "Generate Webflow API code for this"
- "Just give me the Designer API code"
- "Create Webflow extension code"

## Prerequisites

- Design already analyzed (via ReplicateDesign) or screenshot provided
- User understands they need a Webflow App for Designer API

## Workflow Steps

### Step 1: Acknowledge

```
Running the **GenerateAPICode** workflow from the **Webflow** skill...
```

### Step 2: Check for Design Data

If design already analyzed, use existing design tokens.
If new screenshot, run quick analysis first.

### Step 3: Generate Designer API Code

Output complete TypeScript code for a Webflow Designer Extension:

```typescript
/**
 * Webflow Designer Extension
 * Generated from screenshot analysis
 *
 * Usage:
 * 1. Create a new Webflow App: https://developers.webflow.com
 * 2. Run: webflow create-extension
 * 3. Paste this code in your extension's main file
 * 4. Run: webflow dev
 */

// ============================================
// STYLE DEFINITIONS
// ============================================

interface StyleDefinition {
  name: string;
  properties: Record<string, string>;
}

const styles: StyleDefinition[] = [
  // Layout Styles
  {
    name: 'container',
    properties: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 40px',
      width: '100%'
    }
  },

  // Hero Styles
  {
    name: 'hero-section',
    properties: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      padding: '80px 40px'
    }
  },

  {
    name: 'hero-content',
    properties: {
      maxWidth: '900px',
      textAlign: 'center'
    }
  },

  // Typography Styles
  {
    name: 'heading-hero',
    properties: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: '600',
      fontSize: '4rem', // Will be responsive via custom code
      lineHeight: '1.1',
      color: '#0a0a0a',
      marginBottom: '24px'
    }
  },

  {
    name: 'body-large',
    properties: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: '400',
      fontSize: '1.5rem',
      lineHeight: '1.6',
      color: '#333333',
      marginBottom: '32px'
    }
  },

  // Button Styles
  {
    name: 'btn-primary',
    properties: {
      display: 'inline-block',
      padding: '16px 40px',
      backgroundColor: '#116dff',
      color: '#ffffff',
      borderRadius: '8px',
      fontWeight: '500',
      fontSize: '1rem',
      textDecoration: 'none',
      transition: 'all 0.2s ease'
    }
  },

  // Card Styles
  {
    name: 'card',
    properties: {
      padding: '32px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e3e3e3',
      transition: 'all 0.3s ease'
    }
  },

  {
    name: 'card-title',
    properties: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: '600',
      fontSize: '1.5rem',
      lineHeight: '1.3',
      color: '#0a0a0a',
      marginBottom: '12px'
    }
  },

  {
    name: 'card-description',
    properties: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: '400',
      fontSize: '1rem',
      lineHeight: '1.6',
      color: '#6b7280'
    }
  },

  // Grid Styles
  {
    name: 'grid-3col',
    properties: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px'
    }
  }
];

// ============================================
// ELEMENT CREATION FUNCTIONS
// ============================================

async function createStyles(): Promise<Map<string, any>> {
  const styleMap = new Map();

  for (const styleDef of styles) {
    const style = await webflow.createStyle(styleDef.name);
    await style.setProperties(styleDef.properties);
    styleMap.set(styleDef.name, style);
    console.log(`Created style: ${styleDef.name}`);
  }

  return styleMap;
}

async function createHeroSection(styleMap: Map<string, any>): Promise<any> {
  // Create hero section
  const section = await webflow.createElement('Section');
  section.setStyles([styleMap.get('hero-section')]);

  // Create container
  const container = await webflow.createElement('DivBlock');
  container.setStyles([styleMap.get('hero-content')]);
  section.appendChild(container);

  // Create heading
  const heading = await webflow.createElement('Heading');
  heading.setTextContent('Your Hero Headline Here');
  heading.setStyles([styleMap.get('heading-hero')]);
  container.appendChild(heading);

  // Create subheadline
  const subheadline = await webflow.createElement('Paragraph');
  subheadline.setTextContent('Your compelling subheadline that explains your value proposition.');
  subheadline.setStyles([styleMap.get('body-large')]);
  container.appendChild(subheadline);

  // Create CTA button
  const button = await webflow.createElement('LinkBlock');
  button.setTextContent('Get Started');
  button.setStyles([styleMap.get('btn-primary')]);
  container.appendChild(button);

  return section;
}

async function createCardGrid(styleMap: Map<string, any>, cards: number = 3): Promise<any> {
  // Create grid container
  const grid = await webflow.createElement('Grid');
  grid.setStyles([styleMap.get('grid-3col')]);

  for (let i = 0; i < cards; i++) {
    // Create card
    const card = await webflow.createElement('DivBlock');
    card.setStyles([styleMap.get('card')]);

    // Card title
    const title = await webflow.createElement('Heading');
    title.setLevel(3);
    title.setTextContent(`Card Title ${i + 1}`);
    title.setStyles([styleMap.get('card-title')]);
    card.appendChild(title);

    // Card description
    const description = await webflow.createElement('Paragraph');
    description.setTextContent('Card description text goes here. Replace with your actual content.');
    description.setStyles([styleMap.get('card-description')]);
    card.appendChild(description);

    grid.appendChild(card);
  }

  return grid;
}

// ============================================
// MAIN EXECUTION
// ============================================

async function buildPage(): Promise<void> {
  console.log('Starting page build...');

  try {
    // Step 1: Create all styles
    console.log('Creating styles...');
    const styleMap = await createStyles();

    // Step 2: Create page container
    const pageWrapper = await webflow.createElement('DivBlock');
    const wrapperStyle = await webflow.createStyle('page-wrapper');
    await wrapperStyle.setProperties({
      width: '100%',
      minHeight: '100vh'
    });
    pageWrapper.setStyles([wrapperStyle]);

    // Step 3: Add sections
    console.log('Creating hero section...');
    const heroSection = await createHeroSection(styleMap);
    pageWrapper.appendChild(heroSection);

    console.log('Creating card grid...');
    const cardSection = await webflow.createElement('Section');
    const sectionStyle = await webflow.createStyle('section-padding');
    await sectionStyle.setProperties({
      padding: '80px 40px'
    });
    cardSection.setStyles([sectionStyle]);

    const container = await webflow.createElement('DivBlock');
    container.setStyles([styleMap.get('container')]);
    cardSection.appendChild(container);

    const cardGrid = await createCardGrid(styleMap, 3);
    container.appendChild(cardGrid);

    pageWrapper.appendChild(cardSection);

    // Step 4: Add to canvas
    console.log('Adding to canvas...');
    webflow.root.appendChild(pageWrapper);

    console.log('Page build complete!');

  } catch (error) {
    console.error('Error building page:', error);
  }
}

// Execute
buildPage();
```

### Step 4: Provide Setup Instructions

```markdown
## Webflow Designer Extension Setup

### Prerequisites
- Node.js 16+ installed
- Webflow account with site access
- Webflow App registered at developers.webflow.com

### Setup Steps

1. **Create Webflow App**
   - Go to https://developers.webflow.com
   - Click "Create App"
   - Select "Designer Extension"
   - Name it and get your app credentials

2. **Scaffold Extension**
   ```bash
   npm install -g @webflow/cli
   webflow create-extension my-page-builder
   cd my-page-builder
   ```

3. **Replace Extension Code**
   - Open `src/index.ts`
   - Replace contents with the generated code above

4. **Run Development Server**
   ```bash
   webflow dev
   ```

5. **Open in Webflow**
   - Open your Webflow project
   - The extension will appear in the Apps panel
   - Click to activate

6. **Execute**
   - The extension will create elements when activated
   - Check the browser console for progress logs

### Customization

- Modify `styles` array to change visual properties
- Edit `createHeroSection()` to change hero layout
- Adjust `createCardGrid()` for different card counts
- Add new functions for additional sections

### Troubleshooting

If styles don't apply:
- Check console for errors
- Ensure style names are unique
- Verify property names match Webflow's PropertyMap

If elements don't appear:
- Confirm extension is connected
- Check for JavaScript errors
- Verify you're in Design mode
```

## Output Sections

1. **Complete TypeScript Code** - Ready to use
2. **Setup Instructions** - Step-by-step guide
3. **Customization Tips** - How to modify
4. **Troubleshooting** - Common issues
