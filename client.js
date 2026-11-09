/**
 * Full-screen DeepSeek boot sequence, rendered into the frame-wide overlay slot.
 * Plays once per page load; any pointer/key/wheel input skips it.
 */
window.__ModuleLoader__.load({
  id: '@local/deepseek-boot',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'deepseek-boot';
    const HOLD_MS = 3600;
    const FADE_MS = 480;
    const REDUCED_HOLD_MS = 650;

    const EN = {
      title: 'DeepSeek boot animation',
      brand: 'DEEPSEEK // BOOT SEQUENCE',
      tagline: 'Deep dive into intelligence',
      bootLabel: 'BOOT SEQUENCE',
      line1: 'Neural core online',
      line2: 'Weight tensors loaded',
      line3: 'Context channel linked',
      line4: 'All systems ready',
      online: 'SYSTEM ONLINE',
      hint: 'Click anywhere to skip',
    };

    const ZH = {
      title: 'DeepSeek 开机动画',
      brand: '深度求索 // 启动序列',
      tagline: '深潜智能，探索未至',
      bootLabel: '启动序列',
      line1: '神经内核已激活',
      line2: '权重张量已载入',
      line3: '上下文通道已连通',
      line4: '全部系统就绪',
      online: '系统在线',
      hint: '点击任意位置跳过',
    };

    // One play per page load, even if the overlay slot remounts.
    let played = false;

    const CSS = `
.dsboot-root{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;overflow:hidden;background:radial-gradient(120% 95% at 50% 38%,#0b1a35 0%,#060d1c 48%,#01030a 100%);color:#e6efff;font-family:"Segoe UI","PingFang SC","Microsoft YaHei",system-ui,sans-serif;user-select:none;-webkit-user-select:none;pointer-events:auto;isolation:isolate;opacity:1;transform:scale(1);transition:opacity .48s ease,transform .48s cubic-bezier(.4,0,.2,1);will-change:opacity,transform}
.dsboot-root--out{opacity:0;transform:scale(1.04);pointer-events:none}

.dsboot-grid{position:absolute;inset:-25%;background-image:linear-gradient(rgba(96,140,255,.075) 1px,transparent 1px),linear-gradient(90deg,rgba(96,140,255,.075) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:radial-gradient(58% 52% at 50% 44%,#000 0%,rgba(0,0,0,.35) 55%,transparent 78%);mask-image:radial-gradient(58% 52% at 50% 44%,#000 0%,rgba(0,0,0,.35) 55%,transparent 78%);animation:dsboot-grid-drift 7s linear both}
.dsboot-vignette{position:absolute;inset:0;background:radial-gradient(75% 65% at 50% 45%,transparent 40%,rgba(0,0,0,.55) 100%)}
.dsboot-scan{position:absolute;left:0;right:0;top:-30%;height:38%;background:linear-gradient(180deg,transparent,rgba(112,158,255,.10) 55%,rgba(150,220,255,.20) 78%,transparent);animation:dsboot-scan 3.4s cubic-bezier(.35,0,.25,1) both}
.dsboot-flash{position:absolute;inset:0;pointer-events:none;background:radial-gradient(42% 34% at 50% 43%,rgba(190,220,255,.55),rgba(110,150,255,.18) 42%,transparent 70%);opacity:0;animation:dsboot-flash 1.25s ease-out both}
.dsboot-corner{position:absolute;width:22px;height:22px;border:1px solid rgba(130,170,255,.35);opacity:0;animation:dsboot-rise .7s ease-out .45s both}
.dsboot-corner--tl{top:26px;left:26px;border-right:0;border-bottom:0}
.dsboot-corner--tr{top:26px;right:26px;border-left:0;border-bottom:0}
.dsboot-corner--bl{bottom:26px;left:26px;border-right:0;border-top:0}
.dsboot-corner--br{bottom:26px;right:26px;border-left:0;border-top:0}

.dsboot-brand{position:absolute;top:32px;left:48px;font:11px/1 "Cascadia Mono",Consolas,monospace;letter-spacing:.34em;text-transform:uppercase;color:rgba(150,186,255,.62);opacity:0;animation:dsboot-rise .9s ease-out .4s both}
.dsboot-hint{position:absolute;bottom:38px;left:50%;transform:translateX(-50%);font:10px/1 "Cascadia Mono",Consolas,monospace;letter-spacing:.24em;text-transform:uppercase;color:rgba(150,186,255,.42);opacity:0;animation:dsboot-rise 1s ease-out 2.1s both}

.dsboot-stage{position:relative;display:flex;flex-direction:column;align-items:center;animation:dsboot-stage-in .5s ease-out both}

.dsboot-mark{width:212px;height:212px;filter:drop-shadow(0 0 28px rgba(77,107,254,.55));animation:dsboot-mark-in .95s cubic-bezier(.2,.8,.2,1) both}
.dsboot-spin-slow,.dsboot-spin-rev,.dsboot-spin-fast,.dsboot-spin-dot,.dsboot-halo{transform-box:fill-box;transform-origin:center}
.dsboot-spin-slow{animation:dsboot-spin 11s linear infinite}
.dsboot-spin-rev{animation:dsboot-spin 7s linear infinite reverse}
.dsboot-spin-fast{animation:dsboot-spin 5.5s linear infinite}
.dsboot-spin-dot{animation:dsboot-spin 3.4s linear infinite}
.dsboot-halo{animation:dsboot-pulse 2.6s ease-in-out infinite}

.dsboot-word{display:flex;gap:.32em;margin-top:20px;padding-left:.32em;font-size:34px;font-weight:600;letter-spacing:.32em;line-height:1;color:#eff5ff;text-shadow:0 0 22px rgba(99,140,255,.7)}
.dsboot-word span{display:inline-block;opacity:0;animation:dsboot-letter .72s cubic-bezier(.2,.8,.2,1) both}

.dsboot-tagline{margin-top:16px;font-size:12px;letter-spacing:.42em;text-transform:uppercase;color:rgba(158,196,255,.74);opacity:0;animation:dsboot-rise .9s ease-out 1.0s both}
.dsboot-rule{width:56px;height:1px;margin-top:18px;background:linear-gradient(90deg,transparent,rgba(126,231,255,.85),transparent);opacity:0;animation:dsboot-rule .9s ease-out .95s both}

.dsboot-log{width:328px;margin-top:26px;display:flex;flex-direction:column;gap:9px;font:12px/1.5 "Cascadia Mono",Consolas,monospace;letter-spacing:.04em;color:rgba(168,201,255,.78)}
.dsboot-log-row{display:flex;align-items:center;gap:10px;opacity:0;animation:dsboot-rise .55s ease-out both}
.dsboot-log-row i{flex:0 0 auto;width:5px;height:5px;background:#6f8dff;box-shadow:0 0 8px rgba(111,141,255,.95);transform:rotate(45deg)}
.dsboot-log-row:last-child{color:#a9e8ff;text-shadow:0 0 14px rgba(126,231,255,.45)}
.dsboot-log-row:last-child i{background:#7ee7ff;box-shadow:0 0 10px rgba(126,231,255,1)}

.dsboot-progress{width:328px;margin-top:24px}
.dsboot-progress-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;font:10px/1 "Cascadia Mono",Consolas,monospace;letter-spacing:.26em;text-transform:uppercase;color:rgba(140,175,235,.55)}
.dsboot-online{color:#9fe4ff;opacity:0;text-shadow:0 0 12px rgba(126,231,255,.8);animation:dsboot-online .7s ease-out 3.0s both}
.dsboot-rail{position:relative;height:2px;border-radius:2px;background:rgba(120,160,255,.16);overflow:hidden}
.dsboot-fill{position:absolute;inset:0 auto 0 0;width:0;background:linear-gradient(90deg,#4d6bfe,#7ee7ff);box-shadow:0 0 14px rgba(126,231,255,.85);animation:dsboot-fill 2.4s cubic-bezier(.25,.8,.3,1) .95s both}
.dsboot-fill::after{content:"";position:absolute;top:0;bottom:0;width:90px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent);animation:dsboot-shimmer 1.4s linear 1.35s infinite}

@keyframes dsboot-stage-in{from{opacity:0}to{opacity:1}}
@keyframes dsboot-mark-in{0%{opacity:0;transform:scale(.82)}70%{opacity:1}100%{opacity:1;transform:scale(1)}}
@keyframes dsboot-spin{to{transform:rotate(360deg)}}
@keyframes dsboot-pulse{0%,100%{opacity:.28;transform:scale(.92)}50%{opacity:.65;transform:scale(1.06)}}
@keyframes dsboot-letter{0%{opacity:0;filter:blur(10px);transform:translateY(14px) scale(.94)}65%{opacity:1;filter:blur(0)}100%{opacity:1;filter:blur(0);transform:none}}
@keyframes dsboot-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes dsboot-rule{from{opacity:0;transform:scaleX(.2)}to{opacity:1;transform:scaleX(1)}}
@keyframes dsboot-fill{from{width:0}to{width:100%}}
@keyframes dsboot-shimmer{from{transform:translateX(-120px)}to{transform:translateX(360px)}}
@keyframes dsboot-online{from{opacity:0;filter:blur(6px)}to{opacity:1;filter:blur(0)}}
@keyframes dsboot-scan{from{top:-40%}to{top:112%}}
@keyframes dsboot-grid-drift{from{background-position:0 0,0 0}to{background-position:0 56px,56px 0}}
@keyframes dsboot-flash{0%{opacity:0}12%{opacity:.55}40%{opacity:.2}100%{opacity:0}}

@media (max-height: 700px){
.dsboot-mark{width:160px;height:160px}
.dsboot-word{font-size:28px;margin-top:14px}
.dsboot-tagline{margin-top:12px}
.dsboot-log{margin-top:18px;gap:6px}
.dsboot-progress{margin-top:16px}
}
@media (max-width: 520px){
.dsboot-log,.dsboot-progress{width:min(328px,78vw)}
.dsboot-word{font-size:26px;letter-spacing:.24em}
.dsboot-brand{left:28px;letter-spacing:.2em}
}
@media (prefers-reduced-motion: reduce){
.dsboot-root,.dsboot-root *{animation-duration:.001s!important;animation-delay:0s!important;transition-duration:.1s!important}
}
`;

    function Mark() {
      const orbit = [0, 60, 120].map((angle) =>
        h('ellipse', {
          key: angle,
          cx: 100, cy: 100, rx: 62, ry: 22,
          transform: 'rotate(' + angle + ' 100 100)',
          fill: 'none', stroke: '#7d97ff', strokeOpacity: 0.42, strokeWidth: 1,
        }),
      );
      return h('svg', {
        className: 'dsboot-mark',
        viewBox: '0 0 200 200',
        'aria-hidden': 'true',
        focusable: 'false',
      },
      h('defs', { key: 'defs' },
        h('radialGradient', { id: 'dsboot-core', cx: '42%', cy: '34%', r: '78%' },
          h('stop', { offset: '0%', stopColor: '#e2ecff' }),
          h('stop', { offset: '38%', stopColor: '#6d8bff' }),
          h('stop', { offset: '100%', stopColor: '#16306b' }),
        ),
        h('linearGradient', { id: 'dsboot-ring', x1: '0', y1: '0', x2: '1', y2: '1' },
          h('stop', { offset: '0%', stopColor: '#7ee7ff', stopOpacity: 0.9 }),
          h('stop', { offset: '55%', stopColor: '#4d6bfe', stopOpacity: 0.45 }),
          h('stop', { offset: '100%', stopColor: '#7ee7ff', stopOpacity: 0 }),
        ),
        h('filter', { id: 'dsboot-glow', x: '-70%', y: '-70%', width: '240%', height: '240%' },
          h('feGaussianBlur', { stdDeviation: 7 }),
        ),
      ),
      h('g', { key: 'halo', className: 'dsboot-halo' },
        h('circle', { cx: 100, cy: 100, r: 58, fill: 'none', stroke: '#4d6bfe', strokeOpacity: 0.35, strokeWidth: 10, filter: 'url(#dsboot-glow)' }),
      ),
      h('g', { key: 'slow', className: 'dsboot-spin-slow' },
        h('rect', { x: 0, y: 0, width: 200, height: 200, fill: 'none' }),
        h('circle', { cx: 100, cy: 100, r: 88, fill: 'none', stroke: 'url(#dsboot-ring)', strokeWidth: 1, strokeDasharray: '2 10' }),
      ),
      h('g', { key: 'rev', className: 'dsboot-spin-rev' },
        h('rect', { x: 0, y: 0, width: 200, height: 200, fill: 'none' }),
        h('circle', { cx: 100, cy: 100, r: 74, fill: 'none', stroke: '#8fb4ff', strokeOpacity: 0.75, strokeWidth: 1.6, strokeDasharray: '58 407', strokeLinecap: 'round' }),
      ),
      h('g', { key: 'atom', className: 'dsboot-spin-fast' },
        h('rect', { x: 0, y: 0, width: 200, height: 200, fill: 'none' }),
        orbit,
      ),
      h('circle', { key: 'coreglow', cx: 100, cy: 100, r: 34, fill: '#4d6bfe', opacity: 0.32, filter: 'url(#dsboot-glow)' }),
      h('path', {
        key: 'drop',
        d: 'M100 72 C112 87 122 99 122 111 A22 22 0 0 1 78 111 C78 99 88 87 100 72 Z',
        fill: 'url(#dsboot-core)',
        stroke: '#bcd4ff',
        strokeOpacity: 0.55,
        strokeWidth: 1,
      }),
      h('ellipse', { key: 'gleam', cx: 93, cy: 104, rx: 5, ry: 8, fill: '#eaf4ff', opacity: 0.5, transform: 'rotate(-18 93 104)' }),
      h('circle', { key: 'dot', cx: 100, cy: 111, r: 2, fill: '#f4f9ff' }),
      h('g', { key: 'orbit-dot', className: 'dsboot-spin-dot' },
        h('rect', { x: 0, y: 0, width: 200, height: 200, fill: 'none' }),
        h('circle', { cx: 100, cy: 12, r: 2.6, fill: '#a9e8ff' }),
        h('circle', { cx: 100, cy: 12, r: 6, fill: '#7ee7ff', opacity: 0.25 }),
      ),
      );
    }

    function BootOverlay(props) {
      const t = props.t;
      const [phase, setPhase] = React.useState(function start() {
        if (played) return 'done';
        played = true;
        return 'running';
      });

      React.useEffect(() => {
        if (phase !== 'running') return undefined;
        const reduced = typeof window.matchMedia === 'function'
          && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const id = window.setTimeout(() => setPhase('leaving'), reduced ? REDUCED_HOLD_MS : HOLD_MS);
        return () => window.clearTimeout(id);
      }, [phase]);

      React.useEffect(() => {
        if (phase !== 'leaving') return undefined;
        const id = window.setTimeout(() => setPhase('done'), FADE_MS);
        return () => window.clearTimeout(id);
      }, [phase]);

      React.useEffect(() => {
        if (phase !== 'running') return undefined;
        const skip = () => setPhase((current) => (current === 'running' ? 'leaving' : current));
        window.addEventListener('pointerdown', skip, true);
        window.addEventListener('keydown', skip, true);
        window.addEventListener('wheel', skip, { capture: true, passive: true });
        return () => {
          window.removeEventListener('pointerdown', skip, true);
          window.removeEventListener('keydown', skip, true);
          window.removeEventListener('wheel', skip, true);
        };
      }, [phase]);

      if (phase === 'done') return null;
      const out = phase === 'leaving';

      const lines = [t('line1'), t('line2'), t('line3'), t('line4')];

      return h('div', {
        className: 'dsboot-root' + (out ? ' dsboot-root--out' : ''),
        role: 'presentation',
        'aria-label': t('title'),
      },
      h('style', { key: 'style' }, CSS),
      h('div', { key: 'grid', className: 'dsboot-grid' }),
      h('div', { key: 'vignette', className: 'dsboot-vignette' }),
      h('div', { key: 'scan', className: 'dsboot-scan' }),
      h('div', { key: 'flash', className: 'dsboot-flash' }),
      h('div', { key: 'c1', className: 'dsboot-corner dsboot-corner--tl' }),
      h('div', { key: 'c2', className: 'dsboot-corner dsboot-corner--tr' }),
      h('div', { key: 'c3', className: 'dsboot-corner dsboot-corner--bl' }),
      h('div', { key: 'c4', className: 'dsboot-corner dsboot-corner--br' }),
      h('div', { key: 'brand', className: 'dsboot-brand' }, t('brand')),
      h('div', { key: 'stage', className: 'dsboot-stage' },
        h(Mark, { key: 'mark' }),
        h('div', { key: 'word', className: 'dsboot-word', 'aria-hidden': 'true' },
          'DEEPSEEK'.split('').map((letter, index) => h('span', {
            key: index,
            style: { animationDelay: (0.26 + index * 0.066).toFixed(3) + 's' },
          }, letter)),
        ),
        h('div', { key: 'tagline', className: 'dsboot-tagline' }, t('tagline')),
        h('div', { key: 'rule', className: 'dsboot-rule' }),
        h('div', { key: 'log', className: 'dsboot-log' },
          lines.map((line, index) => h('div', {
            key: index,
            className: 'dsboot-log-row',
            style: { animationDelay: (1.15 + index * 0.36).toFixed(2) + 's' },
          }, h('i'), h('span', null, line))),
        ),
        h('div', { key: 'progress', className: 'dsboot-progress' },
          h('div', { key: 'head', className: 'dsboot-progress-head' },
            h('span', { key: 'label' }, t('bootLabel')),
            h('span', { key: 'online', className: 'dsboot-online' }, t('online')),
          ),
          h('div', { key: 'rail', className: 'dsboot-rail' },
            h('div', { key: 'fill', className: 'dsboot-fill' }),
          ),
        ),
      ),
      h('div', { key: 'hint', className: 'dsboot-hint' }, t('hint')),
      );
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', EN));
        ctx.effect(() => ctx.locale.register(NS, 'zh', ZH));
        const t = ctx.locale.bind(NS);
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'deepseek-boot',
          order: -1,
          label: () => t('title'),
        }, () => h(BootOverlay, { t })));
      },
    };
  },
});
