/* Огонёк — маскот сборника. Синяя мордашка с пламенем вместо волос.
   ogonekSvg(mood, size) → строка SVG. mood: smile | wink | love | cool | wow | sleepy */
let uid = 0;

  const FLAME_OUTER =
    'M38 150 C22 128 18 104 30 84 C30 98 36 104 42 106 C36 82 44 58 62 44 C58 62 62 74 70 80 ' +
    'C68 54 80 30 104 14 C98 36 102 52 112 62 C116 44 128 34 142 30 C136 46 138 58 146 68 ' +
    'C152 58 162 54 172 54 C164 66 166 80 172 92 C180 86 186 86 192 88 C182 104 186 126 172 150 Z';
  const FLAME_MID =
    'M52 146 C42 128 42 112 50 100 C52 110 58 114 62 114 C58 94 64 76 78 64 C76 78 80 88 88 92 ' +
    'C88 72 96 54 114 42 C110 60 114 72 122 80 C126 66 134 60 146 56 C140 70 142 82 150 92 ' +
    'C156 86 164 86 170 88 C162 102 166 124 158 146 Z';
  const FLAME_IN =
    'M70 140 C64 126 66 114 72 106 C74 114 78 116 82 116 C80 102 86 90 96 82 C96 94 100 100 106 104 ' +
    'C108 90 116 80 128 74 C124 88 128 98 134 104 C138 100 144 100 148 102 C142 114 146 128 140 140 Z';

  function eyes(mood: string): string {
    const dark = '#1B2F8A';
    switch (mood) {
      case 'wink':
        return `<ellipse cx="88" cy="138" rx="6.5" ry="9" fill="${dark}"/>
          <path d="M116 131 l12 7 l-12 7" fill="none" stroke="${dark}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      case 'love': {
        const h = (x: number, y: number) => `<path transform="translate(${x} ${y}) scale(0.9)" d="M0 6 C-10 -4 -18 4 -10 12 L0 21 L10 12 C18 4 10 -4 0 6 Z" fill="#E8352B" stroke="#B3201A" stroke-width="1.5"/>`;
        return h(86, 128) + h(122, 128);
      }
      case 'cool':
        return `<path d="M66 128 h36 l-4 14 c-2 6 -24 6 -28 0 z M106 128 h36 l-4 14 c-2 6 -24 6 -28 0 z" fill="#15161C"/>
          <path d="M60 129 h88" stroke="#15161C" stroke-width="4" stroke-linecap="round"/>
          <path d="M74 132 l8 0 M114 132 l8 0" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`;
      case 'wow':
        return `<ellipse cx="88" cy="136" rx="8" ry="11" fill="#fff"/><ellipse cx="88" cy="137" rx="5" ry="7" fill="${dark}"/>
          <ellipse cx="122" cy="136" rx="8" ry="11" fill="#fff"/><ellipse cx="122" cy="137" rx="5" ry="7" fill="${dark}"/>`;
      case 'sleepy':
        return `<path d="M80 138 q8 6 16 0 M114 138 q8 6 16 0" fill="none" stroke="${dark}" stroke-width="4" stroke-linecap="round"/>`;
      default:
        return `<ellipse cx="88" cy="136" rx="6.5" ry="9.5" fill="${dark}"/><ellipse cx="122" cy="136" rx="6.5" ry="9.5" fill="${dark}"/>
          <circle cx="90" cy="132" r="2" fill="#fff"/><circle cx="124" cy="132" r="2" fill="#fff"/>`;
    }
  }

  function mouth(mood: string): string {
    const dark = '#1B2F8A';
    switch (mood) {
      case 'wink':
        return `<path d="M88 160 q17 14 34 0" fill="none" stroke="${dark}" stroke-width="4" stroke-linecap="round"/>
          <path d="M100 165 q2 14 10 13 q8 -1 6 -14 z" fill="#F06A8A" stroke="${dark}" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M108 167 v7" stroke="#C2405F" stroke-width="2" stroke-linecap="round"/>`;
      case 'cool':
        return `<path d="M94 162 q14 8 28 -2" fill="none" stroke="${dark}" stroke-width="4" stroke-linecap="round"/>`;
      case 'wow':
        return `<ellipse cx="105" cy="166" rx="7" ry="9" fill="${dark}"/>`;
      case 'sleepy':
        return `<path d="M98 164 q7 4 14 0" fill="none" stroke="${dark}" stroke-width="4" stroke-linecap="round"/>
          <text x="146" y="104" font-family="Neucha, cursive" font-size="20" fill="${dark}">z</text>`;
      default:
        return `<path d="M86 158 q19 18 38 0" fill="none" stroke="${dark}" stroke-width="4.5" stroke-linecap="round"/>`;
    }
  }

  export function ogonekSvg(mood: string = 'smile', size: number = 120, extraClass = ''): string {
    const id = 'og' + ++uid;
    return `<svg class="ogonek ${extraClass}" width="${size}" height="${size}" viewBox="0 0 210 210" role="img" aria-label="Огонёк" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="${id}c" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2"/>
        </filter>
        <radialGradient id="${id}f" cx="50%" cy="38%" r="65%">
          <stop offset="0" stop-color="#5B88F2"/><stop offset="1" stop-color="#3561DB"/>
        </radialGradient>
      </defs>
      <g filter="url(#${id}c)">
        <path d="${FLAME_OUTER}" fill="#EE4A1F"/>
        <path d="${FLAME_MID}" fill="#FF8A1E"/>
        <path d="${FLAME_IN}" fill="#FFC23A"/>
        <circle cx="56" cy="148" r="11" fill="#3561DB"/><circle cx="154" cy="148" r="11" fill="#3561DB"/>
        <path d="M58 148 q-6 0 -4 6" stroke="#22449E" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M152 148 q6 0 4 6" stroke="#22449E" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <ellipse cx="105" cy="148" rx="50" ry="46" fill="url(#${id}f)"/>
        <path d="M70 116 C78 104 92 98 104 98" stroke="#7FA3F7" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>
        ${eyes(mood)}
        <ellipse cx="74" cy="154" rx="7" ry="4" fill="#F08AB0" opacity=".55"/>
        <ellipse cx="136" cy="154" rx="7" ry="4" fill="#F08AB0" opacity=".55"/>
        ${mouth(mood)}
      </g>
    </svg>`;
}
