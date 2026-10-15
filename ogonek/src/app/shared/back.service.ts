import { Injectable, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

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
