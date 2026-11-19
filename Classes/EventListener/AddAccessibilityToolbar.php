<?php
/**
 * This file is part of the jhse-labs/accessibilitytools plugin for TYPO3.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

declare(strict_types=1);

namespace JhseLabs\AccessibilityTools\EventListener;

use TYPO3\CMS\Core\Site\Entity\Site;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\View\StandaloneView;
use TYPO3\CMS\Frontend\Event\AfterCacheableContentIsGeneratedEvent;

/**
 * Event listener to inject the accessibility toolbar into the page
 */
class AddAccessibilityToolbar
{
    public function __invoke(AfterCacheableContentIsGeneratedEvent $event): void
    {
        $controller = $event->getController();
        $request = $event->getRequest();
        
        // Get the site from request
        $site = $request->getAttribute('site');
        if (!$site instanceof Site) {
            return;
        }
        
        // Get settings from site configuration
        $settings = $site->getSettings()->getAll();
        
        // Extract accessibility settings
        $accessibilitySettings = [
            'position' => $settings['accessibilitytools']['position'] ?? 'bottom-right',
            'offsetVertical' => (int)($settings['accessibilitytools']['offsetVertical'] ?? 20),
            'offsetHorizontal' => (int)($settings['accessibilitytools']['offsetHorizontal'] ?? 20),
            'modalOffsetVertical' => (int)($settings['accessibilitytools']['modalOffsetVertical'] ?? 70),
            'modalOffsetHorizontal' => (int)($settings['accessibilitytools']['modalOffsetHorizontal'] ?? 0),
            'enableTextSize' => (bool)($settings['accessibilitytools']['enableTextSize'] ?? true),
            'enableHighContrast' => (bool)($settings['accessibilitytools']['enableHighContrast'] ?? true),
            'enableDarkMode' => (bool)($settings['accessibilitytools']['enableDarkMode'] ?? true),
            'darkModeExcludeSelectors' => trim((string)($settings['accessibilitytools']['darkModeExcludeSelectors'] ?? '')),
            'enableReadableFont' => (bool)($settings['accessibilitytools']['enableReadableFont'] ?? true),
            'enableGreyscale' => (bool)($settings['accessibilitytools']['enableGreyscale'] ?? true),
            'greyscaleExcludeSelectors' => trim((string)($settings['accessibilitytools']['greyscaleExcludeSelectors'] ?? 'video, .modal, .modal-backdrop')),
            'enableHighlightLinks' => (bool)($settings['accessibilitytools']['enableHighlightLinks'] ?? true),
            'readableFont' => $settings['accessibilitytools']['readableFont'] ?? 'sans-serif',
            'showByDefault' => (bool)($settings['accessibilitytools']['showByDefault'] ?? false),
            'showToolbarToggleButton' => (bool)($settings['accessibilitytools']['showToolbarToggleButton'] ?? true),
            'triggerLinkHref' => trim((string)($settings['accessibilitytools']['triggerLinkHref'] ?? '')),
            'buttonColor' => $settings['accessibilitytools']['buttonColor'] ?? '#0d6efd',
            'modalLineColor' => $settings['accessibilitytools']['modalLineColor'] ?? '#dee2e6',
            'actionColor' => $settings['accessibilitytools']['actionColor'] ?? '#0d6efd',
            'iconSvgPath' => $settings['accessibilitytools']['iconSvgPath'] ?? 'EXT:accessibilitytools/Resources/Public/Icons/accessibility-icon.svg',
        ];
        
        // Render the toolbar template
        $view = GeneralUtility::makeInstance(StandaloneView::class);
        $view->setTemplatePathAndFilename(
            GeneralUtility::getFileAbsFileName('EXT:accessibilitytools/Resources/Private/Templates/Accessibility/Toolbar.html')
        );
        
        // assign variables to template
        $view->assignMultiple($accessibilitySettings);
        
        // render the template
        $toolbarHtml = $view->render();
        
        // get current content from controller
        $controller = $event->getController();
        $content = $controller->content;

        // inject toolbar before closing body tag
        if (stripos($content, '</body>') !== false) {
            $content = str_ireplace('</body>', $toolbarHtml . '</body>', $content);
            $controller->content = $content;
        }
    }
}
