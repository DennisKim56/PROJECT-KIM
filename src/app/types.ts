export type RawCityData = {
  city: string;
  country: string;
  lat: number;
  lng: number;
};

export type CityData = {
  city: string;
  country: string;
  guess: Location;
  actual: Location;
  distance: number;
  score: number;
};

export type Location = {
  lat: number | null;
  lng: number | null;
};

export type ResultList = {
  username: string;
  results: CityData[];
  totalScore: number;
  date: Date;
};
