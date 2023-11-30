$(document).ready(function () {
  $("#current-location").click(getGeolocation);
  $("#search-button").click(searchLocation);
  $("#location-select").change(handleSelectChange);
});

function getGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  } else {
    showError("Geolocation is not supported by your browser!!.");
  }
}

function successCallback(position) {
  const { latitude, longitude } = position.coords;
  fetchSunriseSunset(latitude, longitude);
}

function errorCallback(error) {
  showError(`Error Getting Geolocation: ${error.message}`);
}

function searchLocation() {
  const locationName = $("#search-location").val();
  if (locationName) {
    fetch(`https://geocode.maps.co/search?q=${locationName}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          const { lat, lon } = data[0];
          fetchSunriseSunset(lat, lon);
        } else {
          showError("Location Not Found !!!.");
        }
      })
      .catch(() => showError("** Error Fetching Location Data. **"));
  } else {
    showError("Please Enter a location to search");
  }
}

function handleSelectChange() {
  const selectedValue = event.target.value;
  if (selectedValue) {
    const [latitude, longitude] = selectedValue.split(",");
    const locationName = event.target.options[event.target.selectedIndex].text;
    fetchSunriseSunset(latitude, longitude, locationName);
  }
}

function fetchSunriseSunset(latitude, longitude) {
  $("#initial-image").hide();
  $(".card-container").show();

  fetchDataForDate(latitude, longitude, new Date());
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  fetchDataForDate(latitude, longitude, tomorrow);
}

function fetchDataForDate(latitude, longitude, date) {
  const dateString = date.toISOString().split("T")[0];
  const url = `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}&date=${dateString}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "OK") {
        updateDashboard(data.results, dateString);
      } else {
        showError("Error Fetching Data.");
      }
    })
    .catch(() => showError("Error Fetching Data."));
}

function updateDashboard(data, date) {
  let cardId =
    date === new Date().toISOString().split("T")[0]
      ? "#today-card"
      : "#tomorrow-card";
  let content = `<h2>${
    date === new Date().toISOString().split("T")[0] ? "Today's" : "Tomorrow's"
  } Sunrise and Sunset</h2>
                 <p><strong>Sunrise:</strong> ${data.sunrise}</p>
                 <p><strong>Sunset:</strong> ${data.sunset}</p>
                 <p><strong>Dawn (Civil Twilight Begin):</strong> ${
                   data.dawn
                 }</p>
                 <p><strong>Dusk (Civil Twilight End):</strong> ${data.dusk}</p>
                 <p><strong>Day Length:</strong> ${data.day_length}</p>
                 <p><strong>Solar Noon:</strong> ${data.solar_noon}</p>
                 <p><strong>Time Zone:</strong> ${data.timezone}</p>`;
  $(cardId).html(content);
}

function showError(message) {
  $("#initial-image").hide();
  $(".card-container").show();
  $(".card-container").html(`<p class="error">${message}</p>`);
}
