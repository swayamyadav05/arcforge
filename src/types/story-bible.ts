export interface StoryBibleWorld {
  genre: string;
  tone: string;
  hard_rules: string[];
}

export interface StoryBibleCharacter {
  name: string;
  archetype: string;
  description: string;
  voice: string;
  status: string;
  wounds: string[];
  possessions: string[];
  knowledge_state: string[];
}

export interface StoryBibleRelationship {
  character_a: string;
  character_b: string;
  type: string;
  description: string;
}

export interface StoryBibleUnresolvedThread {
  thread_id: string;
  description: string;
  opened_episode: number;
  expected_resolution_window: string;
  stakes: string;
}

export interface StoryBibleTimelineEntry {
  episode: number;
  summary: string;
  occurred_at: string;
}

export interface StoryBibleEstablishedFact {
  fact: string;
  established_episode: number;
  last_changed_episode: number;
  valid_until: number | null;
}

export interface StoryBibleEmotionalArc {
  start: string;
  current: string;
  target: string;
}

export interface StoryBibleStyleGuide {
  voice: string;
  pacing: string;
  forbidden_words: string[];
}

export interface StoryBibleShape {
  world: StoryBibleWorld;
  characters: {
    protagonist: StoryBibleCharacter;
  };
  relationships: StoryBibleRelationship[];
  unresolved_threads: StoryBibleUnresolvedThread[];
  timeline: StoryBibleTimelineEntry[];
  motifs: string[];
  emotional_arc: StoryBibleEmotionalArc;
  established_facts: StoryBibleEstablishedFact[];
  style_guide: StoryBibleStyleGuide;
}
