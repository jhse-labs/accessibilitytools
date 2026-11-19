<?php

defined('TYPO3') or die('Access denied.');

// Register plugin in backend
\TYPO3\CMS\Extbase\Utility\ExtensionUtility::registerPlugin(
    'accessibilitytools',
    'Toolbar',
    'LLL:EXT:accessibilitytools/Resources/Private/Language/locallang_db.xlf:plugin.toolbar.title',
    'EXT:accessibilitytools/Resources/Public/Icons/Extension.svg'
);