import { Component, inject, input } from '@angular/core';
import { BackService } from './back.service';

/** Шапка экрана: «назад», заголовок с жёлтым выделением, место для кнопок справа. */
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
