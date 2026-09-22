/* Native SVG charts: RISE's gray/blue palette and lightweight chart treatment.
   Means and error-bar endpoints are transcribed from the source PDF vectors.
   Each task has 20 evaluations; the average pools the six equal-size tasks.
   The reported intervals are preserved, not re-estimated or reinterpreted. */
(() => {
  'use strict';
  const root = document.getElementById('real-robot-charts');
  if (!root) return;
  const DATA = [
    {task:'Button Pressing', lines:['Button','Pressing'], group:'Single-arm', successes:[3,9], n:20, bounds:[[5.236780,36.042330],[25.819503,65.791799]]},
    {task:'Bottle Uprighting', lines:['Bottle','Uprighting'], group:'Single-arm', successes:[12,14], n:20, bounds:[[38.657795,78.119603],[48.102323,85.452473]]},
    {task:'Test-Tube Transfer', lines:['Test-Tube','Transfer'], group:'Single-arm', successes:[7,11], n:20, bounds:[[18.118955,56.714949],[34.208201,74.180498]]},
    {task:'Flower Insertion', lines:['Flower','Insertion'], group:'Bimanual', successes:[11,14], n:20, bounds:[[34.208201,74.180498],[48.102323,85.452473]]},
    {task:'Cup Stacking', lines:['Cup','Stacking'], group:'Bimanual', successes:[11,12], n:20, bounds:[[34.208201,74.180498],[38.657795,78.119603]]},
    {task:'Towel Folding', lines:['Towel','Folding'], group:'Bimanual', successes:[3,7], n:20, bounds:[[5.236780,36.042330],[18.118955,56.714949]]},
    {task:'Average', lines:['Across all','six tasks'], group:'All tasks', successes:[47,67], n:120, bounds:[[30.899056,48.106383],[46.904361,64.400403]]}
  ];
  const names = ['SFT','I-WoVR'];
  const NS = 'http://www.w3.org/2000/svg';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const svgNode = (tag, attrs = {}, text) => {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const percentage = (row, index) => 100 * row.successes[index] / row.n;
  const label = (row, index) => percentage(row, index).toFixed(row.n === 120 ? 1 : 0) + '%';
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  }, {threshold:0.15});

  ['Single-arm','Bimanual','All tasks'].forEach((group, panelIndex) => {
    const rows = DATA.filter(row => row.group === group);
    const panel = document.createElement('div');
    panel.className = 'robot-chart-panel';
    panel.setAttribute('role', 'group');
    panel.setAttribute('aria-labelledby', 'robot-panel-' + panelIndex);
    const heading = document.createElement('h4');
    heading.id = 'robot-panel-' + panelIndex;
    heading.textContent = group;
    const wrap = document.createElement('div');
    wrap.className = 'robot-chart-wrap';
    const svg = svgNode('svg', {class:'robot-chart', role:'group', 'aria-labelledby':heading.id});
    const tip = document.createElement('div');
    tip.className = 'tooltip robot-chart-tip';
    tip.setAttribute('aria-hidden', 'true');
    wrap.append(svg, tip);
    panel.append(heading, wrap);
    root.append(panel);
    if (!reducedMotion.matches) panel.classList.add('will-animate');
    observer.observe(panel);

    const hideTip = () => tip.classList.remove('on');
    panel.addEventListener('keydown', event => { if (event.key === 'Escape') hideTip(); });
    const showTip = (row, series, bar, event) => {
      const title = document.createElement('strong');
      title.textContent = row.task;
      const value = document.createElement('span');
      value.textContent = `${names[series]}: ${label(row, series)} (${row.successes[series]}/${row.n})`;
      tip.replaceChildren(title, value);
      tip.classList.add('on');
      const rect = wrap.getBoundingClientRect();
      const b = bar.getBoundingClientRect();
      const x = event && Number.isFinite(event.clientX) ? event.clientX - rect.left : b.x - rect.left + b.width / 2;
      const y = event && Number.isFinite(event.clientY) ? event.clientY - rect.top : b.y - rect.top;
      tip.style.left = Math.max(8, Math.min(x + 12, rect.width - tip.offsetWidth - 8)) + 'px';
      tip.style.top = Math.max(8, Math.min(y - tip.offsetHeight - 12, rect.height - tip.offsetHeight - 8)) + 'px';
    };

    let lastWidth = 0;
    const draw = () => {
      const width = Math.round(wrap.clientWidth);
      if (width < 1 || width === lastWidth) return;
      lastWidth = width;
      hideTip();
      const height = 300;
      const pad = {left:39, right:12, top:18, bottom:53};
      const bottom = height - pad.bottom;
      const plotH = bottom - pad.top;
      const plotW = width - pad.left - pad.right;
      const y = value => bottom - value / 100 * plotH;
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.style.setProperty('--chart-baseline', bottom + 'px');
      svg.replaceChildren();
      const grid = svgNode('g', {'aria-hidden':'true'});
      for (let value = 0; value <= 100; value += 20) {
        grid.append(svgNode('line', {x1:pad.left, x2:width-pad.right, y1:y(value), y2:y(value), class:value === 0 ? 'robot-axis' : 'robot-gridline'}));
        grid.append(svgNode('text', {x:pad.left-9, y:y(value)+4, class:'robot-axis-label', 'text-anchor':'end'}, value));
      }
      svg.append(grid);
      const groupW = plotW / rows.length;
      const barW = Math.min(rows.length === 1 ? 46 : 29, (groupW - 18) / 2);
      const gap = 7;
      rows.forEach((row, index) => {
        const center = pad.left + (index + 0.5) * groupW;
        for (let series = 0; series < 2; series++) {
          const value = percentage(row, series);
          const [low, high] = row.bounds[series];
          const x = center - barW - gap/2 + series * (barW + gap);
          const top = y(value);
          const radius = 5;
          const bar = svgNode('g', {
            class:`robot-bar ${series === 0 ? 'robot-sft' : 'robot-ours'}`,
            tabindex:0, role:'img',
            'aria-label':`${row.task}, ${names[series]}: ${label(row, series)}, ${row.successes[series]} of ${row.n} successful.`,
            'data-task':row.task, 'data-policy':names[series], 'data-value':value, 'data-low':low, 'data-high':high
          });
          const ink = svgNode('g', {class:'robot-bar-ink', 'aria-hidden':'true'});
          ink.append(svgNode('path', {class:'robot-bar-shape', d:`M ${x} ${bottom} V ${top+radius} Q ${x} ${top} ${x+radius} ${top} H ${x+barW-radius} Q ${x+barW} ${top} ${x+barW} ${top+radius} V ${bottom} Z`}));
          const cx = x + barW/2;
          ink.append(svgNode('path', {class:'robot-error-bar', d:`M ${cx} ${y(low)} V ${y(high)} M ${cx-4} ${y(low)} H ${cx+4} M ${cx-4} ${y(high)} H ${cx+4}`}));
          bar.append(ink);
          bar.append(svgNode('text', {x:cx, y:y(high)-9, class:'robot-bar-value', 'text-anchor':'middle', 'aria-hidden':'true'}, label(row, series)));
          bar.append(svgNode('rect', {x:x-3, y:y(high)-25, width:barW+6, height:bottom-y(high)+25, class:'robot-bar-hit', 'aria-hidden':'true'}));
          bar.addEventListener('pointerenter', event => showTip(row, series, bar, event));
          bar.addEventListener('pointermove', event => showTip(row, series, bar, event));
          bar.addEventListener('pointerleave', hideTip);
          bar.addEventListener('focus', () => showTip(row, series, bar));
          bar.addEventListener('blur', hideTip);
          bar.addEventListener('click', () => showTip(row, series, bar));
          svg.append(bar);
        }
        const taskLabel = svgNode('text', {x:center, y:bottom+21, class:'robot-task-label', 'text-anchor':'middle', 'aria-hidden':'true'});
        row.lines.forEach((line, lineIndex) => taskLabel.append(svgNode('tspan', {x:center, dy:lineIndex ? 15 : 0}, line)));
        svg.append(taskLabel);
      });
    };
    draw();
    new ResizeObserver(draw).observe(wrap);
  });
})();
