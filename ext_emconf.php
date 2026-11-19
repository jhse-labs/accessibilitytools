<?php

$EM_CONF[$_EXTKEY] = [
    'title' => 'Accessibility Tools',
    'description' => 'Frontend accessibility toolbar with text sizing, high contrast, dark mode, and readable font options',
    'category' => 'plugin',
    'constraints' => [
        'depends' => [
            'typo3' => '13.4.0-13.4.99',
        ],
        'conflicts' => [],
    ],
    'autoload' => [
        'psr-4' => [
            'JhseLabs\\AccessibilityTools\\' => 'Classes',
        ],
    ],
    'state' => 'stable',
    'clearCacheOnLoad' => 1,
    'author_email' => 'jan@jh-se.de',
    'version' => '1.0.0',
];
