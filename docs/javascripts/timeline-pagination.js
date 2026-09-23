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
 * 체결 대장 표 탐색
 *
 * `#trade-log ~ table` 같은 후행 형제 선택자는 범위의 끝이 없어서, 체결 대장 헤딩
 * 뒤에 오는 '현재 보유 포지션'과 '월별 성과 요약' 표까지 함께 잡힌다. 지금은 두 표가
 * 14행 이하라 증상이 없지만, 월별 요약이 15행을 넘기면 그 표에도 '체결 대장 더보기'
 * 버튼이 붙는다.
 *
 * 그래서 선택자 대신 형제 순회로 섹션 경계를 명시한다.
 * 체결 대장 헤딩 다음부터 훑되, 다음 헤딩(H1~H6)을 만나면 중단하고, 그 사이에서
 * 처음 발견한 표 하나만 대상으로 삼는다.
 *
 * Material 테마는 표를 실행 시점에 .md-typeset__scrollwrap > .md-typeset__table 로
 * 감싸므로, 형제가 표 자신인 경우와 래퍼인 경우를 모두 처리한다.
 */
function findTradeLogTables() {
  const tables = [];

  // 1) 클래스로 직접 지정한 표 (HTML로 직접 작성한 경우)
  document.querySelectorAll(".kb-trade-log-table").forEach((table) => {
    tables.push(table);
  });

  // 2) #trade-log 헤딩이 여는 섹션 안의 첫 번째 표
  const heading = document.getElementById("trade-log");
  if (heading) {
    for (let el = heading.nextElementSibling; el; el = el.nextElementSibling) {
      if (/^H[1-6]$/.test(el.tagName)) break; // 다음 섹션에 진입하면 중단
      const table = el.tagName === "TABLE" ? el : el.querySelector("table");
      if (table) {
        tables.push(table);
        break;
      }
    }
  }

  return tables;
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

  findTradeLogTables().forEach((table) => {
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
