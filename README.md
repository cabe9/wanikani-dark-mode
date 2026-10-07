# WaniKani Review Dark Mode

A Tampermonkey userscript that gives WaniKani a muted near-black theme, clearer dashboard text, and a calmer Item Info reading panel.

**[Install from Greasy Fork](https://greasyfork.org/en/scripts/599169-wanikani-review-dark-mode)**

Initial public beta: **2.0.8**. Tested with Firefox and Tampermonkey.

## What it changes

- Near-black backgrounds, light text, and muted blue accents across the dashboard, reviews, and item information.
- Better contrast for dashboard headings, descriptions, and count badges.
- Subtle dividers and inset controls in the Meaning, Reading, and Context sections.
- Clearer audio buttons and cleaner kanji composition cards.
- Distinct green and red answer feedback.
- Matching styles for several separately installed userscripts and their settings panels.

The theme does not include those other userscripts. It needs no WaniKani Open Framework or API key, makes no network requests, and does not submit answers or change grading or SRS data.

## Install or remove

1. Install Tampermonkey from its official browser extension listing.
2. Open the [Greasy Fork listing](https://greasyfork.org/en/scripts/599169-wanikani-review-dark-mode) and install the script.
3. Reload WaniKani. Disable other WaniKani themes while trying it to avoid conflicting styles.

To remove the theme, disable it in Tampermonkey and reload WaniKani. Greasy Fork is the recommended installation source; this repository contains the readable development source.

## Current limitations

Other browsers and combinations of userscripts have not been fully tested. WaniKani markup changes may require theme updates.

The compact layout hides Item Info, context/suggestion panels, and most extra review toolbar controls in small windows. It activates at a viewport height of 560 CSS pixels or less, or at a width of 680 pixels or less combined with a height of 760 pixels or less. Enlarge the window to restore the panels. This version may not suit phone-sized windows.

## Development

The implementation is in `review-dark-mode.user.js`. Most of the file is scoped CSS; a small JavaScript wrapper installs it, handles WaniKani's Turbo navigation, and observes answer state to preserve correct/incorrect feedback.

Syntax check:

```sh
node --check review-dark-mode.user.js
```

Visual checks should cover the dashboard, expanded and collapsed Item Info sections, audio buttons, composition cards, answer feedback, and compact-window behavior. Avoid submitting real reviews just to test the theme.

When reporting a problem, include your browser, the affected page, and enabled WaniKani scripts/themes. Crop account details and private notes out of screenshots.

This project was developed with assistance from OpenAI Codex, guided by feedback and testing in daily WaniKani use. The history here begins with the first public release.

## License

MIT. This is an independent community project and is not affiliated with or supported by the WaniKani team. WaniKani content and artwork are not included in this repository.
