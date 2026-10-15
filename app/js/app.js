/* Огонёк — сборник игр вожатого. Всё работает офлайн: данные в data.js, свои статьи и избранное в localStorage. */
(function () {
  'use strict';

  /* ───────── Хранилище ───────── */
  const KEY = 'ogonek.v1';
  const store = (() => {
    let state = { fav: [], games: [], types: [] };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) state = Object.assign(state, JSON.parse(raw));
    } catch (e) { /* приватный режим — работаем в памяти */ }
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
    return {
      get: () => state,
      save,
      replace(next) { state = Object.assign({ fav: [], games: [], types: [] }, next); save(); }
    };
  })();

  const S = window.SEED;
  const allTypes = () => S.types.concat(store.get().types);
  const allGames = () => S.games.concat(store.get().games);
  const ageById = id => S.ages.find(a => a.id === id);
  const typeById = id => allTypes().find(t => t.id === id);
  const gameById = id => allGames().find(g => g.id === id);
  const isFav = id => store.get().fav.includes(id);
  const isMine = g => g && String(g.id).startsWith('u-');
  const gamesFor = (age, type) => allGames().filter(g => g.ages.includes(age) && (!type || g.type === type));
  const byTitle = (a, b) => a.title.localeCompare(b.title, 'ru');

  /* ───────── Утилиты ───────── */
  const $app = document.getElementById('app');
  const $tabs = document.getElementById('tabbar');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => 'u-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const go = (hash, replace) => replace ? location.replace('#' + hash) : (location.hash = hash);

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove('show'), 1800);
  }

  // Назад: в истории браузера (системная кнопка телефона делает то же самое)
  function back(fallback) {
    if (history.length > 1 && sessionStorage.getItem('ogonek.nav')) history.back();
    else go(fallback || '/home', true);
  }

  const I = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    chev: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-9.3-9.2C1.6 7.8 3.6 4.5 7 4.5c2.1 0 3.6 1.3 5 3 1.4-1.7 2.9-3 5-3 3.4 0 5.4 3.3 4.3 6.3C19.5 15.4 12 20 12 20z"/></svg>',
    heartFull: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7.5-4.6-9.3-9.2C1.6 7.8 3.6 4.5 7 4.5c2.1 0 3.6 1.3 5 3 1.4-1.7 2.9-3 5-3 3.4 0 5.4 3.3 4.3 6.3C19.5 15.4 12 20 12 20z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
    star: '<svg viewBox="0 0 100 100"><polygon fill="#D9302A" points="50,0 58,32 88,10 68,40 100,48 68,58 90,90 58,70 50,100 42,70 12,92 32,60 0,52 32,40 10,12 42,30"/></svg>'
  };

  function topbar(title, opts = {}) {
    return `<header class="top">
      ${opts.noBack ? '' : `<button class="icon-btn" data-act="back" data-fallback="${esc(opts.fallback || '/home')}" aria-label="Назад">${I.back}</button>`}
      <h1>${title}</h1>
      ${opts.right || ''}
    </header>`;
  }

  /* Мини-разметка статьи: ## заголовок, - пункт, > совет, **жирный** */
  function renderText(src) {
    const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    const out = [];
    let list = null;
    const flush = () => { if (list) { out.push('<ul>' + list.join('') + '</ul>'); list = null; } };
    String(src || '').split(/\r?\n/).forEach(line => {
      const l = line.trim();
      if (!l) { flush(); return; }
      if (l.startsWith('## ')) { flush(); out.push(`<h3>${inline(l.slice(3))}</h3>`); }
      else if (l.startsWith('- ')) { (list = list || []).push(`<li>${inline(l.slice(2))}</li>`); }
      else if (l.startsWith('> ')) { flush(); out.push(`<div class="tip">${ogonek('wink', 44)}<div>${inline(l.slice(2))}</div></div>`); }
      else { flush(); out.push(`<p>${inline(l)}</p>`); }
    });
    flush();
    return out.join('');
  }

  const gameItem = (g, hideType) => {
    const t = typeById(g.type);
    const meta = [g.type === 'camp' || hideType === true ? '' : (t ? t.title : ''), g.time].filter(Boolean).join(' · ');
    return `<a class="item game" href="#/game/${encodeURIComponent(g.id)}">
      <span class="ic">${esc(g.title.replace(/[«"]/g, '').charAt(0).toUpperCase())}</span>
      <span class="b"><span class="ttl">${esc(g.title)}${isMine(g) ? '<span class="mine">моя</span>' : ''}</span>
        <span class="meta">${esc(meta)}</span></span>
      ${isFav(g.id) ? `<span class="fav-dot" aria-label="В избранном">♥</span>` : ''}
      <span class="chev">${I.chev}</span>
    </a>`;
  };

  /* ───────── Экраны ───────── */
  const views = {
    splash() {
      return `<section class="splash screen">
        <div class="kraft"></div>
        <div class="star">${I.star}</div>
        <div class="content">
          <h1>Сборник<br><span class="hl">игр</span></h1>
          <div class="sub">вожатого</div>
          <div class="photo">
            ${ogonek('wink', 170)}
            <div class="quote">гореть самому — <span class="hl">зажигать других</span></div>
          </div>
          <a class="btn yellow" href="#/home">Поехали!</a>
          <div class="org">СПО «Маэстро»</div>
        </div>
      </section>`;
    },

    home() {
      const cards = S.ages.map(a => `
        <a class="age-card ${a.color}" href="#/age/${a.id}">
          <span class="t"><h2>${esc(a.title)}</h2><span class="s">${esc(a.sub)}</span></span>
          ${ogonek(a.mood, 96)}
        </a>`).join('');
      const fav = store.get().fav.length;
      const mine = store.get().games.length;
      return `<div class="screen">
        ${topbar('Кого <span class="hl">зажигаем</span>?', { noBack: true })}
        <p class="lead pad">Выбери возраст отряда или <span class="hl">общелагерное дело</span></p>
        <div class="age-grid">${cards}</div>
        <div class="quick">
          <a href="#/fav"><span class="ic">♥</span>Избранное<br>(${fav})</a>
          <a href="#/my"><span class="ic">✎</span>Мои статьи<br>(${mine})</a>
        </div>
      </div>`;
    },

    age(ageId) {
      const age = ageById(ageId);
      if (!age) return views.notFound();
      if (ageId === 'camp') {
        const list = gamesFor('camp').sort(byTitle);
        return `<div class="screen">
          ${topbar(esc(age.title))}
          <p class="lead pad">Большие дела <span class="hl">для всего лагеря</span></p>
          <div class="list">${list.map(gameItem).join('')}</div>
          <div class="pad" style="margin-top:16px"><a class="btn ghost block" href="#/new?age=camp">+ Добавить мероприятие</a></div>
        </div>`;
      }
      const rows = allTypes().map(t => {
        const n = gamesFor(ageId, t.id).length;
        return `<a class="item" href="#/age/${ageId}/${encodeURIComponent(t.id)}">
          <span class="ic">${esc(t.icon || '★')}</span>
          <span class="b"><span class="ttl">${esc(t.title)}</span><span class="meta">${esc(t.note || 'Мой фильтр')}</span></span>
          <span class="cnt ${n ? '' : 'zero'}">${n}</span>
        </a>`;
      }).join('');
      return `<div class="screen">
        ${topbar(esc(age.title))}
        <p class="lead pad">${esc(age.sub)} · <span class="hl">выбери вид активности</span></p>
        <div class="list">${rows}</div>
      </div>`;
    },

    games(ageId, typeId) {
      const age = ageById(ageId), type = typeById(typeId);
      if (!age || !type) return views.notFound();
      const list = gamesFor(ageId, typeId).sort(byTitle);
      const body = list.length
        ? `<div class="list">${list.map(g => gameItem(g, true)).join('')}</div>`
        : `<div class="empty">${ogonek('sleepy', 110)}<p>Здесь пока пусто.<br>Добавь свою игру — Огонёк проснётся!</p></div>`;
      return `<div class="screen">
        ${topbar(esc(type.title), { fallback: '/age/' + ageId })}
        <p class="lead pad">${esc(age.title)} · <span class="hl">${list.length} ${plural(list.length, 'игра', 'игры', 'игр')}</span></p>
        ${body}
        <div class="pad" style="margin-top:16px"><a class="btn ghost block" href="#/new?age=${ageId}&type=${encodeURIComponent(typeId)}">+ Добавить сюда игру</a></div>
      </div>`;
    },

    game(id) {
      const g = gameById(id);
      if (!g) return views.notFound();
      const t = typeById(g.type);
      const ages = g.ages.map(a => `<span class="chip age">${esc(ageById(a)?.title || a)}</span>`).join('');
      const fav = isFav(g.id);
      const facts = [['Время', g.time], ['Игроки', g.players], ['Инвентарь', g.props]]
        .filter(f => f[1]).map(f => `<div class="fact"><div class="k">${f[0]}</div><div class="v">${esc(f[1])}</div></div>`).join('');
      const mine = isMine(g);
      return `<div class="screen">
        ${topbar('', {
          fallback: '/home',
          right: `${navigator.share ? `<button class="icon-btn" data-act="share" data-id="${esc(g.id)}" aria-label="Поделиться">${I.share}</button>` : ''}
            ${mine ? `<a class="icon-btn" href="#/edit/${encodeURIComponent(g.id)}" aria-label="Редактировать">${I.pen}</a>` : ''}`
        })}
        <article class="sheet">
          <div class="sheet-head">
            ${ogonek(fav ? 'love' : 'star', 70)}
            <h2>${esc(g.title)}</h2>
            <div class="chips">${ages}${t && g.type !== 'camp' ? `<span class="chip">${esc(t.icon || '')} ${esc(t.title)}</span>` : ''}${mine ? '<span class="chip">✎ моя статья</span>' : ''}</div>
          </div>
          ${facts ? `<div class="facts">${facts}</div>` : ''}
          <div class="article">${renderText(g.text)}</div>
        </article>
        <div class="actions">
          <button class="btn fav-btn ${fav ? 'on' : ''}" data-act="fav" data-id="${esc(g.id)}">${fav ? '♥ В избранном' : '♡ В избранное'}</button>
        </div>
        ${mine ? `<div class="actions"><button class="btn ghost" data-act="del" data-id="${esc(g.id)}">Удалить статью</button></div>` : ''}
      </div>`;
    },

    search() {
      const f = searchState;
      return `<div class="screen">
        ${topbar('Поиск <span class="hl">и фильтры</span>', { noBack: true })}
        <label class="search">${I.search}<input id="q" type="search" placeholder="Название или слово из текста" value="${esc(f.q)}" autocomplete="off"></label>
        <div class="filter-label">Возраст</div>
        <div class="toggles" id="f-age">${S.ages.map(a => `<button class="tog ${f.ages.includes(a.id) ? 'on' : ''}" data-v="${a.id}">${esc(a.id === 'camp' ? 'Общелагерные' : a.title.replace(' возраст', ''))}</button>`).join('')}</div>
        <div class="filter-label">Вид активности</div>
        <div class="toggles" id="f-type">${allTypes().map(t => `<button class="tog ${f.types.includes(t.id) ? 'on' : ''}" data-v="${esc(t.id)}">${esc(t.icon || '')} ${esc(t.title)}</button>`).join('')}</div>
        <div class="filter-label">Ещё</div>
        <div class="toggles" id="f-more">
          <button class="tog ${f.fav ? 'on' : ''}" data-v="fav">♥ Только избранное</button>
          <button class="tog ${f.mine ? 'on' : ''}" data-v="mine">✎ Только мои</button>
        </div>
        <div id="results"></div>
      </div>`;
    },

    fav() {
      const list = store.get().fav.map(gameById).filter(Boolean);
      return `<div class="screen">
        ${topbar('<span class="hl">Избранное</span>', { noBack: true })}
        ${list.length
          ? `<p class="lead pad">Твои любимые игры — всегда под рукой</p><div class="list">${list.map(gameItem).join('')}</div>`
          : `<div class="empty">${ogonek('love', 120)}<p>Тут будут игры, которые ты отметишь сердечком ♥</p><a class="btn yellow" href="#/home">К играм</a></div>`}
      </div>`;
    },

    my() {
      const st = store.get();
      const games = st.games.slice().sort(byTitle);
      return `<div class="screen">
        ${topbar('Мои <span class="hl">статьи</span>', { noBack: true })}
        ${games.length
          ? `<div class="list">${games.map(gameItem).join('')}</div>`
          : `<div class="empty">${ogonek('point', 130)}<p>Знаешь классную игру? Запиши её — и она всегда будет с тобой, даже без интернета.</p></div>`}
        <div class="pad" style="margin-top:14px"><a class="btn block" href="#/new">+ Новая игра</a></div>

        <div class="section-title">Мои <span class="hl">фильтры</span></div>
        <div class="mytypes">
          ${st.types.length ? st.types.map(t => `<div class="mytype"><span>${esc(t.icon || '★')} ${esc(t.title)}</span>
            <button class="icon-btn" data-act="deltype" data-id="${esc(t.id)}" aria-label="Удалить фильтр">${I.trash}</button></div>`).join('')
            : `<p class="lead" style="margin:0">Свои виды активностей можно добавить при создании статьи</p>`}
        </div>

        <div class="section-title">Резервная <span class="hl">копия</span></div>
        <div class="pad" style="display:grid;gap:10px">
          <button class="btn ghost block" data-act="export" style="color:var(--cream);border-color:var(--cream)">Сохранить в файл</button>
          <label class="btn ghost block" style="color:var(--cream);border-color:var(--cream)">Загрузить из файла<input type="file" id="import" accept="application/json,.json" hidden></label>
          <p class="lead" style="font-size:17px">Свои статьи и избранное хранятся только на этом телефоне. Сохрани файл, чтобы перенести их или поделиться с другим вожатым.</p>
        </div>
      </div>`;
    },

    form(id, params) {
      const g = id ? gameById(id) : null;
      if (id && !isMine(g)) return views.notFound();
      const d = g || { title: '', ages: params.get('age') ? [params.get('age')] : [], type: params.get('type') || '', time: '', players: '', props: '', text: '' };
      formState = { ages: d.ages.slice(), type: d.type };
      return `<div class="screen">
        ${topbar(g ? 'Правка <span class="hl">игры</span>' : 'Новая <span class="hl">игра</span>', { fallback: '/my' })}
        <form class="form" id="gform" novalidate>
          <div class="field"><label for="f-title">Название</label>
            <input type="text" id="f-title" value="${esc(d.title)}" placeholder="Например: «Огоньки в темноте»" maxlength="120"></div>
          <div class="field"><span class="lbl">Для кого</span>
            <div class="pick" id="p-age">${S.ages.map(a => `<button type="button" class="tog ${d.ages.includes(a.id) ? 'on' : ''}" data-v="${a.id}">${esc(a.id === 'camp' ? 'Общелагерное' : a.title.replace(' возраст', ''))}</button>`).join('')}</div>
            <div class="hint">Можно выбрать несколько возрастов</div></div>
          <div class="field" id="type-field"><span class="lbl">Вид активности</span>
            <div class="pick" id="p-type">${typePicks(d.type)}</div>
            <div class="newtype" id="newtype">
              <input type="text" class="emoji" id="nt-icon" placeholder="🔥" maxlength="4">
              <input type="text" id="nt-title" placeholder="Название фильтра" maxlength="40">
              <button type="button" class="btn" data-act="addtype">ОК</button>
            </div></div>
          <div class="row3">
            <div class="field"><label for="f-time">Время</label><input type="text" id="f-time" value="${esc(d.time)}" placeholder="10–15 мин"></div>
            <div class="field"><label for="f-players">Игроки</label><input type="text" id="f-players" value="${esc(d.players)}" placeholder="от 8"></div>
            <div class="field"><label for="f-props">Инвентарь</label><input type="text" id="f-props" value="${esc(d.props)}" placeholder="мяч, верёвка или «не нужен»"></div>
          </div>
          <div class="field"><label for="f-text">Описание</label>
            <textarea id="f-text" placeholder="Как играть, правила, советы…">${esc(d.text)}</textarea>
            <div class="hint">Оформление: <b>## Заголовок</b> · <b>- пункт списка</b> · <b>&gt; совет вожатому</b> · пустая строка — новый абзац</div></div>
          <div class="err" id="f-err"></div>
          <button class="btn block" type="submit">${g ? 'Сохранить' : 'Добавить в сборник'}</button>
        </form>
      </div>`;
    },

    notFound() {
      return `<div class="screen">${topbar('Упс')}<div class="empty">${ogonek('wow', 120)}<p>Такой страницы нет — может, её удалили?</p><a class="btn yellow" href="#/home">На главную</a></div></div>`;
    }
  };

  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  let searchState = { q: '', ages: [], types: [], fav: false, mine: false };
  let formState = { ages: [], type: '' };

  function typePicks(sel) {
    return allTypes().map(t => `<button type="button" class="tog ${t.id === sel ? 'on' : ''}" data-v="${esc(t.id)}">${esc(t.icon || '')} ${esc(t.title)}</button>`).join('')
      + `<button type="button" class="tog add" data-act="newtype">+ свой фильтр</button>`;
  }

  function renderResults() {
    const f = searchState;
    const q = f.q.trim().toLowerCase();
    const list = allGames().filter(g =>
      (!f.ages.length || g.ages.some(a => f.ages.includes(a))) &&
      (!f.types.length || f.types.includes(g.type)) &&
      (!f.fav || isFav(g.id)) &&
      (!f.mine || isMine(g)) &&
      (!q || (g.title + ' ' + g.text + ' ' + (g.props || '')).toLowerCase().includes(q))
    ).sort(byTitle);
    document.getElementById('results').innerHTML = `
      <div class="results-count">Нашлось: ${list.length} ${plural(list.length, 'игра', 'игры', 'игр')}</div>
      ${list.length ? `<div class="list">${list.map(gameItem).join('')}</div>` : `<div class="empty">${ogonek('wow', 100)}<p>Ничего не нашлось. Попробуй убрать пару фильтров.</p></div>`}`;
  }

  /* ───────── Роутер ───────── */
  const scrolls = {};
  let current = '';

  function route() {
    const raw = location.hash.slice(1) || '/';
    const [path, query] = raw.split('?');
    const params = new URLSearchParams(query || '');
    const p = path.split('/').filter(Boolean).map(decodeURIComponent);

    if (current) scrolls[current] = window.scrollY;
    current = raw;

    let html, tab = null, red = false;
    if (!p.length) html = views.splash();
    else if (p[0] === 'home') { html = views.home(); tab = 'home'; }
    else if (p[0] === 'age' && p.length === 2) { html = views.age(p[1]); tab = 'home'; red = p[1] === 'senior'; }
    else if (p[0] === 'age' && p.length === 3) { html = views.games(p[1], p[2]); tab = 'home'; red = p[1] === 'senior'; }
    else if (p[0] === 'game') { html = views.game(p[1]); tab = 'home'; }
    else if (p[0] === 'search') { html = views.search(); tab = 'search'; }
    else if (p[0] === 'fav') { html = views.fav(); tab = 'fav'; }
    else if (p[0] === 'my') { html = views.my(); tab = 'my'; }
    else if (p[0] === 'new') { html = views.form(null, params); }
    else if (p[0] === 'edit') { html = views.form(p[1], params); }
    else html = views.notFound();

    document.body.classList.toggle('red', red);
    $app.innerHTML = html;
    $app.classList.toggle('no-tabs', !tab);
    renderTabs(tab);
    if (p[0] === 'search') renderResults();
    window.scrollTo(0, scrolls[raw] || 0);
    if (p.length) sessionStorage.setItem('ogonek.nav', '1');
  }

  function renderTabs(active) {
    if (!active) { $tabs.hidden = true; return; }
    $tabs.hidden = false;
    const t = (id, href, icon, label) => `<a href="${href}" class="${active === id ? 'on' : ''}" ${active === id ? 'aria-current="page"' : ''}>${icon}<span>${label}</span></a>`;
    $tabs.innerHTML = t('home', '#/home', I.home, 'Игры') + t('search', '#/search', I.search, 'Поиск')
      + `<a href="#/new" class="plus" aria-label="Новая игра"><span class="pl">${I.plus}</span><em>Создать</em></a>`
      + t('fav', '#/fav', I.heart, 'Избранное') + t('my', '#/my', I.pen, 'Мои');
  }

  /* ───────── Действия ───────── */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act], .toggles .tog, .pick .tog');
    if (!el) return;
    const act = el.dataset.act;
    const st = store.get();

    if (act === 'back') return back(el.dataset.fallback);

    if (act === 'fav') {
      const id = el.dataset.id;
      st.fav = isFav(id) ? st.fav.filter(x => x !== id) : [id].concat(st.fav);
      store.save();
      toast(isFav(id) ? 'Добавлено в избранное ♥' : 'Убрано из избранного');
      const y = window.scrollY; route(); window.scrollTo(0, y);
      return;
    }

    if (act === 'share') {
      const g = gameById(el.dataset.id);
      const plain = g.text.replace(/^## /gm, '').replace(/^> /gm, 'Совет: ').replace(/\*\*/g, '');
      navigator.share({ title: g.title, text: `${g.title}\n\n${plain}` }).catch(() => {});
      return;
    }

    if (act === 'del') {
      if (!confirm('Удалить статью? Это нельзя отменить.')) return;
      const id = el.dataset.id;
      st.games = st.games.filter(g => g.id !== id);
      st.fav = st.fav.filter(x => x !== id);
      store.save();
      toast('Статья удалена');
      return back('/my');
    }

    if (act === 'deltype') {
      const id = el.dataset.id;
      const used = st.games.filter(g => g.type === id).length;
      if (used) return toast(`Фильтр используется в ${used} ${plural(used, 'статье', 'статьях', 'статьях')}`);
      if (!confirm('Удалить фильтр?')) return;
      st.types = st.types.filter(t => t.id !== id);
      store.save(); route();
      return;
    }

    if (act === 'export') {
      const blob = new Blob([JSON.stringify({ app: 'ogonek', v: 1, ...st }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `ogonek-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      return;
    }

    if (act === 'newtype') {
      document.getElementById('newtype').classList.toggle('show');
      document.getElementById('nt-title').focus();
      return;
    }

    if (act === 'addtype') {
      const title = document.getElementById('nt-title').value.trim();
      if (!title) return toast('Напиши название фильтра');
      if (allTypes().some(t => t.title.toLowerCase() === title.toLowerCase())) return toast('Такой фильтр уже есть');
      const t = { id: uid(), title, icon: document.getElementById('nt-icon').value.trim() || '★', note: 'Мой фильтр' };
      st.types.push(t); store.save();
      formState.type = t.id;
      document.getElementById('p-type').innerHTML = typePicks(t.id);
      document.getElementById('newtype').classList.remove('show');
      document.getElementById('nt-title').value = ''; document.getElementById('nt-icon').value = '';
      toast('Фильтр «' + title + '» создан');
      return;
    }

    // фильтры поиска
    const box = el.parentElement && el.parentElement.id;
    if (box === 'f-age' || box === 'f-type') {
      const key = box === 'f-age' ? 'ages' : 'types', v = el.dataset.v;
      searchState[key] = searchState[key].includes(v) ? searchState[key].filter(x => x !== v) : searchState[key].concat(v);
      el.classList.toggle('on'); renderResults(); return;
    }
    if (box === 'f-more') {
      searchState[el.dataset.v] = !searchState[el.dataset.v];
      el.classList.toggle('on'); renderResults(); return;
    }
    // выбор в форме
    if (box === 'p-age') {
      const v = el.dataset.v;
      formState.ages = formState.ages.includes(v) ? formState.ages.filter(x => x !== v) : formState.ages.concat(v);
      el.classList.toggle('on'); syncTypeField(); return;
    }
    if (box === 'p-type') {
      formState.type = el.dataset.v;
      el.parentElement.querySelectorAll('.tog').forEach(b => b.classList.toggle('on', b === el));
    }
  });

  // Общелагерное без возрастов — вид активности не нужен
  function syncTypeField() {
    const f = document.getElementById('type-field');
    if (f) f.style.display = formState.ages.length && formState.ages.every(a => a === 'camp') ? 'none' : '';
  }

  document.addEventListener('input', e => {
    if (e.target.id === 'q') { searchState.q = e.target.value; renderResults(); }
  });

  document.addEventListener('change', e => {
    if (e.target.id !== 'import') return;
    const file = e.target.files[0];
    if (!file) return;
    file.text().then(txt => {
      const data = JSON.parse(txt);
      if (data.app !== 'ogonek') throw new Error();
      const st = store.get();
      const known = new Set(st.games.map(g => g.id));
      const knownT = new Set(st.types.map(t => t.id));
      (data.types || []).forEach(t => { if (!knownT.has(t.id)) st.types.push(t); });
      const add = (data.games || []).filter(g => !known.has(g.id));
      st.games = st.games.concat(add);
      st.fav = Array.from(new Set(st.fav.concat(data.fav || [])));
      store.save();
      toast(`Загружено статей: ${add.length}`);
      route();
    }).catch(() => toast('Не получилось прочитать файл'));
  });

  document.addEventListener('submit', e => {
    if (e.target.id !== 'gform') return;
    e.preventDefault();
    const v = id => document.getElementById(id).value.trim();
    const err = document.getElementById('f-err');
    const onlyCamp = formState.ages.length && formState.ages.every(a => a === 'camp');
    const type = onlyCamp ? 'camp' : formState.type;
    if (!v('f-title')) return (err.textContent = 'Добавь название');
    if (!formState.ages.length) return (err.textContent = 'Выбери, для кого эта игра');
    if (!type || type === 'camp' && !onlyCamp) return (err.textContent = 'Выбери вид активности');
    if (!v('f-text')) return (err.textContent = 'Опиши, как играть');

    const st = store.get();
    const editId = location.hash.startsWith('#/edit/') ? decodeURIComponent(location.hash.slice(7)) : null;
    const g = { id: editId || uid(), title: v('f-title'), ages: formState.ages, type, time: v('f-time'), players: v('f-players'), props: v('f-props'), text: v('f-text') };
    if (editId) st.games = st.games.map(x => x.id === editId ? g : x);
    else st.games.push(g);
    store.save();
    toast(editId ? 'Сохранено' : 'Статья добавлена в сборник 🔥');
    go('/game/' + encodeURIComponent(g.id), true);
  });

  window.addEventListener('hashchange', route);
  route();
  if (location.hash.startsWith('#/new') || location.hash.startsWith('#/edit')) syncTypeField();
  window.addEventListener('hashchange', syncTypeField);

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
