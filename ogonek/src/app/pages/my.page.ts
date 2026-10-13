import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService, byTitle, plural } from '../store.service';
import { GameItemComponent, OgonekComponent, ToastService, TopbarComponent } from '../ui';

@Component({
  selector: 'og-my',
  imports: [RouterLink, TopbarComponent, GameItemComponent, OgonekComponent],
  template: `
    <div class="screen">
      <og-top title="Мои" hl="статьи" [noBack]="true" />
      @if (games().length) {
        <div class="list">@for (g of games(); track g.id) { <og-game-item [game]="g" /> }</div>
      } @else {
        <div class="empty"><og-ogonek mood="cool" [size]="110" />
          <p>Знаешь классную игру? Запиши её — и она всегда будет с тобой, даже без интернета.</p></div>
      }
      <div class="pad mt"><a class="btn block" routerLink="/new">+ Новая статья</a></div>

      <div class="section-title">Мои <span class="hl">фильтры</span></div>
      <div class="mytypes">
        @for (t of store.myTypes(); track t.id) {
          <div class="mytype"><span>{{ t.icon }} {{ t.title }}</span>
            <button class="icon-btn" (click)="delType(t.id)" aria-label="Удалить фильтр">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>
            </button></div>
        } @empty {
          <p class="lead" style="margin:0">Свои виды активностей можно добавить при создании статьи</p>
        }
      </div>

      <div class="section-title">Резервная <span class="hl">копия</span></div>
      <div class="pad backup">
        <button class="btn ghost light block" (click)="exportFile()">Сохранить в файл</button>
        <label class="btn ghost light block">Загрузить из файла
          <input type="file" accept="application/json,.json" hidden (change)="importFile($event)"></label>
        <p class="lead small">Свои статьи и избранное хранятся только на этом телефоне. Сохрани файл, чтобы перенести их или поделиться с другим вожатым.</p>
      </div>
    </div>`
})
export class MyPage {
  store = inject(StoreService);
  private toast = inject(ToastService);
  games = computed(() => [...this.store.myGames()].sort(byTitle));

  delType(id: string) {
    const t = this.store.myTypes().find(x => x.id === id);
    if (!t || !confirm(`Удалить фильтр «${t.title}»?`)) return;
    const used = this.store.deleteType(id);
    if (used) this.toast.show(`Фильтр используется в ${used} ${plural(used, 'статье', 'статьях', 'статьях')}`);
  }

  exportFile() {
    const blob = new Blob([this.store.exportJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ogonek-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  importFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    file.text()
      .then(txt => this.toast.show(`Загружено статей: ${this.store.importJson(txt)}`))
      .catch(() => this.toast.show('Не получилось прочитать файл'))
      .finally(() => (input.value = ''));
  }
}
