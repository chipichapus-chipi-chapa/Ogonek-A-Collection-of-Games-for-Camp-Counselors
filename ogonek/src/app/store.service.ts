import { Injectable, computed, signal } from '@angular/core';
import { ActivityType, Game, UserState } from './models';
import { SEED } from './seed';

const KEY = 'ogonek.v1';

/** Встроенная база + то, что вожатый добавил сам (localStorage, работает офлайн). */
@Injectable({ providedIn: 'root' })
export class StoreService {
  readonly ages = SEED.ages;
  private readonly state = signal<UserState>(this.load());

  readonly fav = computed(() => this.state().fav);
  readonly myGames = computed(() => this.state().games);
  readonly myTypes = computed(() => this.state().types);
  readonly types = computed<ActivityType[]>(() => [...SEED.types, ...this.state().types]);
  readonly games = computed<Game[]>(() => [...SEED.games, ...this.state().games]);

  age(id: string) { return this.ages.find(a => a.id === id); }
  type(id: string) { return this.types().find(t => t.id === id); }
  game(id: string) { return this.games().find(g => g.id === id); }
  isFav(id: string) { return this.state().fav.includes(id); }
  isMine(g: Game | undefined) { return !!g && g.id.startsWith('u-'); }

  gamesFor(age: string, type?: string) {
    return this.games()
      .filter(g => g.ages.includes(age) && (!type || g.type === type))
      .sort(byTitle);
  }

  toggleFav(id: string) {
    this.update(s => ({ ...s, fav: s.fav.includes(id) ? s.fav.filter(x => x !== id) : [id, ...s.fav] }));
    return this.isFav(id);
  }

  saveGame(g: Game) {
    this.update(s => ({
      ...s,
      games: s.games.some(x => x.id === g.id) ? s.games.map(x => (x.id === g.id ? g : x)) : [...s.games, g]
    }));
  }

  deleteGame(id: string) {
    this.update(s => ({ ...s, games: s.games.filter(g => g.id !== id), fav: s.fav.filter(x => x !== id) }));
  }

  addType(title: string, icon: string): ActivityType | string {
    if (!title.trim()) return 'Напиши название фильтра';
    if (this.types().some(t => t.title.toLowerCase() === title.trim().toLowerCase())) return 'Такой фильтр уже есть';
    const t: ActivityType = { id: uid(), title: title.trim(), icon: icon.trim() || '★', note: 'Мой фильтр' };
    this.update(s => ({ ...s, types: [...s.types, t] }));
    return t;
  }

  /** Сколько своих игр использует фильтр. */
  typeUsage(id: string) {
    return this.state().games.filter(g => g.type === id).length;
  }

  /** Удаляет фильтр, если он не используется. */
  deleteType(id: string) {
    if (!this.typeUsage(id)) this.update(s => ({ ...s, types: s.types.filter(t => t.id !== id) }));
  }

  exportJson() {
    return JSON.stringify({ app: 'ogonek', v: 1, ...this.state() }, null, 2);
  }

  importJson(txt: string): number {
    const data = JSON.parse(txt);
    if (data.app !== 'ogonek') throw new Error('not ogonek');
    let added = 0;
    this.update(s => {
      const types = [...s.types];
      // фильтр с тем же названием (свой или встроенный) не дублируем — игры переезжают в него
      const remap = new Map<string, string>();
      (data.types || []).forEach((t: ActivityType) => {
        const same = [...SEED.types, ...types].find(x => x.id === t.id || x.title.toLowerCase() === t.title.toLowerCase());
        if (same) remap.set(t.id, same.id);
        else types.push(t);
      });
      const fresh = (data.games || [])
        .filter((g: Game) => !s.games.some(x => x.id === g.id))
        .map((g: Game) => ({ ...g, type: remap.get(g.type) ?? g.type }));
      added = fresh.length;
      return { types, games: [...s.games, ...fresh], fav: Array.from(new Set([...s.fav, ...(data.fav || [])])) };
    });
    return added;
  }

  newId() { return uid(); }

  private update(fn: (s: UserState) => UserState) {
    this.state.update(fn);
    try { localStorage.setItem(KEY, JSON.stringify(this.state())); } catch { /* приватный режим */ }
  }

  private load(): UserState {
    const empty: UserState = { fav: [], games: [], types: [] };
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...empty, ...JSON.parse(raw) } : empty;
    } catch {
      return empty;
    }
  }
}

export const byTitle = (a: { title: string }, b: { title: string }) => a.title.localeCompare(b.title, 'ru');
const uid = () => 'u-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
