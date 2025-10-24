/* Timeslip page script - shared by prime/partner and standalone pages */
(function () {
  let currentId = null;
  let currentData = null; // cache for PDF generation
  const templateCache = {}; // Handlebars template cache

  function formatHHmm(time) {
    if (time == null) return "";
    const parts = String(time).split(":");
    const hh = (parts[0] || "00").padStart(2, "0");
    const mm = (parts[1] || "00").padStart(2, "0");
    return `${hh}:${mm}`;
  }

  function createUserListItem(user, isPartner) {
    const li = document.createElement("li");
    const text = user.userCode ? `${user.userCode} ${user.name}` : user.name;
    li.appendChild(document.createTextNode(text));
    if (user && user.cert === true) {
      const span = document.createElement("span");
      span.style.marginLeft = "6px";
      span.style.display = "inline-flex";
      span.style.verticalAlign = "middle";
      span.innerHTML = window.ICONS.cert;
      li.appendChild(span);
    }
    if (isPartner) {
      const span = document.createElement("span");
      span.style.marginLeft = "6px";
      span.style.display = "inline-flex";
      span.style.verticalAlign = "middle";
      span.style.color = "#424242";
      span.innerHTML = window.ICONS.partner;
      li.appendChild(span);
    }
    return li;
  }

  async function renderTimeslip() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    currentId = id;
    if (!id) {
      alert("❌ URLが正しくありません");
      return;
    }

    const defaultEndpoint = "https://security.ecopunch.vn/api/v1/public/timeslips";
    const endpoint = document.body?.dataset?.endpoint || defaultEndpoint;

    const isPartner = !!window.location.pathname.includes("partner_timeslip");
    let fetchUrl = `${endpoint}?id=${encodeURIComponent(id)}`;
    if (isPartner) {
      fetchUrl = `${endpoint}/partner?id=${encodeURIComponent(id)}`;
    }

    try {
      const res = await fetch(fetchUrl);
      const json = await res.json();
      const data = json.data;
      if (!data || json.code !== "OK") throw new Error("Invalid data");
      currentData = data;

      const date = new Date(data.workDate);
      const fullDate = `${date.getFullYear()}年${date.getMonth() + 1}月<br />${date.getDate()}日`;
      const fullDateEl = document.getElementById("fullDate");
      if (fullDateEl) fullDateEl.innerHTML = fullDate;

      const companyName = data.fixPartner?.name || data.prime?.name || "";
      const primeOrgName = data.fixPartnerOrganization?.name || data.primeOrganization?.name || "";
      const constructionName = data.fixPartnerConstruction?.name || data.construction?.name || "";

      const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
      };

      setText("companyName", companyName);
      setText("primeOrganization", primeOrgName);
      setText("constructionSite", constructionName);

      const workingTimeEl = document.getElementById("workingTime");
      if (workingTimeEl) {
        const icon = data.timeType === "NIGHT" ? window.ICONS.moon : window.ICONS.sun;
        const cancelIcon = data.isCancel ? `<div style="position: absolute; top: 8px; right: 8px; width: 20px; height: 20px;">${window.ICONS.cancel}</div>` : '';
        workingTimeEl.innerHTML = `${cancelIcon}${formatHHmm(data.startTime)} ~ ${formatHHmm(data.endTime)}<div style="margin-top:8px;display:flex;justify-content:center">${icon}</div><div style=\"margin-top:8px\">(休${data.breakTime}分)</div>`;
      }

      const creatorNote = document.getElementById("creatorNote");
      if (creatorNote) creatorNote.innerText = data.createdNote || "";
      const signerNote = document.getElementById("signerNote");
      if (signerNote) signerNote.innerText = data.signerNote || "";

      const countEl = document.getElementById("workerCount");
      if (countEl) countEl.innerText = (data.users || []).length;

      const ul = document.getElementById("workerList");
      if (ul) {
        ul.innerHTML = "";
        (data.users || []).forEach((user) => {
          ul.appendChild(createUserListItem(user, false));
        });
        (data.partnerUsers || []).forEach((user) => {
          ul.appendChild(createUserListItem(user, true));
        });
      }

      if (data.sign) {
        const signImg = document.getElementById("signatureImage");
        if (signImg) signImg.src = `data:image/png;base64,${data.sign}`;
      }
    } catch (err) {
      console.error(err);
      alert("❌ データ取得エラー");
    }
  }

  function buildPdfContext(data) {
    const date = new Date(data.workDate);
    const companyName = data.fixPartner?.name || data.prime?.name || "";
    const primeOrgName = data.fixPartnerOrganization?.name || data.primeOrganization?.name || "";
    const constructionName = data.fixPartnerConstruction?.name || data.construction?.name || "";
    const users = [...(data.users || []), ...(data.partnerUsers || [])];

    // Create 8x6 user grid (8 rows x 6 columns)
    const userDisplays = users.map((u) => u.userCode ? `${u.userCode} ${u.name}` : u.name);
    const userGrid = [];

    for (let row = 0; row < 8; row++) {
      const rowCells = [];
      for (let col = 0; col < 6; col++) {
        const index = row * 6 + col;
        rowCells.push(userDisplays[index] || '');
      }
      userGrid.push({ cells: rowCells });
    }

    const companyLine = `${companyName}　${primeOrgName}`;

    return {
      title: "警備服務報告書",
      companyName: companyName,
      companyLine: companyLine,
      organizationName: primeOrgName,
      dateDisplay: `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`,
      startTime: formatHHmm(data.startTime),
      endTime: formatHHmm(data.endTime),
      breakTime: data.breakTime,
      isNight: data.timeType === "NIGHT",
      isCancel: data.isCancel === true,
      createdNote: data.createdNote || "",
      signerNote: data.signerNote || "",
      constructionName,
      sign: data.sign ? `data:image/png;base64,${data.sign}` : "",
      userGrid: userGrid,
      userCount: users.length,
    };
  }

  async function loadTemplate(path) {
    if (templateCache[path]) return templateCache[path];
    if (!window.Handlebars) return null;
    try {
      const res = await fetch(path, { cache: "no-store" });
      const tpl = await res.text();
      const compiled = window.Handlebars.compile(tpl);
      templateCache[path] = compiled;
      return compiled;
    } catch (e) {
      console.warn("Failed to load template", e);
      return null;
    }
  }

  async function renderPdfA4(data) {
    const compile = await loadTemplate("/assets/pdf-a4.hbs");
    if (!compile) return null;
    const html = compile(buildPdfContext(data));
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-10000px";
    wrapper.style.top = "0";
    wrapper.style.zIndex = "-1";
    wrapper.innerHTML = html;
    return wrapper;
  }

  async function exportPDF() {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) return;
    if (!currentData) {
      try { await renderTimeslip(); } catch (_) {}
    }
    if (!currentData) return;

    const reportRoot = await renderPdfA4(currentData);
    if (!reportRoot) return;
    document.body.appendChild(reportRoot);
    const a4Element = reportRoot.firstChild; // root of template
    const canvas = await html2canvas(a4Element, { scale: 2, backgroundColor: "#ffffff" });
    document.body.removeChild(reportRoot);

    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;
    doc.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    const filename = currentId ? `${currentId}.pdf` : "keibi-report.pdf";
    doc.save(filename);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const btn = document.querySelector(".button");
    if (btn) btn.addEventListener("click", exportPDF);
    renderTimeslip();
  });
})();


