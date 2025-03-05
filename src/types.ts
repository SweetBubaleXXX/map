import { LngLat } from "ymaps3";

export interface UserLocation {
  userId: string;
  username: string;
  coordinates: LngLat;
  timestamp: number;
}
