/* Витрина «Огонька»: свой телефон, переключатель инструкций, закреплённая кнопка внизу. */
(function () {
  'use strict';
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/.test(ua);
  const mine = ios ? 'iphone' : android ? 'android' : null;

  // инструкции: на телефоне видна одна — для своего телефона
  const ways = document.querySelector('.ways');
  const tabs = document.querySelectorAll('.os-tabs [data-os]');
  const show = os => {
    ways.dataset.show = os;
    tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.os === os)));
  };
  tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.os)));
  // ссылка «как установить на iPhone» сразу открывает нужную инструкцию
  document.querySelectorAll('[data-os-link]').forEach(a => a.addEventListener('click', () => show(a.dataset.osLink)));
  if (mine) {
    document.getElementById(mine).classList.add('mine');
    show(mine);
  }

  // iPhone: APK не подходит — главная кнопка «Открыть приложение»
  const sticky = document.getElementById('sticky');
  const stickyBtn = document.getElementById('sticky-btn');
  if (ios) {
    document.getElementById('apk').classList.add('muted');
    stickyBtn.href = 'app/';
    stickyBtn.textContent = 'Открыть приложение';
    stickyBtn.classList.replace('r', 'y');
  }

  // закреплённая кнопка: видна, когда кнопки первого экрана ушли вверх,
  // и прячется, пока на экране инструкция (там своя такая же кнопка)
  const cta = document.querySelector('.cta');
  const install = document.getElementById('install');
  if ('IntersectionObserver' in window && cta && install) {
    let pastHero = false, inInstall = false;
    const update = () => {
      const on = pastHero && !inInstall;
      sticky.classList.toggle('show', on);
      sticky.setAttribute('aria-hidden', String(!on));
      stickyBtn.tabIndex = on ? 0 : -1;
    };
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; update(); }).observe(cta);
    new IntersectionObserver(([e]) => { inInstall = e.isIntersecting; update(); }, { threshold: 0.25 }).observe(install);
  }
})();
