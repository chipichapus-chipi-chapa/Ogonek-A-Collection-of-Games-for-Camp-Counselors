/* Огонёк — маскот сборника (рисунки в img/ogonek/<mood>.webp).
   ogonek(mood, size) → строка <img>. mood: star | wink | love | cool | wow | sleepy | point */
(function () {
  // путь к картинкам считаем от самого скрипта: работает и из app/, и из брендбука в корне
  const base = new URL('../img/ogonek/', document.currentScript.src).href;
  const alias = { smile: 'star' };
  window.ogonek = function (mood = 'star', size = 120, extraClass = '') {
    const m = alias[mood] || mood;
    return `<img class="ogonek ${extraClass}" src="${base}${m}.webp" width="${size}" height="${size}" alt="" draggable="false" style="object-fit:contain">`;
  };
})();
