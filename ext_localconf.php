<?php

defined('TYPO3') or die();

// Add TypoScript setup
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTypoScriptSetup(
    '@import "EXT:accessibilitytools/Configuration/Sets/Accessibilitytools/setup.typoscript"'
);
