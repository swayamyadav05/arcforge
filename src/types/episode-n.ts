export interface EpisodeNOutput {
  episode_title: string;
  opening_quote: string;
  episode_scene: string;
  timeline_summary: string;
  reflection_on_last_mission: string;
  next_mission: {
    title: string;
    description: string;
    stakes: string;
  };
  complications_added: string[];
  inner_observation: string;
}

export interface EpisodeNPlan {
  suggested_title: string;
  beats: string[];
  themes_to_honour: string[];
  callbacks: Array<{ episode_number: number; reference: string }>;
  central_tension: string;
}

export interface StateDelta {
  events: Array<{
    type: string;
    payload: Record<string, unknown>;
  }>;
  complications: string[];
  threads_opened: Array<{
    thread_id: string;
    description: string;
    expected_resolution_window: string;
    stakes: string;
  }>;
  threads_closed: string[];
  bible_updates: {
    archetype?: string;
    emotional_arc_current?: string;
    new_established_facts?: Array<{
      fact: string;
      established_episode: number;
    }>;
  };
}

export interface CriticOutput {
  soft_flags: string[];
  hard_flags: Array<{
    issue: string;
    conflicting_fact: string;
    suggested_resolution: string;
  }>;
  notes_for_next_episode: string;
}
