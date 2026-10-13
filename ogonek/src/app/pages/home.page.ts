import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../store.service';
import { OgonekComponent, TopbarComponent } from '../ui';

@Component({
  selector: 'og-home',
  imports: [RouterLink, OgonekComponent, TopbarComponent],
  template: `
    <div class="screen">
      <og-top title="Кого" hl="зажигаем?" [noBack]="true" />
      <p class="lead pad">Выбери возраст отряда или <span class="hl">общелагерное дело</span></p>
      <div class="age-grid">
        @for (a of store.ages; track a.id) {
          <a class="age-card {{ a.color }}" [routerLink]="['/age', a.id]">
            <span class="t"><h2>{{ a.title }}</h2><span class="s">{{ a.sub }}</span></span>
            <og-ogonek [mood]="a.mood" [size]="96" />
          </a>
        }
      </div>
      <div class="quick">
        <a routerLink="/fav"><span class="ic">♥</span>Избранное<br>({{ store.fav().length }})</a>
        <a routerLink="/my"><span class="ic">✎</span>Мои статьи<br>({{ store.myGames().length }})</a>
      </div>
    </div>`
})
export class HomePage {
  store = inject(StoreService);
}
