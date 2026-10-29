/**
 * Vega-Lite 전역 차트 테마
 *
 * - mkdocs-charts-plugin은 렌더링할 때마다 전역 vegaEmbed를 호출한다.
 *   이 함수를 감싸서 사이트 디자인 토큰(--kb-*)으로 만든 config를 주입한다.
 * - 스펙 안의 config와 명시적인 색은 이 기본값보다 우선한다.
 *   (공포·탐욕 5색처럼 콘텐츠 규칙이 정한 색은 그대로 유지된다)
 * - 다크 모드 전환 시 플러그인이 다시 vegaEmbed를 호출하므로
 *   그 시점의 토큰을 새로 읽어 자동으로 따라간다.
 */
(function () {
  if (typeof window.vegaEmbed !== "function" || window.vegaEmbed.kbThemed) return;

  const originalEmbed = window.vegaEmbed;

  function readToken(name, fallback) {
    const value = getComputedStyle(document.body).getPropertyValue(name).trim();
    return value || fallback;
  }

  function buildConfig() {
    const font = readToken("--md-text-font-family", "Pretendard, sans-serif");
    const strong = readToken("--kb-text-strong", "#0d0d0d");
    const text = readToken("--kb-text", "#262626");
    const muted = readToken("--kb-text-muted", "#5d5d5d");
    const border = readToken("--kb-border", "#ececec");
    const borderStrong = readToken("--kb-border-strong", "#d9d9d9");
    const bg = readToken("--kb-bg", "#ffffff");

    // 시리즈 색은 명도를 맞춘 6색. 스펙이 색을 지정하지 않은 차트에만 쓰인다.
    const palette = [
      readToken("--kb-chart-1", "#10a37f"),
      readToken("--kb-chart-2", "#3b82f6"),
      readToken("--kb-chart-3", "#f59e0b"),
      readToken("--kb-chart-4", "#ef4444"),
      readToken("--kb-chart-5", "#8b5cf6"),
      readToken("--kb-chart-6", "#64748b"),
    ];

    return {
      font: font,
      background: null,
      padding: 4,
      view: { stroke: null },

      // 축: 기준선만 남기고 눈금은 지운다. 격자는 점선 헤어라인으로 물러나게 한다.
      axis: {
        labelFont: font,
        labelColor: muted,
        labelFontSize: 11,
        labelFontWeight: 500,
        labelPadding: 8,
        titleFont: font,
        titleColor: muted,
        titleFontSize: 11,
        titleFontWeight: 500,
        titlePadding: 12,
        domainColor: borderStrong,
        domainWidth: 1,
        ticks: false,
        gridColor: border,
        gridDash: [2, 4],
        gridWidth: 1,
      },
      axisY: { domain: false },
      axisBand: { grid: false },

      legend: {
        labelFont: font,
        labelColor: text,
        labelFontSize: 11,
        labelFontWeight: 500,
        titleFont: font,
        titleColor: muted,
        titleFontSize: 11,
        titleFontWeight: 600,
        symbolType: "circle",
        symbolSize: 70,
        symbolStrokeWidth: 0,
        rowPadding: 6,
        columnPadding: 14,
      },

      title: {
        font: font,
        color: strong,
        fontSize: 14,
        fontWeight: 600,
        subtitleColor: muted,
        subtitleFontSize: 12,
        anchor: "start",
        offset: 14,
      },

      header: { labelColor: muted, titleColor: strong, labelFont: font, titleFont: font },

      range: { category: palette },

      text: { font: font, color: text, fontSize: 11 },
      line: { strokeWidth: 2, strokeCap: "round", strokeJoin: "round" },
      point: { filled: true, size: 44, stroke: bg, strokeWidth: 1.5 },
      bar: { cornerRadiusEnd: 4 },
      rule: { color: borderStrong },
      area: { opacity: 0.16 },
    };
  }

  function themedEmbed(el, spec, options) {
    const opts = Object.assign({}, options);
    // vega 내장 테마(dark 등)는 배경·글자색을 고정하므로 쓰지 않고 사이트 config로 대체한다.
    delete opts.theme;
    opts.config = buildConfig();
    // 툴팁은 extra.css의 .vg-tooltip.custom-theme 스타일을 쓴다.
    opts.tooltip = { theme: "custom" };
    return originalEmbed(el, spec, opts);
  }

  // vegaEmbed.vega, vegaEmbed.version 같은 부가 속성을 그대로 노출한다.
  Object.assign(themedEmbed, originalEmbed);
  themedEmbed.kbThemed = true;
  window.vegaEmbed = themedEmbed;
})();
