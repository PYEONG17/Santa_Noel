export interface Message {
  id: string;
  role: 'user' | 'santa' | 'system';
  text: string;
  timestamp: Date;
}

export interface City {
  name: string;
  lat: number;
  lng: number;
  arrival: string;
}

export interface SantaStatus {
  location: string;
  activity: string;
  speed: number;
  presentsDelivered: number;
}
