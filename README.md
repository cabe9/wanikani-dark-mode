# WaniKani Dark Mode

A site-wide theme for Tampermonkey or Stylus for WaniKani and its Community forum. It keeps WaniKani's pink, blue, and purple distinctions in darker shades, with near-black reading surfaces and light text.

**[Install with Tampermonkey](https://greasyfork.org/en/scripts/599169-wanikani-dark-mode)** · **[Install with Stylus](https://raw.githubusercontent.com/cabe9/wanikani-dark-mode/main/wanikani-dark-mode.user.css)**

Current beta: **2.3.0**. Previously named WaniKani Review Dark Mode; the source filename retains the original name. The former GitHub address redirects to this repository.

## Coverage

- Community forum topic lists, posts, search, menus, and the reply editor, with the forum's native dark wordmark.
- Dashboard widgets, counts, charts, navigation, and customization controls, including the animated Total Days Studied panel with its original green counter.
- Lesson selection and lesson slides, including dark subject colors.
- Reviews and Extra Study, with distinct green/red answer feedback.
- Level lists, radical/kanji/vocabulary pages, audio controls, and composition cards.
- Settings, form fields, notices, dialogs, and shared account-page styles.
- Matching styles for several separately installed userscripts and their settings panels, including readable Community Mnemonics badges and aligned item cards.

The native header logo keeps its pink lettering and blue gator details. A white fill sits only inside the gator silhouette, with the rest of the header dark. Search and menu icons have matching alignment and no visible button frame; the expanded Search button uses a single flat surface.

The narrow-screen menu reserves a sticky row for its close button, and the expanded search field shrinks to keep the Search button onscreen. Item Info uses subtle dividers and inset controls. Small windows use tighter spacing and a wrapping review toolbar; information panels remain available.

This download contains the theme only. It needs no WaniKani Open Framework or API key, does not collect or transmit study data, and does not submit answers or change grading or SRS data. Third-party widgets and review controls are separate scripts.

## Installation

Choose one edition; enable only one copy of this theme at a time.

### Tampermonkey

1. Install Tampermonkey from its official browser extension listing.
2. Open the [Greasy Fork listing](https://greasyfork.org/en/scripts/599169-wanikani-dark-mode) and install the script.
3. Reload WaniKani.

If upgrading from a manually installed copy of **WaniKani Review Dark Mode**, check that Tampermonkey has only one enabled copy. The script name changed in 2.1.0; a manual install may create a second entry.

### Stylus

1. Install the [Stylus browser extension](https://github.com/openstyles/stylus#releases).
2. Open the [UserCSS installation link](https://raw.githubusercontent.com/cabe9/wanikani-dark-mode/main/wanikani-dark-mode.user.css), then choose **Install style**. Leave **Check for updates** enabled to receive updates from GitHub.
3. Disable the Tampermonkey edition of this theme if installed, then reload WaniKani. Other userscripts can stay enabled.

The Stylus edition is CSS only and requires a current browser with `:has()` support. It reads WaniKani's answer-state attributes through CSS selectors for green/red feedback. It references WaniKani's four native dark artwork URLs for the animated days-studied panel; those URLs may need updating if WaniKani changes its assets.

Disable other WaniKani themes while trying either edition to avoid conflicting styles. To remove this theme, disable it in its extension and reload WaniKani. Community Mnemonics and other integrations are optional, separately installed scripts.

## Testing and limitations

Tested in Firefox with Tampermonkey. Version 2.1.0 was checked against WaniKani's current stylesheet and visually checked on the dashboard, lesson picker, vocabulary details, settings, and level overview. Earlier review/audio/composition fixes were checked in live reviews. The animated background update was checked after reloading the dashboard: the animation still moves, and dynamically inserted widgets select dark artwork for the default, candy, pastel, and vintage palettes. Version 2.1.9 was checked after installation: the header icons align, the menu opens and closes, and the Search submit button has no stacked frame. Version 2.2.0 was installed through Stylus 2.4.14 in Firefox and checked with the Tampermonkey theme disabled, then with Tampermonkey entirely disabled. Fourteen browser checks passed for answer feedback, undo, replaced inputs, all four artwork palettes, and animation. Dashboard and level-page layouts were checked, including header centering and all 36 kanji cards with and without Community Mnemonics. Chrome 154 with Stylus was checked on public level pages at 320px, including the menu and expanded search. Safari 26.6.2 was checked with the theme applied to the live level page, including narrow layout, the JavaScript wrapper, search bounds, and separation between the close button and menu items. The same fourteen CSS checks passed in local fixtures using WaniKani’s stylesheet in Chrome and Safari. Safari testing covered rendering and the wrapper, not extension installation.

The theme targets `www.wanikani.com`, `preview.wanikani.com`, and `community.wanikani.com`. Third-party websites and cross-origin embedded content are outside its scope. WaniKani markup changes may require updates.

Version 2.3.0 adds a separate Discourse palette for the Community forum. The forum branch does not install learning-site CSS or quiz observers. The live topic, search panel, and post editor were checked in Firefox, the homepage and navigation in Chrome with the installed Stylus edition (including 320px), and the forum wrapper at 390px in Safari. Safari reported equal viewport and document widths, dark body/header colors, readable timestamps, and no learning-site CSS. Automated checks verify that both editions keep the forum and learning-site styles separate.

## Development

Edit `review-dark-mode.user.js`, then regenerate the Stylus edition from its CSS. The build step changes activation selectors to `:root`, uses `:has()` for answer state, and adds the artwork URLs from `tools/days-studied-assets.json`. The Tampermonkey wrapper handles stylesheet installation, Turbo navigation, answer-state observation, and native artwork selection on the learning site. On Community it installs only the Discourse stylesheet. The UserCSS has separate URL sections for the learning site and forum; it references the forum's native dark logo asset.

```sh
node --check review-dark-mode.user.js
node tools/build-usercss.mjs
node tools/build-usercss.mjs --check
node tests/community-routing-check.mjs
```

`tests/stylus-browser-check.js` can be pasted into the dashboard console with only the Stylus edition enabled. It creates and removes offscreen test elements; it does not submit answers or change study data.

For bug reports, include the affected page, browser, and enabled scripts/themes. Crop account details and private notes out of screenshots.

Developed with assistance from OpenAI Codex, guided by user feedback and testing in daily WaniKani use. The repository history begins with the first public release.

## License

MIT. This is an independent community project, unaffiliated with and unsupported by the WaniKani team. WaniKani content and artwork are not included in this repository.
