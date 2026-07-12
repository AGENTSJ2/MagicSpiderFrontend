export const DesignPrinciplesPrompt = [
  // // ===== CORE MINDSET =====
  // 'DESIGN PHILOSOPHY: Approach every slide as a deliberate composition, not a container to fill.',
  // 'Think like a professional presentation designer, not a document generator. The goal is a slide that looks intentionally crafted by an experienced designer.',
  // 'Before placing any element, mentally map the entire layout first: decide the focal point, the visual hierarchy, and the flow of the eye from top to bottom.',
  // 'Think in terms of a grid system. Divide the 1333x750 canvas into invisible columns and rows, and align elements to these guides so nothing feels arbitrarily placed.',
  // 'Divide the slide into logical regions BEFORE placing any content, and reserve space for future elements so later items are not crammed into whatever is left over.',

  // // ===== PREVENTING OVERLAP (CRITICAL) =====
  // 'COLLISION AVOIDANCE IS MANDATORY: Every element occupies a bounding box (x, y, width, height). No two bounding boxes may ever intersect unless intentional layering (e.g. text on a solid card) is the goal.',
  // 'Never assume an element fits. Carefully estimate its rendered dimensions before placing it.',
  // "Before finalizing each element position, verify: does this box overlap any previously placed box? Compute the right edge (x + width) and bottom edge (y + height) and confirm they do not cross into another element's region.",
  // 'Continuously track which regions of the canvas are already occupied. Before creating any element, confirm sufficient empty space actually exists for it.',
  // 'Maintain a minimum gap of at least 24 canvas units between distinct elements so the layout breathes and never looks cramped or collided.',
  // 'Reserve safe margins: keep all content at least 60 canvas units from the canvas edges (usable area approximately x:60 to x:1273, y:60 to y:690). Nothing should bleed off-screen or touch the border unless it is a deliberate full-bleed background.',
  // 'When stacking text blocks, account for the full rendered height of each block (line count × line height) before placing the next element below it. Never assume text is a single line.',
  // 
  'Choose a cohesive color palette at the beginning and apply it consistently across all slides. Base the palette on established color theory, ensuring appropriate contrast, visual hierarchy, and harmony. Use accent colors sparingly to draw attention to key elements, maintain consistent colors for similar components throughout the presentation, and avoid introducing new colors without a clear semantic purpose. The result should feel unified, professional, and visually balanced from start to finish.',
  // ===== VISUAL HIERARCHY =====
  'Establish a clear hierarchy with size and weight: one dominant title (largest), supporting subtitles (medium), and body content (smallest). The size jumps between levels should be obvious, not subtle.',
  'Use scale intentionally: titles around 48-72 canvas units, subheadings 28-36 canvas units, body text 18-24 canvas units. The biggest element should immediately tell the viewer what the slide is about.',
  'Limit the slide to ONE primary focal point. Everything else should support it, not compete with it. Avoid making everything equally prominent.',

  // ===== SPACING & WHITESPACE =====
  'Whitespace is a design tool, not wasted space. Do not fill every available area. Generous negative space makes a slide feel premium and modern. A large empty space is often better than a crowded layout.',
  'Group related items close together and push unrelated items apart (proximity = relationship). The viewer should understand structure from spacing alone.',
  'Keep consistent internal padding inside cards and containers (typically around 32 canvas units) so text never hugs the edge of its container.',

  // ===== COLOR & CONTRAST =====
  'Choose a cohesive palette: one or two primary colors, one accent color for emphasis, and neutral tones for backgrounds and text. Avoid using many unrelated colors.',
  'Ensure strong contrast between text and its background for readability. Never place light text on a light background or dark text on a dark background.',
  'Use the accent color sparingly and purposefully, only to draw attention to the single most important element or call-to-action.',
  'Prefer subtle, modern backgrounds (soft gradients, muted solid tones, or gentle geometric accents) over harsh pure-white or jarring saturated fills.',

  // ===== TYPOGRAPHY =====
  'Pick clean, modern sans-serif typefaces. Pair at most two font families: one for headings and one for body content.',
  'Keep text concise: prefer short, impactful statements over large paragraphs, and ensure text remains readable from presentation distance.',
  'Keep line lengths comfortable. Constrain text block widths so lines are not stretched across the entire canvas; aim for readable measure rather than edge-to-edge text.',
  'Left-align body text for readability; reserve center alignment for short titles or hero statements.',

  // ===== ALIGNMENT & BALANCE =====
  'Align elements to shared edges or a central axis. Related items should start from the same x or y coordinate. Ragged, misaligned elements read as careless. When in doubt, snap to the grid.',
  'Balance visual weight across the canvas. If one side has a large heavy element, counterbalance the other side with meaningful content rather than leaving it empty and lopsided.',
  'Use symmetry for formal/calm layouts and intentional asymmetry for dynamic/energetic ones, but always with a sense of equilibrium.',

  // ===== INFORMATION DENSITY =====
  'Do not overload a slide. Show only the most important information and split the rest into clear visual groups. A clean slide always beats a crowded one; when content is too much for one slide, simplify rather than cram.',

  // ===== MODERN AESTHETIC CUES =====
  'Embrace modern design patterns: rounded corners on cards, soft shadows for subtle depth, layered cards over backgrounds, and clean iconography or simple geometric shapes as accents.',
  'Use premium, modern presentation aesthetics. Avoid outdated, document-like layouts; slides should feel intentional, polished and premium.',
  'Add visual interest through deliberate accents (a thin divider line, a colored sidebar, a single bold shape) rather than clutter.',
  'Consistency across the slide is key: repeat the same corner radius, spacing rhythm, and color usage so the design feels unified. Similar elements should share similar sizing, and similar cards should share dimensions.',

  // ===== SELF-CHECK BEFORE COMPLETION =====
  'FINAL REVIEW: Before declaring the task complete, mentally render the slide and ask: (1) Do any elements overlap unintentionally? (2) Is everything within the safe margins and inside the canvas? (3) Is there a clear focal point and hierarchy? (4) Is the spacing consistent and balanced? (5) Is alignment clean? (6) Would a professional designer consider this clean and modern?',
  'If the answer to any review question reveals a flaw, reposition or resize the offending elements before finishing. Do not ship a cramped, collided, or misaligned slide.',
  
  // ===== GEOMETRIC SHAPE COMPOSITION (KONVA-FRIENDLY) =====
  'Use simple geometric primitives as design accents: squares, rectangles (including elongated rectangles), and circles. Complex illustrations are not required; strong layouts can be created from basic shapes alone.',
  'Think of shapes as part of the visual atmosphere rather than separate objects. Blend them into the composition so they support the content instead of distracting from it.',
  'Use large, low-contrast background shapes to create depth and visual interest. Shapes should often be subtle and partially hidden behind content areas.',
  'Combine multiple rectangles and circles to build modern abstract compositions. Overlapping decorative shapes is acceptable when they serve as background elements and do not interfere with readability.',
  'Use elongated rectangles as sidebars, section dividers, visual anchors, timeline connectors, highlights, and framing elements.',
  'Use circles to soften layouts, create focal accents, highlight important areas, or balance large rectangular regions.',
  'Vary scale intentionally: mix a few large background shapes with a small number of medium accent shapes. Avoid many similarly sized decorative elements.',
  'Prefer oversized shapes that extend beyond the visible canvas edge. Partial visibility often looks more modern and intentional than fully visible decorative objects.',
  'Decorative shapes should typically use low opacity, muted colors, subtle gradients, or slightly lighter/darker variations of the background color so they feel integrated into the design.',
  'When using shapes behind content, maintain sufficient contrast and spacing so text remains the dominant readable element.',
  'Create visual layers by placing subtle geometric shapes in the background, content cards in the middle layer, and text in the foreground.',
  'Use geometric rhythm: repeat similar shape styles, corner radii, opacity levels, and spacing patterns throughout the slide for consistency.',
  'Avoid random decoration. Every shape should contribute to balance, hierarchy, framing, depth, or visual flow.',
  'If a region feels empty, first consider adding one or two large blended geometric accents rather than adding more text or unnecessary content.',
  'Modern premium slides often rely on a small number of carefully positioned geometric shapes rather than detailed illustrations. Favor simplicity, scale, and restraint.',
].join(' ');
