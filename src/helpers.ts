import { LngLat } from "ymaps3";

export async function getLocation(): Promise<LngLat> {
  const { geolocation } = ymaps3;
  const location = await geolocation.getPosition({ enableHighAccuracy: true });
  return location.coords;
}
