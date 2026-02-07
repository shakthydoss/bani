# Bani

A fully offline, modular mind mapping application built with vanilla JavaScript and Cytoscape.js.

![Mind Mapping Tool](https://img.shields.io/badge/mind%20mapping-tool-blue)
![ES6 Modules](https://img.shields.io/badge/architecture-modular-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

## Features

### Core Functionality
- ✨ **Fully Offline** - No internet connection required
- 🎯 **ES6 Modular Architecture** - Clean, maintainable codebase
- 📝 **Rich Text Nodes** - Support for titles and descriptions
- 🎨 **Customizable Styling** - Colors, borders, fonts, padding
- 💾 **Save/Load** - Export mind maps as `.bani` files (JSON format)
- 📤 **Export** - Export to PNG or PDF
- ⌨️ **Keyboard Shortcuts** - Fast navigation and editing
- 🖱️ **Intuitive UI** - Click, double-click, right-click interactions
- 🔍 **Zoom Controls** - Pan and zoom your mind maps

## Quick Start

### Running in Browser

```bash
# Navigate to project directory
cd bani

# Start a local server (required for ES6 modules)
python3 -m http.server 8000

# Open in browser
open http://localhost:8000/src/index.html
```

### Building for Desktop (Electron)

Coming soon! Phase 2 will add Electron support for native desktop apps.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save mind map |
| `Ctrl/Cmd + O` | Open mind map |
| `Ctrl/Cmd + N` | New mind map |
| `Ctrl/Cmd + Enter` | Save description (in modal) |
| `Double-click node` | Edit node text |
| `Right-click canvas` | Add node |
| `Right-click node` | Select node |
| `Escape` | Close modals/menus |
| `Enter` | Submit inline editor |

## Project Structure

```
bani/
├── src/                        # Modular source code
│   ├── index.html             # Main HTML file
│   ├── styles/                # CSS modules
│   │   ├── variables.css      # Design system variables
│   │   ├── base.css           # Base styles
│   │   ├── header.css         # Header styles
│   │   ├── panel.css          # Node panel styles
│   │   ├── modal.css          # Modal styles
│   │   └── canvas.css         # Canvas & zoom styles
│   ├── js/                    # JavaScript modules
│   │   ├── main.js            # Application entry point
│   │   ├── config/            # Configuration modules
│   │   │   ├── constants.js   # App constants
│   │   │   └── cytoscape-config.js  # Cytoscape setup
│   │   ├── core/              # Core functionality
│   │   │   └── state.js       # State management
│   │   ├── features/          # Feature modules
│   │   │   ├── node-manager.js      # Node CRUD operations
│   │   │   ├── panel-manager.js     # Panel interactions
│   │   │   ├── inline-editor.js     # Inline text editing
│   │   │   ├── modal-manager.js     # Description modal
│   │   │   ├── file-manager.js      # Save/Load functionality
│   │   │   ├── export-manager.js    # PNG/PDF export
│   │   │   └── zoom-manager.js      # Zoom controls
│   │   └── utils/             # Utility functions
│   │       └── helpers.js
│   ├── lib/                   # External libraries (local)
│   │   ├── cytoscape.min.js
│   │   ├── html2canvas.min.js
│   │   └── jspdf.umd.min.js
│   └── img/                   # Assets
│       ├── bani.png
│       └── bani.ico
├── bani.html                  # Original monolithic version
├── README.md
├── LICENSE
├── CLAUDE.md
└── .gitignore
```

## Technology Stack

- **[Cytoscape.js](https://js.cytoscape.org/)** (v3.28.1): Graph visualization
- **[html2canvas](https://html2canvas.hertzen.com/)** (v1.4.1): Canvas rendering
- **[jsPDF](https://github.com/parallax/jsPDF)** (v2.5.1): PDF generation
- **ES6 Modules**: Native JavaScript modules
- **System Fonts**: Native OS fonts for offline support

## File Format

Mind maps are saved as `.bani` files in JSON format:

```json
{
  "version": "1.0",
  "created": "2025-02-07T...",
  "viewport": {
    "zoom": 1.0,
    "pan": { "x": 0, "y": 0 }
  },
  "nodes": [...],
  "edges": [...]
}
```

## Architecture

Bani uses a **modular ES6 architecture** for maximum maintainability:

### Layers

1. **Config Layer**: Constants and Cytoscape configuration
2. **Core Layer**: State management
3. **Features Layer**: Independent feature modules
4. **Utils Layer**: Shared utility functions

### Benefits

- ✅ **Easy to extend**: Add new features without touching existing code
- ✅ **Easy to debug**: Clear module boundaries
- ✅ **Easy to test**: Each module is self-contained
- ✅ **Easy to collaborate**: Multiple developers can work on different features
- ✅ **Still offline**: All dependencies are local

### Development Workflow

```bash
# Edit files in src/
# Refresh browser to see changes (no build needed!)
# ES6 modules load instantly
```

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires ES6 module support (all modern browsers since 2018).

## Contributing

Contributions are welcome! The modular architecture makes it easy to add new features:

1. Fork the repository
2. Create a feature module in `src/js/features/`
3. Import and initialize in `src/js/main.js`
4. Test in browser
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Note**: Bani is fully offline and stores all data locally in files you save. No data is sent to any server, and no internet connection is required after downloading the repository.
