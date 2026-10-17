type State = Record<string, unknown>;
declare const model: {
  poles: { id: string; name: string; icon: string; asset: string; brief: string; page: string }[];
  defaults: State;
  val(s: State, key: string, fallback?: unknown): unknown;
  lead(role: string): boolean;
  task(
    s: State,
    id: string
  ): {
    owner: string;
    head: string;
    brief: string;
    chapter: string;
    due: string;
    content: string;
    evidence: string;
    feedback: string;
    status: string;
    required: boolean;
  };
  edit(s: State, key: string, value: unknown): void;
  invalidate(s: State): void;
  sourceChanged(s: State, key: string): void;
  transition(s: State, id: string, action: string, role: string): string | null;
  blockers(s: State): string[];
  decide(s: State, action: string, role: string): string | null;
};
export = model;
