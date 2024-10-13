import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import * as L from 'leaflet';
import { getDistance, convertDistance } from 'geolib';

import { CitydataService } from '../service/citydata.service';
import { CityData, RawCityData, ResultList } from '../types';

@Component({
  selector: 'app-leaflet-map',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './leaflet-map.component.html',
  styleUrl: './leaflet-map.component.css',
})
export class LeafletMapComponent implements OnInit {
  map: any;
  cityData: CityData[] = [];
  activeIndex: number = 0;
  activeMarker: any = undefined;
  actualMarker: any = undefined;
  actualLine: any = undefined;
  user?: string;
  faCircleCheck = faCircleCheck;
  result?: ResultList;
  gameComplete: boolean = false;
  constructor(private citydataService: CitydataService) {}

  configMap(): void {
    this.map = L.map('map', {
      center: [0, 0],
      zoom: 3,
      maxZoom: 8,
      minZoom: 2,
    });

    L.tileLayer(
      'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}',
      {
        noWrap: true,
      }
    ).addTo(this.map);

    this.map.on('click', (e: any) => {
      this.cityData[this.activeIndex].guess = {
        lat: parseFloat(e.latlng.lat.toFixed(4)),
        lng: parseFloat(e.latlng.lng.toFixed(4)),
      };

      if (this.activeMarker != undefined) {
        this.map.removeLayer(this.activeMarker);
      }
      this.activeMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(
        this.map
      );
    });
  }

  handleSubmit(): void {
    if (this.readyForSubmit()) {
      let totalScore = 0;
      this.cityData.forEach((record: CityData) => {
        const rawDistance = getDistance(
          { latitude: record.actual.lat!, longitude: record.actual.lng! },
          { latitude: record.guess.lat!, longitude: record.guess.lng! }
        );
        const distanceMiles = convertDistance(rawDistance, 'mi');
        let score = 0;
        if (distanceMiles < 1000) {
          score = Math.round(1000 - distanceMiles);
        }
        totalScore += score;
        record.distance = distanceMiles;
        record.score = score;
      });
      this.result = {
        username: this.user!,
        results: this.cityData,
        totalScore: totalScore,
        date: new Date(),
      };
      // Write results to local storage
      if (localStorage.getItem('results') === null) {
        localStorage.setItem('results', JSON.stringify([this.result]));
      } else {
        let resultsArr: any[] = JSON.parse(localStorage.getItem('results')!);
        resultsArr.push(this.result);
        localStorage.setItem('results', JSON.stringify(resultsArr));
      }
      this.map.off('click');
      this.gameComplete = true;
      this.setActive(0);
    }
  }

  getRandomElements(arr: RawCityData[], count: number): RawCityData[] {
    const shuffled: RawCityData[] = arr.slice();
    let i: number = arr.length;
    let index: number;
    let temp: RawCityData;

    // Shuffle the array using the Fisher-Yates algorithm
    while (i--) {
      index = Math.floor((i + 1) * Math.random());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
    }
    return shuffled.slice(0, count);
  }

  readyForSubmit(): boolean {
    let isReady: boolean = this.cityData.reduce((accumulator, city) => {
      return accumulator && city.guess.lat != null && city.guess.lng != null;
    }, true);

    return isReady && this.user != null && this.user != '';
  }

  setActive(idx: number): void {
    this.activeIndex = idx;
    // Create marker for guess
    if (this.activeMarker != undefined) {
      this.map.removeLayer(this.activeMarker);
    }
    if (
      this.cityData[this.activeIndex].guess.lat !== null &&
      this.cityData[this.activeIndex].guess.lng !== null
    ) {
      this.activeMarker = L.marker([
        this.cityData[this.activeIndex].guess.lat!,
        this.cityData[this.activeIndex].guess.lng!,
      ]).addTo(this.map);
    }
    if (this.gameComplete) {
      // Create marker for actual location
      const actualIcon = L.icon({
        iconUrl: '/greenstar.png',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      if (this.actualMarker != undefined) {
        this.map.removeLayer(this.actualMarker);
      }
      if (
        this.cityData[this.activeIndex].actual.lat !== null &&
        this.cityData[this.activeIndex].actual.lng !== null
      ) {
        this.actualMarker = L.marker(
          [
            this.cityData[this.activeIndex].actual.lat!,
            this.cityData[this.activeIndex].actual.lng!,
          ],
          { icon: actualIcon }
        ).addTo(this.map);
      }

      // Create line connecting actual and guess locations
      if (this.actualLine != undefined) {
        this.map.removeLayer(this.actualLine);
      }
      this.actualLine = L.polyline([
        [
          this.cityData[this.activeIndex].actual.lat!,
          this.cityData[this.activeIndex].actual.lng!,
        ],
        [
          this.cityData[this.activeIndex].guess.lat!,
          this.cityData[this.activeIndex].guess.lng!,
        ],
      ]).addTo(this.map);
    }
  }

  ngOnInit(): void {
    // Config and create map
    this.configMap();

    // Get city data
    this.citydataService.getUsData().subscribe((data: RawCityData[]) => {
      this.cityData = [
        ...this.cityData,
        ...this.getRandomElements(data, 5).map((element: RawCityData) => {
          return {
            city: element.city,
            country: element.country,
            guess: {
              lat: null,
              lng: null,
            },
            actual: {
              lat: element.lat,
              lng: element.lng,
            },
            distance: 0,
            score: 0,
          };
        }),
      ];
    });
    this.citydataService.getWorldData().subscribe((data) => {
      this.cityData = [
        ...this.cityData,
        ...this.getRandomElements(data, 5).map((element: RawCityData) => {
          return {
            city: element.city,
            country: element.country,
            guess: {
              lat: null,
              lng: null,
            },
            actual: {
              lat: element.lat,
              lng: element.lng,
            },
            distance: 0,
            score: 0,
          };
        }),
      ];
    });
  }
}
