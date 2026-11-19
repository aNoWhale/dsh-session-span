/**
 * Browser half of the Session-span bundle.
 *
 * Contributes one section to the Sidebar Session-row hover card: how long the
 * conversation has been running since its first prompt, plus that start time.
 * The start itself comes from the Host `sessionSpan` projection; this module
 * only formats and ticks a clock while the card is open.
 *
 * The card is mounted only while it is open, so the interval below never runs
 * for a row nobody is looking at.
 */
window.__ModuleLoader__.load({
  id: 'dsh-session-span',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** Dictionary namespace owned by this plugin. */
    const NS = 'sessionSpan';

    const zh = {
      'span.label': '已持续 {duration}',
      'span.since': '首条消息 {time}',
      'span.date': '{y}年{m}月{d}日',
      'span.lessThanMinute': '不到 1 分钟',
      'span.minutes': '{minutes} 分钟',
      'span.hours': '{hours} 小时 {minutes} 分',
      'span.days': '{days} 天 {hours} 小时',
    };

    const en = {
      'span.label': 'Elapsed {duration}',
      'span.since': 'First message {time}',
      'span.date': '{y}-{m}-{d}',
      'span.lessThanMinute': 'less than a minute',
      'span.minutes': '{minutes} min',
      'span.hours': '{hours} h {minutes} min',
      'span.days': '{days} d {hours} h',
    };

    const ja = {
      'span.label': '経過 {duration}',
      'span.since': '最初のメッセージ {time}',
      'span.date': '{y}年{m}月{d}日',
      'span.lessThanMinute': '1 分未満',
      'span.minutes': '{minutes} 分',
      'span.hours': '{hours} 時間 {minutes} 分',
      'span.days': '{days} 日 {hours} 時間',
    };

    const es = {
      'span.label': 'Tiempo transcurrido {duration}',
      'span.since': 'Primer mensaje {time}',
      'span.date': '{d}/{m}/{y}',
      'span.lessThanMinute': 'menos de un minuto',
      'span.minutes': '{minutes} min',
      'span.hours': '{hours} h {minutes} min',
      'span.days': '{days} d {hours} h',
    };

    const fr = {
      'span.label': 'Durée {duration}',
      'span.since': 'Premier message {time}',
      'span.date': '{d}/{m}/{y}',
      'span.lessThanMinute': 'moins d’une minute',
      'span.minutes': '{minutes} min',
      'span.hours': '{hours} h {minutes} min',
      'span.days': '{days} j {hours} h',
    };

    const de = {
      'span.label': 'Dauer {duration}',
      'span.since': 'Erste Nachricht {time}',
      'span.date': '{d}.{m}.{y}',
      'span.lessThanMinute': 'weniger als eine Minute',
      'span.minutes': '{minutes} Min.',
      'span.hours': '{hours} Std. {minutes} Min.',
      'span.days': '{days} T. {hours} Std.',
    };

    const ru = {
      'span.label': 'Длительность {duration}',
      'span.since': 'Первое сообщение {time}',
      'span.date': '{d}.{m}.{y}',
      'span.lessThanMinute': 'меньше минуты',
      'span.minutes': '{minutes} мин',
      'span.hours': '{hours} ч {minutes} мин',
      'span.days': '{days} д {hours} ч',
    };

    const pt = {
      'span.label': 'Duração {duration}',
      'span.since': 'Primeira mensagem {time}',
      'span.date': '{d}/{m}/{y}',
      'span.lessThanMinute': 'menos de um minuto',
      'span.minutes': '{minutes} min',
      'span.hours': '{hours} h {minutes} min',
      'span.days': '{days} d {hours} h',
    };

    /** Pad a number to two digits without consulting the browser locale. */
    const pad2 = (value) => String(value).padStart(2, '0');

    /**
     * Absolute start stamp in the device zone. The date part goes through the
     * dictionary (the message-clock pattern), so the card follows the app
     * locale instead of the browser language.
     */
    function startStamp(epochMs, t) {
      const d = new Date(epochMs);
      const date = t('span.date', { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() });
      return `${date} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    }

    /** Elapsed wall time in at most two units: minutes, then hours, then days. */
    function duration(ms, t) {
      const totalMinutes = Math.floor(Math.max(0, ms) / 60_000);
      if (totalMinutes < 1) return t('span.lessThanMinute');
      const days = Math.floor(totalMinutes / 1_440);
      const hours = Math.floor((totalMinutes % 1_440) / 60);
      const minutes = totalMinutes % 60;
      if (days > 0) return t('span.days', { days, hours });
      if (hours > 0) return t('span.hours', { hours, minutes });
      return t('span.minutes', { minutes });
    }

    /**
     * One hover-card section: the elapsed wall time and the first-message stamp.
     * @param props.sessionId - Session this row shows.
     * @param props.useSessions - selector hook over the Session list.
     * @param props.refreshProjections - non-activating projection read for a row
     *   whose value was never computed in this profile.
     * @param props.t - this namespace's translator.
     */
    function SessionSpanSection({ sessionId, useSessions, refreshProjections, t }) {
      const readValue = typeof useSessions === 'function' ? useSessions : () => undefined;
      const translate = typeof t === 'function' ? t : (key) => key;
      const startedAt = readValue((state) => {
        if (state === undefined || state === null) return undefined;
        const row = state.byId === undefined ? undefined : state.byId[sessionId];
        const values = row === undefined ? undefined : row.projectionValues;
        if (values !== undefined && values !== null && values.sessionSpan !== undefined) {
          return values.sessionSpan;
        }
        const block = state.projectionsBySession === undefined
          ? undefined
          : state.projectionsBySession[sessionId];
        return block === undefined || block.values === undefined ? undefined : block.values.sessionSpan;
      });

      const [now, setNow] = React.useState(() => Date.now());
      React.useEffect(() => {
        const timer = setInterval(() => { setNow(Date.now()) }, 30_000);
        return () => { clearInterval(timer) };
      }, []);

      // A row whose projection was never folded (installed after the row
      // existed) is read once through the non-activating projection endpoint;
      // the store then feeds the same selector.
      const asked = React.useRef(false);
      React.useEffect(() => {
        if (startedAt !== undefined || asked.current) return;
        if (typeof refreshProjections !== 'function') return;
        asked.current = true;
        try {
          Promise.resolve(refreshProjections(sessionId)).catch(() => {});
        } catch {
          // A rejected read leaves the section hidden; the next hover retries.
        }
      }, [startedAt, sessionId, refreshProjections]);

      // `undefined` means "no value yet"; null means the Session has no
      // starting prompt (blank Session, import, or only synthetic context).
      if (startedAt === undefined || startedAt === null || !Number.isFinite(startedAt)) return null;

      const text = duration(now - startedAt, translate);
      return h(
        'div',
        {
          'data-session-span': '',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            fontSize: '12px',
            lineHeight: '16px',
            color: 'var(--dsw-alias-hovercard-label-secondary)',
          },
        },
        h('span', null, translate('span.label', { duration: text })),
        h(
          'span',
          { style: { color: 'var(--dsw-alias-hovercard-label-tertiary)' } },
          translate('span.since', { time: startStamp(startedAt, translate) }),
        ),
      );
    }

    return {
      inject: ['slots', 'locale', 'sessions'],
      apply(ctx) {
        ctx.effect(
          () => ctx.locale.register(NS, { zh, en, ja, es, fr, de, ru, pt }),
          'session-span: dictionaries',
        );
        ctx.slots.inject('sidebar.session.row.hover', () => ctx.slots.register({
          name: 'sidebar.session.row.hover',
          id: 'session-span',
          order: 5,
          locale: NS,
          inject: () => ({
            refreshProjections: (sessionId) => ctx.sessions.refreshProjections(sessionId),
          }),
        }, SessionSpanSection));
      },
    };
  },
});
