const WORKER_BASE_URL = "https://lielupes-loki-web-map.damp-sky-01e1.workers.dev";

const mapEl = document.getElementById("llMap");
const mapLayersEl = document.getElementById("llMapLayers");
const tooltipEl = document.getElementById("llTooltip");
const propertyListEl = document.getElementById("llPropertyList");
const countEl = document.getElementById("llCount");

const modalBackdrop = document.getElementById("llModalBackdrop");
const modalCloseBtn = document.getElementById("llModalClose");
const reservationForm = document.getElementById("llReservationForm");
const plotSelect = document.getElementById("plotSelect");
const successEl = document.getElementById("llSuccess");
const errorEl = document.getElementById("llError");
const submitBtn = document.getElementById("submitBtn");

const properties = [
  {
    id: 3,
    number: 3,
    name: "Auzu iela 40",
    address: "3",
    size: "1500 m²",
    price: "€55 500",
    status: "Pieejams",
    points: [
      { x: 32.3828, y: 64.6528 },
      { x: 19.8828, y: 85.0000 },
      { x: 10.7031, y: 83.0556 },
      { x: 10.1953, y: 80.9722 },
      { x: 22.6953, y: 64.1667 }
    ]
  },
  {
    id: 4,
    number: 4,
    name: "Auzu iela 42",
    address: "4",
    size: "1500 m²",
    price: "€55 500",
    status: "Pieejams",
    points: [
      { x: 33.4375, y: 65.2083 },
      { x: 42.8516, y: 65.8333 },
      { x: 33.4375, y: 85.4861 },
      { x: 21.5234, y: 84.5833 }
    ]
  },
  {
    id: 5,
    number: 5,
    name: "Auzu iela 44",
    address: "5",
    size: "1500 m²",
    price: "€55 500",
    status: "Pieejams",
    points: [
      { x: 56.2500, y: 66.7361 },
      { x: 52.1875, y: 85.9028 },
      { x: 34.8438, y: 85.4167 },
      { x: 43.9453, y: 66.1111 }
    ]
  },
  {
    id: 7,
    number: 7,
    name: "Auzu iela 48",
    address: "7",
    size: "1800 m²",
    price: "€66 600",
    status: "Pieejams",
    points: [
      { x: 79.8828, y: 81.8056 },
      { x: 57.3047, y: 85.4861 },
      { x: 60.1172, y: 66.3889 },
      { x: 74.6484, y: 67.0833 },
      { x: 79.8828, y: 81.8056 }
    ]
  },
  {
    id: 6,
    number: 6,
    name: "Auzu iela 46",
    address: "6",
    size: "2200 m²",
    price: "€80 000",
    status: "Pieejams",
    points: [
      { x: 51.3672, y: 50.9722 },
      { x: 67.8125, y: 64.3056 },
      { x: 45.6250, y: 62.4306 }
    ]
  },
  {
    id: 2,
    number: 2,
    name: "Auzu iela 38",
    address: "2",
    size: "2531 m²",
    price: "€80 000",
    status: "Pieejams",
    points: [
      { x: 44.6094, y: 62.5694 },
      { x: 24.7266, y: 61.4583 },
      { x: 32.2266, y: 51.8056 },
      { x: 50.1953, y: 51.2500 }
    ]
  },
  {
    id: 1,
    number: 1,
    name: "Auzu iela 36",
    address: "1",
    size: "2200 m²",
    price: "€80 000",
    status: "Pieejams",
    points: [
      { x: 37.6953, y: 40.2778 },
      { x: 50.0000, y: 49.8611 },
      { x: 32.1484, y: 50.4167 },
      { x: 24.6484, y: 59.9306 },
      { x: 23.7891, y: 58.8194 },
      { x: 37.6953, y: 40.2778 }
    ]
  }
];

let activeId = null;

function isMobileMapMode() {
  return window.matchMedia("(max-width: 767px)").matches || window.matchMedia("(hover: none)").matches;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getCenter(points) {
  const total = points.reduce(
    (acc, point) => {
      acc.x += point.x;
      acc.y += point.y;
      return acc;
    },
    { x: 0, y: 0 }
  );

  return {
    x: total.x / points.length,
    y: total.y / points.length
  };
}

function getStatusClass(status) {
  if (status === "Rezervēts") return "reserved";
  if (status === "Pārdots") return "sold";
  return "available";
}

function getPropertyById(id) {
  return properties.find((item) => Number(item.id) === Number(id));
}

function getAvailableProperties() {
  return properties.filter((item) => item.status === "Pieejams");
}

function populateSelect(selectedId) {
  plotSelect.innerHTML = "";

  getAvailableProperties().forEach((property) => {
    const option = document.createElement("option");
    option.value = String(property.id);
    option.textContent = `${property.number}. ${property.name} — ${property.address}`;
    if (Number(selectedId) === Number(property.id)) {
      option.selected = true;
    }
    plotSelect.appendChild(option);
  });
}

function buildTooltipContent(property) {
  const isReserved = property.status === "Rezervēts";
  const isSold = property.status === "Pārdots";

  const buttonHtml =
    isReserved || isSold
      ? ""
      : `<button type="button" class="ll-tooltip-btn" data-reserve-id="${property.id}">Rezervēt</button>`;

  return `
    <div class="ll-tooltip-title">${escapeHtml(property.name)}</div>
    <div class="ll-tooltip-address">${escapeHtml(property.address)}</div>
    <div class="ll-tooltip-meta">
      <div>
        <span class="ll-tooltip-meta-label">Platība</span>
        <span class="ll-tooltip-meta-value">${escapeHtml(property.size)}</span>
      </div>
      <div>
        <span class="ll-tooltip-meta-label">Cena</span>
        <span class="ll-tooltip-meta-value">${escapeHtml(property.price)}</span>
      </div>
    </div>
    ${buttonHtml}
  `;
}

function positionTooltip(centerX, centerY) {
  const mapRect = mapEl.getBoundingClientRect();
  const leftPx = (centerX / 100) * mapRect.width;
  const topPx = (centerY / 100) * mapRect.height;

  tooltipEl.style.left = `${leftPx}px`;
  tooltipEl.style.top = `${topPx}px`;
  tooltipEl.style.transform = "translate(-50%, calc(-100% - 20px))";

  requestAnimationFrame(() => {
    const tipRect = tooltipEl.getBoundingClientRect();
    const margin = 10;

    let nextLeft = leftPx;
    let nextTop = topPx;
    let nextTransform = "translate(-50%, calc(-100% - 20px))";

    if (tipRect.left < mapRect.left + margin) {
      nextLeft += (mapRect.left + margin) - tipRect.left;
    }

    if (tipRect.right > mapRect.right - margin) {
      nextLeft -= tipRect.right - (mapRect.right - margin);
    }

    if (tipRect.top < mapRect.top + margin) {
      nextTop = topPx;
      nextTransform = "translate(-50%, 20px)";
    }

    tooltipEl.style.left = `${nextLeft}px`;
    tooltipEl.style.top = `${nextTop}px`;
    tooltipEl.style.transform = nextTransform;
  });
}

function showTooltip(property) {
  if (isMobileMapMode()) {
    hideTooltip();
    return;
  }

  const center = getCenter(property.points);
  tooltipEl.innerHTML = buildTooltipContent(property);
  tooltipEl.classList.add("is-visible");
  tooltipEl.setAttribute("aria-hidden", "false");
  positionTooltip(center.x, center.y);
}

function hideTooltip() {
  tooltipEl.classList.remove("is-visible");
  tooltipEl.setAttribute("aria-hidden", "true");
}

function updateActiveUI() {
  document.querySelectorAll("[data-plot-id]").forEach((el) => {
    const id = Number(el.dataset.plotId);
    el.classList.toggle("is-active", id === activeId);
  });
}

function setActive(id, options = {}) {
  const property = getPropertyById(id);
  if (!property) return;

  activeId = Number(id);
  updateActiveUI();
  showTooltip(property);

  if (options.scrollCard !== false) {
    const card = document.querySelector(`.ll-property-card[data-plot-id="${property.id}"]`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
}

function clearActive() {
  activeId = null;
  updateActiveUI();
  hideTooltip();
}

function renderMap() {
  mapLayersEl.innerHTML = "";

  properties.forEach((property) => {
    const polygonString = property.points.map((point) => `${point.x}% ${point.y}%`).join(", ");
    const center = getCenter(property.points);

    const overlay = document.createElement("button");
    overlay.type = "button";
    overlay.className = "ll-plot";
    overlay.dataset.plotId = String(property.id);
    overlay.style.clipPath = `polygon(${polygonString})`;

    if (property.status === "Rezervēts") overlay.classList.add("is-reserved");
    if (property.status === "Pārdots") overlay.classList.add("is-sold");

   overlay.addEventListener("mouseenter", () => {
  if (!isMobileMapMode()) {
    setActive(property.id, { scrollCard: false });
  }
});

overlay.addEventListener("click", (event) => {
  event.stopPropagation();

  if (isMobileMapMode()) {
    openModal(property.id);
    return;
  }

  setActive(property.id, { scrollCard: true });
});

    const numberBubble = document.createElement("div");
    numberBubble.className = "ll-plot-number";
    numberBubble.dataset.plotId = String(property.id);
    numberBubble.textContent = String(property.number);
    numberBubble.style.left = `${center.x}%`;
    numberBubble.style.top = `${center.y}%`;

    if (property.status === "Rezervēts") numberBubble.classList.add("is-reserved");
    if (property.status === "Pārdots") numberBubble.classList.add("is-sold");

    mapLayersEl.appendChild(overlay);
    mapLayersEl.appendChild(numberBubble);
  });
}

function renderList() {
  propertyListEl.innerHTML = "";

  properties.forEach((property) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "ll-property-card";
    card.dataset.plotId = String(property.id);

    if (property.status === "Rezervēts") card.classList.add("is-reserved");
    if (property.status === "Pārdots") card.classList.add("is-sold");

    const statusClass = getStatusClass(property.status);

    card.innerHTML = `
      <div class="ll-property-line">
        <div class="ll-property-badge">${escapeHtml(property.number)}</div>
        <div class="ll-property-mainline">
          <span class="ll-property-name">${escapeHtml(property.name)}</span>
          <span class="ll-divider">·</span>
          <span class="ll-property-subtle">${escapeHtml(property.address)}</span>
          <span class="ll-divider">·</span>
          <span class="ll-property-subtle">${escapeHtml(property.size)}</span>
          <span class="ll-divider">·</span>
          <span class="ll-property-price">${escapeHtml(property.price)}</span>
        </div>
        <span class="ll-status-inline ${statusClass}">${escapeHtml(property.status)}</span>
      </div>
    `;

   card.addEventListener("click", () => {
  if (isMobileMapMode()) {
    openModal(property.id);
    return;
  }

  setActive(property.id, { scrollCard: false });
});

    propertyListEl.appendChild(card);
  });

  const availableCount = getAvailableProperties().length;
  countEl.textContent = `${availableCount} pieejami no ${properties.length}`;
}

function openModal(preselectedId) {
  successEl.classList.remove("is-visible");
  errorEl.classList.remove("is-visible");
  successEl.textContent = "";
  errorEl.textContent = "";

  reservationForm.reset();
  populateSelect(preselectedId);

  modalBackdrop.classList.add("is-open");
  modalBackdrop.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modalBackdrop.classList.remove("is-open");
  modalBackdrop.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

async function fetchStatusesFromWorker() {
  const response = await fetch(`${WORKER_BASE_URL}/api/plots`, {
    method: "GET"
  });

  if (!response.ok) {
    throw new Error("Neizdevās iegūt zemesgabalu statusus no servera.");
  }

  return response.json();
}

async function syncStatuses() {
  try {
    const data = await fetchStatusesFromWorker();
    const statusMap = data.statuses || {};

    properties.forEach((property) => {
      const workerStatus = statusMap[String(property.id)];
      if (workerStatus === "Rezervēts" || workerStatus === "Pārdots") {
        property.status = workerStatus;
      } else {
        property.status = "Pieejams";
      }
    });
  } catch (error) {
    console.error(error);
  }
}

async function reservePlot(payload) {
  const response = await fetch(`${WORKER_BASE_URL}/api/reserve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "Rezervācija neizdevās.");
  }

  return result;
}

tooltipEl.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-reserve-id]");
  if (!btn) return;

  const id = Number(btn.dataset.reserveId);
  openModal(id);
});

mapEl.addEventListener("click", (event) => {
  if (event.target === mapEl || event.target === mapLayersEl) {
    clearActive();
  }
});

modalCloseBtn.addEventListener("click", closeModal);

modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

reservationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  successEl.classList.remove("is-visible");
  errorEl.classList.remove("is-visible");
  successEl.textContent = "";
  errorEl.textContent = "";

  const plotId = Number(plotSelect.value);
  const property = getPropertyById(plotId);

  if (!property) {
    errorEl.textContent = "Lūdzu, izvēlieties zemesgabalu.";
    errorEl.classList.add("is-visible");
    return;
  }

  const payload = {
    plot_id: property.id,
    plot_number: property.number,
    plot_name: property.name,
    plot_address: property.address,
    plot_price: property.price,
    plot_size: property.size,
    first_name: document.getElementById("firstName").value.trim(),
    last_name: document.getElementById("lastName").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    message: document.getElementById("message").value.trim()
  };

  if (!payload.first_name || !payload.last_name || !payload.phone || !payload.email) {
    errorEl.textContent = "Lūdzu, aizpildiet visus obligātos laukus.";
    errorEl.classList.add("is-visible");
    return;
  }

  submitBtn.disabled = true;
  const oldText = submitBtn.textContent;
  submitBtn.textContent = "Nosūta...";

  try {
    await reservePlot(payload);
    await syncStatuses();

    renderMap();
    renderList();
    populateSelect();

    successEl.textContent = "Paldies! Zemesgabals ir rezervēts uz 72 stundām, un mēs ar Jums sazināsimies tuvākajā laikā.";
    successEl.classList.add("is-visible");

    reservationForm.reset();

    setTimeout(() => {
      closeModal();
      clearActive();
    }, 1400);
  } catch (error) {
    errorEl.textContent = error.message || "Radās kļūda, nosūtot pieteikumu.";
    errorEl.classList.add("is-visible");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = oldText;
  }
});

async function init() {
  await syncStatuses();
  renderMap();
  renderList();

  if (properties.length > 0) {
    setActive(properties[0].id, { scrollCard: false });
  }
}

init();
