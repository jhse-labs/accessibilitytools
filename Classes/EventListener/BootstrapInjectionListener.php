<?php
/**
 * This file is part of the jhse-labs/accessibilitytools plugin for TYPO3.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

declare(strict_types=1);

namespace JhseLabs\AccessibilityTools\EventListener;

use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Frontend\Event\AfterPageAndLanguageIsResolvedEvent;

/**
 * Event listener to inject Bootstrap framework into the frontend
 */
class BootstrapInjectionListener
{
    public function __invoke(AfterPageAndLanguageIsResolvedEvent $event): void
    {
        $request = $event->getRequest();
        $site = $request->getAttribute('site');
        $settings = $site->getSettings()->getAll();

        $injectBootstrap = (bool)($settings['accessibilitytools']['injectBootstrap'] ?? false);

        if ($injectBootstrap) {
            // get PageRenderer instance
            $pageRenderer = GeneralUtility::makeInstance(PageRenderer::class);

            // add bootstrap CSS
            $pageRenderer->addCssFile('EXT:accessibilitytools/Resources/Public/Css/bootstrap.min.css');

            // add bootstrap JS
            $pageRenderer->addJsFooterFile('EXT:accessibilitytools/Resources/Public/JavaScript/bootstrap.min.js');
        }
    }
}
