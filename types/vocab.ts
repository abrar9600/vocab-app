export interface VocabPair {
  id: string;
  word: string;
  meaning: string;
}

export interface Card {
  id: string; // Unique ID for each card
  pairId: string; // ID linking word and meaning together
  text: string;
  type: 'word' | 'meaning';
}