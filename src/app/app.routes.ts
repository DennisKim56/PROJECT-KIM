import { Routes } from '@angular/router';
import { ErrorComponent } from './error/error.component';
import { HomeComponent } from './home/home.component';
import { LeafletMapComponent } from './leaflet-map/leaflet-map.component';
import { ScoreViewComponent } from './score-view/score-view.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'play',
    component: LeafletMapComponent,
  },
  {
    path: 'high-scores',
    component: ScoreViewComponent,
  },
  {
    path: '**',
    component: ErrorComponent,
  },
];
