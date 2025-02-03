# Prompetize

A Chrome/Firefox extension for managing, versioning, and sharing prompt templates with GitHub integration. Built with React 19, TypeScript, and TailwindCSS.

## Features

- 🔄 Sync prompt templates with GitHub
- 📝 Create and manage prompt templates
- 🏷️ Tag and categorize prompts
- 🌙 Dark mode support
- 🔍 Search and filter functionality
- 🔒 Client-side OAuth for GitHub integration
- 🌐 Cross-browser support (Chrome/Firefox)
- 🔥 Hot reloading during development

## Tech Stack

- React 19
- TypeScript
- TailwindCSS 4
- Vite 6
- webextension-polyfill
- ESLint + Prettier

## Development

### Prerequisites

- Node.js >= 18
- npm or yarn
- Chrome/Firefox for testing

### Setup

1. Clone the repository:
```bash
git clone https://github.com/zoharbabin/prompetize.git
cd prompetize
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:

For Chrome:
```bash
npm run dev:chrome
```

For Firefox:
```bash
npm run dev:firefox
```

The development server supports hot reloading, so changes will be reflected immediately in the browser.

### Building

For Chrome:
```bash
npm run build:chrome
```

For Firefox:
```bash
npm run build:firefox
```

The built extension will be in `dist_chrome` or `dist_firefox` respectively.

### Loading the Extension

#### Chrome
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist_chrome` directory

#### Firefox
1. Open Firefox
2. Go to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select any file in the `dist_firefox` directory

## Project Structure

```
├── src/
│   ├── assets/          # Static assets and styles
│   │   ├── img/        # Images and icons
│   │   └── styles/     # Global styles and TailwindCSS config
│   ├── locales/        # i18n translations
│   └── pages/          # Extension pages
│       ├── background/ # Service worker
│       ├── content/    # Content scripts
│       ├── devtools/   # DevTools integration
│       ├── options/    # Options page
│       ├── panel/      # DevTools panel UI
│       └── popup/      # Popup UI
├── public/            # Public static files
├── .github/           # GitHub Actions and templates
├── manifest.json      # Extension manifest
└── vite.config.ts    # Build configuration
```

## Development Workflow

1. Make changes to the source code
2. The development server will automatically rebuild
3. For Chrome: The extension will automatically reload
4. For Firefox: Click the reload button in about:debugging

## Testing

The extension includes several types of pages:
- Popup: Click the extension icon
- Options: Right-click extension icon > Options
- DevTools: Open DevTools > Prompetize tab
- Content Scripts: Automatically injected into pages

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Automated Workflows

- GitHub Actions for automated builds
- Dependabot for dependency updates
- Stale bot for issue management

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
