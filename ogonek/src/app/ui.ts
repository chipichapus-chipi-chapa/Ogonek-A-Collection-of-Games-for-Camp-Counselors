/* Общие маленькие компоненты: Огонёк, шапка, строка игры, текст статьи, тост. */
import { Component, ElementRef, Injectable, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ActivityType, Game, Mood } from './models';
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

/** Поля «новый фильтр» (вид активности). Enter создаёт фильтр, а не отправляет внешнюю форму. */
@Component({
  selector: 'og-new-type',
  template: `
    <div class="newtype">
      <input type="text" class="emoji" [value]="icon()" (input)="icon.set($any($event.target).value)"
        (keydown.enter)="$event.preventDefault(); add()" placeholder="🔥" maxlength="4" aria-label="Значок фильтра">
      <input type="text" [value]="title()" (input)="title.set($any($event.target).value)"
        (keydown.enter)="$event.preventDefault(); add()" placeholder="Название фильтра" maxlength="40" aria-label="Название фильтра">
      <button type="button" class="btn" (click)="add()">ОК</button>
    </div>`
})
export class NewTypeComponent {
  created = output<ActivityType>();
  title = signal('');
  icon = signal('');
  private store = inject(StoreService);
  private toast = inject(ToastService);

  add() {
    const r = this.store.addType(this.title(), this.icon());
    if (typeof r === 'string') return this.toast.show(r);
    this.title.set('');
    this.icon.set('');
    this.toast.show(`Фильтр «${r.title}» создан`);
    this.created.emit(r);
  }
}

export interface ConfirmOptions {
  title: string;
  text?: string;
  ok?: string;
  cancel?: string;
  mood?: Mood;
}

/** Своё окно подтверждения вместо системного confirm(). ask() → Promise<boolean>. */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly current = signal<ConfirmOptions | null>(null);
  private resolve?: (v: boolean) => void;

  ask(opts: ConfirmOptions): Promise<boolean> {
    this.resolve?.(false);
    this.current.set(opts);
    return new Promise(r => (this.resolve = r));
  }

  /** Для canDeactivate: если окно открыто — закрываем его вместо перехода (кнопка «назад»). */
  allowLeave(): boolean {
    if (!this.current()) return true;
    this.close(false);
    return false;
  }

  close(result: boolean) {
    this.current.set(null);
    this.resolve?.(result);
    this.resolve = undefined;
  }
}

@Component({
  selector: 'og-confirm',
  imports: [OgonekComponent],
  host: { '(document:keydown.escape)': 'opts() && dlg.close(false)' },
  template: `
    @if (opts(); as o) {
      <div class="sheet-backdrop" (click)="dlg.close(false)"></div>
      <div class="confirm-sheet" role="alertdialog" aria-modal="true" aria-labelledby="cf-title" aria-describedby="cf-text">
        <og-ogonek class="cf-og" [mood]="o.mood || 'wow'" [size]="110" />
        <h2 id="cf-title">{{ o.title }}</h2>
        @if (o.text) { <p id="cf-text">{{ o.text }}</p> }
        <div class="cf-actions">
          <button class="btn ghost" (click)="dlg.close(false)" #cancel>{{ o.cancel || 'Отмена' }}</button>
          <button class="btn" (click)="dlg.close(true)">{{ o.ok || 'Удалить' }}</button>
        </div>
      </div>
    }`
})
export class ConfirmComponent {
  dlg = inject(ConfirmService);
  opts = this.dlg.current;
  private cancel = viewChild<ElementRef<HTMLButtonElement>>('cancel');

  constructor() {
    // фокус на «Отмена»: случайный Enter ничего не удалит
    effect(() => this.cancel()?.nativeElement.focus());
  }
}
