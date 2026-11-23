/**
 * MkDocs Material 주석(.md-annotation)에 데스크톱 마우스 호버를 지원한다.
 * - 마우스를 올리면 focus로 네이티브 툴팁을 열고, 벗어나면 짧은 지연 후 닫는다.
 * - 모바일(touch/pen)에서는 기존 클릭·탭 동작을 그대로 유지한다.
 * - navigation.instant(SPA) 환경 호환: document$ 구독 및 DOM 준비 직후 바인딩.
 */
(function () {
  var HOVER_CLOSE_DELAY_MS = 180;

  function bindAnnotationHover() {
    var annotations = document.querySelectorAll("aside.md-annotation");
    annotations.forEach(function (aside) {
      if (aside.dataset.hoverBound === "1") {
        return;
      }
      aside.dataset.hoverBound = "1";

      var closeTimer = null;

      aside.addEventListener("pointerenter", function (event) {
        if (event.pointerType !== "mouse") {
          return;
        }
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
        aside.focus({ preventScroll: true });
      });

      aside.addEventListener("pointerleave", function (event) {
        if (event.pointerType !== "mouse") {
          return;
        }
        if (closeTimer) {
          clearTimeout(closeTimer);
        }
        closeTimer = setTimeout(function () {
          closeTimer = null;
          if (!aside.matches(":hover")) {
            aside.blur();
          }
        }, HOVER_CLOSE_DELAY_MS);
      });
    });
  }

  function scheduleBind() {
    bindAnnotationHover();
    // Material 컴포넌트가 document$ 직후 비동기로 마운트될 경우를 대비한다.
    requestAnimationFrame(bindAnnotationHover);
    setTimeout(bindAnnotationHover, 50);
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(scheduleBind);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleBind);
  } else {
    scheduleBind();
  }
})();
