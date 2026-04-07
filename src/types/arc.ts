// src/types/arc.ts

export interface ArcCharacterArc {
  the_wound: string;
  the_weapon: string;
  the_destiny: string;
}

export interface ArcRivalOrMentor {
  name: string;
  description: string;
}

export interface ArcRivalsAndMentors {
  the_rival: ArcRivalOrMentor;
  the_mentor: ArcRivalOrMentor;
}

export interface ArcCoreStats {
  conviction: string;
  visibility: string;
  endurance: string;
  impact: string;
}

export type ArcRarity = "Common" | "Rare" | "Mythic" | "Legendary";

export interface ArcNumericStats {
  resolve: number; // Strength of conviction and follow-through
  chaos: number; // Tendency toward disruption and unpredictability
  empathy: number; // Depth of connection to others' experiences
  focus: number; // Ability to channel energy toward a single goal
}

// The weekly mission — one specific action derived from
// the wound and weapon. Displayed at the end of the reveal
// screen. The Phase 2 feedback loop is built around this.
export interface ArcMission {
  title: string; // Short dramatic name for the mission
  description: string; // The specific action, framed in arc language
  stakes: string; // What it means if they do it vs don't
}

export interface GeneratedArc {
  character_name: string;
  archetype: string;
  opening_episode_quote: string;
  character_arc: ArcCharacterArc;
  episode_one_scenario: string;
  rivals_and_mentors: ArcRivalsAndMentors;
  core_stats: ArcCoreStats;
  signature_move: string;
  character_flaw_that_is_also_their_strength: string;
  the_truth_they_avoid: string;
  how_their_story_ends: string | Record<string, string>;
  if_they_were_a_genre: string;
  rarity: ArcRarity;
  numeric_stats: ArcNumericStats;
  episode_one_mission: ArcMission;
}
