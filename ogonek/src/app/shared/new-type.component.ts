import { Component, inject, output, signal } from '@angular/core';
import { ActivityType } from '../models';
import { StoreService } from '../store.service';
import { ToastService } from './toast.service';

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
