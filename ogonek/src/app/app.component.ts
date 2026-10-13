import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ToastService } from './ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <main id="app" [class.no-tabs]="!tab()"><router-outlet /></main>
    @if (tab(); as t) {
      <nav class="tabbar">
        <a routerLink="/home" [class.on]="t === 'home'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg><span>Игры</span></a>
        <a routerLink="/search" [class.on]="t === 'search'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><span>Поиск</span></a>
        <a routerLink="/new" class="plus" aria-label="Новая статья">
          <span class="pl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span><em>Создать</em></a>
        <a routerLink="/fav" [class.on]="t === 'fav'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-9.3-9.2C1.6 7.8 3.6 4.5 7 4.5c2.1 0 3.6 1.3 5 3 1.4-1.7 2.9-3 5-3 3.4 0 5.4 3.3 4.3 6.3C19.5 15.4 12 20 12 20z"/></svg><span>Избранное</span></a>
        <a routerLink="/my" [class.on]="t === 'my'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></svg><span>Мои</span></a>
      </nav>
    }
    <div class="toast" [class.show]="toast.msg()" role="status">{{ toast.msg() }}</div>`
})
export class AppComponent {
  toast = inject(ToastService);
  tab = signal<string | undefined>(undefined);

  constructor() {
    const router = inject(Router);
    const route = inject(ActivatedRoute);
    const sub = router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      let r = route.snapshot;
      while (r.firstChild) r = r.firstChild;
      this.tab.set(r.data['tab']);
      // старшие — на бордовом фоне, как посты ком.состава
      document.body.classList.toggle('red', r.paramMap.get('ageId') === 'senior');
    });
    inject(DestroyRef).onDestroy(() => sub.unsubscribe());
  }
}
