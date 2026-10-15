import { Component, input } from '@angular/core';
import { Mood } from '../models';

/** Огонёк — рисунок из public/img/ogonek/<mood>.webp */
@Component({
  selector: 'og-ogonek',
  template: `<img class="ogonek" [src]="'img/ogonek/' + mood() + '.webp'" [width]="size()" [height]="size()" alt="" draggable="false">`,
  styles: [':host{display:inline-flex;flex:none} img{display:block;object-fit:contain;user-select:none}']
})
export class OgonekComponent {
  mood = input<Mood>('star');
  size = input(120);
}
