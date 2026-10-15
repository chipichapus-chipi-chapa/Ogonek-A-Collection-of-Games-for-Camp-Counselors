/* Общие маленькие компоненты: Огонёк, шапка, строка игры, текст статьи, тост. */
import { Component, Injectable, computed, inject, input, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Game, Mood } from './models';
import { StoreService } from './store.service';

@Component({
  selector: 'og-ogonek',
  template: `<img class="ogonek" [src]="'img/ogonek/' + mood() + '.webp'" [width]="size()" [height]="size()" alt="" draggable="false">`,
  styles: [':host{display:inline-flex;flex:none} img{display:block;object-fit:contain;user-select:none}']
})
export class OgonekComponent {
  mood = input<Mood>('star');
  size = input(120);
}

/** Назад по истории (как системная кнопка телефона); если истории нет — на запасной экран. */
@Injectable({ providedIn: 'root' })
export class BackService {
  private location = inject(Location);
  private router = inject(Router);

  back(fallback = '/home') {
    const st = this.location.getState() as { navigationId?: number } | null;
    if (st?.navigationId && st.navigationId > 1) this.location.back();
    else this.router.navigateByUrl(fallback, { replaceUrl: true });
  }
}

@Component({
  selector: 'og-top',
  template: `
    <header class="top">
      @if (!noBack()) {
        <button class="icon-btn" (click)="nav.back(fallback())" aria-label="Назад">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
        </button>
      }
      <h1>{{ title() }} @if (hl()) {<span class="hl">{{ hl() }}</span>}</h1>
      <ng-content />
    </header>`
})
export class TopbarComponent {
  title = input('');
  hl = input('');
  noBack = input(false);
  fallback = input('/home');
  nav = inject(BackService);
}

@Component({
  selector: 'og-game-item',
  imports: [RouterLink],
  template: `
    <a class="item game" [routerLink]="['/game', game().id]">
      <span class="ic">{{ letter() }}</span>
      <span class="b">
        <span class="ttl">{{ game().title }}@if (store.isMine(game())) {<span class="mine">моя</span>}</span>
        <span class="meta">{{ meta() }}</span>
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

type Block =
  | { k: 'h'; html: string }
  | { k: 'p'; html: string }
  | { k: 'tip'; html: string }
  | { k: 'ul'; items: string[] };

/** Мини-разметка статьи: ## заголовок, - пункт, > совет, **жирный** */
@Component({
  selector: 'og-rich-text',
  imports: [OgonekComponent],
  template: `
    @for (b of blocks(); track $index) {
      @switch (b.k) {
        @case ('h') { <h3 [innerHTML]="b.html"></h3> }
        @case ('p') { <p [innerHTML]="b.html"></p> }
        @case ('tip') { <div class="tip"><og-ogonek mood="wink" [size]="44" /><div [innerHTML]="b.html"></div></div> }
        @case ('ul') { <ul>@for (li of b.items; track $index) {<li [innerHTML]="li"></li>}</ul> }
      }
    }`
})
export class RichTextComponent {
  text = input('');
  blocks = computed(() => parse(this.text()));
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const inline = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

function parse(src: string): Block[] {
  const out: Block[] = [];
  let list: string[] | null = null;
  const flush = () => { if (list) { out.push({ k: 'ul', items: list }); list = null; } };
  for (const line of src.split(/\r?\n/)) {
    const l = line.trim();
    if (!l) { flush(); continue; }
    if (l.startsWith('## ')) { flush(); out.push({ k: 'h', html: inline(l.slice(3)) }); }
    else if (l.startsWith('- ')) (list ??= []).push(inline(l.slice(2)));
    else if (l.startsWith('> ')) { flush(); out.push({ k: 'tip', html: inline(l.slice(2)) }); }
    else { flush(); out.push({ k: 'p', html: inline(l) }); }
  }
  flush();
  return out;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly msg = signal('');
  private t?: ReturnType<typeof setTimeout>;
  show(m: string) {
    this.msg.set(m);
    clearTimeout(this.t);
    this.t = setTimeout(() => this.msg.set(''), 1800);
  }
}
