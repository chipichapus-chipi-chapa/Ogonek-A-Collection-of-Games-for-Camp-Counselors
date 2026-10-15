import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OgonekComponent } from '../ui';

@Component({
  selector: 'og-splash',
  imports: [RouterLink, OgonekComponent],
  template: `
    <section class="splash">
      <div class="kraft"></div>
      <div class="star"><svg viewBox="0 0 100 100"><polygon fill="#D9302A" points="50,0 58,32 88,10 68,40 100,48 68,58 90,90 58,70 50,100 42,70 12,92 32,60 0,52 32,40 10,12 42,30"/></svg></div>
      <div class="content">
        <h1><span class="l1">Сборник</span><br><span class="hl l2">игр</span></h1>
        <div class="sub">вожатого</div>
        <div class="photo">
          <div class="og-float"><og-ogonek mood="wink" [size]="170" /></div>
          <div class="quote">гореть самому — <span class="hl">зажигать других</span></div>
        </div>
        <a class="btn yellow" routerLink="/home">Поехали!</a>
        <div class="org">СПО «Маэстро»</div>
      </div>
    </section>`
})
export class SplashPage {}
