import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../store.service';
import { BackService, ConfirmService, OgonekComponent, RichTextComponent, ToastService, TopbarComponent } from '../ui';

@Component({
  selector: 'og-game',
  imports: [RouterLink, TopbarComponent, OgonekComponent, RichTextComponent],
  template: `
    @if (game(); as g) {
      <div class="screen">
        <og-top>
          @if (canShare) {
            <button class="icon-btn" (click)="share()" aria-label="Поделиться">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>
            </button>
          }
          @if (mine()) {
            <a class="icon-btn" [routerLink]="['/edit', g.id]" aria-label="Редактировать">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></svg>
            </a>
          }
        </og-top>
        <article class="sheet">
          <div class="sheet-head">
            <og-ogonek class="corner" [mood]="fav() ? 'love' : 'star'" [size]="70" />
            <h2>{{ g.title }}</h2>
            <div class="chips">
              @for (a of g.ages; track a) { <span class="chip age">{{ store.age(a)?.title || a }}</span> }
              @if (type(); as t) { <span class="chip">{{ t.icon }} {{ t.title }}</span> }
              @if (mine()) { <span class="chip">✎ моя статья</span> }
            </div>
          </div>
          @if (facts().length) {
            <div class="facts">
              @for (f of facts(); track f[0]) { <div class="fact"><div class="k">{{ f[0] }}</div><div class="v">{{ f[1] }}</div></div> }
            </div>
          }
          <og-rich-text class="article" [text]="g.text" />
        </article>
        <div class="actions">
          <button class="btn fav-btn" [class.on]="fav()" (click)="toggleFav()">{{ fav() ? '♥ В избранном' : '♡ В избранное' }}</button>
        </div>
        @if (mine()) {
          <div class="actions"><button class="btn ghost" (click)="remove()">Удалить статью</button></div>
        }
      </div>
    } @else {
      <div class="screen"><og-top title="Упс" />
        <div class="empty"><og-ogonek mood="wow" [size]="120" /><p>Такой игры нет — может, её удалили?</p><a class="btn yellow" routerLink="/home">На главную</a></div></div>
    }`
})
export class GamePage {
  id = input.required<string>();
  store = inject(StoreService);
  private toast = inject(ToastService);
  private nav = inject(BackService);
  private dlg = inject(ConfirmService);
  canShare = typeof navigator !== 'undefined' && !!navigator.share;

  game = computed(() => this.store.game(this.id()));
  fav = computed(() => this.store.fav().includes(this.id()));
  mine = computed(() => this.store.isMine(this.game()));
  type = computed(() => {
    const g = this.game();
    return g && g.type !== 'camp' ? this.store.type(g.type) : undefined;
  });
  facts = computed(() => {
    const g = this.game();
    if (!g) return [];
    return ([['Время', g.time], ['Игроки', g.players], ['Инвентарь', g.props]] as [string, string | undefined][])
      .filter(f => !!f[1]);
  });

  toggleFav() {
    this.toast.show(this.store.toggleFav(this.id()) ? 'Добавлено в избранное ♥' : 'Убрано из избранного');
  }

  share() {
    const g = this.game()!;
    const plain = g.text.replace(/^## /gm, '').replace(/^> /gm, 'Совет: ').replace(/\*\*/g, '');
    navigator.share({ title: g.title, text: `${g.title}\n\n${plain}` }).catch(() => {});
  }

  async remove() {
    const ok = await this.dlg.ask({
      title: 'Удалить статью?',
      text: `«${this.game()!.title}» пропадёт с этого телефона. Вернуть её можно будет только из резервной копии.`,
      ok: 'Удалить'
    });
    if (!ok) return;
    this.store.deleteGame(this.id());
    this.toast.show('Статья удалена');
    this.nav.back('/my');
  }
}
