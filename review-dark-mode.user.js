// ==UserScript==
// @name        WaniKani Dark Mode
// @namespace   CalebReviewDark
// @version     2.1.2
// @description A site-wide near-black theme for WaniKani: dashboard, lessons, reviews, item pages, settings, and userscript panels.
// @homepageURL https://github.com/cabe9/wanikani-dark-mode
// @supportURL  https://github.com/cabe9/wanikani-dark-mode/issues
// @license     MIT
// @match       https://www.wanikani.com/*
// @match       https://preview.wanikani.com/*
// @grant       none
// @run-at      document-start
// ==/UserScript==

(() => {
    'use strict'

    const ROOT_CLASS = 'wkrd-active'
    const CORRECT_CLASS = 'wkrd-correct'
    const INCORRECT_CLASS = 'wkrd-incorrect'
    const STYLE_ID = 'wkrd-styles'
    let inputContainer = null
    let resultObserver = null
    let artworkObserver = null

    installStyles()
    updateTheme()

    document.addEventListener('turbo:before-render', handleBeforeRender)
    document.addEventListener('turbo:load', handlePageLoad)
    window.addEventListener('popstate', updateTheme)
    window.addEventListener('willShowNextQuestion', clearResultState, {passive: true})
    window.addEventListener('didUnanswerQuestion', clearResultState, {passive: true})

    function isQuizPage() {
        const path = window.location.pathname
        return (
            path.startsWith('/subjects/review') ||
            path.startsWith('/subjects/extra_study') ||
            path.startsWith('/subjects/lesson/quiz') ||
            /^\/subject-lessons\/[^/]+\/quiz(?:\/|$)/.test(path) ||
            /^\/recent-mistakes\/.*\/quiz(?:\/|$)/.test(path)
        )
    }

    function updateTheme() {
        installStyles()
        document.documentElement.classList.add(ROOT_CLASS)
        updateDashboardArtwork()
        if (isQuizPage()) startResultObserver()
        else stopResultObserver()
    }

    function updateDashboardArtwork() {
        const path = window.location.pathname
        if (path !== '/' && !path.startsWith('/dashboard')) {
            artworkObserver?.disconnect()
            artworkObserver = null
            return
        }

        // Use WaniKani's own dark artwork, including its palette variants and
        // animation. Avoid copying assets or depending on hashed image URLs.
        const selector = '.days-studied-widget__background'
        const darkClass = 'days-studied-widget__background--dark'
        const apply = (root) => {
            if (root.nodeType !== 1 && root.nodeType !== 9) return
            if (root.matches?.(selector)) root.classList.add(darkClass)
            root.querySelectorAll(selector).forEach((element) => element.classList.add(darkClass))
        }
        apply(document)
        if (artworkObserver) return
        artworkObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) mutation.addedNodes.forEach(apply)
        })
        // Widgets and customization previews can arrive after the initial page.
        artworkObserver.observe(document.documentElement, {childList: true, subtree: true})
    }

    function handleBeforeRender() {
        clearResultState()
        inputContainer = null
        stopResultObserver()
    }

    function handlePageLoad() {
        updateTheme()
        if (isQuizPage()) mountInputContainer()
    }

    function startResultObserver() {
        const start = () => {
            if (resultObserver) return
            resultObserver = new MutationObserver((mutations) => {
                const resultChanged = mutations.some(
                    (mutation) =>
                        mutation.type === 'attributes' && mutation.target === inputContainer,
                )
                if (!inputContainer?.isConnected) mountInputContainer()
                else if (resultChanged) updateResultState()
            })
            resultObserver.observe(document.body, {
                attributes: true,
                attributeFilter: ['correct', 'incorrect'],
                childList: true,
                subtree: true,
            })
            mountInputContainer()
        }

        if (document.body) start()
        else document.addEventListener('DOMContentLoaded', start, {once: true})
    }

    function stopResultObserver() {
        resultObserver?.disconnect()
        resultObserver = null
        inputContainer = null
        clearResultState()
    }

    function mountInputContainer() {
        const nextContainer = document.querySelector('.quiz-input__input-container')
        if (nextContainer === inputContainer) {
            updateResultState()
            return
        }
        inputContainer = nextContainer
        updateResultState()
    }

    function updateResultState() {
        clearResultState()
        if (!inputContainer) return

        const correctValue = inputContainer.getAttribute('correct')
        const isIncorrect =
            inputContainer.hasAttribute('incorrect') || correctValue === 'false'
        const isCorrect =
            !isIncorrect &&
            inputContainer.hasAttribute('correct') &&
            correctValue !== 'false'

        document.documentElement.classList.toggle(CORRECT_CLASS, isCorrect)
        document.documentElement.classList.toggle(INCORRECT_CLASS, isIncorrect)
    }

    function clearResultState() {
        document.documentElement.classList.remove(CORRECT_CLASS, INCORRECT_CLASS)
    }

    function installStyles() {
        if (document.getElementById(STYLE_ID)) return

        const style = document.createElement('style')
        style.id = STYLE_ID
        style.textContent = `
            html.${ROOT_CLASS} {
                color-scheme: dark;
                --wkrd-bg: #151719;
                --wkrd-surface: #1c1f22;
                --wkrd-surface-raised: #25292d;
                --wkrd-surface-hover: #30353a;
                --wkrd-border: #41474d;
                --wkrd-border-strong: #596169;
                --wkrd-text: #f3f5f6;
                --wkrd-muted: #aeb6bc;
                --wkrd-focus: #78a9be;
                --wkrd-correct: #254b35;
                --wkrd-correct-border: #3f7655;
                --wkrd-incorrect: #5a2930;
                --wkrd-incorrect-border: #8a414b;
                --color-text: #f3f5f6;
                --color-text-subdued: #b7bec3;
                --color-text-dimmed: #929ba2;
                --color-text-link: #86bdd4;
                --color-link: #86bdd4;
                --color-border: #41474d;
                --color-widget-background: #1c1f22;
                /* Native dashboard widgets have their own text and surface tokens. */
                --color-widget-primary-text: var(--wkrd-text);
                --color-widget-secondary-text: var(--wkrd-muted);
                --color-widget-border: var(--wkrd-border);
                --color-widget-divider: var(--wkrd-border);
                --color-item-spread-total-background: var(--wkrd-surface-raised);
                --color-item-spread-total-border: var(--wkrd-border-strong);
                --color-item-spread-row-icon: var(--wkrd-muted);
                --color-item-spread-graph-axis-label: var(--wkrd-muted);
                --color-count-bubble-background: var(--wkrd-surface-raised);
                --color-count-bubble-border: var(--wkrd-border-strong);
                --color-count-bubble-text: var(--wkrd-text);
                --color-count-bubble-divider: var(--wkrd-border-strong);
                --color-extra-study-button-background: var(--wkrd-surface-raised);
                --color-extra-study-button-hover-background: var(--wkrd-surface-hover);
                --color-extra-study-button-active-background: var(--wkrd-surface-hover);
                --color-extra-study-button-disabled-background: var(--wkrd-surface);
                --color-extra-study-button-border: var(--wkrd-border);
                --color-extra-study-button-text: var(--wkrd-text);
                --color-extra-study-button-icon: var(--wkrd-muted);
                --color-extra-study-button-remaining-text: var(--wkrd-muted);
                --color-extra-study-single-button-empty-background: var(--wkrd-surface-raised);
                --color-extra-study-split-subjects-background: var(--wkrd-surface-raised);
                --color-extra-study-split-subjects-border: var(--wkrd-border);
                --color-level-progress-item-stat-border: var(--wkrd-border);
                --color-level-progress-item-stat-hover-background: var(--wkrd-surface-hover);
                --color-level-progress-item-stat-active-background: var(--wkrd-surface-hover);
                --color-level-progress-subjects-background: var(--wkrd-surface-raised);
                --color-level-progress-subjects-border: var(--wkrd-border);
                --color-days-studied-content-background: var(--wkrd-surface);
                --color-days-studied-digit: var(--wkrd-muted);
                --color-days-studied-digit-background: var(--wkrd-surface-raised);
                --color-days-studied-digit-border: var(--wkrd-border);
                --color-study-streak-today-incomplete-background: var(--wkrd-surface-raised);
                --color-grouped-navigation-background: var(--wkrd-surface);
                --color-grouped-navigation-header-text: var(--wkrd-muted);
                --color-grouped-navigation-link-background: var(--wkrd-surface-raised);
                --color-grouped-navigation-link-text: var(--wkrd-text);
                --color-grouped-navigation-link-hover-background: var(--wkrd-surface-hover);
                --color-grouped-navigation-link-hover-text: var(--wkrd-text);
                --color-grouped-navigation-link-active-background: var(--wkrd-surface-hover);
                --color-grouped-navigation-link-active-border: var(--wkrd-border-strong);
                --color-wk-panel-background: #1c1f22;
                --color-wk-panel-content-background: #1c1f22;
                --color-wk-panel-border: #41474d;
                --color-wk-panel-header-text: #f3f5f6;
                --color-button-primary-background: var(--wkrd-surface-raised);
                --color-button-primary-hover-background: var(--wkrd-surface-hover);
                --color-button-primary-active-background: var(--wkrd-surface-hover);
                --color-button-primary-border: var(--wkrd-border-strong);
                --color-button-primary-icon: var(--wkrd-muted);
                --color-button-secondary-background: var(--wkrd-surface-raised);
                --color-button-secondary-hover-background: var(--wkrd-surface-hover);
                --color-button-secondary-active-background: var(--wkrd-surface-hover);
                --color-button-secondary-border: var(--wkrd-border-strong);
                --color-button-secondary-icon: var(--wkrd-muted);
                --color-button-frameless-text: #c0c7cc;
                --color-focus-ring: #78a9be;

                /* Shared native tokens cover pages outside the review interface. */
                --color-app-background: var(--wkrd-bg);
                --color-title-underline: var(--wkrd-border);
                --color-link-hover: #b8dbe9;
                --color-link-active: #b8dbe9;
                --color-focus: var(--wkrd-focus);
                --color-radical: #176384;
                --color-radical-dark: #124c66;
                --color-radical-highlight: #57b6dc;
                --color-radical-lowlight: #103e52;
                --color-kanji: #812456;
                --color-kanji-dark: #652044;
                --color-kanji-highlight: #d473aa;
                --color-kanji-lowlight: #481b3a;
                --color-vocabulary: #593180;
                --color-vocabulary-dark: #452763;
                --color-vocabulary-highlight: #a982d2;
                --color-vocabulary-lowlight: #35204f;
                --color-locked: #41474d;
                --color-locked-dark: #353a3f;
                --color-locked-highlight: #596169;
                --color-locked-lowlight: #30353a;
                --color-text-highlight-radical-background: #1d5065;
                --color-text-highlight-radical-text: #e0f3fb;
                --color-text-highlight-kanji-background: #652448;
                --color-text-highlight-kanji-text: #ffe3f1;
                --color-text-highlight-vocabulary-background: #4e3168;
                --color-text-highlight-vocabulary-text: #f1e4ff;
                --color-text-highlight-meaning-background: #3c4249;
                --color-text-highlight-meaning-text: var(--wkrd-text);
                --color-text-highlight-reading-background: #28543f;
                --color-text-highlight-reading-text: #e2f7eb;
                --color-page-header-title: var(--wkrd-text);
                --color-page-header-subtitle: var(--wkrd-muted);
                --color-page-header-description: var(--wkrd-muted);
                --color-page-nav-header-icon: var(--wkrd-muted);
                --color-global-header-background: var(--wkrd-surface);
                --color-global-header-border: var(--wkrd-border);
                --color-hint-background: var(--wkrd-surface-raised);
                --color-text-shadow-light: transparent;
                --text-shadow-light: none;
                --color-input-background: #111315;
                --color-input-border: var(--wkrd-border-strong);
                --color-input-focus-border: var(--wkrd-focus);
                --color-code-text: #f4afca;
                --color-code-background: var(--wkrd-surface-raised);
                --color-code-border: var(--wkrd-border);
                --color-form-error-text: #ffadb7;
                --color-form-error-background: #45262c;
                --color-form-error-text-shadow: transparent;
                --color-form-control-indicator-success: #9bd5ac;
                --color-form-control-indicator-loading: var(--wkrd-muted);
                --color-alert-error-background: #45262c;
                --color-alert-error-text: #ffdfe2;
                --color-alert-error-border: #8a414b;
                --color-alert-info-background: #243542;
                --color-alert-info-text: #d8eaf4;
                --color-alert-info-border: #54788b;
                --color-notification-error-background: #45262c;
                --color-notification-error-border: #8a414b;
                --color-notification-error-icon: #ffadb7;
                --color-notification-error-reload: #ffdfe2;
                --color-notification-info-background: #243542;
                --color-notification-info-border: #54788b;
                --color-notification-info-icon: #a9d6ed;
                --color-notification-info-reload: #d8eaf4;
                --color-notification-success-background: #254b35;
                --color-notification-success-border: #3f7655;
                --color-notification-success-icon: #9bd5ac;
                --color-notification-success-reload: #dcf3e3;
                --color-button-icon-only-text: var(--wkrd-muted);
                --color-button-icon-only-hover-background: var(--wkrd-surface-hover);
                --color-button-icon-only-active-background: var(--wkrd-surface-hover);
                --color-button-frameless-icon: var(--wkrd-muted);
                --color-button-frameless-hover-background: var(--wkrd-surface-hover);
                --color-button-frameless-active-background: var(--wkrd-surface-hover);
                --color-chip-background: var(--wkrd-surface-raised);
                --color-chip-border: var(--wkrd-border);
                --color-chip-text: var(--wkrd-text);
                --color-chip-hover-background: var(--wkrd-surface-hover);
                --color-chip-hover-border: var(--wkrd-border-strong);
                --color-chip-hover-text: var(--wkrd-text);
                --color-chip-active-background: #315568;
                --color-chip-active-border: var(--wkrd-focus);
                --color-chip-active-text: var(--wkrd-text);

                /* Lessons, subject lists, and item details use the same palette. */
                --colorSlideBackground: var(--wkrd-surface);
                --colorSlideBorder: var(--wkrd-border);
                --colorSlideShadow: transparent;
                --color-subject-slide-navigation-background: var(--wkrd-surface-raised);
                --color-subject-slide-navigation-button-hover: var(--wkrd-surface-hover);
                --color-section-header-border: var(--wkrd-border);
                --color-section-subtitle: var(--wkrd-muted);
                --color-mnemonic-image-background: var(--wkrd-surface-raised);
                --color-lesson-picker-footer-background: #1c1f22ee;
                --color-lesson-picker-footer-border: 1px solid var(--wkrd-border);
                --color-lesson-and-review-border: var(--wkrd-border);
                --color-lesson-and-review-border-hover: var(--wkrd-focus);
                --color-lesson-and-review-count-background: var(--wkrd-surface-hover);
                --color-lesson-and-review-count-zero-background: var(--wkrd-surface-raised);
                --color-subject-list-separator: var(--wkrd-border);
                --color-subject-legend-title: var(--wkrd-muted);
                --color-subject-character-secondary-info: var(--wkrd-muted);
                --color-subject-character-grid-header-background: var(--wkrd-surface);
                --color-subject-character-grid-header-title: var(--wkrd-text);
                --color-subject-character-grid-header-subtitle: var(--wkrd-muted);
                --color-subject-character-grid-item-background: var(--wkrd-surface-raised);
                --color-subject-character-grid-item-border: var(--wkrd-border);
                --color-subject-page-header-border: var(--wkrd-border);
                --color-subject-srs-progress-stage-background: var(--wkrd-surface-hover);
                --color-subject-srs-progress-text: var(--wkrd-muted);
                --color-user-note-count: var(--wkrd-muted);
                --color-recent-mistakes-intro-divider: var(--wkrd-border);
                --color-last-item-border: var(--wkrd-border);
                --color-last-item-section-divider: var(--wkrd-border);
                --color-last-item-correct-icon: #9bd5ac;
                --color-last-item-incorrect-icon: #ffadb7;
                --color-wk-panel-content-title-underline: var(--wkrd-border);
                --colorAdditionalInfoButtonBackground: var(--wkrd-surface);
                --colorAdditionalInfoButtonShadow: transparent;
                --colorAdditionalInfoButtonText: var(--wkrd-text);
                --colorAdditionalInfoButtonDisabledBackground: #1a1c1f;
                --colorAdditionalInfoButtonDisabledShadow: transparent;
                --colorAdditionalInfoButtonDisabledText: #717980;
                --colorAdditionalInfoButtonActiveBackground: var(--wkrd-surface-hover);
                --colorAdditionalInfoButtonActiveShadow: transparent;
                --colorAdditionalInfoButtonActiveText: var(--wkrd-text);
                --colorAdditionalInfoBackground: var(--wkrd-bg);
                --colorAdditionalInfoBorder: var(--wkrd-border);
                --colorAdditionalInfoShadow: transparent;
                --colorQuizExceptionBackground: var(--wkrd-surface-raised);
                --colorQuizExceptionShadow: transparent;
                --colorQuizExceptionText: var(--wkrd-text);

                /* Forms, account pages, and dialogs. */
                --color-modal-background: var(--wkrd-surface-raised);
                --color-setting-divider: var(--wkrd-border);
                --color-authentication-footer-divider: var(--wkrd-border);
                --color-subscription-plan-background: var(--wkrd-surface);
                --color-subscription-plan-border: var(--wkrd-border);
                --color-subscription-plan-divider: var(--wkrd-border);
                --color-billing-plan-background: var(--wkrd-surface);
                --color-billing-plan-border: var(--wkrd-border);
                --color-billing-plan-title-background: var(--wkrd-surface-raised);
                --color-billing-receipt-background-hover: var(--wkrd-surface-hover);
                --color-billing-activation-error: #ffadb7;
                --color-public-profile-info-background: var(--wkrd-surface);
                --color-public-profile-info-text: var(--wkrd-muted);
                --color-public-profile-avatar-border: var(--wkrd-border);
                --color-count_bubble-background: var(--wkrd-surface-raised);
                --color-count_bubble-text: var(--wkrd-text);

                /* Dashboard charts, empty states, and widget customization. */
                --color-empty-widget-background: var(--wkrd-surface);
                --color-placeholder-pulse-default-stop-1: var(--wkrd-surface-raised);
                --color-placeholder-pulse-default-stop-2: var(--wkrd-surface-hover);
                --color-extra-study-flashcard-loading-background: var(--wkrd-surface);
                --color-extra-study-flashcard-placeholder-pulse-stop-1: var(--wkrd-surface-raised);
                --color-extra-study-flashcard-placeholder-pulse-stop-2: var(--wkrd-surface-hover);
                --color-item-spread-row-background: var(--wkrd-surface-raised);
                --color-item-spread-row-border: var(--wkrd-border);
                --color-item-spread-row-hover-background: var(--wkrd-surface-hover);
                --color-item-spread-row-active-background: var(--wkrd-surface-hover);
                --color-item-spread-graph-grid-line: var(--wkrd-border);
                --color-level-progress-indicator-background: var(--wkrd-border);
                --color-level-progress-bar: var(--wkrd-border);
                --color-heat-map-cell-empty: var(--wkrd-surface);
                --color-heat-map-cell-level-0: var(--wkrd-surface-raised);
                --color-heat-map-cell-selected-border: var(--wkrd-focus);
                --color-review-forecast-header-background: #423b28;
                --color-review-forecast-bar-zero: var(--wkrd-surface-raised);
                --color-review-forecast-bar-zero-border: var(--wkrd-border);
                --color-review-forecast-day-hover: var(--wkrd-surface-raised);
                --color-review-forecast-day-active: var(--wkrd-surface-hover);
                --color-review-forecast-day-header-label: var(--wkrd-muted);
                --color-review-forecast-priority-count: var(--wkrd-muted);
                --color-review-forecast-increase-positive: #9bd5ac;
                --color-study-streak-day-miss-icon: var(--wkrd-muted);
                --color-study-streak-today-complete-background: #254b35;
                --color-study-streak-today-complete-text: #dcf3e3;
                --color-progress-chart-bar-background: var(--wkrd-border);
                --color-progress-chart-metric-text: var(--wkrd-muted);
                --color-progress-chart-metric-count: var(--wkrd-text);
                --color-progress-chart-metric-count-background: var(--wkrd-surface-hover);
                --color-widget-gallery-divider: var(--wkrd-border);
                --color-widget-gallery-background: var(--wkrd-surface);
                --color-widget-gallery-widget-background: var(--wkrd-bg);
                --color-widget-gallery-navigation-background: var(--wkrd-surface-raised);
                --color-widget-gallery-description: var(--wkrd-muted);
                --color-dashboard-customization-menu-background: var(--wkrd-surface);
                --color-dashboard-customization-menu-border: var(--wkrd-border);
                --color-dashboard-customization-menu-divider: var(--wkrd-border);
                --color-dashboard-customization-menu-text: var(--wkrd-text);
                --color-dashboard-customization-row-background: var(--wkrd-surface-raised);
                --color-dashboard-customization-row-control: var(--wkrd-muted);
                --color-dashboard-customization-widget-container-background: var(--wkrd-bg);
                --color-dashboard-customization-widget-container-control: var(--wkrd-muted);
                --color-dashboard-customization-template-background: var(--wkrd-surface);
                --color-dashboard-customization-template-hover-background: var(--wkrd-surface-hover);
                --color-dashboard-customization-template-selected-background: #243542;
                --color-dashboard-customization-template-disabled-background: #1a1c1f;
                --color-dashboard-customization-template-border: var(--wkrd-border);
                --color-dashboard-customization-template-selected-border: var(--wkrd-focus);
                --color-dashboard-customization-template-disabled-border: var(--wkrd-border);
                --color-dashboard-customization-template-illustration-background: var(--wkrd-bg);
                --color-dashboard-customization-template-illustration-selected-background: #243542;
                --color-dashboard-customization-template-illustration-border: var(--wkrd-border);
                --color-dashboard-customization-template-illustration-selected-border: var(--wkrd-focus);
                --color-dashboard-customization-template-illustration-bar-background: var(--wkrd-border);
                --color-dashboard-customization-template-illustration-bar-selected-background: #54788b;
                --color-dashboard-customization-template-illustration-bar-disabled-background: var(--wkrd-surface);
                --color-dashboard-customization-template-illustration-bar-border: var(--wkrd-muted);
                --color-dashboard-customization-template-illustration-bar-selected-border: var(--wkrd-focus);
                --color-dashboard-customization-template-illustration-bar-disabled-border: var(--wkrd-border);
                --color-dashboard-customization-template-radio: var(--wkrd-muted);
                --color-dashboard-customization-template-radio-selected: var(--wkrd-focus);
            }

            /* Preserve each widget's identity with dark pink and blue surfaces. */
            html.${ROOT_CLASS} :is(.todays-lessons-widget, .reviews-widget)[class] {
                --color-widget-background: var(--wkrd-surface);
                --color-widget-border: var(--wkrd-border);
                --color-widget-primary-text: var(--wkrd-text);
                --color-widget-secondary-text: var(--wkrd-muted);
                --color-count-bubble-background: var(--wkrd-surface-raised);
                --color-count-bubble-border: var(--wkrd-border-strong);
                --color-count-bubble-divider: var(--wkrd-border);
                --color-count-bubble-text: var(--wkrd-text);
                --color-button-border: var(--wkrd-border-strong);
                --color-button-hover-border: var(--wkrd-focus);
                --color-button-active-border: var(--wkrd-border-strong);
                --color-button-edge: var(--wkrd-bg);
                --color-button-hover-edge: var(--wkrd-bg);
                --color-button-active-edge: var(--wkrd-bg);
            }

            html.${ROOT_CLASS} .todays-lessons-widget[class] {
                --color-widget-background: #35202d;
                --color-widget-border: #694458;
                --color-widget-secondary-text: #dcbacb;
                --color-count-bubble-background: #593149;
                --color-count-bubble-border: #80556c;
                --color-count-bubble-text: #ffe3f1;
            }

            html.${ROOT_CLASS} .reviews-widget[class] {
                --color-widget-background: #1d3443;
                --color-widget-border: #42677d;
                --color-widget-secondary-text: #b6cfdf;
                --color-count-bubble-background: #2b4c62;
                --color-count-bubble-border: #547f99;
                --color-count-bubble-text: #e0f3ff;
            }

            html.${ROOT_CLASS} .days-studied-widget__background--dark {
                opacity: 0.65;
            }

            html.${ROOT_CLASS} :is(.sitemap__section-header, .search-button, .navigation__toggle) {
                background: var(--wkrd-surface-raised) !important;
                color: var(--wkrd-text) !important;
                border-color: var(--wkrd-border) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} :is(.sitemap__section-header, .search-button, .navigation__toggle):hover {
                background: var(--wkrd-surface-hover) !important;
            }

            html.${ROOT_CLASS} .character-header--radical {
                background: var(--color-radical-gradient) !important;
                text-shadow: none;
            }

            html.${ROOT_CLASS} .character-header--kanji {
                background: var(--color-kanji-gradient) !important;
                text-shadow: none;
            }

            html.${ROOT_CLASS} .character-header--vocabulary {
                background: var(--color-vocabulary-gradient) !important;
                text-shadow: none;
            }

            html.${ROOT_CLASS} .subject-character {
                --color-blue: var(--color-radical);
                --color-blue-dark: #9ed9ed;
                --color-blue-light: #253f4b;
                --color-pink: var(--color-kanji);
                --color-pink-dark: #f2b3d7;
                --color-pink-light: #4b293b;
                --color-purple: var(--color-vocabulary);
                --color-purple-dark: #d4b9ee;
                --color-purple-light: #3f2d53;
            }

            html.${ROOT_CLASS} .subject-character__characters-text {
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} :is(.lesson-picker__section-toggle, .lesson-picker__section-toggle-all) {
                background: var(--wkrd-surface-raised) !important;
                color: #b8dbe9 !important;
                border: 1px solid var(--wkrd-border);
                border-radius: 6px;
                padding: 6px 10px;
            }

            html.${ROOT_CLASS} .lesson-picker__subject[aria-selected=false] {
                opacity: 0.85;
            }

            html.${ROOT_CLASS} .lesson-picker__subject[aria-selected=true] {
                outline: 2px solid var(--wkrd-focus);
                outline-offset: 3px;
                border-radius: 8px;
            }

            html.${ROOT_CLASS} :is(.reader, .readers-list__item, .empty-message-container) {
                background: var(--wkrd-surface);
                color: var(--wkrd-text);
            }

            html.${ROOT_CLASS} :is(.subject-progress__button, .sitemap__section-header) {
                color: var(--wkrd-text);
                text-shadow: none;
            }

            html.${ROOT_CLASS} :is(.kana-chart__character, .kana-chart__backspace, .batch-list__item-button) {
                background: var(--wkrd-surface-raised);
                color: var(--wkrd-text);
                text-shadow: none;
            }

            html.${ROOT_CLASS} .kana-chart__tab:not(.kana-chart__tab--selected):hover {
                color: var(--wkrd-text);
            }

            html.${ROOT_CLASS} .subject-collocations__pattern-name[aria-selected=true],
            html.${ROOT_CLASS} .subject-collocations__pattern-name[aria-selected=true]::after {
                background: var(--wkrd-surface-hover);
                color: var(--wkrd-text);
                text-shadow: none;
            }

            html.${ROOT_CLASS} turbo-frame[data-show-loading=true]:not([complete])::after {
                background-color: #151719e6;
            }

            html.${ROOT_CLASS},
            html.${ROOT_CLASS} body,
            html.${ROOT_CLASS} #turbo-body,
            html.${ROOT_CLASS} main,
            html.${ROOT_CLASS} .page-container,
            html.${ROOT_CLASS} .dashboard,
            html.${ROOT_CLASS} .dashboard__content {
                background-color: var(--wkrd-bg) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} body {
                scrollbar-color: var(--wkrd-border-strong) var(--wkrd-bg);
            }

            html.${ROOT_CLASS} ::selection {
                background: #315d70;
                color: #fff;
            }

            html.${ROOT_CLASS} a:not(.subject-character):not(.subject-character__link) {
                color: #86bdd4;
            }

            html.${ROOT_CLASS} .global-header,
            html.${ROOT_CLASS} .site-header,
            html.${ROOT_CLASS} .navigation,
            html.${ROOT_CLASS} .navigation__menu,
            html.${ROOT_CLASS} .navigation__mobile-menu,
            html.${ROOT_CLASS} .user-summary,
            html.${ROOT_CLASS} .sitemap,
            html.${ROOT_CLASS} body > footer,
            html.${ROOT_CLASS} .site-footer {
                background: var(--wkrd-surface) !important;
                background-image: none !important;
                border-color: var(--wkrd-border) !important;
                box-shadow: none !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} .global-header a,
            html.${ROOT_CLASS} .site-header a,
            html.${ROOT_CLASS} .navigation a,
            html.${ROOT_CLASS} .user-summary a,
            html.${ROOT_CLASS} .sitemap a,
            html.${ROOT_CLASS} body > footer a,
            html.${ROOT_CLASS} .site-footer a {
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .navigation__link,
            html.${ROOT_CLASS} .navigation__button,
            html.${ROOT_CLASS} .global-header button,
            html.${ROOT_CLASS} .site-header button,
            html.${ROOT_CLASS} .user-summary button {
                background: var(--wkrd-surface-raised) !important;
                background-image: none !important;
                border-color: var(--wkrd-border) !important;
                box-shadow: none !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .navigation__link:hover,
            html.${ROOT_CLASS} .navigation__button:hover,
            html.${ROOT_CLASS} .global-header button:hover,
            html.${ROOT_CLASS} .site-header button:hover,
            html.${ROOT_CLASS} .user-summary button:hover {
                background: var(--wkrd-surface-hover) !important;
                border-color: var(--wkrd-border-strong) !important;
            }

            html.${ROOT_CLASS} .wk-panel,
            html.${ROOT_CLASS} [class*="wk-panel--"],
            html.${ROOT_CLASS} .wk-panel__header,
            html.${ROOT_CLASS} .wk-panel__content,
            html.${ROOT_CLASS} .item-spread-table-widget,
            html.${ROOT_CLASS} .item-spread-table-row,
            html.${ROOT_CLASS} .review-forecast,
            html.${ROOT_CLASS} .progress-and-forecast,
            html.${ROOT_CLASS} .recent-unlocks,
            html.${ROOT_CLASS} .level-progressions,
            html.${ROOT_CLASS} .dashboard__row {
                background-color: var(--wkrd-surface) !important;
                background-image: none !important;
                border-color: var(--wkrd-border) !important;
                box-shadow: none !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .wk-panel__header,
            html.${ROOT_CLASS} .item-spread-table-row__header {
                background-color: var(--wkrd-surface-raised) !important;
            }

            html.${ROOT_CLASS} .wk-panel *,
            html.${ROOT_CLASS} .item-spread-table-widget *,
            html.${ROOT_CLASS} .review-forecast *,
            html.${ROOT_CLASS} .progress-and-forecast * {
                border-color: var(--wkrd-border);
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .wk-panel :is(h1, h2, h3, h4, p, span, time, strong),
            html.${ROOT_CLASS} .item-spread-table-widget :is(h1, h2, h3, h4, p, span, time, strong),
            html.${ROOT_CLASS} .review-forecast :is(h1, h2, h3, h4, p, span, time, strong) {
                color: inherit;
            }

            /* Keep the SRS extension's secondary labels distinct from its counts. */
            html.${ROOT_CLASS} .item-spread-table-widget .wk-srs-breakdown {
                color: var(--wkrd-muted);
            }

            html.${ROOT_CLASS} .item-spread-table-widget .wk-srs-breakdown strong {
                color: var(--wkrd-text);
            }

            html.${ROOT_CLASS} table:not(.subject-character),
            html.${ROOT_CLASS} .table {
                background: var(--wkrd-surface) !important;
                border-color: var(--wkrd-border) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} table:not(.subject-character) thead,
            html.${ROOT_CLASS} table:not(.subject-character) th,
            html.${ROOT_CLASS} .table thead,
            html.${ROOT_CLASS} .table th {
                background: var(--wkrd-surface-raised) !important;
                border-color: var(--wkrd-border) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} table:not(.subject-character) td,
            html.${ROOT_CLASS} table:not(.subject-character) tr,
            html.${ROOT_CLASS} .table td,
            html.${ROOT_CLASS} .table tr {
                border-color: var(--wkrd-border) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} table:not(.subject-character) tbody tr:nth-child(even),
            html.${ROOT_CLASS} .table tbody tr:nth-child(even) {
                background: rgba(255, 255, 255, 0.025) !important;
            }

            html.${ROOT_CLASS} .subject-page,
            html.${ROOT_CLASS} .subject-page__content,
            html.${ROOT_CLASS} .subject-section,
            html.${ROOT_CLASS} .subject-section__content,
            html.${ROOT_CLASS} .subject-navigation,
            html.${ROOT_CLASS} .subject-pager,
            html.${ROOT_CLASS} .subject-list,
            html.${ROOT_CLASS} .subject-legend {
                background-color: var(--wkrd-bg) !important;
                border-color: var(--wkrd-border) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} :is(
                .page-nav__link,
                .page-navigation__link,
                .wk-nav__item-link,
                .subject-navigation__link,
                .subject-page__navigation-link,
                .subject-section-navigation__link,
                a[href="#meaning"],
                a[href="#readings"],
                a[href="#reading"],
                a[href="#found-in-vocabulary"],
                a[href="#found-in-vocab"],
                a[href="#found-in-kanji"],
                a[href="#vocabulary"],
                a[href="#vocabulary-items"],
                a[href="#progress"]
            ) {
                background: var(--wkrd-surface-raised) !important;
                background-image: none !important;
                border: 1px solid var(--wkrd-border) !important;
                box-shadow: none !important;
                color: #b8dbe9 !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} :is(
                .page-nav__link,
                .page-navigation__link,
                .wk-nav__item-link,
                .subject-navigation__link,
                .subject-page__navigation-link,
                .subject-section-navigation__link,
                a[href="#meaning"],
                a[href="#readings"],
                a[href="#reading"],
                a[href="#found-in-vocabulary"],
                a[href="#found-in-vocab"],
                a[href="#found-in-kanji"],
                a[href="#vocabulary"],
                a[href="#vocabulary-items"],
                a[href="#progress"]
            ):hover,
            html.${ROOT_CLASS} :is(
                .page-nav__link,
                .page-navigation__link,
                .wk-nav__item-link,
                .subject-navigation__link,
                .subject-page__navigation-link,
                .subject-section-navigation__link
            )[aria-current="true"] {
                background: var(--wkrd-surface-hover) !important;
                border-color: var(--wkrd-border-strong) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} main h1,
            html.${ROOT_CLASS} main h1 *,
            html.${ROOT_CLASS} .page-header__content,
            html.${ROOT_CLASS} .page-header__title,
            html.${ROOT_CLASS} .page-header__title-text,
            html.${ROOT_CLASS} .subject-header,
            html.${ROOT_CLASS} .subject-header__title,
            html.${ROOT_CLASS} .subject-header__title-text,
            html.${ROOT_CLASS} .subject-header__meaning,
            html.${ROOT_CLASS} .subject-page__title,
            html.${ROOT_CLASS} .subject-page__title-text,
            html.${ROOT_CLASS} .subject-page__meaning {
                color: #dce2e5 !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .subject-character,
            html.${ROOT_CLASS} .subject-character__link,
            html.${ROOT_CLASS} .subject-character__content,
            html.${ROOT_CLASS} .subject-character__info {
                border-color: var(--wkrd-border) !important;
                box-shadow: none !important;
            }

            html.${ROOT_CLASS} .subject-character__info,
            html.${ROOT_CLASS} .subject-character__meaning,
            html.${ROOT_CLASS} .subject-character__reading {
                background: var(--wkrd-surface-raised) !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .dropdown-menu,
            html.${ROOT_CLASS} .popover,
            html.${ROOT_CLASS} .menu:not(.character-header__menu),
            html.${ROOT_CLASS} [role="menu"],
            html.${ROOT_CLASS} .modal,
            html.${ROOT_CLASS} .wk-modal,
            html.${ROOT_CLASS} [role="dialog"]:not(.ui-dialog) {
                background: var(--wkrd-surface-raised) !important;
                background-image: none !important;
                border-color: var(--wkrd-border) !important;
                box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} .dropdown-menu a,
            html.${ROOT_CLASS} .popover a,
            html.${ROOT_CLASS} [role="menu"] a,
            html.${ROOT_CLASS} [role="menuitem"] {
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .dropdown-menu a:hover,
            html.${ROOT_CLASS} [role="menuitem"]:hover {
                background: var(--wkrd-surface-hover) !important;
            }

            html.${ROOT_CLASS} .user-synonyms__form_container {
                background: var(--wkrd-surface-raised) !important;
                border: 1px solid var(--wkrd-border) !important;
                box-shadow: 0 18px 48px rgba(0, 0, 0, 0.55) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} .user-synonyms__form_container .wk-title {
                border-color: var(--wkrd-border) !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .user-synonyms__form_container .wk-form__input {
                background: #111315 !important;
                border: 1px solid var(--wkrd-border) !important;
                box-shadow: none !important;
                caret-color: var(--wkrd-text) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} .user-synonyms__form_container .wk-form__input:focus {
                border-color: var(--wkrd-focus) !important;
                box-shadow: 0 0 0 3px rgba(120, 169, 190, 0.22) !important;
                outline: none !important;
            }

            html.${ROOT_CLASS} .user-synonyms__form_container .wk-button__shadow {
                display: none !important;
            }

            html.${ROOT_CLASS} .user-synonyms__form_container .wk-button__edge {
                background: #111315 !important;
            }

            html.${ROOT_CLASS} .user-synonyms__form_container .wk-button:not(.wk-button--icon-only) .wk-button__content {
                background: var(--wkrd-surface-hover) !important;
                background-image: none !important;
                border-color: var(--wkrd-border-strong) !important;
                box-shadow: none !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .user-synonyms__form_container .wk-button:not(.wk-button--icon-only):hover .wk-button__content {
                background: #394047 !important;
                border-color: var(--wkrd-focus) !important;
            }

            html.${ROOT_CLASS} .user-synonyms__form_container .user-synonyms__close-button .wk-button,
            html.${ROOT_CLASS} .user-synonyms__form_container .user-synonyms__close-button .wk-button__content {
                background: transparent !important;
                border-color: transparent !important;
                box-shadow: none !important;
                color: var(--wkrd-muted) !important;
            }

            html.${ROOT_CLASS} .user-synonyms__form_container .user-synonyms__close-button .wk-button:hover .wk-button__content {
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} .user-synonyms__form_container :is(.wk-button__icon, .wk-button__text, .wk-icon, svg) {
                color: inherit !important;
                fill: currentColor !important;
            }

            html.${ROOT_CLASS} input:not(.quiz-input__input):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]),
            html.${ROOT_CLASS} textarea,
            html.${ROOT_CLASS} select {
                background-color: #111315 !important;
                border-color: var(--wkrd-border) !important;
                caret-color: var(--wkrd-text) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} input[type="checkbox"],
            html.${ROOT_CLASS} input[type="radio"] {
                accent-color: #628fa3;
            }

            html.${ROOT_CLASS} :is(input, textarea, select, button, a):focus-visible {
                outline-color: var(--wkrd-focus) !important;
            }

            html.${ROOT_CLASS} body,
            html.${ROOT_CLASS} .quiz,
            html.${ROOT_CLASS} .quiz__content {
                background: var(--wkrd-bg) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} .quiz-input,
            html.${ROOT_CLASS} .quiz-input__input-container,
            html.${ROOT_CLASS} #answer-form {
                background: var(--wkrd-surface) !important;
            }

            html.${ROOT_CLASS} .quiz-input__question-type-container,
            html.${ROOT_CLASS} .quiz-input__question-type-container[data-question-type="meaning"],
            html.${ROOT_CLASS} .quiz-input__question-type-container[data-question-type="reading"] {
                background: #181a1d !important;
                background-image: none !important;
                border-color: var(--wkrd-border) !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .quiz-input__question-type-container[data-question-type="meaning"] {
                border-top-color: #555d64 !important;
            }

            html.${ROOT_CLASS} .quiz-input__question-type-container[data-question-type="reading"] {
                border-top-color: #426777 !important;
            }

            html.${ROOT_CLASS} .quiz-input__question-category,
            html.${ROOT_CLASS} .quiz-input__question-type {
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} input#user-response.quiz-input__input,
            html.${ROOT_CLASS} .quiz-input__input {
                background: #111315 !important;
                border: 1px solid var(--wkrd-border) !important;
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03) !important;
                caret-color: var(--wkrd-text) !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .quiz-input__input::placeholder {
                color: #858e95 !important;
                opacity: 1;
            }

            html.${ROOT_CLASS} .quiz-input__input:focus {
                border-color: var(--wkrd-focus) !important;
                box-shadow: 0 0 0 3px rgba(120, 169, 190, 0.22) !important;
                outline: none !important;
            }

            html.${ROOT_CLASS} .quiz-input__input-container[correct="true"] .quiz-input__input,
            html.${ROOT_CLASS} .quiz-input__input-container[correct]:not([correct="false"]) .quiz-input__input {
                background: var(--wkrd-correct) !important;
                border-color: var(--wkrd-correct-border) !important;
                caret-color: var(--wkrd-text) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} .quiz-input__input-container[incorrect] .quiz-input__input,
            html.${ROOT_CLASS} .quiz-input__input-container[correct="false"] .quiz-input__input {
                background: var(--wkrd-incorrect) !important;
                border-color: var(--wkrd-incorrect-border) !important;
                caret-color: var(--wkrd-text) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} .quiz-input__submit-button,
            html.${ROOT_CLASS} button.later-crabigator {
                background: var(--wkrd-surface-raised) !important;
                border: 1px solid var(--wkrd-border) !important;
                box-shadow: none !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .quiz-input__submit-button:hover:not(:disabled),
            html.${ROOT_CLASS} button.later-crabigator:hover:not(:disabled) {
                background: var(--wkrd-surface-hover) !important;
                border-color: var(--wkrd-border-strong) !important;
            }

            html.${ROOT_CLASS} .quiz-input__submit-button:focus-visible,
            html.${ROOT_CLASS} button.later-crabigator:focus-visible {
                outline: 3px solid rgba(120, 169, 190, 0.55) !important;
                outline-offset: -3px !important;
            }

            html.${ROOT_CLASS} .quiz-input__submit-button:disabled,
            html.${ROOT_CLASS} button.later-crabigator:disabled {
                background: #202327 !important;
                color: #798188 !important;
                opacity: 1 !important;
            }

            html.${ROOT_CLASS} #additional-content,
            html.${ROOT_CLASS} #additional-content .additional-content__menu {
                background: var(--wkrd-bg) !important;
            }

            html.${ROOT_CLASS} #additional-content .additional-content__item {
                background: var(--wkrd-surface) !important;
                border: 1px solid var(--wkrd-border) !important;
                box-shadow: none !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} #additional-content .additional-content__item:hover:not(.additional-content__item--disabled) {
                background: var(--wkrd-surface-hover) !important;
                border-color: var(--wkrd-border-strong) !important;
            }

            html.${ROOT_CLASS} #additional-content .additional-content__item--disabled {
                background: #1a1c1f !important;
                border-color: #30353a !important;
                color: #717980 !important;
                opacity: 1 !important;
            }

            html.${ROOT_CLASS} #additional-content .additional-content__item-text,
            html.${ROOT_CLASS} #additional-content .wk-icon,
            html.${ROOT_CLASS} #additional-content svg {
                color: inherit !important;
                fill: currentColor !important;
            }

            html.${ROOT_CLASS} .quiz-input__exception,
            html.${ROOT_CLASS} .answer-exception {
                background: var(--wkrd-surface-raised) !important;
                border-color: var(--wkrd-border) !important;
                box-shadow: none !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .quiz-input__exception::before,
            html.${ROOT_CLASS} .answer-exception::before {
                border-bottom-color: var(--wkrd-surface-raised) !important;
            }

            html.${ROOT_CLASS} turbo-frame#subject-info,
            html.${ROOT_CLASS} .subject-info,
            html.${ROOT_CLASS} .additional-content__content,
            html.${ROOT_CLASS} turbo-frame#last-items {
                background: var(--wkrd-surface) !important;
                border-color: var(--wkrd-border) !important;
                color: var(--wkrd-text) !important;
            }

            /* A quiet navigation strip leads into a continuous reading pane. */
            html.${ROOT_CLASS} #additional-content .additional-content__menu .additional-content__menu-item .additional-content__item {
                background: transparent !important;
                border: 0 !important;
                border-radius: 6px;
            }

            html.${ROOT_CLASS} #additional-content .additional-content__menu .additional-content__menu-item .additional-content__item:hover:not(.additional-content__item--disabled) {
                background: rgba(255, 255, 255, 0.06) !important;
            }

            html.${ROOT_CLASS} #additional-content .additional-content__item--open::after {
                content: '';
                position: absolute;
                inset: auto auto -4px 50%;
                width: 28px;
                height: 2px;
                margin: 0;
                border: 0;
                border-radius: 2px;
                background: var(--wkrd-focus);
                transform: translateX(-50%);
            }

            html.${ROOT_CLASS} #additional-content .additional-content__item:focus-visible {
                outline: 2px solid var(--wkrd-focus);
                outline-offset: -3px;
            }

            html.${ROOT_CLASS} #additional-content #information {
                border: 0 !important;
                box-shadow: none !important;
                background: var(--wkrd-bg) !important;
                margin: 12px 10px 0;
            }

            html.${ROOT_CLASS} #information .item-info {
                padding-top: 8px;
                padding-bottom: 16px;
            }

            html.${ROOT_CLASS} #information :is(turbo-frame#subject-info, .subject-info) {
                background: transparent !important;
            }

            html.${ROOT_CLASS} .subject-section--collapsible {
                --wkrd-panel-inset: clamp(16px, 2vw, 24px);
                box-sizing: border-box;
                margin: 0;
                border: 0 !important;
                border-bottom: 1px solid rgba(174, 182, 188, 0.14) !important;
                border-radius: 0;
                background: transparent !important;
            }

            html.${ROOT_CLASS} .subject-section--collapsible:last-child {
                border-bottom: 0 !important;
            }

            html.${ROOT_CLASS} .subject-section--collapsible > .subject-section__title {
                margin: 0 !important;
                padding: 0 !important;
                border: 0 !important;
            }

            html.${ROOT_CLASS} .subject-section--collapsible .subject-section__toggle {
                box-sizing: border-box;
                display: flex;
                position: relative;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                width: 100%;
                min-height: 62px;
                padding: 18px var(--wkrd-panel-inset);
                border-radius: 0;
                font-size: 1.125rem;
                font-weight: 600;
                line-height: 1.4;
                text-decoration: none;
                transition: background-color 120ms ease;
            }

            html.${ROOT_CLASS} .subject-section--collapsible .subject-section__toggle::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                width: 2px;
                height: 20px;
                border-radius: 2px;
                background: var(--wkrd-focus);
                transform: translateY(-50%);
                opacity: 0;
            }

            html.${ROOT_CLASS} .subject-section--collapsible[expanded] .subject-section__toggle::before {
                opacity: 1;
            }

            html.${ROOT_CLASS} .subject-section--collapsible[expanded] > .subject-section__title .subject-section__title-text {
                color: #b8dbe9 !important;
            }

            html.${ROOT_CLASS} .subject-section--collapsible .subject-section__toggle:hover {
                background: rgba(255, 255, 255, 0.035);
            }

            html.${ROOT_CLASS} .subject-section--collapsible .subject-section__toggle:focus-visible {
                outline: 2px solid var(--wkrd-focus);
                outline-offset: -3px;
            }

            html.${ROOT_CLASS} .subject-section--collapsible .subject-section__title-text {
                min-width: 0;
            }

            html.${ROOT_CLASS} .subject-section--collapsible .subject-section__toggle-icon {
                display: grid;
                place-items: center;
                flex: 0 0 14px;
                width: 14px;
                height: 14px;
                line-height: 1;
                opacity: 0.65;
            }

            html.${ROOT_CLASS} .subject-section--collapsible .subject-section__toggle-icon svg {
                display: block;
                width: 14px;
                height: 14px;
            }

            html.${ROOT_CLASS} .subject-section--collapsible > .subject-section__content {
                box-sizing: border-box;
                padding: 4px var(--wkrd-panel-inset) 30px;
                border: 0;
                background: transparent !important;
                line-height: 1.7;
            }

            html.${ROOT_CLASS} .subject-section--collapsible .subject-section__subtitle {
                font-size: 0.8125rem;
                font-weight: 600;
                letter-spacing: 0.045em;
                color: var(--wkrd-muted) !important;
            }

            @media (prefers-reduced-motion: reduce) {
                html.${ROOT_CLASS} .subject-section--collapsible .subject-section__toggle {
                    transition: none;
                }
            }

            html.${ROOT_CLASS} .subject-section,
            html.${ROOT_CLASS} .subject-section__title,
            html.${ROOT_CLASS} .subject-section__title-text,
            html.${ROOT_CLASS} .subject-section__subtitle,
            html.${ROOT_CLASS} .subject-section__content,
            html.${ROOT_CLASS} .subject-section__meanings,
            html.${ROOT_CLASS} .subject-section__meanings-items,
            html.${ROOT_CLASS} .subject-section__meanings-item,
            html.${ROOT_CLASS} .subject-section__readings,
            html.${ROOT_CLASS} .subject-section__readings-items,
            html.${ROOT_CLASS} .subject-section__readings-item,
            html.${ROOT_CLASS} .subject-section__user-synonyms,
            html.${ROOT_CLASS} .subject-section__user-synonyms-items,
            html.${ROOT_CLASS} .subject-section__user-synonyms-item,
            html.${ROOT_CLASS} .subject-section__text,
            html.${ROOT_CLASS} .subject-section p,
            html.${ROOT_CLASS} .subject-section li,
            html.${ROOT_CLASS} .subject-section dd,
            html.${ROOT_CLASS} .subject-section strong,
            html.${ROOT_CLASS} .subject-section em,
            html.${ROOT_CLASS} .subject-section span:not(.subject-character__badge):not([class*="highlight-"]) {
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} turbo-frame#subject-info .subject-section *,
            html.${ROOT_CLASS} .subject-info .subject-section *,
            html.${ROOT_CLASS} .additional-content__content .subject-section * {
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .subject-section__meanings-title,
            html.${ROOT_CLASS} .subject-section__readings-title,
            html.${ROOT_CLASS} .subject-section__user-synonyms-title,
            html.${ROOT_CLASS} .subject-section__label,
            html.${ROOT_CLASS} .subject-section small,
            html.${ROOT_CLASS} .text-subdued,
            html.${ROOT_CLASS} .text-muted {
                color: var(--wkrd-muted) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .subject-section button:disabled,
            html.${ROOT_CLASS} .subject-section [aria-disabled="true"] {
                color: #7f888f !important;
                opacity: 1 !important;
            }

            html.${ROOT_CLASS} .subject-section a,
            html.${ROOT_CLASS} #wkcm2 a,
            html.${ROOT_CLASS} .wk_keisei a {
                color: #86bdd4 !important;
            }

            html.${ROOT_CLASS} .subject-section .subject-character,
            html.${ROOT_CLASS} .subject-section .subject-character__link,
            html.${ROOT_CLASS} .subject-section .subject-character__content,
            html.${ROOT_CLASS} .subject-section .subject-character__info {
                background: var(--wkrd-surface-raised) !important;
                border-color: var(--wkrd-border) !important;
                box-shadow: none !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .subject-section .subject-character:hover,
            html.${ROOT_CLASS} .subject-section .subject-character__link:hover {
                background: var(--wkrd-surface-hover) !important;
                border-color: var(--wkrd-border-strong) !important;
            }

            html.${ROOT_CLASS} .subject-section .subject-character__meaning,
            html.${ROOT_CLASS} .subject-section .subject-character__reading,
            html.${ROOT_CLASS} .subject-section .subject-character__meaning--primary,
            html.${ROOT_CLASS} .subject-section .subject-character__reading--primary {
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .subject-section .subject-character__meaning-label,
            html.${ROOT_CLASS} .subject-section .subject-character__reading-label {
                color: var(--wkrd-muted) !important;
            }

            /* Put the card surface and border on the link, not competing nested layers. */
            html.${ROOT_CLASS} .subject-section .subject-character-grid__item {
                background: transparent !important;
                border: 0 !important;
                border-radius: 10px;
                box-shadow: none !important;
            }

            html.${ROOT_CLASS} .subject-section .subject-character-grid__item > .subject-character {
                box-sizing: border-box;
                border: 1px solid var(--wkrd-border) !important;
                border-radius: 10px;
            }

            html.${ROOT_CLASS} .subject-section .subject-character-grid__item > .subject-character:hover {
                border-color: var(--wkrd-border-strong) !important;
            }

            html.${ROOT_CLASS} .subject-section .subject-character-grid__item :is(
                .subject-character__content,
                .subject-character__info,
                .subject-character__reading,
                .subject-character__meaning
            ) {
                background: transparent !important;
            }

            /* Keep both play and stop icons legible without changing their visibility logic. */
            html.${ROOT_CLASS} .subject-section .reading-with-audio__icons {
                box-sizing: border-box;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 32px;
                width: 32px;
                height: 32px;
                margin-right: 8px;
                padding: 6px;
                border: 1px solid #54788b !important;
                border-radius: 8px;
                background: #263944 !important;
                color: var(--wkrd-text) !important;
                cursor: pointer;
            }

            html.${ROOT_CLASS} .subject-section .reading-with-audio__icons:hover:not(:disabled) {
                background: #354f5d !important;
                border-color: var(--wkrd-focus) !important;
            }

            html.${ROOT_CLASS} .subject-section .reading-with-audio__icons svg {
                width: 18px;
                height: 18px;
                fill: currentColor !important;
            }

            html.${ROOT_CLASS} .subject-section .reading-with-audio__icons:focus-visible {
                outline: 2px solid var(--wkrd-focus);
                outline-offset: 3px;
            }

            html.${ROOT_CLASS} .subject-section mark,
            html.${ROOT_CLASS} .subject-section [class*="highlight-"],
            html.${ROOT_CLASS} .subject-section [class*="-highlight"],
            html.${ROOT_CLASS} .wk-kanjidamage-mnemonic [class*="highlight-"],
            html.${ROOT_CLASS} .wk-kanjidamage-mnemonic [class*="-highlight"] {
                background-image: none !important;
                border-radius: 3px;
                box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
                color: #f7f8f8 !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .subject-section .radical-highlight,
            html.${ROOT_CLASS} .subject-section .highlight-radical,
            html.${ROOT_CLASS} .wk-kanjidamage-mnemonic .radical-highlight,
            html.${ROOT_CLASS} .wk-kanjidamage-mnemonic .highlight-radical {
                background: #1d5065 !important;
            }

            html.${ROOT_CLASS} .subject-section .kanji-highlight,
            html.${ROOT_CLASS} .subject-section .highlight-kanji,
            html.${ROOT_CLASS} .wk-kanjidamage-mnemonic .kanji-highlight,
            html.${ROOT_CLASS} .wk-kanjidamage-mnemonic .highlight-kanji {
                background: #652448 !important;
            }

            html.${ROOT_CLASS} .subject-section .vocabulary-highlight,
            html.${ROOT_CLASS} .subject-section .highlight-vocabulary,
            html.${ROOT_CLASS} .wk-kanjidamage-mnemonic .vocabulary-highlight,
            html.${ROOT_CLASS} .wk-kanjidamage-mnemonic .highlight-vocabulary {
                background: #4e3168 !important;
            }

            html.${ROOT_CLASS} .subject-section .reading-highlight,
            html.${ROOT_CLASS} .subject-section .highlight-reading,
            html.${ROOT_CLASS} .wk-kanjidamage-mnemonic .reading-highlight,
            html.${ROOT_CLASS} .wk-kanjidamage-mnemonic .highlight-reading {
                background: #28543f !important;
            }

            html.${ROOT_CLASS} .subject-section mark:not([class]),
            html.${ROOT_CLASS} .subject-section [class*="highlight-"]:not(.highlight-radical):not(.highlight-kanji):not(.highlight-vocabulary):not(.highlight-reading),
            html.${ROOT_CLASS} .subject-section [class*="-highlight"]:not(.radical-highlight):not(.kanji-highlight):not(.vocabulary-highlight):not(.reading-highlight) {
                background: #4a414f !important;
            }

            html.${ROOT_CLASS} .wk-hint,
            html.${ROOT_CLASS} .subject-hint {
                --color-text: var(--wkrd-text);
                --color-text-subdued: var(--wkrd-muted);
                --wk-hint-background-color: var(--wkrd-surface-raised);
                background: var(--wkrd-surface-raised) !important;
                border: 1px solid var(--wkrd-border) !important;
                box-shadow: none !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .wk-hint__title,
            html.${ROOT_CLASS} .wk-hint__text,
            html.${ROOT_CLASS} .subject-hint__title,
            html.${ROOT_CLASS} .subject-hint__text {
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .cm-mnem-text,
            html.${ROOT_CLASS} .cm-form.cm-mnem-text {
                background: #17191b !important;
                border-color: var(--wkrd-border) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} .cm-prev,
            html.${ROOT_CLASS} .cm-next,
            html.${ROOT_CLASS} .cm-format-btn {
                background: var(--wkrd-surface-raised) !important;
                background-image: none !important;
                border-color: var(--wkrd-border) !important;
                box-shadow: none !important;
                color: var(--wkrd-muted) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .cm-prev:not(.disabled):hover,
            html.${ROOT_CLASS} .cm-next:not(.disabled):hover,
            html.${ROOT_CLASS} .cm-format-btn:hover {
                background: var(--wkrd-surface-hover) !important;
                border-color: var(--wkrd-border-strong) !important;
            }

            html.${ROOT_CLASS} .cm-prev svg,
            html.${ROOT_CLASS} .cm-next svg,
            html.${ROOT_CLASS} .cm-prev svg *,
            html.${ROOT_CLASS} .cm-next svg * {
                color: inherit !important;
                fill: currentColor !important;
            }

            html.${ROOT_CLASS} .cm-info,
            html.${ROOT_CLASS} .cm-score,
            html.${ROOT_CLASS} .cm-score-num {
                color: var(--wkrd-muted) !important;
            }

            html.${ROOT_CLASS} .cm-small-btn,
            html.${ROOT_CLASS} .cm-submit-highlight,
            html.${ROOT_CLASS} .cm-upvote-highlight,
            html.${ROOT_CLASS} .cm-downvote-highlight,
            html.${ROOT_CLASS} .form-button-wrapper .cm-save-highlight,
            html.${ROOT_CLASS} .form-button-wrapper .cm-cancel-highlight {
                border: 1px solid var(--wkrd-border) !important;
                box-shadow: none !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} .cm-edit-highlight {
                background: #353a3f !important;
            }

            html.${ROOT_CLASS} .cm-delete-highlight,
            html.${ROOT_CLASS} .cm-downvote-highlight {
                background: #613138 !important;
            }

            html.${ROOT_CLASS} .cm-request-highlight {
                background: #61451f !important;
            }

            html.${ROOT_CLASS} .cm-upvote-highlight {
                background: #294d38 !important;
            }

            html.${ROOT_CLASS} .cm-submit-highlight,
            html.${ROOT_CLASS} .cm-save-highlight,
            html.${ROOT_CLASS} .cm-cancel-highlight {
                background: #353a3f !important;
            }

            html.${ROOT_CLASS} .cm-text,
            html.${ROOT_CLASS} .additional-content__content textarea,
            html.${ROOT_CLASS} .additional-content__content select,
            html.${ROOT_CLASS} .additional-content__content input:not([type="checkbox"]):not([type="radio"]) {
                background: #111315 !important;
                border: 1px solid var(--wkrd-border) !important;
                box-shadow: none !important;
                caret-color: var(--wkrd-text) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} .cm-text::placeholder,
            html.${ROOT_CLASS} .additional-content__content textarea::placeholder,
            html.${ROOT_CLASS} .additional-content__content input::placeholder {
                color: #858e95 !important;
                opacity: 1;
            }

            html.${ROOT_CLASS} .wk-kanjidamage-mnemonic,
            html.${ROOT_CLASS} .wk-kanjidamage-mnemonic__text,
            html.${ROOT_CLASS} .wk_keisei {
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} .wk-kanjidamage-mnemonic__empty,
            html.${ROOT_CLASS} .wk_keisei .text-muted {
                color: var(--wkrd-muted) !important;
            }

            html.${ROOT_CLASS} .wk_keisei button,
            html.${ROOT_CLASS} .wk_keisei .btn {
                background: var(--wkrd-surface-raised) !important;
                border-color: var(--wkrd-border) !important;
                box-shadow: none !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} #wkec-context-panel {
                background: var(--wkrd-surface) !important;
                border-color: var(--wkrd-border) !important;
                border-left-color: var(--wkrd-focus) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} #wkec-context-panel .wkec-counter,
            html.${ROOT_CLASS} #wkec-context-panel .wkec-english {
                color: var(--wkrd-muted) !important;
            }

            html.${ROOT_CLASS} #confusionGuesserOverlay {
                --vissim: #66521c !important;
                --onon: #24566b !important;
                --onkun: #24566b !important;
                --kunon: #3e4b73 !important;
                --kunkun: #3e4b73 !important;
                --naon: #67461f !important;
                --nakun: #67461f !important;
                --onna: #67461f !important;
                --kunna: #67461f !important;
                --nana: #67461f !important;
                --special: #454b50 !important;
                --text: var(--wkrd-text) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} #confusionGuesserOverlay > div,
            html.${ROOT_CLASS} #confusionGuesserOverlay > div.highContrast {
                background: var(--wkrd-surface-raised) !important;
                border-color: var(--wkrd-border-strong) !important;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.38) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} #confusionGuesserOverlay .confusion-guesser__header {
                color: var(--wkrd-muted) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} #confusionGuesserOverlay #guesses > a,
            html.${ROOT_CLASS} #confusionGuesserOverlay #guesses > a > *,
            html.${ROOT_CLASS} #confusionGuesserOverlay #guesses > a::before {
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} #confusionGuesserOverlay #guesses > a > *,
            html.${ROOT_CLASS} #confusionGuesserOverlay #guesses > a::before {
                box-shadow: none !important;
            }

            html.${ROOT_CLASS} #confusionGuesserOverlay #guesses > a.show > *,
            html.${ROOT_CLASS} #confusionGuesserOverlay #guesses > a.show::before {
                box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18) !important;
            }

            html.${ROOT_CLASS} #confusionGuesserOverlay > div > label,
            html.${ROOT_CLASS} #confusionGuesserOverlay > button,
            html.${ROOT_CLASS} #confusionGuesserOverlay #guesses > button {
                background: var(--wkrd-surface) !important;
                border-color: var(--wkrd-border) !important;
                box-shadow: none !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} #confusionGuesserOverlay > div > label:hover,
            html.${ROOT_CLASS} #confusionGuesserOverlay > button:hover,
            html.${ROOT_CLASS} #confusionGuesserOverlay #guesses > button:hover {
                background: var(--wkrd-surface-hover) !important;
                border-color: var(--wkrd-border-strong) !important;
            }

            html.${ROOT_CLASS} #wkof_ds .ui-dialog,
            html.${ROOT_CLASS} #wkof_ds .ui-dialog-content,
            html.${ROOT_CLASS} #wkof_ds .ui-dialog-buttonpane,
            html.${ROOT_CLASS} #wkof_ds .ui-widget-content,
            html.${ROOT_CLASS} #wkof_ds .wkof_settings,
            html.${ROOT_CLASS} #wkof_ds .ui-tabs-panel {
                background: var(--wkrd-surface) !important;
                background-image: none !important;
                border-color: var(--wkrd-border) !important;
                box-shadow: none !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} #wkof_ds .ui-dialog {
                box-shadow: 0 14px 38px rgba(0, 0, 0, 0.5) !important;
            }

            html.${ROOT_CLASS} #wkof_ds .ui-widget,
            html.${ROOT_CLASS} #wkof_ds .ui-widget button {
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} #wkof_ds .ui-widget-header,
            html.${ROOT_CLASS} #wkof_ds .ui-dialog-titlebar {
                background: var(--wkrd-surface-raised) !important;
                background-image: none !important;
                border-color: var(--wkrd-border) !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} #wkof_ds .ui-dialog-title,
            html.${ROOT_CLASS} #wkof_ds .wkof_settings,
            html.${ROOT_CLASS} #wkof_ds .wkof_settings label,
            html.${ROOT_CLASS} #wkof_ds .wkof_settings legend,
            html.${ROOT_CLASS} #wkof_ds .wkof_settings .left,
            html.${ROOT_CLASS} #wkof_ds .wkof_settings .right,
            html.${ROOT_CLASS} #wkof_ds .ui-widget-content a {
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} #wkof_ds .wkof_settings fieldset {
                background: rgba(255, 255, 255, 0.025) !important;
                border-color: var(--wkrd-border) !important;
            }

            html.${ROOT_CLASS} #wkof_ds .wkof_settings section {
                background: var(--wkrd-surface-raised) !important;
                border-left: 3px solid var(--wkrd-border-strong);
                color: var(--wkrd-muted) !important;
            }

            html.${ROOT_CLASS} #wkof_ds .wkof_settings hr,
            html.${ROOT_CLASS} #wkof_ds .wkof_settings .ui-tabs .ui-tabs-nav {
                background: transparent !important;
                border-color: var(--wkrd-border) !important;
            }

            html.${ROOT_CLASS} #wkof_ds .ui-state-default,
            html.${ROOT_CLASS} #wkof_ds .ui-widget-content .ui-state-default,
            html.${ROOT_CLASS} #wkof_ds .ui-widget-header .ui-state-default,
            html.${ROOT_CLASS} #wkof_ds .ui-button {
                background: var(--wkrd-surface-raised) !important;
                background-image: none !important;
                border-color: var(--wkrd-border) !important;
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} #wkof_ds .ui-state-hover,
            html.${ROOT_CLASS} #wkof_ds .ui-state-focus,
            html.${ROOT_CLASS} #wkof_ds .ui-button:hover,
            html.${ROOT_CLASS} #wkof_ds .ui-button:focus {
                background: var(--wkrd-surface-hover) !important;
                border-color: var(--wkrd-border-strong) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} #wkof_ds .ui-state-active,
            html.${ROOT_CLASS} #wkof_ds .ui-widget-content .ui-state-active,
            html.${ROOT_CLASS} #wkof_ds .ui-widget-header .ui-state-active,
            html.${ROOT_CLASS} #wkof_ds .wkof_settings .ui-tabs .ui-tabs-nav li.ui-tabs-active {
                background: #343a3f !important;
                border-color: var(--wkrd-border-strong) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} #wkof_ds .ui-state-default a,
            html.${ROOT_CLASS} #wkof_ds .ui-state-active a,
            html.${ROOT_CLASS} #wkof_ds .ui-state-hover a,
            html.${ROOT_CLASS} #wkof_ds .ui-state-focus a {
                color: var(--wkrd-text) !important;
                text-shadow: none !important;
            }

            html.${ROOT_CLASS} #wkof_ds .wkof_settings select,
            html.${ROOT_CLASS} #wkof_ds .wkof_settings textarea,
            html.${ROOT_CLASS} #wkof_ds .wkof_settings input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]) {
                background: #111315 !important;
                border-color: var(--wkrd-border) !important;
                box-shadow: none !important;
                caret-color: var(--wkrd-text) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS} #wkof_ds .wkof_settings select:focus,
            html.${ROOT_CLASS} #wkof_ds .wkof_settings textarea:focus,
            html.${ROOT_CLASS} #wkof_ds .wkof_settings input:focus {
                border-color: var(--wkrd-focus) !important;
                outline: 2px solid rgba(120, 169, 190, 0.35) !important;
                outline-offset: 0;
            }

            html.${ROOT_CLASS} #wkof_ds .wkof_settings input[type="checkbox"],
            html.${ROOT_CLASS} #wkof_ds .wkof_settings input[type="radio"] {
                accent-color: #628fa3;
            }

            html.${ROOT_CLASS} #wkof_ds .ui-slider {
                background: #111315 !important;
                border-color: var(--wkrd-border) !important;
            }

            html.${ROOT_CLASS} #wkof_ds .ui-slider .ui-slider-range {
                background: #4d7385 !important;
                background-image: none !important;
            }

            html.${ROOT_CLASS} #wkof_ds .ui-slider .ui-slider-handle {
                background: #8ca7b3 !important;
                border-color: #b7c7ce !important;
                box-shadow: 0 0 0 2px var(--wkrd-surface) !important;
            }

            html.${ROOT_CLASS} #wkof_ds .wkof_settings .note {
                color: var(--wkrd-muted) !important;
            }

            html.${ROOT_CLASS} #wkof_ds .wkof_settings .note.error {
                color: #e68b94 !important;
            }

            html.${ROOT_CLASS} #wkof_ds .wkof_settings .setting.invalid,
            html.${ROOT_CLASS} #wkof_ds .ui-state-error {
                background: #48262b !important;
                border-color: var(--wkrd-incorrect-border) !important;
                color: #ffdfe2 !important;
            }

            html.${ROOT_CLASS} #wkof_ds .wkof_settings .setting[disabled],
            html.${ROOT_CLASS} #wkof_ds .ui-state-disabled {
                background: #202327 !important;
                color: #798188 !important;
                opacity: 1 !important;
            }

            html.${ROOT_CLASS} #wkof_ds .ui-dialog-titlebar-close .ui-icon {
                filter: invert(1) brightness(1.4);
            }

            html.${ROOT_CLASS} #wkof_ds #wkofs_bkgd {
                background: rgba(0, 0, 0, 0.68) !important;
            }

            @media (max-height: 560px), (max-width: 680px) and (max-height: 760px) {
                html.${ROOT_CLASS},
                html.${ROOT_CLASS} body,
                html.${ROOT_CLASS} .quiz {
                    min-height: 100%;
                    overflow-y: auto !important;
                }

                html.${ROOT_CLASS} .character-header {
                    min-height: 0 !important;
                    padding-top: 4px !important;
                    padding-bottom: 4px !important;
                }

                html.${ROOT_CLASS} .character-header__content {
                    min-height: 0 !important;
                    padding-top: 2px !important;
                    padding-bottom: 2px !important;
                }

                html.${ROOT_CLASS} .character-header__characters {
                    font-size: 3.5rem !important;
                    line-height: 1.05 !important;
                    min-height: 0 !important;
                    padding-top: 2px !important;
                    padding-bottom: 2px !important;
                }

                html.${ROOT_CLASS} .quiz-input__question-type-container,
                html.${ROOT_CLASS} .quiz-input__question-type-container[data-question-type] {
                    min-height: 30px !important;
                    padding-top: 3px !important;
                    padding-bottom: 3px !important;
                }

                html.${ROOT_CLASS} .quiz-input__question-category,
                html.${ROOT_CLASS} .quiz-input__question-type {
                    font-size: 0.8rem !important;
                    line-height: 1.2 !important;
                }

                html.${ROOT_CLASS} .quiz-input__input-container,
                html.${ROOT_CLASS} #answer-form {
                    min-height: 46px !important;
                }

                html.${ROOT_CLASS} input#user-response.quiz-input__input,
                html.${ROOT_CLASS} .quiz-input__input {
                    height: 46px !important;
                    min-height: 46px !important;
                    font-size: 1.2rem !important;
                    line-height: 1.2 !important;
                    padding-top: 4px !important;
                    padding-bottom: 4px !important;
                }

                html.${ROOT_CLASS} .quiz-input__submit-button {
                    width: 50px !important;
                    min-width: 50px !important;
                }

                html.${ROOT_CLASS} button.later-crabigator {
                    top: 5px !important;
                    right: 54px !important;
                    bottom: 5px !important;
                    min-width: 58px !important;
                    padding: 0 8px !important;
                }

                html.${ROOT_CLASS} button.later-crabigator.left {
                    right: auto !important;
                    left: 6px !important;
                }

                html.${ROOT_CLASS} #additional-content .additional-content__menu {
                    min-height: 42px !important;
                    align-items: stretch !important;
                    justify-content: center !important;
                    flex-wrap: wrap !important;
                    gap: 4px !important;
                    padding: 4px !important;
                }

                html.${ROOT_CLASS} #additional-content .additional-content__menu > .additional-content__menu-item {
                    flex: 1 1 42px !important;
                    min-width: 42px !important;
                }

                html.${ROOT_CLASS} #additional-content #option-retype {
                    flex: 0 0 96px !important;
                    width: 96px !important;
                    min-width: 96px !important;
                    margin: 0 !important;
                }

                html.${ROOT_CLASS} #additional-content #option-retype .additional-content__item {
                    display: flex !important;
                    min-height: 36px !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 6px !important;
                    padding: 4px 8px !important;
                }

                html.${ROOT_CLASS} #additional-content #option-retype .additional-content__item-text {
                    display: block !important;
                    overflow: visible !important;
                    font-size: 0.78rem !important;
                    text-overflow: clip !important;
                }

                html.${ROOT_CLASS} #additional-content #option-retype .additional-content__item-icon-container,
                html.${ROOT_CLASS} #additional-content #option-retype svg {
                    width: 1rem !important;
                    height: 1rem !important;
                }
            }

            html.${ROOT_CLASS}.${CORRECT_CLASS} .quiz-input,
            html.${ROOT_CLASS}.${CORRECT_CLASS} .quiz-input__input-container,
            html.${ROOT_CLASS}.${CORRECT_CLASS} #answer-form,
            html.${ROOT_CLASS}.${CORRECT_CLASS} #additional-content,
            html.${ROOT_CLASS}.${CORRECT_CLASS} #additional-content .additional-content__menu {
                background: #17271d !important;
            }

            html.${ROOT_CLASS}.${CORRECT_CLASS} .quiz-input__question-type-container,
            html.${ROOT_CLASS}.${CORRECT_CLASS} .quiz-input__question-type-container[data-question-type] {
                background: #1d3526 !important;
                border-color: var(--wkrd-correct-border) !important;
            }

            html.${ROOT_CLASS}.${CORRECT_CLASS} input#user-response.quiz-input__input,
            html.${ROOT_CLASS}.${CORRECT_CLASS} .quiz-input__input,
            html.${ROOT_CLASS}.${CORRECT_CLASS} .quiz-input__submit-button,
            html.${ROOT_CLASS}.${CORRECT_CLASS} button.later-crabigator,
            html.${ROOT_CLASS}.${CORRECT_CLASS} #additional-content .additional-content__item {
                background: var(--wkrd-correct) !important;
                border-color: var(--wkrd-correct-border) !important;
                color: var(--wkrd-text) !important;
            }

            html.${ROOT_CLASS}.${INCORRECT_CLASS} .quiz-input,
            html.${ROOT_CLASS}.${INCORRECT_CLASS} .quiz-input__input-container,
            html.${ROOT_CLASS}.${INCORRECT_CLASS} #answer-form,
            html.${ROOT_CLASS}.${INCORRECT_CLASS} #additional-content,
            html.${ROOT_CLASS}.${INCORRECT_CLASS} #additional-content .additional-content__menu {
                background: #2b181b !important;
            }

            html.${ROOT_CLASS}.${INCORRECT_CLASS} .quiz-input__question-type-container,
            html.${ROOT_CLASS}.${INCORRECT_CLASS} .quiz-input__question-type-container[data-question-type] {
                background: #3b2025 !important;
                border-color: var(--wkrd-incorrect-border) !important;
            }

            html.${ROOT_CLASS}.${INCORRECT_CLASS} input#user-response.quiz-input__input,
            html.${ROOT_CLASS}.${INCORRECT_CLASS} .quiz-input__input,
            html.${ROOT_CLASS}.${INCORRECT_CLASS} .quiz-input__submit-button,
            html.${ROOT_CLASS}.${INCORRECT_CLASS} button.later-crabigator,
            html.${ROOT_CLASS}.${INCORRECT_CLASS} #additional-content .additional-content__item {
                background: var(--wkrd-incorrect) !important;
                border-color: var(--wkrd-incorrect-border) !important;
                color: var(--wkrd-text) !important;
            }
        `
        document.documentElement.appendChild(style)
    }
})()
