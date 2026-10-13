import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Game } from '../models';
import { StoreService } from '../store.service';
import { GameItemComponent, OgonekComponent, TopbarComponent } from '../ui';

@Component({
  selector: 'og-fav',
  imports: [RouterLink, TopbarComponent, GameItemComponent, OgonekComponent],
  template: `
    <div class="screen">
      <og-top hl="Избранное" [noBack]="true" />
      @if (list().length) {
        <p class="lead pad">Твои любимые игры — всегда под рукой</p>
        <div class="list">@for (g of list(); track g.id) { <og-game-item [game]="g" /> }</div>
      } @else {
        <div class="empty">
          <og-ogonek mood="love" [size]="120" />
          <p>Тут будут игры, которые ты отметишь сердечком ♥</p>
          <a class="btn yellow" routerLink="/home">К играм</a>
        </div>
      }
    </div>`
})
export class FavPage {
  private store = inject(StoreService);
  list = computed(() => this.store.fav().map(id => this.store.game(id)).filter((g): g is Game => !!g));
}
