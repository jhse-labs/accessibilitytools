# Accessibility Tools - Configuration Guide

## Configuration source of truth

This extension is configured via TYPO3 **Site Settings** (TYPO3 v13), not by runtime TypoScript plugin settings.

- Setting definitions: `Configuration/Sets/Accessibilitytools/settings.definitions.yaml`
- Runtime readout: `Classes/EventListener/AddAccessibilityToolbar.php` via `$site->getSettings()`

## Backend location

1. TYPO3 Backend → **Site Management** → **Sites**
2. Open your site
3. Edit **Settings**
4. Configure section **Accessibility Tools**

## Available settings

### Core

- `accessibilitytools.position`
  - `bottom-right`, `bottom-left`, `top-right`, `top-left`
  - Default: `bottom-right`

- `accessibilitytools.offsetVertical`
  - Distance in px from `top` or `bottom` (depending on toolbar position)
  - Default: `20`

- `accessibilitytools.offsetHorizontal`
  - Distance in px from `left` or `right` (depending on toolbar position)
  - Default: `20`

- `accessibilitytools.modalOffsetVertical`
  - Distance in px between toolbar anchor and dialog panel on vertical axis
  - Uses `bottom` for bottom positions, `top` for top positions
  - Default: `70`

- `accessibilitytools.modalOffsetHorizontal`
  - Horizontal dialog offset in px from aligned edge
  - Uses `left` for left positions, `right` for right positions
  - Default: `0`

- `accessibilitytools.darkModeExcludeSelectors`
  - Comma-separated CSS selectors that should be excluded from dark mode rendering
  - Default: ``
  - Example: `.custom-gallery-overlay`
  - Supports element selectors, classes, and combined CSS selectors

- `accessibilitytools.greyscaleExcludeSelectors`
  - Comma-separated CSS selectors that should be excluded from greyscale rendering
  - Default: `video, .modal, .modal-backdrop`
  - Example: `video, iframe, .modal, .modal-backdrop`
  - Supports element selectors, classes, and combined CSS selectors

- `accessibilitytools.showByDefault`
  - Controls initial toolbar open state
  - Default: `false`
  - Note: persisted LocalStorage visibility (`accessibility_toolbarVisible`) can override this on later visits

- `accessibilitytools.showToolbarToggleButton`
  - Controls if the default floating accessibility toggle button/icon is rendered
  - Default: `true`
  - Set to `false` when you want to provide your own custom trigger markup/button

- `accessibilitytools.triggerLinkHref`
  - Comma-separated list of anchor `href` values that should toggle the toolbar
  - Default: `''` (disabled)
  - Example: `#accessibility, /accessibility`
  - Works additionally to JS events and is useful for TYPO3 backend-integrated links

- `accessibilitytools.iconSvgPath`
  - EXT: path for the toolbar toggle SVG icon
  - Default: `EXT:accessibilitytools/Resources/Public/Icons/accessibility-icon.svg`

- `accessibilitytools.buttonColor`
  - HEX color for the floating accessibility button
  - Default: `#0d6efd`

- `accessibilitytools.modalLineColor`
  - HEX color for modal borders and separator lines
  - Default: `#dee2e6`

- `accessibilitytools.actionColor`
  - HEX color for the reset button and active text-size option
  - Default: `#0d6efd`

### Feature toggles

- `accessibilitytools.enableTextSize` (default: `true`)
- `accessibilitytools.enableHighContrast` (default: `true`)
- `accessibilitytools.enableDarkMode` (default: `true`)
- `accessibilitytools.enableReadableFont` (default: `true`)
- `accessibilitytools.enableGreyscale` (default: `true`)
- `accessibilitytools.enableHighlightLinks` (default: `true`)

### Font / asset options

- `accessibilitytools.readableFont`
  - `sans-serif`, `Verdana`, `Comic Sans MS`, `OpenDyslexic`
  - Default: `sans-serif`

- `accessibilitytools.injectBootstrap`
  - Inject extension-local Bootstrap CSS/JS
  - Default: `true`

## Example `settings.yaml`

File: `config/sites/main/settings.yaml`

```yaml
accessibilitytools.position: 'top-right'
accessibilitytools.offsetVertical: 20
accessibilitytools.offsetHorizontal: 20
accessibilitytools.modalOffsetVertical: 70
accessibilitytools.modalOffsetHorizontal: 0
accessibilitytools.darkModeExcludeSelectors: ''
accessibilitytools.greyscaleExcludeSelectors: 'video, .modal, .modal-backdrop'
accessibilitytools.showByDefault: false
accessibilitytools.showToolbarToggleButton: true
accessibilitytools.triggerLinkHref: '#accessibility, /accessibility'

accessibilitytools.enableTextSize: true
accessibilitytools.enableHighContrast: true
accessibilitytools.enableDarkMode: true
accessibilitytools.enableReadableFont: true
accessibilitytools.enableGreyscale: true
accessibilitytools.enableHighlightLinks: true

accessibilitytools.readableFont: 'OpenDyslexic'
accessibilitytools.iconSvgPath: 'EXT:t3test/Resources/Public/Icons/my-accessibility-icon.svg'
accessibilitytools.buttonColor: '#0d6efd'
accessibilitytools.modalLineColor: '#dee2e6'
accessibilitytools.actionColor: '#0d6efd'
accessibilitytools.injectBootstrap: true
```

## Use your own trigger button

If you want to hide the default icon and trigger the accessibility modal with your own button:

1. Set this in site settings:

```yaml
accessibilitytools.showToolbarToggleButton: false
```

2. Add your own button in your markup, for example:

```html
<button
  type="button"
  id="my-accessibility-trigger"
  aria-controls="accessibility-toolbar-content"
  aria-expanded="false"
>
  Accessibility
</button>
```

3. Bind your button to the toolbar via custom events:

```html
<script>
  document.addEventListener('DOMContentLoaded', function () {
    const trigger = document.getElementById('my-accessibility-trigger');
    if (!trigger) {
      return;
    }

    trigger.addEventListener('click', function () {
      document.dispatchEvent(new CustomEvent('accessibility-toolbar:toggle'));
    });
  });
</script>
```

Available events:

- `accessibility-toolbar:toggle`
- `accessibility-toolbar:open`
- `accessibility-toolbar:close`

Optional: the toolbar instance is also available as `window.AccessibilityToolbarInstance`.

## Toggle toolbar via configured link href

If you want the toolbar to toggle via plain anchor links (without custom integration JS), configure:

```yaml
accessibilitytools.triggerLinkHref: '#accessibility, /accessibility'
```

Then links like these will toggle the toolbar automatically:

```html
<a href="#accessibility">Accessibility</a>
<a href="/accessibility">Accessibility options</a>
```

Notes:

- Matching is done against the literal `href` attribute value.
- For matching links, default navigation is prevented and the toolbar is toggled (open/close).
- This works whether `showToolbarToggleButton` is `true` or `false`.

## Troubleshooting

After changing site settings:

1. Flush TYPO3 caches

```bash
php vendor/bin/typo3 cache:flush
```

2. Hard refresh browser
3. If testing `showByDefault`, clear LocalStorage key `accessibility_toolbarVisible` first

## Notes

- German labels are available via language overlays (`de.locallang*.xlf`).
- Toolbar is injected automatically by the extension event listener.