import rides from "./data/rides.json" with { type: "json" };

Splitting({
	whitespace: true
})

const mapboxToken =
  "pk.eyJ1IjoidHlsZXJnYXciLCJhIjoiY21kM3lwbGd5MDlqNDJtbjEwNXFsbGd4MyJ9.6LeDAzHAMcLJoLi1UQ2O_A";

function renderRides() {
  const el = document.getElementById("rides-list");
  const zero = "<li class='rides-zero'>No rides</li>";

  if (!rides) {
    el.innerHTML = zero;
    return;
  }

  if (rides.length === 0) {
    el.innerHTML = zero;
    return;
  }

  el.innerHTML = rides.reduce((html, ride, i) => {
    if (ride.sport_type !== "Ride") return html;

    const style = "dark-v11"; // streets-v12
    const strokeWidth = "2";
    const strokeColor = "ff0055";
    const encodedPolyline = encodeURIComponent(ride.map.summary_polyline);
    const imgWidth = 400;
    const imgHeight = 600;
    const size = `${imgWidth}x${imgHeight}`;
    const padding = "100,40,40";
    const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/${style}/static/path-${strokeWidth}+${strokeColor}-1(${encodedPolyline})/auto/${size}?attribution=false&padding=${padding}&access_token=${mapboxToken}`;

    html += `<li id='ride-${ride.id}' class="ride">
      <a href="https://www.strava.com/activities/${ride.id}">
        <div class="ride-content">
          <p class="ride-meta">
            <b>${rides.length - i}</b>
            <time datetime="${ride.start_date}">${formatDate(
      ride.start_date
    )}</time>
          </p>
          <p class="ride-distance">${metersToMiles(
            ride.distance
          )} <small>mi</small></p>
        </div>
        <img src="${mapUrl}" alt="Ride map" width="${imgWidth}" height="${imgHeight}" />
      </a>
    </li>`;

    return html;
  }, "");
}

renderRides();

function renderStats() {
  const el = document.getElementById("stats-container");
  const numRides = rides.length;

  let distances = [];
  let totalDistance = 0;
  let totalTime = 0;

  for (let i = 0; i < numRides; i++) {
    distances.push(rides[i].distance);
    totalDistance += rides[i].distance;
    totalTime += rides[i].moving_time;
  }

  distances.sort();
  const avgDistance = totalDistance / numRides;
  const timeParts = getTimeParts(totalTime);

  el.innerHTML = `
    <div class="stat">
      <span class="stat-title">Total rides</span>
      <span class="stat-detail">${numRides}</span>
    </div>
    <div class="stat">
      <span class="stat-title">Total distance</span>
      <span class="stat-detail">${metersToMiles(
        totalDistance
      )} <small>mi</small></span>
    </div>
    <div class="stat">
      <span class="stat-title">Avg. distance</span>
      <span class="stat-detail">${metersToMiles(
        avgDistance
      )} <small>mi</small></span>
    </div>
    <div class="stat">
      <span class="stat-title">Longest ride</span>
      <span class="stat-detail">${metersToMiles(
        distances[distances.length - 1]
      )} <small>mi</small></span>
    </div>
    <div class="stat">
      <span class="stat-title">Total moving time</span>
      <span class="stat-detail">${timeParts.days}<small>d</small> ${
    timeParts.hours
  }<small>hr</small> ${timeParts.minutes}<small>min</small></span>
    </div>
    <div class="stat">
      <span class="stat-title">Boroughs</span>
      <span class="stat-detail">4</span>
      <small>(we don’t go to that other one)</small>
     </div>
  `;

  const progress = document.getElementById("progress")
  const percentComplete = `${(
    (metersToMiles(totalDistance) / 1000) *
    100
  ).toFixed(2)}`;
  progress.style.setProperty("--percent-complete", `${percentComplete}%`);

  const displayEl = document.getElementById("meter-complete");
  displayEl.innerHTML = `${metersToMiles(totalDistance)} <small>mi</small>`;

  const percentDisplayEl = document.getElementById("progress-percentage")
  percentDisplayEl.innerText = `${percentComplete}% complete`
}

renderStats();

/**
 * Convert meters to miles.
 *
 * @param {number} meters
 * @returns {string}
 */
function metersToMiles(meters) {
  return (meters / 1609.344).toFixed(2);
}

/**
 * Given a date string, return a formatted date like "July 13th".
 *
 * @param {string} date
 * @returns {string}
 */
function formatDate(date) {
  const d = new Date(date);
  const day = d.getDate();
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(d);
  const suffix = getOrdinalSuffix(day);
  return `${month} ${day}${suffix}`;
}

/**
 * Given a number of a day, return the correct suffix.
 * @param {string} n
 */
function getOrdinalSuffix(n) {
  if (n >= 11 && n <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 *
 * @param {number} seconds
 * @returns {{ days: number, hours: number, minutes: number }}
 */
function getTimeParts(seconds) {
  const days = Math.floor(seconds / 86400); // 60 * 60 * 24
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return { days, hours, minutes };
}
