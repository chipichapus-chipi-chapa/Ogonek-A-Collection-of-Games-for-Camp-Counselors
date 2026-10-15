import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Game } from '../models';
import { StoreService } from '../store.service';

/** Строка игры в списке. */
@Component({
  selector: 'og-game-item',
  imports: [RouterLink],
  template: `
    <a class="item game" [routerLink]="['/game', game().id]">
      <span class="ic">{{ letter() }}</span>
      <span class="b">
        <span class="ttl">{{ game().title }}</span>
        <span class="meta">@if (store.isMine(game())) {<span class="mine">моя</span>}{{ meta() }}</span>
      </span>
      @if (store.isFav(game().id)) {<span class="fav-dot" aria-label="В избранном">♥</span>}
      <span class="chev"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></span>
    </a>`
})
export class GameItemComponent {
  game = input.required<Game>();
  hideType = input(false);
  store = inject(StoreService);
  letter = computed(() => this.game().title.replace(/[«"]/g, '').charAt(0).toUpperCase());
  meta = computed(() => {
    const g = this.game();
    const t = g.type === 'camp' || this.hideType() ? '' : this.store.type(g.type)?.title;
    return [t, g.time].filter(Boolean).join(' · ');
  });
}
