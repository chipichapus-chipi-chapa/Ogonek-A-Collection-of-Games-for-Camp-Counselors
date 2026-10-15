import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService, plural } from '../store.service';
import { GameItemComponent, OgonekComponent, TopbarComponent } from '../ui';

@Component({
  selector: 'og-games',
  imports: [RouterLink, TopbarComponent, GameItemComponent, OgonekComponent],
  template: `
    @if (age() && type() && ageId() !== 'camp') {
    <div class="screen">
      <og-top [title]="type()?.title || 'Игры'" [fallback]="'/age/' + ageId()" />
      <p class="lead pad">{{ age()?.title }} · <span class="hl">{{ list().length }} {{ word() }}</span></p>
      @if (list().length) {
        <div class="list">
          @for (g of list(); track g.id) { <og-game-item [game]="g" [hideType]="true" /> }
        </div>
      } @else {
        <div class="empty"><og-ogonek mood="sleepy" [size]="110" /><p>Здесь пока пусто.<br>Добавь свою игру — Огонёк проснётся!</p></div>
      }
      <div class="pad mt">
        <a class="btn ghost block" routerLink="/new" [queryParams]="{ age: ageId(), type: typeId() }">+ Добавить сюда игру</a>
      </div>
    </div>
    } @else {
      <div class="screen"><og-top title="Упс" />
        <div class="empty"><og-ogonek mood="wow" [size]="120" /><p>Такой страницы нет — может, фильтр удалили?</p><a class="btn yellow" routerLink="/home">На главную</a></div></div>
    }`
})
export class GamesPage {
  ageId = input.required<string>();
  typeId = input.required<string>();
  store = inject(StoreService);
  age = computed(() => this.store.age(this.ageId()));
  type = computed(() => this.store.type(this.typeId()));
  list = computed(() => this.store.gamesFor(this.ageId(), this.typeId()));
  word = computed(() => plural(this.list().length, 'игра', 'игры', 'игр'));
}
