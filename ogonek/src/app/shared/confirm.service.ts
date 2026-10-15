import { Injectable, signal } from '@angular/core';
import { Mood } from '../models';

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
