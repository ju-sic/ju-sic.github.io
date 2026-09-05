/**
 * 시계열 매매 타임라인 페이징 (더보기) 스크립트
 *
 * - 초기 로드 시 최신 4개만 표시
 * - '더보기' 클릭 시 4개씩 추가 렌더링
 * - Material for MkDocs SPA 네비게이션(navigation.instant) 호환
 */
function initTimelinePagination() {
  const INITIAL_LIMIT = 4;
  const BATCH_SIZE = 4;

  const timelines = document.querySelectorAll(".kb-timeline");
  timelines.forEach((timeline) => {
    // 중복 초기화 방지
    if (timeline.dataset.paginated === "true") return;
    timeline.dataset.paginated = "true";

    const items = Array.from(timeline.querySelectorAll(".kb-timeline-item"));
    if (items.length <= INITIAL_LIMIT) {
      return; // 4개 이하일 때는 더보기 버튼을 생성하지 않음
    }

    let currentlyVisible = INITIAL_LIMIT;

    // 4번째 초과 아이템 숨김 처리
    items.forEach((item, index) => {
      if (index >= INITIAL_LIMIT) {
        item.classList.add("kb-timeline-item--hidden");
      }
    });

    // 더보기 버튼 래퍼 생성
    const wrap = document.createElement("div");
    wrap.className = "kb-timeline-more-wrap";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "kb-timeline-more-btn";

    function updateButtonState() {
      const remaining = items.length - currentlyVisible;
      if (remaining > 0) {
        const nextBatch = Math.min(BATCH_SIZE, remaining);
        btn.textContent = `타임라인 더보기 (+${nextBatch}개 / 잔여 ${remaining}개)`;
        btn.classList.remove("kb-timeline-more-btn--collapse");
      } else {
        btn.textContent = "처음으로 접기 (최신 4개만 보기)";
        btn.classList.add("kb-timeline-more-btn--collapse");
      }
    }

    btn.addEventListener("click", () => {
      const remaining = items.length - currentlyVisible;
      if (remaining > 0) {
        const nextTarget = Math.min(currentlyVisible + BATCH_SIZE, items.length);
        for (let i = currentlyVisible; i < nextTarget; i++) {
          items[i].classList.remove("kb-timeline-item--hidden");
        }
        currentlyVisible = nextTarget;
      } else {
        // 전체 접기
        for (let i = INITIAL_LIMIT; i < items.length; i++) {
          items[i].classList.add("kb-timeline-item--hidden");
        }
        currentlyVisible = INITIAL_LIMIT;
        timeline.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      updateButtonState();
    });

    updateButtonState();
    wrap.appendChild(btn);
    timeline.parentNode.insertBefore(wrap, timeline.nextSibling);
  });
}

/**
 * 실전 체결 대장 (Trade Log) 페이징 (더보기) 스크립트
 *
 * - 초기 로드 시 최신 14개만 표시
 * - '더보기' 클릭 시 10개씩 추가 렌더링
 * - Material for MkDocs SPA 네비게이션(navigation.instant) 호환
 */
function initTradeLogPagination() {
  const INITIAL_LIMIT = 14;
  const BATCH_SIZE = 10;

  const tables = document.querySelectorAll(
    ".kb-trade-log-table, #trade-log ~ .md-typeset__scrollwrap table, #trade-log ~ .md-typeset__table table, #trade-log ~ table"
  );

  tables.forEach((table) => {
    // 중복 초기화 방지
    if (table.dataset.paginated === "true") return;
    table.dataset.paginated = "true";

    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll("tr"));
    if (rows.length <= INITIAL_LIMIT) {
      return; // 14개 이하일 때는 더보기 버튼을 생성하지 않음
    }

    let currentlyVisible = INITIAL_LIMIT;

    // 14번째 초과 행 숨김 처리
    rows.forEach((row, index) => {
      if (index >= INITIAL_LIMIT) {
        row.classList.add("kb-table-row--hidden");
      }
    });

    // 더보기 버튼 래퍼 생성
    const wrap = document.createElement("div");
    wrap.className = "kb-table-more-wrap";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "kb-table-more-btn";

    function updateButtonState() {
      const remaining = rows.length - currentlyVisible;
      if (remaining > 0) {
        const nextBatch = Math.min(BATCH_SIZE, remaining);
        btn.textContent = `체결 대장 더보기 (+${nextBatch}개 / 잔여 ${remaining}개)`;
        btn.classList.remove("kb-table-more-btn--collapse");
      } else {
        btn.textContent = "처음으로 접기 (최신 14개만 보기)";
        btn.classList.add("kb-table-more-btn--collapse");
      }
    }

    const mountTarget = table.closest(".md-typeset__scrollwrap") || table.closest(".md-typeset__table") || table;

    btn.addEventListener("click", () => {
      const remaining = rows.length - currentlyVisible;
      if (remaining > 0) {
        const nextTarget = Math.min(currentlyVisible + BATCH_SIZE, rows.length);
        for (let i = currentlyVisible; i < nextTarget; i++) {
          rows[i].classList.remove("kb-table-row--hidden");
        }
        currentlyVisible = nextTarget;
      } else {
        // 전체 접기
        for (let i = INITIAL_LIMIT; i < rows.length; i++) {
          rows[i].classList.add("kb-table-row--hidden");
        }
        currentlyVisible = INITIAL_LIMIT;
        mountTarget.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      updateButtonState();
    });

    updateButtonState();
    wrap.appendChild(btn);
    mountTarget.parentNode.insertBefore(wrap, mountTarget.nextSibling);
  });
}

function initAllPaginations() {
  initTimelinePagination();
  initTradeLogPagination();
}

// Material 테마의 instant loading 지원 및 일반 DOMContentLoaded 지원
if (typeof document$ !== "undefined") {
  document$.subscribe(initAllPaginations);
} else {
  document.addEventListener("DOMContentLoaded", initAllPaginations);
}
