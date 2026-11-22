# dsh-session-span

[简体中文](README.md) | **English**

[![npm version](https://img.shields.io/npm/v/dsh-session-span.svg)](https://www.npmjs.com/package/dsh-session-span)
[![license](https://img.shields.io/npm/l/dsh-session-span.svg)](LICENSE)
[![Listed on dsh-plugin.org](https://dsh-plugin.org/badges/listed.svg)](https://dsh-plugin.org/plugins/dshplugin/dsh-plugin-hub)

## Introduction

When work is organized as one task per session, two questions come up regularly: how much time this task has taken so far, and when it began. The current sidebar shows only the time since the most recent message, so neither question can be answered from it. This plugin therefore adds only the start time and the total elapsed time of the session, and nothing else.

## Features

The Session hover card in the sidebar gains two lines:

- **Elapsed time**: the time from the first message to the present. It continues to accumulate while the session is idle and updates every 30 seconds while the card is open.
- **First message time**: shown in the device time zone, with a date format that follows the interface language (for example `2026-11-19 09:12` in English).

```
Session title
C:\Users\Administrator
3 minutes ago                    Existing: time since the most recent message
Elapsed 3 h 12 min               This plugin: time since the first message
First message 2026-11-19 10:57   This plugin: when it began
● Running
```

## Installation

The plugin is published on npm: [dsh-session-span](https://www.npmjs.com/package/dsh-session-span).

**In the application (recommended)**: open **Settings → Plugins → Add plugin**, enter `dsh-session-span`, and enable the **Session elapsed time** bundle. The application installs the latest version from npm.

**From a shell**, for a `web` or other profile managed from the command line:

```sh
dsh plugin --profile web add dsh-session-span
```

The Desktop profile is managed by the application, so install from the Plugins page there.

Requirements: verified on DSH `0.2.2-rc.3`. The package declares `engines.dsh` as `>=0.2.0-0`, so every stable or prerelease version from 0.2.0 onward can install it; the Node version is whatever DSH itself requires, since the package adds no restriction of its own. If a 0.2.0 or 0.2.1 installation misbehaves, upgrade to 0.2.2 or later.

## How the start time is determined

- The start time is the first message in the session log that was initiated by the user or by a scheduled task. A session created by a scheduled task therefore also has a start time.
- A session created by forking another session uses its own creation time, not the first message of the original session.
- The duration is computed and cached by DSH on the Host from the complete session log, and is delivered with the session summary to the sidebar. Paging, compaction, and restarts do not change the result.
- Sessions that existed before the plugin was installed have no cached result. The first hover reads it once, after which it is cached; for sessions with a long log, this section may appear slightly later on that first hover.

## Notes and limitations

- The value is the actual elapsed time, including the periods when the session was idle. To see the time actually spent executing, the statistics bar below the composer shows the sum of model time and tool time.
- The plugin does not inject content into the model and does not send data outside; apart from the computed start time it stores no state.
- It can be disabled or removed in **Settings → Plugins**, and the hover card returns to its original content.

## Development

The package is published as is, with no build step: the Host side is a plain ESM module, and the client side is a browser module registered into the `sidebar.session.row.hover` slot.

```sh
# point a profile at this checkout
dsh plugin --profile web add /absolute/path/to/this/directory
```

## Links

- npm: [dsh-session-span](https://www.npmjs.com/package/dsh-session-span)
- Repository: [github.com/aNoWhale/dsh-session-span](https://github.com/aNoWhale/dsh-session-span)
- Issues: [github.com/aNoWhale/dsh-session-span/issues](https://github.com/aNoWhale/dsh-session-span/issues)

## License

MIT
