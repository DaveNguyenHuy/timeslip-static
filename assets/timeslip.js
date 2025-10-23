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

  const CERT_ICON_SVG = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.99902 4.99707C13.6809 4.99707 16.666 7.98216 16.666 11.6641C16.6658 15.3458 13.6808 18.3301 9.99902 18.3301C6.31723 18.3301 3.33221 15.3458 3.33203 11.6641C3.33203 7.98216 6.31713 4.99707 9.99902 4.99707ZM9.99902 9.16406C9.76232 9.16406 9.60375 9.44761 9.28711 10.0156L9.20508 10.1631C9.11522 10.3243 9.0701 10.4048 9 10.458C8.92987 10.5112 8.8426 10.5308 8.66797 10.5703L8.50879 10.6064C7.8939 10.7456 7.58682 10.8156 7.51367 11.0508C7.44054 11.286 7.65013 11.5313 8.06934 12.0215L8.17773 12.1484C8.29667 12.2875 8.35604 12.3573 8.38281 12.4434C8.40956 12.5295 8.40081 12.6228 8.38281 12.8086L8.36621 12.9775C8.30285 13.6314 8.2715 13.9581 8.46289 14.1035C8.65436 14.2489 8.94204 14.1166 9.51758 13.8516L9.66699 13.7832C9.8306 13.7079 9.91231 13.6699 9.99902 13.6699C10.0857 13.6699 10.1674 13.7079 10.3311 13.7832L10.4805 13.8516C11.056 14.1166 11.3437 14.2489 11.5352 14.1035C11.7266 13.9581 11.6952 13.6314 11.6318 12.9775L11.6152 12.8086C11.5972 12.6228 11.5885 12.5295 11.6152 12.4434C11.642 12.3573 11.7014 12.2875 11.8203 12.1484L11.9287 12.0215C12.3479 11.5313 12.5575 11.286 12.4844 11.0508C12.4112 10.8156 12.1041 10.7456 11.4893 10.6064L11.3301 10.5703C11.1554 10.5308 11.0682 10.5112 10.998 10.458C10.9279 10.4048 10.8828 10.3243 10.793 10.1631L10.7109 10.0156C10.3943 9.44761 10.2357 9.16406 9.99902 9.16406ZM10.832 1.66406C12.4034 1.66406 13.1896 1.66419 13.6777 2.15234C14.1586 2.6336 14.1659 3.40383 14.166 4.93066C12.9558 4.18009 11.5278 3.74707 9.99902 3.74707C8.47021 3.74707 7.04228 4.18009 5.83203 4.93066C5.83213 3.40383 5.8394 2.6336 6.32031 2.15234C6.80847 1.66419 7.59467 1.66406 9.16602 1.66406H10.832Z" fill="#dc6803"/></svg>`;
  const PARTNER_ICON_SVG = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.14062 7.65625C5.75598 7.65625 7.07031 8.97059 7.07031 10.5859C7.07031 11.5552 7.85883 12.3438 8.82812 12.3438H9.41406V14.6875H8.82812C6.56676 14.6875 4.72656 12.8473 4.72656 10.5859H3.55469C3.55469 12.4065 4.49046 14.0019 5.89844 14.9482V17.0312H0L0.929688 10.1719C1.13452 8.73801 2.38096 7.65637 3.8291 7.65625H4.14062ZM16.1709 7.65625C17.619 7.65637 18.8655 8.73801 19.0703 10.1719L20 17.0312H14.1016V14.9668C15.5132 14.0196 16.4452 12.4104 16.4453 10.5859H15.2734C15.2732 12.8475 13.4331 14.6875 11.1719 14.6875H10.5859V12.3438H11.1719C12.1412 12.3438 12.9297 11.5552 12.9297 10.5859C12.9297 8.97059 14.244 7.65625 15.8594 7.65625H16.1709ZM4.72656 2.96875C6.02098 2.96875 7.07031 4.01808 7.07031 5.3125C7.07031 6.60692 6.02098 7.65625 4.72656 7.65625C3.43215 7.65625 2.38281 6.60692 2.38281 5.3125C2.38281 4.01808 3.43215 2.96875 4.72656 2.96875ZM15.2734 2.96875C16.5679 2.96875 17.6172 4.01808 17.6172 5.3125C17.6172 6.60692 16.5679 7.65625 15.2734 7.65625C13.979 7.65625 12.9297 6.60692 12.9297 5.3125C12.9297 4.01808 13.979 2.96875 15.2734 2.96875Z" fill="currentColor"/></svg>`;

  function createUserListItem(user, isPartner) {
    const li = document.createElement("li");
    const text = user.userCode ? `${user.userCode} ${user.name}` : user.name;
    li.appendChild(document.createTextNode(text));
    if (user && user.cert === true) {
      const span = document.createElement("span");
      span.style.marginLeft = "6px";
      span.style.display = "inline-flex";
      span.style.verticalAlign = "middle";
      span.innerHTML = CERT_ICON_SVG;
      li.appendChild(span);
    }
    if (isPartner) {
      const span = document.createElement("span");
      span.style.marginLeft = "6px";
      span.style.display = "inline-flex";
      span.style.verticalAlign = "middle";
      span.style.color = "#424242";
      span.innerHTML = PARTNER_ICON_SVG;
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
        const moonIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21C16.9706 21 21 16.9706 21 12C21 11.5836 20.3759 11.5148 20.1605 11.8712C19.1361 13.5666 17.2754 14.7 15.15 14.7C11.9191 14.7 9.3 12.0809 9.3 8.85C9.3 6.72461 10.4334 4.86395 12.1288 3.83948C12.4852 3.62412 12.4164 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" fill="#424242"/></svg>`;
        const sunIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.5814 12C17.5814 15.0825 15.0825 17.5814 12 17.5814C8.91749 17.5814 6.4186 15.0825 6.4186 12C6.4186 8.91749 8.91749 6.4186 12 6.4186C15.0825 6.4186 17.5814 8.91749 17.5814 12Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 0C12.4624 0 12.8372 0.374835 12.8372 0.837209V3.06977C12.8372 3.53214 12.4624 3.90698 12 3.90698C11.5376 3.90698 11.1628 3.53214 11.1628 3.06977V0.837209C11.1628 0.374835 11.5376 0 12 0ZM2.69989 2.75284C3.01189 2.4116 3.54145 2.38789 3.8827 2.69989L6.36308 4.96771C6.70433 5.27971 6.72804 5.80926 6.41604 6.15051C6.10404 6.49175 5.57447 6.51546 5.23323 6.20346L2.75284 3.93565C2.4116 3.62365 2.38789 3.09409 2.69989 2.75284ZM21.3002 2.75284C21.6122 3.09409 21.5884 3.62365 21.2471 3.93565L18.7668 6.20346C18.4255 6.51546 17.896 6.49175 17.584 6.15051C17.272 5.80926 17.2956 5.27971 17.6369 4.96771L20.1174 2.69989C20.4586 2.38789 20.9881 2.4116 21.3002 2.75284ZM0 12C0 11.5376 0.374835 11.1628 0.837209 11.1628H3.06977C3.53214 11.1628 3.90698 11.5376 3.90698 12C3.90698 12.4624 3.53214 12.8372 3.06977 12.8372H0.837209C0.374835 12.8372 0 12.4624 0 12ZM20.093 12C20.093 11.5376 20.4679 11.1628 20.9302 11.1628H23.1628C23.6252 11.1628 24 11.5376 24 12C24 12.4624 23.6252 12.8372 23.1628 12.8372H20.9302C20.4679 12.8372 20.093 12.4624 20.093 12ZM17.6099 17.6095C17.9368 17.2826 18.4669 17.2826 18.7939 17.6095L21.2743 20.0902C21.6012 20.4172 21.6011 20.9473 21.2742 21.2743C20.9472 21.6012 20.4171 21.6011 20.0902 21.2742L17.6099 18.7935C17.2829 18.4665 17.2829 17.9365 17.6099 17.6095ZM6.39033 17.6096C6.71728 17.9366 6.71728 18.4667 6.39033 18.7937L3.9097 21.2743C3.58275 21.6012 3.05267 21.6012 2.72571 21.2743C2.39876 20.9473 2.39876 20.4172 2.72571 20.0903L5.20634 17.6096C5.53328 17.2827 6.06337 17.2827 6.39033 17.6096ZM12 20.093C12.4624 20.093 12.8372 20.4679 12.8372 20.9302V23.1628C12.8372 23.6252 12.4624 24 12 24C11.5376 24 11.1628 23.6252 11.1628 23.1628V20.9302C11.1628 20.4679 11.5376 20.093 12 20.093Z" fill="currentColor"/></svg>`;
        const icon = data.timeType === "NIGHT" ? moonIcon : sunIcon;
        workingTimeEl.innerHTML = `${formatHHmm(data.startTime)} ~ ${formatHHmm(data.endTime)}<div style="margin-top:8px;display:flex;justify-content:center">${icon}</div><div style=\"margin-top:8px\">(休${data.breakTime}分)</div>`;
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

    const context = {
      title: "警備服務報告書", // no page fraction
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

    console.log('DEBUG - context.userCount:', context.userCount);
    console.log('DEBUG - full context object:', context);

    return context;
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


