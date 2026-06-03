const byId = (id) => document.getElementById(id);
const fmt = new Intl.NumberFormat("ko-KR");

function actionClass(action) {
  if (action === "GATE_CHECK") return "gate";
  if (action === "SELL_REVIEW") return "sell";
  if (action === "NEWS_WATCH") return "watch";
  return "wait";
}

function renderCandidates(rows) {
  if (!rows.length) {
    byId("candidates").innerHTML = "<p>현재 후보가 없습니다.</p>";
    return;
  }
  byId("candidates").innerHTML = `
    <table>
      <thead>
        <tr><th>종목</th><th>분류</th><th>BUY</th><th>SELL</th><th>뉴스</th><th>최근가</th></tr>
      </thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            <td><strong>${row.ticker}</strong><br>${row.label || ""}</td>
            <td><span class="badge ${actionClass(row.action)}">${row.action}</span></td>
            <td>${row.signals?.buy ?? 0}</td>
            <td>${row.signals?.sell ?? 0}</td>
            <td>${row.news_count ?? 0}</td>
            <td>${row.close ? fmt.format(Math.round(row.close)) + "원" : "-"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderNews(articles) {
  byId("news").innerHTML = articles.slice(0, 10).map((article) => `
    <li>
      <a href="${article.url}" target="_blank" rel="noreferrer">${article.title}</a>
      <span>${article.category || "news"} · ${article.source || ""}</span>
    </li>
  `).join("") || "<li>표시할 뉴스가 없습니다.</li>";
}

async function load() {
  const res = await fetch("data/market_monitor_latest.json", { cache: "no-store" });
  if (!res.ok) throw new Error("latest report not found");
  const payload = await res.json();
  const briefing = payload.briefing || {};
  const rows = briefing.candidates || [];
  const articles = briefing.news?.articles || [];
  const gateCount = rows.filter((row) => row.action === "GATE_CHECK").length;
  const sellCount = rows.filter((row) => row.action === "SELL_REVIEW").length;

  byId("generated").textContent = briefing.generated_at || "-";
  byId("gateCount").textContent = gateCount;
  byId("sellCount").textContent = sellCount;
  byId("newsCount").textContent = articles.length;
  byId("liveOrders").textContent = "주문 OFF";
  byId("message").textContent = payload.message || "";
  renderCandidates(rows);
  renderNews(articles);
}

load().catch((error) => {
  byId("generated").textContent = "오류";
  byId("candidates").innerHTML = `<p>${error.message}</p>`;
  byId("message").textContent = "아직 첫 Pages 배포 리포트가 없거나 GitHub Actions 실행이 필요합니다.";
});
