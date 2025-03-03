export const FIREBASE_CONFIGURATION = JSON.parse(
  import.meta.env.VITE_FIREBASE_CONFIG
);

export const LOCATION_POLLING_INTERVAL_MS = 10000;

export const DEFAULT_LAST_SEEN_DELTA_MS = 48 * 60 * 60 * 1000; // 48 hours

export const ICON_COLORS = [
  "#90cc41",
  "#414dcc",
  "#9941cc",
  "#ccb341",
  "#cc4164",
  "#c91512",
  "#74cccf",
  "#ad8b00",
];
