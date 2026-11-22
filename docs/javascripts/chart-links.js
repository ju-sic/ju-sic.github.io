/**
 * 종목 차트 링크(highchart-opal.vercel.app)를 새 탭으로 연다.
 * - 본문에는 일반 마크다운 링크만 쓰고, target/rel 속성은 이 스크립트가 일괄 지정한다.
 * - Material for MkDocs SPA 네비게이션(navigation.instant) 호환: document$ 구독
 */
(function () {
  var CHART_HOST = "highchart-opal.vercel.app";

  function openChartLinksInNewTab() {
    var links = document.querySelectorAll('a[href*="' + CHART_HOST + '"]');
    links.forEach(function (link) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  }

  // instant 내비게이션이면 페이지 전환마다, 아니면 최초 로드 시 한 번 적용
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(openChartLinksInNewTab);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", openChartLinksInNewTab);
  } else {
    openChartLinksInNewTab();
  }
})();
