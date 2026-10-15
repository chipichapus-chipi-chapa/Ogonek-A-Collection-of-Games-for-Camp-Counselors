import { Component, computed, input } from '@angular/core';
import { OgonekComponent } from './ogonek.component';

type Block =
  | { k: 'h'; html: string }
  | { k: 'p'; html: string }
  | { k: 'tip'; html: string }
  | { k: 'ul'; items: string[] };

/** Мини-разметка текста игры: ## заголовок, - пункт, > совет, **жирный** */
@Component({
  selector: 'og-rich-text',
  imports: [OgonekComponent],
  template: `
    @for (b of blocks(); track $index) {
      @switch (b.k) {
        @case ('h') { <h3 [innerHTML]="b.html"></h3> }
        @case ('p') { <p [innerHTML]="b.html"></p> }
        @case ('tip') { <div class="tip"><og-ogonek mood="wink" [size]="44" /><div [innerHTML]="b.html"></div></div> }
        @case ('ul') { <ul>@for (li of b.items; track $index) {<li [innerHTML]="li"></li>}</ul> }
      }
    }`
})
export class RichTextComponent {
  text = input('');
  blocks = computed(() => parse(this.text()));
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const inline = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

function parse(src: string): Block[] {
  const out: Block[] = [];
  let list: string[] | null = null;
  const flush = () => { if (list) { out.push({ k: 'ul', items: list }); list = null; } };
  for (const line of src.split(/\r?\n/)) {
    const l = line.trim();
    if (!l) { flush(); continue; }
    if (l.startsWith('## ')) { flush(); out.push({ k: 'h', html: inline(l.slice(3)) }); }
    else if (l.startsWith('- ')) (list ??= []).push(inline(l.slice(2)));
    else if (l.startsWith('> ')) { flush(); out.push({ k: 'tip', html: inline(l.slice(2)) }); }
    else { flush(); out.push({ k: 'p', html: inline(l) }); }
  }
  flush();
  return out;
}
