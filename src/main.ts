import { LngLat } from "ymaps3";
import { LOCATION_POLLING_INTERVAL_MS } from "./constants";
import {
  computeId,
  getIconColor,
  getLocation,
  getUsername,
  setToolbarCoordinates,
  setToolbarIcon,
  setToolbarIconColor,
} from "./helpers";
import { YMapDefaultMarker } from "@yandex/ymaps3-default-ui-theme";

let username: string;
let userId: string;

let currentLocation: {
  marker: YMapDefaultMarker;
  location: LngLat;
  timestamp: number;
} | null = null;

main();

async function main() {
  await ymaps3.ready;
  console.log("Map is ready");

  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapControls,
  } = ymaps3;

  const { YMapZoomControl, YMapGeolocationControl, YMapDefaultMarker } =
    await import("@yandex/ymaps3-default-ui-theme");

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

  const updateLocation = async () => {
    const location = await getLocation();
    console.log("Current location:", location);

    let marker = currentLocation?.marker;
    if (!marker) {
      marker = new YMapDefaultMarker({ coordinates: location, id: "me" });
      map.addChild(marker);
    }

    currentLocation = { location, marker, timestamp: Date.now() };
    currentLocation.marker.update({ coordinates: location });

    setToolbarCoordinates(location);
  };
  updateLocation();
  setInterval(updateLocation, LOCATION_POLLING_INTERVAL_MS);
}
