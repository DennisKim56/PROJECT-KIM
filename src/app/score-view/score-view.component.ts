import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultList } from '../types';

@Component({
  selector: 'app-score-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './score-view.component.html',
  styleUrl: './score-view.component.css',
})
export class ScoreViewComponent implements OnInit {
  scoreData: ResultList[] = [];
  ngOnInit(): void {
    if (localStorage.getItem('results') !== null) {
      this.scoreData = JSON.parse(localStorage.getItem('results')!).sort(
        (a: ResultList, b: ResultList) => b.totalScore - a.totalScore
      );
    }
  }
}
