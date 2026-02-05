# Bani

A self-contained, single-file mind mapping application built with vanilla JavaScript. No build process, no dependencies to install—just open and start creating.

![Mind Mapping Tool](https://img.shields.io/badge/mind%20mapping-tool-blue)
![No Build Required](https://img.shields.io/badge/build-none-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

## Features

### Core Functionality
- **Visual Mind Mapping**: Create interconnected nodes with hierarchical relationships
- **Node Management**: Add children, siblings, and parent nodes with automatic edge creation
- **Inline Editing**: Double-click nodes for quick text editing
- **Rich Descriptions**: Add detailed multi-line descriptions to any node

### Styling Options
- **Background Colors**: Yellow, red, blue, green, white
- **Border Styles**: Customizable color, size (thin/medium/thick), and style (solid/dotted/dashed)
- **Text Formatting**: Color, size, weight (normal/bold), and style (regular/italic)
- **Padding Control**: Compact to large padding options

### File Operations
- **Save/Load**: Export mind maps as `.smm` files (JSON format)
- **Export**: Generate PNG images or PDF documents
- **Viewport Preservation**: Zoom level and pan position saved with your mind map

### User Experience
- **Keyboard Shortcuts**: Power-user friendly with Ctrl+S, Ctrl+O, Ctrl+N
- **Context Menus**: Right-click for quick actions
- **Zoom Controls**: Zoom in/out/fit with mouse wheel or buttons
- **Responsive Canvas**: Grid background with smooth panning and zooming

## Getting Started

### Running the Application

No installation needed! Simply open `bani.html` in any modern web browser:

```bash
# macOS
open bani.html

# Linux
xdg-open bani.html

# Windows
start bani.html

# Or use a local web server
python3 -m http.server 8000
# Then visit http://localhost:8000/bani.html
```

### Creating Your First Mind Map

1. **Start with the central idea**: The application opens with a "Central Idea" node
2. **Add nodes**: Right-click on empty canvas or use the left panel when a node is selected
3. **Edit nodes**: Double-click any node to edit its text
4. **Style nodes**: Select a node to access styling options in the left panel
5. **Save your work**: Press `Ctrl+S` or click the Save button

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save mind map |
| `Ctrl/Cmd + O` | Open mind map |
| `Ctrl/Cmd + N` | New mind map |
| `Ctrl/Cmd + Enter` | Save description (in modal) |
| `Double-click node` | Edit node text |
| `Right-click canvas` | Add new node |
| `Right-click node` | Select node |
| `Escape` | Close modals/menus |
| `Enter` | Submit inline editor |

## File Format

Mind maps are saved as `.smm` (SimpleMindMap) files in JSON format:

```json
{
  "version": "1.0",
  "created": "2025-01-11T12:00:00.000Z",
  "viewport": {
    "zoom": 1.0,
    "pan": { "x": 0, "y": 0 }
  },
  "nodes": [
    {
      "data": {
        "id": "node_1",
        "label": "Central Idea",
        "bgColor": "#ffffff",
        "borderColor": "#1a1a2e",
        ...
      },
      "position": { "x": 400, "y": 300 }
    }
  ],
  "edges": [...]
}
```

## Technology Stack

- **[Cytoscape.js](https://js.cytoscape.org/)** (v3.28.1): Graph visualization and interaction
- **[html2canvas](https://html2canvas.hertzen.com/)** (v1.4.1): Canvas rendering for image export
- **[jsPDF](https://github.com/parallax/jsPDF)** (v2.5.1): PDF generation
- **Vanilla JavaScript**: No frameworks or build tools required
- **System Fonts**: Uses native OS fonts for optimal offline performance

## Architecture

Bani is built for maximum portability and offline use:
- **Main file**: `bani.html` (~2000 lines) contains all HTML, CSS, and JavaScript
- **Local libraries**: `lib/` folder contains all JavaScript dependencies
- **No build process**: Open and run directly in any browser
- **Fully offline**: Works completely without internet connection

This architecture prioritizes:
- **Portability**: Share the entire folder, works anywhere
- **Simplicity**: No build process, no package manager
- **Offline-first**: All dependencies included locally

## Browser Compatibility

Bani works on all modern browsers that support:
- ES6+ JavaScript
- CSS Grid and Flexbox
- HTML5 Canvas
- File API for save/load

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Contributing

Since this is a single-file application, contributions should maintain that architecture. When adding features:

1. Keep all code within `bani.html`
2. Use the existing sectioning pattern (CSS variables, styles, HTML, JS)
3. Follow the established coding style
4. Test manually in multiple browsers
5. Update CLAUDE.md if architecture changes

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

Built with ❤️ using:
- [Cytoscape.js](https://js.cytoscape.org/) for graph visualization
- [DM Sans](https://fonts.google.com/specimen/DM+Sans) and [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) fonts
- Inspiration from classic mind mapping tools

## Project Structure

```
bani/
├── bani.html           # Main application file
├── lib/                # JavaScript libraries (included)
│   ├── cytoscape.min.js
│   ├── html2canvas.min.js
│   └── jspdf.umd.min.js
├── README.md
├── LICENSE
└── .gitignore
```

---

**Note**: Bani is fully offline and stores all data locally in files you save. No data is sent to any server, and no internet connection is required after downloading the repository.
