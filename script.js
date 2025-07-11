// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const userInputDiv = document.querySelector(".user-input--div");
const inputVisitationType = document.querySelector(".place-visited");
const inputPlaceType = document.querySelector(".place-type");
const submitBtn = document.querySelector(".submit"); // mark-my-spot / mark-it button.
const dateHTML = `<input class="date" type="date" />`;
const resetBtn = document.querySelector(".reset");
let inputDateVisited = document.querySelector(".date");
let placesListDiv = document.querySelector(".list--div");
let html;
let marker;
// let dateIDBuilder = new Date();

// construct a readable date format.
function monthsBreakdown(date) {
  const monthNumber = parseInt(String(date).slice(5, 7));
  const month = months[monthNumber - 1];
  const dateNum = String(date).slice(8);
  const year = String(date).slice(0, 4);
  return `${month} ${dateNum}, ${year}.`;
}

inputVisitationType.addEventListener("change", function () {
  if (inputVisitationType.value === "✅ Visited") {
    inputDateVisited = document.querySelector(".date");
    if (!inputDateVisited)
      inputPlaceType.insertAdjacentHTML("afterend", dateHTML);
  } else {
    inputDateVisited = document.querySelector(".date");
    if (inputDateVisited) inputDateVisited.remove();
  }
});

let latitude;
let longitude;
let lat, lng;
let initialMarker;
let placesArr = [];
let markersGroup;
let markerExists;
navigator.geolocation.getCurrentPosition(
  function (position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    console.log(position);
    map = L.map("map").setView([latitude, longitude], 13);

    L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      maxZoom: 21,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    }).addTo(map);

    // create a marker group
    markersGroup = L.layerGroup().addTo(map);
    // THE SEARCH BAR ON TOP-RIGHT
    const geocoderControl = L.Control.geocoder({
      collapsed: false,
      defaultMarkGeocode: false,
      placeholder: "Search for a place",
      errorMessage: "Nothing found.",
    })
      .on("markgeocode", function (e) {
        const center = e.geocode.center;
        // you can also add a marker
        L.marker(center).addTo(map).bindPopup(e.geocode.name).openPopup();
        map.setView(center, 13);
      })
      .addTo(map);

    // LOAD THE STORED DATA IN LOCAL STORAGE
    const storedDataArr = JSON.parse(
      this.window.localStorage.getItem("placesArrToStore")
    );

    if (storedDataArr) {
      // loop through the stored array
      storedDataArr.forEach((item) => {
        console.log(item.htmlPlaces);
        userInputDiv.insertAdjacentHTML("afterend", item.htmlPlaces); // display the html
        let placeTypeValue = document.querySelector(".place-type-value");
        if (placeTypeValue)
          placeTypeValue =
            document.querySelector(".place-type-value").textContent;
        let visitTypeValue = document.querySelector(".visit-value");
        if (visitTypeValue)
          visitTypeValue = document.querySelector(".visit-value").textContent;
        console.log(visitTypeValue);
        console.log(document.querySelector(".place-type-value"));
        console.log(placeTypeValue);
        userInputDiv.classList.remove("hidden");

        marker = L.marker(item.coords)
          .addTo(map)
          .bindPopup(
            L.popup({
              maxWidth: 400,
              minwidth: 200,
              autoClose: false,
              closeOnClick: false,
            })
          )
          .setPopupContent(
            `${placeTypeValue ? placeTypeValue : ""} ${
              visitTypeValue ? "<br>" + visitTypeValue : ""
            }`
          )
          .openPopup();
        markersGroup.addLayer(marker);
        placesArr.push(item); // add the loaded ones to the current array to work on.
        console.log(placesArr);
      });
    }
    // WHEN MAP IS CLICKED
    map.on("click", function (pos) {
      userInputDiv.classList.remove("hidden");
      console.log(pos);
      console.log("map is clicked!");
      lat = pos.latlng.lat;
      lng = pos.latlng.lng;
      // check if marker already exists
      markerExists = checkIfMarkerAlreadyExists(pos.latlng);

      if (initialMarker) initialMarker.remove();
      initialMarker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(
          L.popup({
            maxWidth: 400,
            minwidth: 200,
            autoClose: false,
            closeOnClick: false,
          })
        )
        .setPopupContent(
          `Add additional info about this place on the left pane.`
        )
        .openPopup();
    });
    submitBtn.addEventListener("click", function (e) {
      initialMarker.remove();
      markerExists = checkIfMarkerAlreadyExists({ lat, lng });
      if (markerExists) return;
      inputDateVisited = document.querySelector(".date");
      const placeType = inputPlaceType.value;
      const visitation = inputVisitationType.value;
      // when no input is provided about the visitation -> visitation is not selected.
      if (!visitation) {
        if (!placeType) {
          return;
        }
        marker = L.marker([lat, lng])
          .addTo(map)
          .bindPopup(
            L.popup({
              maxWidth: 400,
              minwidth: 200,
              autoClose: false,
              closeOnClick: false,
            })
          )
          .setPopupContent(`${placeType}`)
          .openPopup();
        markersGroup.addLayer(marker);

        html = `<div class="list--div" data-id="${Date.now()}">
                      <h2 class="place-type-value">
                      ${placeType}
                      </h2>
                  </div>`;
        userInputDiv.insertAdjacentHTML("afterend", html);
        placesListDiv = document.querySelector(".list--div");
        placesArr.push({
          coords: [lat, lng],
          uid: placesListDiv.dataset.id,
          htmlPlaces: html,
        });

        return;
      }
      // when the place is visited
      if (visitation === "✅ Visited") {
        const date = inputDateVisited.value;
        // when there is no date, no place type, just the visitation -> visited
        if (!date && !placeType) {
          marker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(
              L.popup({
                maxWidth: 400,
                minwidth: 200,
                autoClose: false,
                closeOnClick: false,
              })
            )
            .setPopupContent(`${visitation}`)
            .openPopup();
          markersGroup.addLayer(marker);

          // initialMarker.remove();
          html = `<div class="list--div" data-id="${Date.now()}">
                    <h3 class="visit-value">${visitation} </h3>
                </div>`;
          userInputDiv.insertAdjacentHTML("afterend", html);
          placesListDiv = document.querySelector(".list--div");
          placesArr.push({
            coords: [lat, lng],
            uid: placesListDiv.dataset.id,
            htmlPlaces: html,
          });

          return;
        }
        //  when the place is visited but date is not entered. visitation -> visited
        if (!date) {
          marker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(
              L.popup({
                maxWidth: 400,
                minwidth: 200,
                autoClose: false,
                closeOnClick: false,
              })
            )
            .setPopupContent(
              `${!placeType ? "" : placeType + "<br>"}  ${visitation}`
            )
            .openPopup();
          markersGroup.addLayer(marker);

          // initialMarker.remove();
          html = `<div class="list--div" data-id="${Date.now()}">
              <h2 class="place-type-value">${placeType}
              </h2>
              <h3 class="visit-value">${visitation} </h3>
          </div>`;
          userInputDiv.insertAdjacentHTML("afterend", html);
          placesListDiv = document.querySelector(".list--div");
          placesArr.push({
            coords: [lat, lng],
            uid: placesListDiv.dataset.id,
            htmlPlaces: html,
          });

          return;
        }

        //  when the place is visited and date is entered.
        const prettyDate = monthsBreakdown(date); // get a neat readable date from the function.
        console.log(prettyDate, placeType, visitation);
        marker = L.marker([lat, lng])
          .addTo(map)
          .bindPopup(
            L.popup({
              maxWidth: 400,
              minwidth: 200,
              autoClose: false,
              closeOnClick: false,
            })
          )
          .setPopupContent(
            `${placeType} <br> ${visitation} on 🗓️ ${prettyDate}`
          )
          .openPopup();
        markersGroup.addLayer(marker);

        // initialMarker.remove();
        html = `<div class="list--div" data-id="${Date.now()}">
              <h2 class="place-type-value">
              ${placeType}
              </h2>
              <h3 class="h3-when-visited visit-value">${visitation} on ${prettyDate}</h3>
              </div>`;
        userInputDiv.insertAdjacentHTML("afterend", html);
        placesListDiv = document.querySelector(".list--div");
        placesArr.push({
          coords: [lat, lng],
          uid: placesListDiv.dataset.id,
          htmlPlaces: html,
        });
        return;
      }
      if (visitation === "🤩 I want to visit") {
        if (!placeType) {
          // when the place hasn't been visited -> visitation: want to visit.
          marker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(
              L.popup({
                maxWidth: 400,
                minwidth: 200,
                autoClose: false,
                closeOnClick: false,
              })
            )
            .setPopupContent(`${visitation}`)
            .openPopup();
          markersGroup.addLayer(marker);

          // initialMarker.remove();
          html = ` <div class="list--div" data-id="${Date.now()}">
                 <h3 class="visit-value">${visitation} </h3>
                 </div>`;
          userInputDiv.insertAdjacentHTML("afterend", html);
          placesListDiv = document.querySelector(".list--div");
          placesArr.push({
            coords: [lat, lng],
            uid: placesListDiv.dataset.id,
            htmlPlaces: html,
          });

          return;
        }
        console.log(placeType, visitation);
        marker = L.marker([lat, lng])
          .addTo(map)
          .bindPopup(
            L.popup({
              maxWidth: 400,
              minwidth: 200,
              autoClose: false,
              closeOnClick: false,
            })
          )
          .setPopupContent(`${placeType}<br> ${visitation}`)
          .openPopup();
        markersGroup.addLayer(marker);

        // initialMarker.remove();
        html = `<div class="list--div" data-id="${Date.now()}">
              <h2 class="place-type-value">
              ${placeType}
              </h2>
              <h3 class="visit-value">${visitation} </h3>
              </div>`;
        userInputDiv.insertAdjacentHTML("afterend", html);
        placesListDiv = document.querySelector(".list--div");
        placesArr.push({
          coords: [lat, lng],
          uid: placesListDiv.dataset.id,
          htmlPlaces: html,
        });

        return;
      }
    });
  },
  // if location access is denied.
  function () {
    alert(
      "☹️ Sorry, please allow location access for proper functionality of the site."
    );
    return;
  }
);

window.addEventListener("click", function (e) {
  placesListDiv = document.querySelector(".list--div");
  if (
    e.target.classList.contains("list--div") ||
    e.target.parentElement.classList.contains("list--div")
  ) {
    let desiredObj;
    if (e.target.classList.contains("list--div")) {
      placesListDiv = e.target;

      for (let i = 0; i < placesArr.length; i++) {
        if (placesArr[i].uid === e.target.dataset.id) {
          desiredObj = placesArr[i];
        }
      }

      marker = L.marker(desiredObj.coords).addTo(map);
      markersGroup.addLayer(marker);
      map.panTo(desiredObj.coords);
      map.setView(desiredObj.coords, 13);
    } else {
      placesListDiv = e.target.parentElement;
      for (let i = 0; i < placesArr.length; i++) {
        if (placesArr[i].uid === e.target.parentElement.dataset.id) {
          desiredObj = placesArr[i];
        }
      }
      marker = L.marker(desiredObj.coords).addTo(map);
      markersGroup.addLayer(marker);

      map.panTo(desiredObj.coords);
      map.setView(desiredObj.coords, 13);
    }
  }
  console.log(placesArr);
  window.localStorage.setItem("placesArrToStore", JSON.stringify(placesArr));
  console.log(JSON.parse(this.window.localStorage.getItem("placesArrToStore")));
  if (e.target == resetBtn) {
    this.window.localStorage.removeItem("placesArrToStore");
    console.log("reset btn clicked");
    placesListDiv = document.querySelectorAll(".list--div");
    if (placesListDiv) placesListDiv.forEach((placeDiv) => placeDiv.remove());
    placesArr = [];
    inputPlaceType.value = "";
    inputVisitationType.value = "";
    if (inputDateVisited) inputDateVisited.value = "";
    // remove every marker at once
    markersGroup.clearLayers();
  }
});

// function removeAllMarkers() {
//   map.eachLayer((layer) => {
//     if (layer instanceof L.Marker) {
//       map.removeLayer(layer);
//     }
//   });
// }

function checkIfMarkerAlreadyExists(latLng) {
  const exists = markersGroup
    .getLayers()
    .some((marker) => marker.getLatLng().equals(latLng));

  if (exists) {
    console.log("Marker already here! 🎯");
    return true;
  } else return false;
}
