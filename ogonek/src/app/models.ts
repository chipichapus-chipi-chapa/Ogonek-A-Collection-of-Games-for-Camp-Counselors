/** Эмоции Огонька — файлы public/img/ogonek/<mood>.webp */
export type Mood = 'star' | 'wink' | 'love' | 'cool' | 'wow' | 'sleepy' | 'point';

export interface Age {
  id: string;
  title: string;
  sub: string;
  mood: Mood;
  color: 'yellow' | 'olive' | 'red' | 'kraft';
}

export interface ActivityType {
  id: string;
  title: string;
  icon: string;
  note?: string;
}

export interface Game {
  id: string;
  type: string;
  ages: string[];
  title: string;
  time?: string;
  players?: string;
  props?: string;
  text: string;
}

export interface Seed {
  ages: Age[];
  types: ActivityType[];
  games: Game[];
}

export interface UserState {
  fav: string[];
  games: Game[];
  types: ActivityType[];
}
