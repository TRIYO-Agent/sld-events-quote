/**
 * SLD Events intake form and quote estimate.
 *
 * REAL PRICES come from the SLD Events pricing sheet (November 2026):
 *   Day-of Coordination starts at $1,200
 *   Full-Service Planning starts at $4,200
 * Those starting prices are official. Final pricing depends on guest count,
 * venue, and the scope of the celebration, and is confirmed in a written
 * quote after a free consultation.
 *
 * SAMPLE ADJUSTMENTS below (guest count, short timeline, travel outside the
 * service area) are not published on the sheet. They are reasonable estimate
 * ranges so the live quote can show how a starting price might change.
 * They are not official SLD Events fees. When Stacey has official adjustment
 * amounts, edit only the SAMPLE section. Amounts are USD.
 *
 * Planning fees do not include venue, catering, florals, rentals, or other
 * vendor costs. Those are paid by the client directly to each vendor.
 */
const RATES = {
  contactEmail: "Stacey@eventsbystacey.com",

  // REAL starting prices from the SLD Events pricing sheet.
  packages: {
    "day-of": {
      name: "Day-of Coordination",
      starting: 1200,
    },
    full: {
      name: "Full-Service Planning",
      starting: 4200,
    },
  },

  // ----- SAMPLE ADJUSTMENTS (not published on the pricing sheet) -----

  // Added when guest count is above 100, as a percent of the starting price.
  guestAdjust: [
    { max: 100, low: 0, high: 0 },
    { max: 200, low: 0.15, high: 0.2 },
    { max: 350, low: 0.3, high: 0.4 },
    { max: Infinity, low: 0.5, high: 0.65 },
  ],

  // Added when the event date is within this many days.
  rush: { withinDays: 56, label: "Short-timeline planning", low: 0.15, high: 0.25 },

  // Added when the venue is outside the Baltimore and Washington, DC area.
  travel: { label: "Travel outside the service area", low: 400, high: 800 },
};

const OCCASION_LABELS = {
  wedding: "Wedding",
  mitzvah: "Bar or Bat Mitzvah",
  celebration: "Celebration",
};

const form = document.getElementById("form");
const estimateKicker = document.getElementById("estimateKicker");
const estimateTotal = document.getElementById("estimateTotal");
const estimateLines = document.getElementById("estimateLines");
const estimateNote = document.getElementById("estimateNote");
const formError = document.getElementById("formError");
const mobileBar = document.getElementById("mobileBar");
const mobileTotal = document.getElementById("mobileTotal");
const venueNote = document.getElementById("venueNote");
const quizResult = document.getElementById("quizResult");

function money(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function rangeText(low, high) {
  return low === high ? money(low) : money(low) + " to " + money(high);
}

function readForm() {
  const data = new FormData(form);
  return {
    firstName: (data.get("firstName") || "").trim(),
    lastName: (data.get("lastName") || "").trim(),
    email: (data.get("email") || "").trim(),
    phone: (data.get("phone") || "").trim(),
    occasion: data.get("occasion") || "",
    mitzvahType: (data.get("mitzvahType") || "").trim(),
    celebrationType: (data.get("celebrationType") || "").trim(),
    eventDate: data.get("eventDate") || "",
    guestCount: data.get("guestCount") ? Number(data.get("guestCount")) : null,
    venueStatus: data.get("venueStatus") || "have",
    venue: (data.get("venue") || "").trim(),
    outsideArea: data.get("outsideArea") === "yes",
    planningLevel: data.get("planningLevel") || "",
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

function occasionLabel(input) {
  if (input.occasion === "mitzvah" && input.mitzvahType) return input.mitzvahType;
  if (input.occasion === "celebration" && input.celebrationType) {
    return "Celebration (" + input.celebrationType + ")";
  }
  return OCCASION_LABELS[input.occasion] || input.occasion || "Not specified";
}

function buildEstimate(input) {
  const pack = RATES.packages[input.planningLevel];
  if (!pack) {
    return { ready: false, lines: [], starting: 0, adjLow: 0, adjHigh: 0, low: 0, high: 0, days: null };
  }

  const lines = [];
  const starting = pack.starting;
  lines.push({
    label: pack.name + ", starting at",
    low: starting,
    high: starting,
    official: true,
    note: "Published starting price from the SLD Events pricing sheet.",
  });

  let adjLow = 0;
  let adjHigh = 0;

  if (input.guestCount && input.guestCount > 0) {
    const band = RATES.guestAdjust.find((g) => input.guestCount <= g.max);
    if (band && (band.low || band.high)) {
      const gLow = Math.round(starting * band.low);
      const gHigh = Math.round(starting * band.high);
      adjLow += gLow;
      adjHigh += gHigh;
      lines.push({
        label: "Larger guest count (" + input.guestCount + ")",
        low: gLow,
        high: gHigh,
        official: false,
        note: "Sample estimate for a celebration over 100 guests. Not a published fee.",
      });
    }
  }

  const days = daysUntil(input.eventDate);
  if (days !== null && days >= 0 && days <= RATES.rush.withinDays) {
    const rLow = Math.round(starting * RATES.rush.low);
    const rHigh = Math.round(starting * RATES.rush.high);
    adjLow += rLow;
    adjHigh += rHigh;
    lines.push({
      label: RATES.rush.label,
      low: rLow,
      high: rHigh,
      official: false,
      note: "Sample estimate when the date is within eight weeks. Not a published fee.",
    });
  }

  if (input.outsideArea) {
    adjLow += RATES.travel.low;
    adjHigh += RATES.travel.high;
    lines.push({
      label: RATES.travel.label,
      low: RATES.travel.low,
      high: RATES.travel.high,
      official: false,
      note: "Sample estimate for a venue outside the Baltimore and Washington, DC area. Not a published fee.",
    });
  }

  return {
    ready: true,
    pack,
    lines,
    starting,
    adjLow,
    adjHigh,
    low: starting + adjLow,
    high: starting + adjHigh,
    days,
  };
}

function disclaimerText(estimate) {
  const base =
    "Final pricing depends on guest count, venue, and the scope of the celebration, and is confirmed in a written quote after a free consultation. A 50% deposit reserves the date. The balance is due before the event. Vendor and venue costs are paid directly by you and are not included.";
  if (!estimate.ready) {
    return "Choose a package to see the starting price. " + base;
  }
  if (estimate.adjLow || estimate.adjHigh) {
    return "The starting price is official. Any adjustments shown below it are sample estimates only, not published SLD Events fees. " + base;
  }
  return "This starting price is official. " + base;
}

function renderEstimate() {
  const input = readForm();
  const estimate = buildEstimate(input);
  estimateLines.innerHTML = "";

  form.querySelector(".mitzvah-detail").hidden = input.occasion !== "mitzvah";
  form.querySelector(".celebration-detail").hidden = input.occasion !== "celebration";

  venueNote.hidden = !(input.venueStatus === "need" && input.planningLevel === "day-of");

  if (!estimate.ready) {
    estimateKicker.textContent = "Choose a planning package";
    estimateTotal.textContent = "";
    estimateNote.textContent = disclaimerText(estimate);
    mobileTotal.textContent = "pending";
    mobileBar.hidden = true;
    return estimate;
  }

  const hasAdj = estimate.adjLow || estimate.adjHigh;
  estimateKicker.textContent = estimate.pack.name + ", starting at " + money(estimate.starting);
  estimateTotal.textContent = hasAdj
    ? "Estimated range " + rangeText(estimate.low, estimate.high)
    : "Starting at " + money(estimate.starting);
  estimateNote.textContent = disclaimerText(estimate);
  mobileTotal.textContent = hasAdj ? rangeText(estimate.low, estimate.high) : "Starting at " + money(estimate.starting);
  mobileBar.hidden = false;

  for (const line of estimate.lines) {
    const li = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = line.label + (line.official ? "" : " (estimate)");
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

  if (hasAdj) {
    const total = document.createElement("li");
    const tName = document.createElement("span");
    tName.textContent = "Starting price plus estimated adjustments";
    const tAmt = document.createElement("span");
    tAmt.className = "amt";
    tAmt.textContent = rangeText(estimate.low, estimate.high);
    total.append(tName, tAmt);
    estimateLines.append(total);
  }

  return estimate;
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
    "Occasion: " + occasionLabel(input),
    "Event date: " + (input.eventDate || "Not set yet"),
    "Guest count: " + (input.guestCount || "Not set yet"),
    "Venue: " + (input.venueStatus === "need" ? "Needs help finding a venue" : "Has a venue or location") + (input.venue ? " (" + input.venue + ")" : ""),
    "Outside the Baltimore and Washington, DC area: " + (input.outsideArea ? "Yes" : "No"),
    "Package: " + (estimate.ready ? estimate.pack.name : "Not chosen"),
    "Overall event budget range: " + (input.budget || "Not sure yet"),
    "",
  ];

  if (estimate.ready) {
    lines.push("Starting price (from the pricing sheet): " + money(estimate.starting));
    if (estimate.adjLow || estimate.adjHigh) {
      lines.push("Estimated adjustments (sample ranges, not published fees): " + rangeText(estimate.adjLow, estimate.adjHigh));
      for (const line of estimate.lines) {
        if (line.official) continue;
        lines.push("- " + line.label + ": " + rangeText(line.low, line.high));
      }
      lines.push("Estimated planning range: " + rangeText(estimate.low, estimate.high));
    } else {
      lines.push("No sample adjustments applied. Estimated planning fee starts at " + money(estimate.starting) + ".");
    }
    lines.push("");
    lines.push("Final pricing depends on guest count, venue, and the scope of the celebration, and is confirmed in a written quote after a free consultation. A 50% deposit reserves the date. The balance is due before the event. Vendor and venue costs are paid directly by the client and are not included.");
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

document.querySelectorAll(".quiz").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tier = btn.dataset.tier;
    const radio = form.querySelector('input[name="planningLevel"][value="' + tier + '"]');
    if (radio) {
      radio.checked = true;
      radio.focus();
    }
    document.querySelectorAll(".quiz").forEach((b) => b.classList.toggle("is-picked", b === btn));
    quizResult.hidden = false;
    quizResult.textContent =
      tier === "day-of"
        ? "Day-of Coordination looks like the right fit. It starts at $1,200 and covers execution on the day itself."
        : "Full-Service Planning looks like the right fit. It starts at $4,200 and covers the work from budget and venue to design and the day itself.";
    renderEstimate();
    document.getElementById("tiers").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});

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
  if (!input.occasion) {
    showError("Please choose an occasion.");
    return;
  }
  if (!input.planningLevel) {
    showError("Please choose Day-of Coordination or Full-Service Planning.");
    return;
  }
  showError("");
  const estimate = buildEstimate(input);
  const subject = "Event inquiry: " + occasionLabel(input) + (input.eventDate ? " on " + input.eventDate : "");
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
