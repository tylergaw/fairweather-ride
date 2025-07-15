import rides from "./data/rides.json" with { type: "json" };

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
    const strokeColor = "f73e00"
    const encodedPolyline = encodeURIComponent(ride.map.summary_polyline);
    const size = "400x600";
    const padding = "100,40,40";
    const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/${style}/static/path-${strokeWidth}+${strokeColor}-1(${encodedPolyline})/auto/${size}?attribution=false&padding=${padding}&access_token=${mapboxToken}`;

    html += `<li id='ride-${ride.id}' class="ride">
      <div class="ride-content">
        <p class="ride-meta">
          <b>${rides.length - i}</b>
          <time datetime="${ride.start_date}">${formatDate(
        ride.start_date
      )}</time>
        </p>
        <p class="ride-distance">${metersToMiles(ride.distance)} <small>mi</small></p>
      </div>
      <img src="${mapUrl}" alt="Ride map" />
    </li>`;

    return html;
  }, "");
}

renderRides();

function renderStats() {
  const numRides = rides.length;
  const totalDistance = rides.reduce((distance, ride) => {
    return distance + ride.distance;
  }, 0);
  const avgDistance = totalDistance / numRides
  
  console.log('total', metersToMiles(totalDistance))
  console.log('avg', metersToMiles(avgDistance))
}

renderStats()

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
