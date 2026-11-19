# dsh-session-span

[简体中文](README.md) | **English**

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin that shows **how long a conversation has been running since its first message**, right in the sidebar Session hover card.

```
Session title
C:\Users\Administrator
3 minutes ago                  ← DSH: last activity
Elapsed 3 h 12 min             ← this plugin: from the first message
First message 2026-11-19 10:57 ← and when that was
● Running
```

## Install

In the app: **Settings → Plugins → Add plugin**, enter `dsh-session-span`, then enable the **Session elapsed time** bundle.

From a shell, for a `web` profile:

```sh
dsh plugin --profile web add dsh-session-span
```

The Desktop profile is owned by the app, so install there through the Plugins page.

Requires DSH `>=0.2.2-rc.3` and Node `>=22.6`. The package has no dependencies and no install scripts.

## What it shows

- `Elapsed` — wall-clock time from the conversation's first message to now. It keeps counting while the Session is idle and refreshes every 30 seconds while the card is open.
- `First message` — that start stamp in the device time zone, formatted through the app locale (English shows `2026-11-19 09:12`).

## How the start is decided

- The start is the first `user/message` committed with a `user` or `schedule` source, so a Session created by a scheduled task also has a start.
- A fork counts from its own creation instead of inheriting the parent's first prompt.
- The value is a Host Session projection (`sessionSpan`) folded once over the complete durable log. It travels with the Session summary, so the sidebar reads it without activating anything, and it survives paging, compaction, and reloads.
- Sessions that existed before the plugin was installed have no cached value yet; hovering such a row performs one non-activating projection read, and the value is cached from then on. The first hover of a large old Session can therefore show this section a moment late.

## Notes

- Wall-clock means idle time counts too. If you need "time actually spent working", DSH's composer stats strip shows model plus tool wall time instead.
- Nothing model-facing is added, nothing is sent anywhere, and the plugin keeps no state of its own besides the folded projection.
- Uninstall or disable it in **Settings → Plugins**; the hover card returns to its default content.

## Development

The package is shipped as-is: plain ESM on the Host, one browser module registering into the `sidebar.session.row.hover` slot, no build step.

```sh
# point a profile at this checkout
dsh plugin --profile web add /absolute/path/to/this/directory
```

MIT licensed.
