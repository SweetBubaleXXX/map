import { LngLat } from "ymaps3";
import { ICON_COLORS } from "./constants";

export async function getLocation(): Promise<LngLat> {
  const { geolocation } = ymaps3;
  const location = await geolocation.getPosition({ enableHighAccuracy: true });
  return location.coords;
}

export function getUsername(): string {
  let username: string | null;
  do {
    username = prompt("Введите имя пользователя");
  } while (!username);
  return username;
}

export function setToolbarCoordinates(coordinates: LngLat): void {
  const toolbarCoordinates = document
    .getElementsByClassName("toolbar-coordinates")
    .item(0);
  if (toolbarCoordinates) {
    toolbarCoordinates.textContent = `${coordinates[1]} ${coordinates[0]}`;
  }
}

export function setToolbarIcon(letter: string): void {
  const toolbarIcon = document
    .getElementsByClassName("toolbar-user-icon")
    .item(0);
  if (toolbarIcon) {
    toolbarIcon.textContent = letter.toUpperCase();
  }
}

export function setToolbarIconColor(color: string): void {
  const toolbarIcon = document
    .getElementsByClassName("toolbar-user-icon")
    .item(0) as HTMLDivElement | null;
  if (toolbarIcon) {
    toolbarIcon.style.backgroundColor = color;
  }
}

export function getIconColor(userId: string): string {
  const colorIndex = parseInt(`0x${userId.slice(-2)}`, 16) % 8;
  return ICON_COLORS[colorIndex];
}

export async function computeId(username: string): Promise<string> {
  const digest = await window.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(username.toLowerCase())
  );
  const resultBytes = [...new Uint8Array(digest)];
  return resultBytes.map((x) => x.toString(16).padStart(2, "0")).join("");
}
