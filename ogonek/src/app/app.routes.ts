import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AgePage } from './pages/age.page';
import { FavPage } from './pages/fav.page';
import { FormPage } from './pages/form.page';
import { GamePage } from './pages/game.page';
import { GamesPage } from './pages/games.page';
import { HomePage } from './pages/home.page';
import { MyPage } from './pages/my.page';
import { SearchPage } from './pages/search.page';
import { SplashPage } from './pages/splash.page';
import { ConfirmService } from './ui';

// data.tab — какая вкладка нижнего меню подсвечена (нет — меню скрыто)
const pages: Routes = [
  { path: '', component: SplashPage },
  { path: 'home', component: HomePage, data: { tab: 'home' } },
  { path: 'age/:ageId', component: AgePage, data: { tab: 'home' } },
  { path: 'age/:ageId/:typeId', component: GamesPage, data: { tab: 'home' } },
  { path: 'game/:id', component: GamePage, data: { tab: 'home' } },
  { path: 'search', component: SearchPage, data: { tab: 'search' } },
  { path: 'fav', component: FavPage, data: { tab: 'fav' } },
  { path: 'my', component: MyPage, data: { tab: 'my' } },
  { path: 'new', component: FormPage },
  { path: 'edit/:id', component: FormPage },
  { path: '**', redirectTo: 'home' }
];

// «назад» на телефоне при открытом окне подтверждения закрывает окно, а не уходит со страницы
export const routes: Routes = pages.map(r => (r.component ? { ...r, canDeactivate: [() => inject(ConfirmService).allowLeave()] } : r));
