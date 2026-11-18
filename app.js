/**
 * SLD Events intake form and quote estimate.
 *
 * SAMPLE RATES: eventsbystacey.com does not list package prices. The services
 * page says "Prices below are placeholders. Replace each [price] before
 * publishing numbers." The figures in RATES are reasonable Mid-Atlantic
 * sample planning-fee ranges for discussion only. They are not published
 * SLD Events rates and must not be described as Stacey's fees. When she
 * has official prices, edit this object only. Amounts are USD.
 *
 * Planning fees cover Stacey's planning and coordination time. They do not
 * include venue, catering, florals, rentals, entertainment, or other vendors.
 */
const RATES = {
  contactEmail: "Stacey@eventsbystacey.com",

  // Base planning packages: [low, high]. Guest count up to 100 is included.
  packages: {
    mitzvah: {
      "day-of": [1800, 2800],
      partial: [3500, 5500],
      full: [6500, 11000],
    },
    wedding: {
      "day-of": [2000, 3200],
      partial: [4000, 7000],
      full: [8000, 14000],
    },
    corporate: {
      "day-of": [1500, 2500],
      partial: [3000, 5000],
      full: [5500, 9500],
    },
    other: {
      "day-of": [1800, 2800],
      partial: [3500, 5500],
      full: [6500, 11000],
    },
  },

  // Extra planning time for larger rooms, as a percent of the package.
  guestAdjust: [
    { max: 100, low: 0, high: 0 },
    { max: 200, low: 0.15, high: 0.2 },
    { max: 350, low: 0.3, high: 0.4 },
    { max: Infinity, low: 0.5, high: 0.65 },
  ],

  // Optional coordination and design-direction fees (not vendor invoices).
  addons: {
    decor: { label: "Theme and décor direction", low: 400, high: 800 },
    florals: { label: "Florals coordination", low: 300, high: 600 },
    rentals: { label: "Rentals coordination", low: 250, high: 500 },
    catering: { label: "Catering coordination", low: 300, high: 700 },
    paper: { label: "Invitations and paper direction", low: 250, high: 500 },
    lighting: { label: "Lighting and layout direction", low: 300, high: 600 },
    "teen-program": { label: "Kids and teen program coordination", low: 350, high: 700 },
    av: { label: "Audiovisual and registration coordination", low: 350, high: 700 },
  },

  // Added when the client needs help finding a venue.
  venueSearch: { label: "Venue search", low: 400, high: 800 },

  // Added when the event date is within this many days.
  rush: { withinDays: 56, label: "Short-timeline planning", low: 0.15, high: 0.25 },
};

const EVENT_LABELS = {
  "bar-mitzvah": "Bar Mitzvah",
  "bat-mitzvah": "Bat Mitzvah",
  "bnai-mitzvah": "B'nai Mitzvah",
  wedding: "Wedding",
  corporate: "Corporate event",
  other: "Other",
};

const PLAN_LABELS = {
  "day-of": "Day-of coordination",
  partial: "Partial planning",
  full: "Full planning",
};

const form = document.getElementById("form");
const estimateTotal = document.getElementById("estimateTotal");
const estimateLines = document.getElementById("estimateLines");
const estimateNote = document.getElementById("estimateNote");
const formError = document.getElementById("formError");
const mobileBar = document.getElementById("mobileBar");
const mobileTotal = document.getElementById("mobileTotal");

function money(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function rangeText(low, high) {
  return low === high ? money(low) : money(low) + " to " + money(high);
}

function eventFamily(type) {
  if (type === "bar-mitzvah" || type === "bat-mitzvah" || type === "bnai-mitzvah") return "mitzvah";
  if (type === "wedding" || type === "corporate" || type === "other") return type;
  return "";
}

function readForm() {
  const data = new FormData(form);
  const addons = data.getAll("addons");
  return {
    firstName: (data.get("firstName") || "").trim(),
    lastName: (data.get("lastName") || "").trim(),
    email: (data.get("email") || "").trim(),
    phone: (data.get("phone") || "").trim(),
    eventType: data.get("eventType") || "",
    eventTypeOther: (data.get("eventTypeOther") || "").trim(),
    eventDate: data.get("eventDate") || "",
    guestCount: data.get("guestCount") ? Number(data.get("guestCount")) : null,
    venueStatus: data.get("venueStatus") || "have",
    venue: (data.get("venue") || "").trim(),
    planningLevel: data.get("planningLevel") || "",
    addons,
    budget: data.get("budget") || "",
    notes: (data.get("notes") || "").trim(),
  };
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const event = new Date(dateStr + "T00:00:00");
  return Math.round((event - today) / 86400000);
}

function buildEstimate(input) {
  const lines = [];
  const family = eventFamily(input.eventType);
  if (!family || !input.planningLevel) {
    return { ready: false, lines, low: 0, high: 0, warnings: [] };
  }

  const pack = RATES.packages[family][input.planningLevel];
  let low = pack[0];
  let high = pack[1];
  lines.push({
    label: PLAN_LABELS[input.planningLevel],
    low,
    high,
    note: EVENT_LABELS[input.eventType] + " planning fee, sample range.",
  });

  if (input.guestCount && input.guestCount > 0) {
    const band = RATES.guestAdjust.find((g) => input.guestCount <= g.max);
    if (band && (band.low || band.high)) {
      const gLow = Math.round(pack[0] * band.low);
      const gHigh = Math.round(pack[1] * band.high);
      low += gLow;
      high += gHigh;
      lines.push({
        label: "Larger guest count (" + input.guestCount + ")",
        low: gLow,
        high: gHigh,
        note: "Sample adjustment for a room over 100 guests.",
      });
    }
  }

  if (input.venueStatus === "need") {
    low += RATES.venueSearch.low;
    high += RATES.venueSearch.high;
    lines.push({
      label: RATES.venueSearch.label,
      low: RATES.venueSearch.low,
      high: RATES.venueSearch.high,
      note: input.planningLevel === "day-of"
        ? "Day-of coordination usually assumes a venue is already booked. This sample fee covers a venue search if you still need one."
        : "",
    });
  }

  for (const key of input.addons) {
    const addon = RATES.addons[key];
    if (!addon) continue;
    low += addon.low;
    high += addon.high;
    lines.push({ label: addon.label, low: addon.low, high: addon.high });
  }

  const days = daysUntil(input.eventDate);
  if (days !== null && days >= 0 && days <= RATES.rush.withinDays) {
    const rLow = Math.round(pack[0] * RATES.rush.low);
    const rHigh = Math.round(pack[1] * RATES.rush.high);
    low += rLow;
    high += rHigh;
    lines.push({
      label: RATES.rush.label,
      low: rLow,
      high: rHigh,
      note: "Sample addition when the date is within eight weeks.",
    });
  }

  const warnings = [];
  if (days !== null && days < 0) {
    warnings.push("The date looks like it has already passed. Please check it before you send.");
  }
  return { ready: true, lines, low, high, warnings, days };
}

function renderEstimate() {
  const input = readForm();
  const estimate = buildEstimate(input);
  estimateLines.innerHTML = "";

  const otherLabel = form.querySelector(".other-label");
  otherLabel.hidden = input.eventType !== "other";

  form.querySelectorAll(".check[data-for]").forEach((el) => {
    const show =
      (el.dataset.for === "mitzvah" && eventFamily(input.eventType) === "mitzvah") ||
      (el.dataset.for === "corporate" && input.eventType === "corporate") ||
      !input.eventType;
    el.hidden = !show;
    if (!show) el.querySelector("input").checked = false;
  });

  if (!estimate.ready) {
    estimateTotal.textContent = "Choose a planning level";
    mobileTotal.textContent = "pending";
    mobileBar.hidden = true;
    return estimate;
  }

  estimateTotal.textContent = rangeText(estimate.low, estimate.high);
  mobileTotal.textContent = rangeText(estimate.low, estimate.high);
  mobileBar.hidden = false;

  for (const line of estimate.lines) {
    const li = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = line.label;
    const amt = document.createElement("span");
    amt.className = "amt";
    amt.textContent = rangeText(line.low, line.high);
    li.append(name, amt);
    if (line.note) {
      const sub = document.createElement("span");
      sub.className = "sub";
      sub.textContent = line.note;
      li.append(sub);
    }
    estimateLines.append(li);
  }

  const total = document.createElement("li");
  const tName = document.createElement("span");
  tName.textContent = "Estimated planning fee";
  const tAmt = document.createElement("span");
  tAmt.className = "amt";
  tAmt.textContent = rangeText(estimate.low, estimate.high);
  total.append(tName, tAmt);
  estimateLines.append(total);
  return estimate;
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function eventTypeLabel(input) {
  if (input.eventType === "other" && input.eventTypeOther) {
    return "Other (" + input.eventTypeOther + ")";
  }
  return EVENT_LABELS[input.eventType] || input.eventType || "Not specified";
}

function emailBody(input, estimate) {
  const lines = [
    "Hello Stacey,",
    "",
    "I used the SLD Events planning estimate form and would like to talk about this event.",
    "",
    "Name: " + input.firstName + " " + input.lastName,
    "Email: " + input.email,
    "Phone: " + (input.phone || "Not provided"),
    "Event type: " + eventTypeLabel(input),
    "Event date: " + (input.eventDate || "Not set yet"),
    "Guest count: " + (input.guestCount || "Not set yet"),
    "Venue: " + (input.venueStatus === "need" ? "Needs help finding a venue" : "Has a venue or location") + (input.venue ? " (" + input.venue + ")" : ""),
    "Planning level: " + (PLAN_LABELS[input.planningLevel] || "Not chosen"),
    "Add-ons: " + (input.addons.length ? input.addons.map((k) => (RATES.addons[k] || {}).label || k).join(", ") : "None selected"),
    "Overall event budget range: " + (input.budget || "Not sure yet"),
    "",
  ];

  if (estimate.ready) {
    lines.push("Sample estimated planning fee: " + rangeText(estimate.low, estimate.high));
    lines.push("Itemized sample range:");
    for (const line of estimate.lines) {
      lines.push("- " + line.label + ": " + rangeText(line.low, line.high));
    }
    lines.push("");
    lines.push("Please note: this is a sample estimate only. Package prices are not listed on eventsbystacey.com yet, and these numbers are not published SLD Events rates. Final pricing is confirmed by you.");
    lines.push("");
  }

  if (input.notes) {
    lines.push("Notes:");
    lines.push(input.notes);
    lines.push("");
  }

  lines.push("Thank you.");
  return lines.join("\n");
}

function showError(msg) {
  formError.hidden = !msg;
  formError.textContent = msg || "";
}

form.addEventListener("input", renderEstimate);
form.addEventListener("change", renderEstimate);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = readForm();
  if (!input.firstName || !input.lastName) {
    showError("Please add your first and last name.");
    return;
  }
  if (!validEmail(input.email)) {
    showError("Please add a valid email address.");
    return;
  }
  if (!input.eventType) {
    showError("Please choose an event type.");
    return;
  }
  if (!input.planningLevel) {
    showError("Please choose a planning level so Stacey can see the estimate you reviewed.");
    return;
  }
  showError("");
  const estimate = buildEstimate(input);
  const subject = "Event inquiry: " + eventTypeLabel(input) + (input.eventDate ? " on " + input.eventDate : "");
  const href =
    "mailto:" + encodeURIComponent(RATES.contactEmail) +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(emailBody(input, estimate));
  window.location.href = href;
});

document.getElementById("printBtn").addEventListener("click", () => {
  renderEstimate();
  window.print();
});

renderEstimate();
