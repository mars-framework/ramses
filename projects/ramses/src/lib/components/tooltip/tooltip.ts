import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'm-tooltip',
  styleUrl: './tooltip.scss',
  templateUrl: './tooltip.html',
})
export class Tooltip {
  message = input.required<string>();
}
