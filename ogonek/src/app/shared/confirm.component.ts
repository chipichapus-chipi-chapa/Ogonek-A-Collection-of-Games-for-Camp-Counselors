import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { OgonekComponent } from './ogonek.component';
import { ConfirmService } from './confirm.service';

/** Окно подтверждения: выезжает снизу, фокус на «Отмена», Escape и фон закрывают. */
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
