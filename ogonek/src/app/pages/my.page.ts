import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService, byTitle, plural } from '../store.service';
import { ConfirmService, NewTypeComponent, OgonekComponent, ToastService, TopbarComponent } from '../ui';

type Tab = 'games' | 'types' | 'backup';
// выбранная вкладка переживает переход в игру и обратно
const tab = signal<Tab>('games');

const AGE_SHORT: Record<string, string> = { junior: '7–10', middle: '11–13', senior: '14–17', camp: 'лагерь' };

@Component({
  selector: 'og-my',
  imports: [RouterLink, TopbarComponent, OgonekComponent, NewTypeComponent],
  template: `
    <div class="screen">
      <og-top title="Моя" hl="копилка" [noBack]="true" />

      <div class="seg" role="tablist">
        <button role="tab" [class.on]="tab() === 'games'" [attr.aria-selected]="tab() === 'games'" (click)="tab.set('games')">
          Игры <span class="n">{{ games().length }}</span></button>
        <button role="tab" [class.on]="tab() === 'types'" [attr.aria-selected]="tab() === 'types'" (click)="tab.set('types')">
          Фильтры <span class="n">{{ store.myTypes().length }}</span></button>
        <button role="tab" [class.on]="tab() === 'backup'" [attr.aria-selected]="tab() === 'backup'" (click)="tab.set('backup')">Копия</button>
      </div>

      @switch (tab()) {
        @case ('games') {
          @if (games().length) {
            <div class="list">
              @for (g of games(); track g.id) {
                <div class="mycard">
                  <a class="mc-body" [routerLink]="['/game', g.id]">
                    <span class="mc-title">{{ g.title }}</span>
                    <span class="mc-meta">
                      @for (a of g.ages; track a) { <span class="mc-age">{{ ageShort(a) }}</span> }
                      @if (typeLabel(g.type); as t) { <span class="mc-type">{{ t }}</span> }
                      @if (store.isFav(g.id)) { <span class="mc-fav" aria-label="В избранном">♥</span> }
                    </span>
                  </a>
                  <a class="icon-btn mc-edit" [routerLink]="['/edit', g.id]" aria-label="Редактировать">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></svg>
                  </a>
                </div>
              }
            </div>
          } @else {
            <div class="empty"><og-ogonek mood="point" [size]="120" />
              <p>Знаешь классную игру? Запиши её — и она всегда будет с тобой, даже без интернета.</p></div>
          }
          <div class="pad mt"><a class="btn block" routerLink="/new">+ Новая игра</a></div>
        }

        @case ('types') {
          <p class="lead pad">Свой вид активности появится <span class="hl">во всех возрастах</span></p>
          <div class="mytypes">
            @for (t of store.myTypes(); track t.id) {
              <div class="mytype">
                <span class="mt-ic">{{ t.icon || '★' }}</span>
                <span class="mt-t">{{ t.title }}<small>{{ usage(t.id) }}</small></span>
                <button class="icon-btn" (click)="delType(t.id)" aria-label="Удалить фильтр">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>
                </button>
              </div>
            }
            <og-new-type />
          </div>
        }

        @case ('backup') {
          <div class="pad backup">
            <p class="lead small">Свои игры, фильтры и избранное хранятся <span class="hl">только на этом телефоне</span>. Сохрани файл, чтобы перенести их или поделиться с другим вожатым.</p>
            <button class="btn ghost light block" (click)="exportFile()">Сохранить в файл</button>
            <label class="btn ghost light block">Загрузить из файла
              <input type="file" accept="application/json,.json" hidden (change)="importFile($event)"></label>
          </div>
        }
      }
    </div>`
})
export class MyPage {
  store = inject(StoreService);
  private toast = inject(ToastService);
  private dlg = inject(ConfirmService);
  tab = tab;
  games = computed(() => [...this.store.myGames()].sort(byTitle));

  ageShort(id: string) { return AGE_SHORT[id] ?? id; }

  typeLabel(id: string) {
    if (id === 'camp') return '';
    const t = this.store.type(id);
    return t ? `${t.icon} ${t.title}` : '';
  }

  usage(id: string) {
    const n = this.store.typeUsage(id);
    return n ? `${n} ${plural(n, 'игра', 'игры', 'игр')}` : 'пока пусто';
  }

  async delType(id: string) {
    const t = this.store.myTypes().find(x => x.id === id);
    if (!t) return;
    const used = this.store.typeUsage(id);
    if (used) return this.toast.show(`Фильтр используется в ${used} ${plural(used, 'игре', 'играх', 'играх')}`);
    const ok = await this.dlg.ask({
      title: 'Удалить фильтр?',
      text: `«${t.title}» исчезнет из всех возрастов. Игр в нём нет, так что ничего не потеряется.`,
      ok: 'Удалить',
      mood: 'sleepy'
    });
    if (!ok) return;
    this.store.deleteType(id);
    this.toast.show(`Фильтр «${t.title}» удалён`);
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
      .then(txt => this.toast.show(`Загружено игр: ${this.store.importJson(txt)}`))
      .catch(() => this.toast.show('Не получилось прочитать файл'))
      .finally(() => (input.value = ''));
  }
}
