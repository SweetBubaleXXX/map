import { LngLat } from "ymaps3";
import { ICON_COLORS } from "./constants";
import {
  collection,
  doc,
  Firestore,
  GeoPoint,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { UserLocation } from "./types";

export async function getLocation(): Promise<LngLat> {
  const { geolocation } = ymaps3;
  const location = await geolocation.getPosition({ enableHighAccuracy: true });
  console.log("Current location:", location.coords);
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

export async function saveLocationToFirestore(
  db: Firestore,
  userLocation: UserLocation
): Promise<void> {
  await setDoc(doc(db, "users", userLocation.userId), {
    coordinates: new GeoPoint(
      userLocation.coordinates[1],
      userLocation.coordinates[0]
    ),
    lastSeen: Timestamp.fromMillis(userLocation.timestamp),
    username: userLocation.username,
  });
  console.log("Location info sent to Firebase");
}

export async function getAllLocations(
  db: Firestore,
  lastSeenDeltaMs: number
): Promise<UserLocation[]> {
  const now = Date.now();
  const lastSeenFrom = now - lastSeenDeltaMs;

  const q = query(
    collection(db, "users"),
    where("lastSeen", ">=", Timestamp.fromMillis(lastSeenFrom))
  );
  const querySnapshot = await getDocs(q);

  const result: UserLocation[] = [];

  querySnapshot.forEach((document) => {
    const docContent = document.data();
    const coordinates = docContent.coordinates as GeoPoint;
    result.push({
      userId: document.id,
      username: docContent.username as string,
      coordinates: [coordinates.longitude, coordinates.latitude],
      timestamp: (docContent.lastSeen as Timestamp).toMillis(),
    });
  });

  return result;
}
