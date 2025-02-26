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

  ymaps3.import.registerCdn(
    "https://cdn.jsdelivr.net/npm/{package}",
    "@yandex/ymaps3-default-ui-theme@latest"
  );
  // @ts-ignore
  const { YMapZoomControl, YMapGeolocationControl } = await ymaps3.import(
    // @ts-ignore
    "@yandex/ymaps3-default-ui-theme"
  );

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
}
