import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Game } from '../models';
import { StoreService } from '../store.service';
import { OgonekComponent, ToastService, TopbarComponent } from '../ui';

/** Создание и правка своей статьи. /new?age=..&type=.. или /edit/:id */
@Component({
  selector: 'og-form',
  imports: [FormsModule, RouterLink, TopbarComponent, OgonekComponent],
  template: `
    @if (!id() || original()) {
      <div class="screen">
        <og-top [title]="id() ? 'Правка' : 'Новая'" hl="статья" fallback="/my" />
        <form class="form" (ngSubmit)="save()" novalidate>
          <div class="field"><label for="f-title">Название</label>
            <input type="text" id="f-title" name="title" [(ngModel)]="d.title" placeholder="Например: «Огоньки в темноте»" maxlength="120"></div>

          <div class="field"><span class="lbl">Для кого</span>
            <div class="pick">
              @for (a of store.ages; track a.id) {
                <button type="button" class="tog" [class.on]="ages().includes(a.id)" (click)="toggleAge(a.id)">{{ a.id === 'camp' ? 'Общелагерное' : a.title.replace(' возраст', '') }}</button>
              }
            </div>
            <div class="hint">Можно выбрать несколько возрастов</div></div>

          @if (!onlyCamp()) {
            <div class="field"><span class="lbl">Вид активности</span>
              <div class="pick">
                @for (t of store.types(); track t.id) {
                  <button type="button" class="tog" [class.on]="type() === t.id" (click)="type.set(t.id)">{{ t.icon }} {{ t.title }}</button>
                }
                <button type="button" class="tog add" (click)="showNewType.set(!showNewType())">+ свой фильтр</button>
              </div>
              @if (showNewType()) {
                <div class="newtype">
                  <input type="text" class="emoji" name="ntIcon" [(ngModel)]="ntIcon" placeholder="🔥" maxlength="4">
                  <input type="text" name="ntTitle" [(ngModel)]="ntTitle" placeholder="Название фильтра" maxlength="40">
                  <button type="button" class="btn" (click)="addType()">ОК</button>
                </div>
              }
            </div>
          }

          <div class="row3">
            <div class="field"><label for="f-time">Время</label><input type="text" id="f-time" name="time" [(ngModel)]="d.time" placeholder="10–15 мин"></div>
            <div class="field"><label for="f-players">Игроки</label><input type="text" id="f-players" name="players" [(ngModel)]="d.players" placeholder="от 8"></div>
            <div class="field"><label for="f-props">Инвентарь</label><input type="text" id="f-props" name="props" [(ngModel)]="d.props" placeholder="мяч, верёвка или «не нужен»"></div>
          </div>

          <div class="field"><label for="f-text">Описание</label>
            <textarea id="f-text" name="text" [(ngModel)]="d.text" placeholder="Как играть, правила, советы…"></textarea>
            <div class="hint">Оформление: <b>## Заголовок</b> · <b>- пункт списка</b> · <b>&gt; совет вожатому</b> · пустая строка — новый абзац</div></div>

          <div class="err">{{ err() }}</div>
          <button class="btn block" type="submit">{{ id() ? 'Сохранить' : 'Добавить в сборник' }}</button>
        </form>
      </div>
    } @else {
      <div class="screen"><og-top title="Упс" />
        <div class="empty"><og-ogonek mood="wow" [size]="120" /><p>Эту статью нельзя редактировать</p><a class="btn yellow" routerLink="/home">На главную</a></div></div>
    }`
})
export class FormPage implements OnInit {
  id = input<string>();
  age = input<string>();      // из ?age=
  typeQ = input<string>(undefined, { alias: 'type' }); // из ?type=

  store = inject(StoreService);
  private router = inject(Router);
  private toast = inject(ToastService);

  original = computed(() => {
    const g = this.id() ? this.store.game(this.id()!) : undefined;
    return this.store.isMine(g) ? g : undefined;
  });

  d = { title: '', time: '', players: '', props: '', text: '' };
  ages = signal<string[]>([]);
  type = signal('');
  showNewType = signal(false);
  ntTitle = '';
  ntIcon = '';
  err = signal('');
  onlyCamp = computed(() => this.ages().length > 0 && this.ages().every(a => a === 'camp'));

  ngOnInit() {
    const g = this.original();
    if (g) {
      this.d = { title: g.title, time: g.time || '', players: g.players || '', props: g.props || '', text: g.text };
      this.ages.set([...g.ages]);
      this.type.set(g.type);
    } else {
      if (this.age()) this.ages.set([this.age()!]);
      if (this.typeQ()) this.type.set(this.typeQ()!);
    }
  }

  toggleAge(id: string) {
    this.ages.update(l => (l.includes(id) ? l.filter(x => x !== id) : [...l, id]));
  }

  addType() {
    const r = this.store.addType(this.ntTitle, this.ntIcon);
    if (typeof r === 'string') return this.toast.show(r);
    this.type.set(r.id);
    this.ntTitle = this.ntIcon = '';
    this.showNewType.set(false);
    this.toast.show(`Фильтр «${r.title}» создан`);
  }

  save() {
    const type = this.onlyCamp() ? 'camp' : this.type();
    if (!this.d.title.trim()) return this.err.set('Добавь название');
    if (!this.ages().length) return this.err.set('Выбери, для кого эта игра');
    if (!type || (type === 'camp' && !this.onlyCamp())) return this.err.set('Выбери вид активности');
    if (!this.d.text.trim()) return this.err.set('Опиши, как играть');

    const g: Game = {
      id: this.original()?.id || this.store.newId(),
      type,
      ages: this.ages(),
      title: this.d.title.trim(),
      time: this.d.time.trim(),
      players: this.d.players.trim(),
      props: this.d.props.trim(),
      text: this.d.text.trim()
    };
    this.store.saveGame(g);
    this.toast.show(this.id() ? 'Сохранено' : 'Статья добавлена в сборник 🔥');
    // replaceUrl: «назад» со статьи не вернёт в форму
    this.router.navigate(['/game', g.id], { replaceUrl: true });
  }
}
