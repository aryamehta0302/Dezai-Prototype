# Feature: Hybrid Lesson Player & Content Delivery Engine

The Hybrid Lesson Player is a lightweight structured delivery client designed to cut video bandwidth costs while offering a rich interactive learning experience.

## Overview
Instead of serving everything as large video resources, the Hybrid Content Delivery Engine splits lesson content:
1. **Pillars**: Standard HTML5 video is reserved for core high-level conceptual pillars.
2. **Text & Interaction**: All other content is served via structured markdown containing custom interactive cognitive and visual blocks.

---

## Technical Details

### 1. Markdown Parser & Renderer (`LessonMarkdownRenderer`)
- Uses `react-markdown` + `remark-gfm` + `rehype-sanitize` for safe, AST-based HTML generation without `dangerouslySetInnerHTML`.
- Hooks into custom code block tags (fences) to route them to premium interactive React components.

### 2. Video Player (`LessonVideoPlayer`)
- Replaces simulated mock players with a real HTML5 `<video>` element.
- Custom controls for Play/Pause, seeking (progress bar clicks), volume adjustments, and full screen toggling.
- Dark-chrome styling to ensure visual excellence.

### 3. Resource List (`LessonResourceList`)
- Displays links and file attachments associated with each lesson (e.g. PDFs, ZIP archives, web links) with unique visual icons.

### 4. Interactive Components
- **Memory Leak Block**: Visual representation of character/text dripping and dissolving using `framer-motion`.
- **Overfit Squeeze Block**: Border compressing animation representing overfitting.
- **Interactive Cognitive Anchor**: Dynamic typography changes triggered via `IntersectionObserver` on scroll/hover.
- **Concept Highlight Callout**: Specialized variant boxes for definitions, insights, and warnings.
- **Block Registry**: Dynamic registry mapping fence keys to components.
