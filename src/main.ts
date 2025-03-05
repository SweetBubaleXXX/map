import { LngLat } from "ymaps3";
import {
  DEFAULT_LAST_SEEN_DELTA_MS,
  FIREBASE_CONFIGURATION,
  LOCATION_POLLING_INTERVAL_MS,
} from "./constants";
import {
  computeId,
  getAllLocations,
  getIconColor,
  getLocation,
  getUsername,
  saveLocationToFirestore,
  setToolbarCoordinates,
  setToolbarIcon,
  setToolbarIconColor,
} from "./helpers";
import {
  YMapDefaultMarker,
  YMapPopupContentProps,
  YMapPopupMarker,
} from "@yandex/ymaps3-default-ui-theme";
import { YMapMarker } from "ymaps3";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { UserLocation } from "./types";

let username: string;
let userId: string;

let currentLocation: {
  marker: YMapDefaultMarker;
  location: LngLat;
  timestamp: number;
} | null = null;

const markers: {
  [id: string]: { marker: YMapMarker; popup: YMapPopupMarker } | undefined;
} = {};

main();

async function main() {
  await ymaps3.ready;
  console.log("Map is ready");

  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapControls,
    YMapMarker,
  } = ymaps3;

  const {
    YMapZoomControl,
    YMapGeolocationControl,
    YMapDefaultMarker,
    YMapPopupMarker,
  } = await import("@yandex/ymaps3-default-ui-theme");

  const map = new YMap(
    document.getElementById("map")!,
    {
      location: {
        zoom: 12,
        center: [27.56, 53.9],
      },
    },
    [new YMapDefaultSchemeLayer({}), new YMapDefaultFeaturesLayer({})]
  );

  map.addChild(
    new YMapControls({ position: "bottom left" }).addChild(
      new YMapZoomControl({})
    )
  );
  map.addChild(
    new YMapControls({ position: "bottom right" }).addChild(
      new YMapGeolocationControl({
        easing: "ease-in-out",
        duration: 1000,
        zoom: 15,
      })
    )
  );

  username = getUsername();
  userId = await computeId(username);
  console.log("User ID:", userId);
  setToolbarIcon(username[0]);
  setToolbarIconColor(getIconColor(userId));

  const firebaseApp = initializeApp(FIREBASE_CONFIGURATION);
  const db = getFirestore(firebaseApp);

  const createPopup = (userLocation: UserLocation): YMapPopupContentProps => {
    const popupDiv = document.createElement("div");
    popupDiv.classList.add("marker-popup");

    const popupUsername = document.createElement("div");
    popupUsername.classList.add("popup-username");
    popupUsername.textContent = userLocation.username;
    popupDiv.appendChild(popupUsername);

    const popupCoordinates = document.createElement("div");
    popupCoordinates.classList.add("popup-coordinates");
    popupCoordinates.textContent = `${userLocation.coordinates[1]} ${userLocation.coordinates[0]}`;
    popupDiv.appendChild(popupCoordinates);

    const popupLastSeen = document.createElement("div");
    popupLastSeen.classList.add("popup-timestamp");
    popupLastSeen.textContent = new Date(
      userLocation.timestamp
    ).toLocaleString();
    popupDiv.appendChild(popupLastSeen);

    return () => popupDiv;
  };

  const createOrUpdateMarker = (userLocation: UserLocation) => {
    const existingMarker = markers[userLocation.userId];

    if (existingMarker) {
      existingMarker.marker.update({ coordinates: userLocation.coordinates });
    } else {
      const markerDiv = document.createElement("div");
      markerDiv.classList.add("marker");
      markerDiv.textContent = userLocation.username[0].toUpperCase();
      markerDiv.style.backgroundColor = getIconColor(userLocation.userId);

      const popup = new YMapPopupMarker({
        coordinates: userLocation.coordinates,
        position: "left top",
        content: createPopup(userLocation),
        show: false,
      });
      const marker = new YMapMarker(
        {
          coordinates: userLocation.coordinates,
          id: userLocation.userId,
          onClick: () => popup.update({ show: !popup.isOpen }),
        },
        markerDiv
      );
      markers[userLocation.userId] = { marker, popup };
      map.addChild(popup);
      map.addChild(marker);
    }
  };

  const fetchLocations = async () => {
    const userLocations = await getAllLocations(db, DEFAULT_LAST_SEEN_DELTA_MS);

    userLocations.forEach((userLocation) => {
      if (userLocation.userId !== userId) {
        createOrUpdateMarker(userLocation);
      }
    });
  };

  const updateLocation = async () => {
    const location = await getLocation();

    let marker = currentLocation?.marker;
    if (!marker) {
      marker = new YMapDefaultMarker({ coordinates: location, id: "me" });
      map.addChild(marker);
    }

    currentLocation = { location, marker, timestamp: Date.now() };
    currentLocation.marker.update({ coordinates: location });

    setToolbarCoordinates(location);

    await saveLocationToFirestore(db, {
      userId,
      username,
      coordinates: location,
      timestamp: currentLocation.timestamp,
    });
  };

  updateLocation();
  fetchLocations();
  setInterval(updateLocation, LOCATION_POLLING_INTERVAL_MS);
  setInterval(fetchLocations, LOCATION_POLLING_INTERVAL_MS);
}
