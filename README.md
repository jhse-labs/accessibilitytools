# TYPO3 Accessibility Tools Extension

A configurable accessibility toolbar for TYPO3 v13.4.  
It is injected automatically into the frontend and allows visitors to adjust readability options such as text size, contrast and font.

## Features

- Text size controls (A-, A, A+, A++, A+++)
- High contrast mode
- Dark mode
- Readable font mode
- Greyscale mode
- Highlight links mode
- Reset button
- LocalStorage persistence of user preferences
- Configurable via TYPO3 **Site Settings**
- German translations included (`de.locallang*.xlf`)

## Requirements

- TYPO3 v13.4.x
- Browser with LocalStorage support

## Installation

### Composer

```bash
composer require jhse-labs/accessibilitytools
```

### Activation

Activate the extension in TYPO3 Extension Manager.

## Configuration (recommended)

Configure the toolbar in TYPO3 **Site Settings**:

1. Backend → **Site Management** → **Settings**
2. Edit the **Accessibility Tools** section

The extension reads values from site settings (`$site->getSettings()`), based on:

- `Configuration/Sets/Accessibilitytools/settings.definitions.yaml`

### Available settings (current)

- `accessibilitytools.position`
- `accessibilitytools.enableTextSize`
- `accessibilitytools.enableHighContrast`
- `accessibilitytools.enableDarkMode`
- `accessibilitytools.enableReadableFont`
- `accessibilitytools.enableGreyscale`
- `accessibilitytools.enableHighlightLinks`
- `accessibilitytools.readableFont`
- `accessibilitytools.showByDefault` (default: `false`)
- `accessibilitytools.injectBootstrap`
- `accessibilitytools.iconSvgPath`

### Example site override

`config/sites/main/settings.yaml`

```yaml
accessibilitytools.position: 'bottom-right'
accessibilitytools.showByDefault: false
accessibilitytools.readableFont: 'OpenDyslexic'
accessibilitytools.iconSvgPath: 'EXT:t3test/Resources/Public/Icons/my-accessibility-icon.svg'
```

## Behavior notes

- `showByDefault` defines the initial open/closed state when no explicit toolbar visibility has been stored yet.
- Toolbar visibility is persisted in LocalStorage (`accessibility_toolbarVisible`) and then takes precedence for that browser.

## Styling

You can override CSS in your site package, for example:

```css
.accessibility-toolbar-bottom-right {
    bottom: 30px;
    right: 30px;
}

.accessibility-toolbar-toggle {
    background-color: #0d6efd !important;
}
```

## Troubleshooting

Clear TYPO3 caches after changing settings:

```bash
php vendor/bin/typo3 cache:flush
```

Then hard refresh the browser to avoid stale assets.

## License

GPL-2.0-or-later
