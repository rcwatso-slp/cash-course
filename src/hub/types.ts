// Types shared by the hub areas and the per-patient settings.

export type AreaId = 'money' | 'memory' | 'language' | 'speech' | 'swallow' | 'reasoning' | 'executive';

export const ALL_AREAS: AreaId[] = ['memory', 'language', 'speech', 'swallow', 'reasoning', 'executive', 'money'];

/** 1 = easier, 2 = middle, 3 = harder. */
export type Level = 1 | 2 | 3;

/** How the patient answers language and memory items. */
export type ResponseMode = 'spoken' | 'choose' | 'typed';

/** A spaced-retrieval target the clinician writes for one patient. */
export interface SrtTarget {
  id: string;
  question: string;
  answer: string;
}

/** One prescribed swallowing exercise. */
export interface ExerciseRx {
  id: string;
  reps: number;
  holdSec: number;
  sets: number;
}
