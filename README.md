# WaniKani Dark Mode

A site-wide Tampermonkey theme for the main WaniKani application. It keeps WaniKani's pink, blue, and purple distinctions in darker shades, with near-black reading surfaces and light text.

**[Install from Greasy Fork](https://greasyfork.org/en/scripts/599169-wanikani-dark-mode)**

Current beta: **2.1.2**. Previously named WaniKani Review Dark Mode; the source filename retains the original name. The former GitHub address redirects to this repository.

## Coverage

- Dashboard widgets, counts, charts, navigation, and customization controls, including the animated Total Days Studied panel with its original green counter.
- Lesson selection and lesson slides, including dark subject colors.
- Reviews and Extra Study, with distinct green/red answer feedback.
- Level lists, radical/kanji/vocabulary pages, audio controls, and composition cards.
- Settings, form fields, notices, dialogs, and shared account-page styles.
- Matching styles for several separately installed userscripts and their settings panels.

Item Info uses subtle dividers and inset controls. Small windows use tighter spacing and a wrapping review toolbar; information panels remain available.

This download contains the theme only. It needs no WaniKani Open Framework or API key, does not collect or transmit study data, and does not submit answers or change grading or SRS data. Third-party widgets and review controls are separate scripts.

## Installation

1. Install Tampermonkey from its official browser extension listing.
2. Open the [Greasy Fork listing](https://greasyfork.org/en/scripts/599169-wanikani-dark-mode) and install the script.
3. Reload WaniKani. Disable other WaniKani themes while trying it to avoid conflicting styles.

If upgrading from a manually installed copy of **WaniKani Review Dark Mode**, check that Tampermonkey has only one enabled copy after installation. The script name changed in 2.1.0; a manual install may create a second entry.

To remove the theme, disable it in Tampermonkey and reload WaniKani.

## Testing and limitations

Tested in Firefox with Tampermonkey. Version 2.1.0 was checked against WaniKani's current stylesheet and visually checked on the dashboard, lesson picker, vocabulary details, settings, and level overview. Earlier review/audio/composition fixes were checked in live reviews. The animated background update was checked after reloading the dashboard: the animation still moves, and dynamically inserted widgets select dark artwork for the default, candy, pastel, and vintage palettes. Browser combinations and other userscripts may still reveal gaps.

The theme targets `www.wanikani.com` and `preview.wanikani.com`. The separate Community forum, third-party websites, and cross-origin embedded content are outside its scope. WaniKani markup changes may require updates.

## Development

Edit `review-dark-mode.user.js`. Most of the implementation is scoped CSS. A small JavaScript wrapper installs it, handles Turbo navigation, and observes answer state for feedback colors, and selects WaniKani's native dark days-studied artwork as dashboard widgets load.

```sh
node --check review-dark-mode.user.js
```

For bug reports, include the affected page, browser, and enabled scripts/themes. Crop account details and private notes out of screenshots.

Developed with assistance from OpenAI Codex, guided by user feedback and testing in daily WaniKani use. The repository history begins with the first public release.

## License

MIT. This is an independent community project, unaffiliated with and unsupported by the WaniKani team. WaniKani content and artwork are not included in this repository.
