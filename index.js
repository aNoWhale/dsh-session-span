/**
 * Host half of the Session-span bundle.
 *
 * Publishes the start of a Session conversation as the `sessionSpan`
 * projection: the committed time of its first prompt on the append surface, or
 * the fork's own creation time when the Session inherited a parent prefix.
 * The value is folded over the complete durable log once, so the Web UI can
 * render "how long has this conversation been running" for every Session row
 * without reading the log again.
 *
 * Only the fold lives here; delivery (list summaries, control baselines, and
 * the persisted projection cache) belongs to the projection seam.
 */

/**
 * Both schemas are validated with `parse` only by the projection registry, and
 * the shapes are plain JSON this plugin owns, so a pass-through validator is
 * enough and keeps the bundle dependency-free.
 */
const passthrough = { parse: value => value }

/**
 * Message sources that start a conversation on the human's behalf. A scheduled
 * task delivers its prompt as a `schedule` source, so a task-owned Session has
 * a start even when no human typed the first message.
 */
const STARTING_SOURCES = new Set(['user', 'schedule'])

/** The projection registry is the plugin's whole purpose. */
export const inject = ['sessionProjections']

/**
 * Register the `sessionSpan` unit; the registration is an effect on this
 * plugin's fiber, so unloading removes the key.
 * @param ctx - registrant context carrying the projection registry.
 * @returns when the unit is registered.
 */
export async function apply(ctx) {
  await ctx.sessionProjections.register({
    key: 'sessionSpan',
    stateVersion: 1,
    stateSchema: passthrough,
    init: (header, inheritedEventCount) => ({
      // A fork inherits its parent's events, so its first prompt predates this
      // conversation; the fork's own header time is the only honest start.
      startedAt: inheritedEventCount > 0 ? header.createdAt : null,
    }),
    apply: (state, event) => {
      if (state.startedAt !== null) return state
      if (event.type !== 'user/message') return state
      const source = event.data?.source
      if (source === undefined || !STARTING_SOURCES.has(source.kind)) return state
      const content = event.data?.content
      if (!Array.isArray(content) || content.length === 0) return state
      return { startedAt: event.time }
    },
    wire: {
      viewSchema: passthrough,
      /** Epoch milliseconds, or null while no starting prompt exists yet. */
      view: state => state.startedAt,
      // The Session list row carries this value, which is how the sidebar
      // hover card reads it without activating anything.
      summary: true,
    },
  })
}
