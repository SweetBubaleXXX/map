export const FIREBASE_CONFIGURATION = JSON.parse(
  import.meta.env.VITE_FIREBASE_CONFIG
);

export const LOCATION_POLLING_INTERVAL_MS = 10000;

export const DEFAULT_LAST_SEEN_DELTA_MS = 60 * 24 * 60 * 60 * 1000; // 60 days

export const ICON_COLORS = [
  "#90cc41",
  "#414dcc",
  "#9941cc",
  "#ccb341",
  "#cc4164",
  "#c91512",
  "#74cccf",
  "#fc7d1c",
  "#008f26",
  "#025aa3",
];
