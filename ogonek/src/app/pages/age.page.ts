import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../store.service';
import { GameItemComponent, OgonekComponent, TopbarComponent } from '../ui';

/** Возраст → список видов активности. Для общелагерных — сразу список мероприятий. */
@Component({
  selector: 'og-age',
  imports: [RouterLink, TopbarComponent, GameItemComponent, OgonekComponent],
  template: `
    @if (age(); as a) {
      <div class="screen">
        <og-top [title]="a.title" />
        @if (a.id === 'camp') {
          <p class="lead pad">Большие дела <span class="hl">для всего лагеря</span></p>
          <div class="list">
            @for (g of store.gamesFor('camp'); track g.id) { <og-game-item [game]="g" /> }
          </div>
          <div class="pad mt"><a class="btn ghost block" routerLink="/new" [queryParams]="{ age: 'camp' }">+ Добавить мероприятие</a></div>
        } @else {
          <p class="lead pad">{{ a.sub }} · <span class="hl">выбери вид активности</span></p>
          <div class="list">
            @for (t of store.types(); track t.id) {
              @let n = store.gamesFor(a.id, t.id).length;
              <a class="item" [routerLink]="['/age', a.id, t.id]">
                <span class="ic">{{ t.icon || '★' }}</span>
                <span class="b"><span class="ttl">{{ t.title }}</span><span class="meta">{{ t.note || 'Мой фильтр' }}</span></span>
                <span class="cnt" [class.zero]="!n">{{ n }}</span>
              </a>
            }
          </div>
        }
      </div>
    } @else {
      <div class="screen"><og-top title="Упс" />
        <div class="empty"><og-ogonek mood="wow" [size]="120" /><p>Такой страницы нет</p><a class="btn yellow" routerLink="/home">На главную</a></div></div>
    }`
})
export class AgePage {
  ageId = input.required<string>();
  store = inject(StoreService);
  age = computed(() => this.store.age(this.ageId()));
}
