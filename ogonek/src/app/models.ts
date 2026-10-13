export type Mood = 'smile' | 'wink' | 'love' | 'cool' | 'wow' | 'sleepy';

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
