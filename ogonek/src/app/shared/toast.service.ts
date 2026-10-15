import { Injectable, signal } from '@angular/core';

/** Короткая подсказка внизу экрана. */
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
