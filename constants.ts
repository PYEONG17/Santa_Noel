import { City } from './types';

export const GEOJSON_URL = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

// A simulated flight path for Santa (Latitude, Longitude)
// Starts at North Pole, goes through Oceania, Asia, Europe, Africa, Americas
export const SANTA_PATH: City[] = [
  { name: "Bắc Cực", lat: 90, lng: 0, arrival: "00:00" },
  { name: "Auckland", lat: -36.8485, lng: 174.7633, arrival: "01:00" },
  { name: "Sydney", lat: -33.8688, lng: 151.2093, arrival: "02:00" },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503, arrival: "04:00" },
  { name: "Bắc Kinh", lat: 39.9042, lng: 116.4074, arrival: "05:00" },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, arrival: "07:30" },
  { name: "Dubai", lat: 25.2048, lng: 55.2708, arrival: "09:00" },
  { name: "Mát-xcơ-va", lat: 55.7558, lng: 37.6173, arrival: "11:00" },
  { name: "Paris", lat: 48.8566, lng: 2.3522, arrival: "13:00" },
  { name: "Luân Đôn", lat: 51.5074, lng: -0.1278, arrival: "13:30" },
  { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, arrival: "16:00" },
  { name: "New York", lat: 40.7128, lng: -74.0060, arrival: "19:00" },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437, arrival: "22:00" },
  { name: "Honolulu", lat: 21.3069, lng: -157.8583, arrival: "23:30" },
];

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'welcome',
    role: 'santa' as const,
    text: "Ho Ho Ho! Giáng sinh an lành! Ta đang kiểm tra lịch trình bay. Ta có thể giúp gì cho cháu?",
    timestamp: new Date()
  }
];