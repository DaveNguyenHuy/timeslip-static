/* Timeslip page script - shared by prime/partner and standalone pages */
(function () {
  let currentId = null;

  function formatHHmm(time) {
    if (time == null) return "";
    const parts = String(time).split(":");
    const hh = (parts[0] || "00").padStart(2, "0");
    const mm = (parts[1] || "00").padStart(2, "0");
    return `${hh}:${mm}`;
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

    try {
      const res = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`);
      const json = await res.json();
      const data = json.data;
      if (!data || json.code !== "OK") throw new Error("Invalid data");

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
          const li = document.createElement("li");
          li.innerText = user.userCode ? `${user.userCode} ${user.name}` : user.name;
          ul.appendChild(li);
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

  async function exportPDF() {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) return;
    const doc = new jsPDF();
    const element = document.body;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    const filename = currentId ? `${currentId}.pdf` : "keibi-report.pdf";
    doc.save(filename);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const btn = document.querySelector(".button");
    if (btn) btn.addEventListener("click", exportPDF);
    renderTimeslip();
  });
})();


