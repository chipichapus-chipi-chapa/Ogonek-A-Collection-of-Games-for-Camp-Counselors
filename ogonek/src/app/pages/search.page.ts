import { Component, Injectable, computed, inject, signal } from '@angular/core';
import { StoreService, byTitle, plural } from '../store.service';
import { GameItemComponent, OgonekComponent, TopbarComponent } from '../ui';

/** Состояние фильтров живёт в сервисе, чтобы не сбрасываться при переходе в игру и обратно. */
@Injectable({ providedIn: 'root' })
export class SearchState {
  q = signal('');
  ages = signal<string[]>([]);
  types = signal<string[]>([]);
  onlyFav = signal(false);
  onlyMine = signal(false);
}

@Component({
  selector: 'og-search',
  imports: [TopbarComponent, GameItemComponent, OgonekComponent],
  template: `
    <div class="screen">
      <og-top title="Поиск" hl="и фильтры" [noBack]="true" />
      <label class="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
        <input type="search" placeholder="Название или слово из текста" autocomplete="off" [value]="f.q()" (input)="f.q.set($any($event.target).value)">
      </label>
      <div class="filter-label">Возраст</div>
      <div class="toggles">
        @for (a of store.ages; track a.id) {
          <button class="tog" [class.on]="f.ages().includes(a.id)" (click)="toggle(f.ages, a.id)">{{ short(a.id, a.title) }}</button>
        }
      </div>
      <div class="filter-label">Вид активности</div>
      <div class="toggles">
        @for (t of store.types(); track t.id) {
          <button class="tog" [class.on]="f.types().includes(t.id)" (click)="toggle(f.types, t.id)">{{ t.icon }} {{ t.title }}</button>
        }
      </div>
      <div class="filter-label">Ещё</div>
      <div class="toggles">
        <button class="tog" [class.on]="f.onlyFav()" (click)="f.onlyFav.set(!f.onlyFav())">♥ Только избранное</button>
        <button class="tog" [class.on]="f.onlyMine()" (click)="f.onlyMine.set(!f.onlyMine())">✎ Только мои</button>
      </div>
      <div class="results-count">Нашлось: {{ results().length }} {{ word() }}</div>
      @if (results().length) {
        <div class="list">@for (g of results(); track g.id) { <og-game-item [game]="g" /> }</div>
      } @else {
        <div class="empty"><og-ogonek mood="wow" [size]="100" /><p>Ничего не нашлось. Попробуй убрать пару фильтров.</p></div>
      }
    </div>`
})
export class SearchPage {
  store = inject(StoreService);
  f = inject(SearchState);

  results = computed(() => {
    const q = this.f.q().trim().toLowerCase();
    const ages = this.f.ages(), types = this.f.types();
    return this.store.games().filter(g =>
      (!ages.length || g.ages.some(a => ages.includes(a))) &&
      (!types.length || types.includes(g.type)) &&
      (!this.f.onlyFav() || this.store.isFav(g.id)) &&
      (!this.f.onlyMine() || this.store.isMine(g)) &&
      (!q || `${g.title} ${g.text} ${g.props || ''}`.toLowerCase().includes(q))
    ).sort(byTitle);
  });
  word = computed(() => plural(this.results().length, 'игра', 'игры', 'игр'));

  toggle(sig: ReturnType<typeof signal<string[]>>, v: string) {
    sig.update(list => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]));
  }

  short(id: string, title: string) {
    return id === 'camp' ? 'Общелагерные' : title.replace(' возраст', '');
  }
}
