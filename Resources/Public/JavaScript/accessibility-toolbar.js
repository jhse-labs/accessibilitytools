/**
 * Accessibility Toolbar JavaScript
 * Handles all interactive functionality and LocalStorage persistence
 */
(function() {
    'use strict';
    
    const STORAGE_PREFIX = 'accessibility_';
    const STORAGE_KEYS = {
        textSize: STORAGE_PREFIX + 'textSize',
        highContrast: STORAGE_PREFIX + 'highContrast',
        darkMode: STORAGE_PREFIX + 'darkMode',
        readableFont: STORAGE_PREFIX + 'readableFont',
        greyscale: STORAGE_PREFIX + 'greyscale',
        highlightLinks: STORAGE_PREFIX + 'highlightLinks',
        toolbarVisible: STORAGE_PREFIX + 'toolbarVisible'
    };

    class AccessibilityToolbar {
        constructor() {
            console.log('Accessibility Toolbar constructor()');
            this.toolbar = document.getElementById('accessibility-toolbar');
            if (!this.toolbar) return;
            
            this.toggle = document.getElementById('accessibility-toolbar-toggle');
            this.content = document.getElementById('accessibility-toolbar-content');
            this.closeButton = this.toolbar.querySelector('.accessibility-toolbar-close');
            this.readableFontType = this.toolbar.dataset.readableFont || 'sans-serif';
            this.showByDefault = this.toolbar.dataset.showByDefault === '1' || this.toolbar.dataset.showByDefault === 'true';
            this.darkModeExcludeSelectors = this.parseSelectorList(
                this.toolbar.dataset.darkModeExcludeSelectors || ''
            );
            this.greyscaleExcludeSelectors = this.parseGreyscaleExcludeSelectors(
                this.toolbar.dataset.greyscaleExcludeSelectors || ''
            );
            this.triggerLinkHrefs = (this.toolbar.dataset.triggerLinkHref || '')
                .split(',')
                .map((href) => href.trim())
                .filter((href) => href.length > 0);
            this.darkModeObserver = null;
            this.greyscaleObserver = null;
            
            this.init();
        }
        
        init() {
            // Apply saved settings from LocalStorage
            this.loadSettings();
            
            // Bind events
            this.bindEvents();
            
            // Set readable font CSS variable
            document.documentElement.style.setProperty('--accessibility-readable-font', this.readableFontType);

            // Expose instance for custom integrations
            window.AccessibilityToolbarInstance = this;
        }
        
        bindEvents() {
            // Toggle toolbar visibility
            if (this.toggle) {
                this.toggle.addEventListener('click', () => this.toggleToolbar());
            }

            // Custom integration events for external trigger buttons
            document.addEventListener('accessibility-toolbar:toggle', () => this.toggleToolbar());
            document.addEventListener('accessibility-toolbar:open', () => this.showToolbar());
            document.addEventListener('accessibility-toolbar:close', () => this.hideToolbar());

            // Config-based integration via link href (comma-separated)
            if (this.triggerLinkHrefs.length > 0) {
                document.addEventListener('click', (event) => {
                    const triggerLink = event.target.closest('a[href]');
                    if (!triggerLink) {
                        return;
                    }

                    const href = (triggerLink.getAttribute('href') || '').trim();
                    if (this.triggerLinkHrefs.includes(href)) {
                        event.preventDefault();
                        this.toggleToolbar();
                    }
                });
            }

            // Allow selected third-party widgets to disable greyscale mode on interaction.
            document.addEventListener('click', (event) => {
                if (!(event.target instanceof Element)) {
                    return;
                }

                if (!event.target.closest('.accessibilitytools-greyscale-disable')) {
                    return;
                }

                this.setGreyscale(false);
            }, true);
            
            // Close button
            if (this.closeButton) {
                this.closeButton.addEventListener('click', () => this.hideToolbar());
            }
            
            // Text size buttons
            const textSizeButtons = this.toolbar.querySelectorAll('.accessibility-text-size');
            textSizeButtons.forEach(button => {
                button.addEventListener('click', (e) => this.handleTextSize(e));
            });
            
            // Feature toggles (high contrast, dark mode, readable font)
            const toggles = this.toolbar.querySelectorAll('.accessibility-toggle');
            toggles.forEach(toggle => {
                toggle.addEventListener('change', (e) => this.handleToggle(e));
            });
            
            // Reset button
            const resetButton = this.toolbar.querySelector('.accessibility-reset');
            if (resetButton) {
                resetButton.addEventListener('click', () => this.resetAll());
            }
            
            // Keyboard accessibility - ESC to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.content && this.content.style.display !== 'none') {
                    this.hideToolbar();
                }
            });
        }
        
        loadSettings() {
            // Load text size
            const savedTextSize = localStorage.getItem(STORAGE_KEYS.textSize);
            if (savedTextSize) {
                this.applyTextSize(savedTextSize);
            }
            
            // Load high contrast
            const highContrast = localStorage.getItem(STORAGE_KEYS.highContrast) === 'true';
            if (highContrast) {
                this.applyHighContrast(true);
                const checkbox = document.getElementById('accessibility-high-contrast');
                if (checkbox) checkbox.checked = true;
            }
            
            // Load dark mode
            const darkMode = localStorage.getItem(STORAGE_KEYS.darkMode) === 'true';
            if (darkMode) {
                this.applyDarkMode(true);
                const checkbox = document.getElementById('accessibility-dark-mode');
                if (checkbox) checkbox.checked = true;
            }
            
            // Load readable font
            const readableFont = localStorage.getItem(STORAGE_KEYS.readableFont) === 'true';
            if (readableFont) {
                this.applyReadableFont(true);
                const checkbox = document.getElementById('accessibility-readable-font');
                if (checkbox) checkbox.checked = true;
            }
            
            // Load greyscale
            const greyscale = localStorage.getItem(STORAGE_KEYS.greyscale) === 'true';
            if (greyscale) {
                this.applyGreyscale(true);
                const checkbox = document.getElementById('accessibility-greyscale');
                if (checkbox) checkbox.checked = true;
            }
            
            // Load highlight links
            const highlightLinks = localStorage.getItem(STORAGE_KEYS.highlightLinks) === 'true';
            if (highlightLinks) {
                this.applyHighlightLinks(true);
                const checkbox = document.getElementById('accessibility-highlight-links');
                if (checkbox) checkbox.checked = true;
            }
            
            // Load toolbar visibility
            const toolbarVisible = localStorage.getItem(STORAGE_KEYS.toolbarVisible);
            if (toolbarVisible === 'true') {
                this.showToolbar(false); // false = don't save to localStorage again
            } else if (toolbarVisible === 'false') {
                this.hideToolbar(false); // false = don't save to localStorage again
            } else if (this.showByDefault) {
                this.showToolbar(false); // initial state from site settings
            } else {
                this.hideToolbar(false); // initial state from site settings
            }
        }
        
        handleTextSize(event) {
            const button = event.currentTarget;
            const size = button.dataset.size;
            
            // Update active state
            const allButtons = this.toolbar.querySelectorAll('.accessibility-text-size');
            allButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Apply and save
            this.applyTextSize(size);
            localStorage.setItem(STORAGE_KEYS.textSize, size);
        }
        
        applyTextSize(size) {
            const rootElement = document.documentElement;

            // Remove all text size classes
            rootElement.classList.remove('accessibility-text-small', 'accessibility-text-large', 'accessibility-text-larger');
            
            // Apply new size
            switch(size) {
                case 'small':
                    rootElement.classList.add('accessibility-text-small');
                    break;
                case 'large':
                    rootElement.classList.add('accessibility-text-large');
                    break;
                case 'larger':
                    rootElement.classList.add('accessibility-text-larger');
                    break;
                case 'normal':
                default:
                    // No class needed for normal size
                    break;
            }
            
            // Update button states
            const allButtons = this.toolbar.querySelectorAll('.accessibility-text-size');
            allButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.size === size);
            });
        }
        
        handleToggle(event) {
            const toggle = event.currentTarget;
            const feature = toggle.dataset.feature;
            const isEnabled = toggle.checked;
            
            switch(feature) {
                case 'high-contrast':
                    this.applyHighContrast(isEnabled);
                    localStorage.setItem(STORAGE_KEYS.highContrast, isEnabled);
                    // Disable dark mode if high contrast is enabled
                    if (isEnabled) {
                        const darkModeToggle = document.getElementById('accessibility-dark-mode');
                        if (darkModeToggle && darkModeToggle.checked) {
                            darkModeToggle.checked = false;
                            this.applyDarkMode(false);
                            localStorage.setItem(STORAGE_KEYS.darkMode, false);
                        }
                    }
                    break;
                    
                case 'dark-mode':
                    this.applyDarkMode(isEnabled);
                    localStorage.setItem(STORAGE_KEYS.darkMode, isEnabled);
                    // Disable high contrast if dark mode is enabled
                    if (isEnabled) {
                        const highContrastToggle = document.getElementById('accessibility-high-contrast');
                        if (highContrastToggle && highContrastToggle.checked) {
                            highContrastToggle.checked = false;
                            this.applyHighContrast(false);
                            localStorage.setItem(STORAGE_KEYS.highContrast, false);
                        }
                    }
                    break;
                    
                case 'readable-font':
                    this.applyReadableFont(isEnabled);
                    localStorage.setItem(STORAGE_KEYS.readableFont, isEnabled);
                    break;
                    
                case 'greyscale':
                    this.setGreyscale(isEnabled);
                    break;
                    
                case 'highlight-links':
                    this.applyHighlightLinks(isEnabled);
                    localStorage.setItem(STORAGE_KEYS.highlightLinks, isEnabled);
                    break;
            }
        }
        
        applyHighContrast(enabled) {
            document.body.classList.toggle('accessibility-high-contrast', enabled);
        }
        
        applyDarkMode(enabled) {
            document.body.classList.toggle('accessibility-dark-mode', enabled);
            this.updateFeatureTargets('dark-mode', enabled, this.darkModeExcludeSelectors);

            if (enabled) {
                this.startFeatureObserver('dark-mode', this.darkModeExcludeSelectors);
            } else {
                this.stopFeatureObserver('dark-mode');
            }
        }
        
        applyReadableFont(enabled) {
            document.body.classList.toggle('accessibility-readable-font', enabled);
        }

        setGreyscale(enabled, saveState = true) {
            this.applyGreyscale(enabled);

            const greyscaleToggle = document.getElementById('accessibility-greyscale');
            if (greyscaleToggle) {
                greyscaleToggle.checked = enabled;
            }

            if (saveState) {
                localStorage.setItem(STORAGE_KEYS.greyscale, enabled);
            }
        }

        parseSelectorList(selectorString) {
            return selectorString
                .split(',')
                .map((selector) => selector.trim())
                .filter((selector) => selector.length > 0);
        }

        parseGreyscaleExcludeSelectors(selectorString) {
            return this.parseSelectorList(selectorString);
        }

        matchesExcludeSelector(element, selectors) {
            return selectors.some((selector) => {
                try {
                    return element.matches(selector);
                } catch (error) {
                    console.warn('Invalid accessibility exclude selector:', selector, error);
                    return false;
                }
            });
        }

        containsExcludeSelector(element, selectors) {
            return selectors.some((selector) => {
                try {
                    return element.querySelector(selector) !== null;
                } catch (error) {
                    console.warn('Invalid accessibility exclude selector:', selector, error);
                    return false;
                }
            });
        }

        getFeatureTargetClass(featureName) {
            return `accessibility-${featureName}-target`;
        }

        getFeatureObserverProperty(featureName) {
            return `${featureName.replace(/-([a-z])/g, (_, character) => character.toUpperCase())}Observer`;
        }

        markFeatureTargets(element, featureName, excludeSelectors) {
            if (element === this.toolbar) {
                return;
            }

            if (['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT'].includes(element.tagName)) {
                return;
            }

            if (this.matchesExcludeSelector(element, excludeSelectors)) {
                return;
            }

            if (this.containsExcludeSelector(element, excludeSelectors)) {
                Array.from(element.children).forEach((child) => this.markFeatureTargets(child, featureName, excludeSelectors));
                return;
            }

            element.classList.add(this.getFeatureTargetClass(featureName));
        }

        updateFeatureTargets(featureName, enabled, excludeSelectors) {
            const targetClass = this.getFeatureTargetClass(featureName);

            document.querySelectorAll(`.${targetClass}`).forEach((element) => {
                element.classList.remove(targetClass);
            });

            if (!enabled) {
                return;
            }

            Array.from(document.body.children).forEach((child) => this.markFeatureTargets(child, featureName, excludeSelectors));
        }

        startFeatureObserver(featureName, excludeSelectors) {
            const observerProperty = this.getFeatureObserverProperty(featureName);

            if (this[observerProperty]) {
                return;
            }

            this[observerProperty] = new MutationObserver(() => {
                if (document.body.classList.contains(`accessibility-${featureName}`)) {
                    this.updateFeatureTargets(featureName, true, excludeSelectors);
                }
            });

            this[observerProperty].observe(document.body, {
                childList: true,
                subtree: true,
            });
        }

        stopFeatureObserver(featureName) {
            const observerProperty = this.getFeatureObserverProperty(featureName);

            if (!this[observerProperty]) {
                return;
            }

            this[observerProperty].disconnect();
            this[observerProperty] = null;
        }
        
        applyGreyscale(enabled) {
            document.body.classList.toggle('accessibility-greyscale', enabled);
            this.updateFeatureTargets('greyscale', enabled, this.greyscaleExcludeSelectors);

            if (enabled) {
                this.startFeatureObserver('greyscale', this.greyscaleExcludeSelectors);
            } else {
                this.stopFeatureObserver('greyscale');
            }
        }
        
        applyHighlightLinks(enabled) {
            document.body.classList.toggle('accessibility-highlight-links', enabled);
        }
        
        toggleToolbar() {
            if (this.content.style.display === 'none' || !this.content.style.display) {
                this.showToolbar();
            } else {
                this.hideToolbar();
            }
        }
        
        showToolbar(saveState = true) {
            if (this.content) {
                this.content.style.display = 'block';
                this.content.classList.add('show');
                if (this.toggle) {
                    this.toggle.setAttribute('aria-expanded', 'true');
                }
                if (saveState) {
                    localStorage.setItem(STORAGE_KEYS.toolbarVisible, 'true');
                }
            }
        }
        
        hideToolbar(saveState = true) {
            if (this.content) {
                this.content.style.display = 'none';
                this.content.classList.remove('show');
                if (this.toggle) {
                    this.toggle.setAttribute('aria-expanded', 'false');
                }
                if (saveState) {
                    localStorage.setItem(STORAGE_KEYS.toolbarVisible, 'false');
                }
            }
        }
        
        resetAll() {
            // Clear all classes
            document.body.classList.remove(
                'accessibility-high-contrast',
                'accessibility-dark-mode',
                'accessibility-readable-font',
                'accessibility-greyscale',
                'accessibility-highlight-links'
            );

            document.documentElement.classList.remove(
                'accessibility-text-small',
                'accessibility-text-large',
                'accessibility-text-larger',
                'accessibility-text-largest'
            );

            this.updateFeatureTargets('dark-mode', false, this.darkModeExcludeSelectors);
            this.stopFeatureObserver('dark-mode');
            this.updateFeatureTargets('greyscale', false, this.greyscaleExcludeSelectors);
            this.stopFeatureObserver('greyscale');
            
            // Reset all checkboxes
            const toggles = this.toolbar.querySelectorAll('.accessibility-toggle');
            toggles.forEach(toggle => {
                toggle.checked = false;
            });
            
            // Reset text size buttons
            const textSizeButtons = this.toolbar.querySelectorAll('.accessibility-text-size');
            textSizeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.size === 'normal');
            });
            
            // Clear LocalStorage
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });

            // Close the toolbar
            this.hideToolbar();
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new AccessibilityToolbar();
        });
    } else {
        new AccessibilityToolbar();
    }
})();
