// Route → page for every hub task. Cash Course's own routes stay in App.tsx.
import MatchingPairs from '../modules/memory/MatchingPairs';
import NumberRecall from '../modules/memory/NumberRecall';
import SpacedRetrieval from '../modules/memory/SpacedRetrieval';
import Wrap from '../modules/memory/Wrap';
import StoryRecall from '../modules/memory/StoryRecall';
import WordList from '../modules/memory/WordList';
import CategoryNaming from '../modules/language/CategoryNaming';
import FinishSentence from '../modules/language/FinishSentence';
import FollowDirections from '../modules/language/FollowDirections';
import NameIt from '../modules/language/NameIt';
import PointToIt from '../modules/language/PointToIt';
import YesOrNo from '../modules/language/YesOrNo';
import LoudClear from '../modules/speech/LoudClear';
import PacingBoard from '../modules/speech/PacingBoard';
import SayItClearly from '../modules/speech/SayItClearly';
import SwallowExercises from '../modules/swallow/SwallowExercises';
import SwallowPlan from '../modules/swallow/SwallowPlan';
import SwallowStrategies from '../modules/swallow/SwallowStrategies';
import { Analogies, Inference, OddOneOut, Safety, WhatsWrong } from '../modules/reasoning/ReasonDrill';
import Calendar from '../modules/executive/Calendar';
import FindThemAll from '../modules/executive/FindThemAll';
import PillOrganizer from '../modules/executive/PillOrganizer';
import PutInOrder from '../modules/executive/PutInOrder';
import SwitchItUp from '../modules/executive/SwitchItUp';
import ChunkIt from '../modules/memory/ChunkIt';
import MentalWorkout from '../modules/memory/MentalWorkout';
import NamesFaces from '../modules/memory/NamesFaces';
import { CategoryBuilder, WhatAmI, WordLinks } from '../modules/language/WordFinding';
import ReadAndDo from '../modules/language/ReadAndDo';
import Deductions from '../modules/reasoning/Deductions';
import Clocks from '../modules/executive/Clocks';
import Planner from '../modules/executive/Planner';
import Checkbook from '../modules/Checkbook';

export const HUB_PAGES: Record<string, () => JSX.Element> = {
  'spaced-retrieval': SpacedRetrieval,
  'word-list': WordList,
  'story-recall': StoryRecall,
  wrap: Wrap,
  'number-recall': NumberRecall,
  'matching-pairs': MatchingPairs,
  'name-it': NameIt,
  'point-to-it': PointToIt,
  'follow-directions': FollowDirections,
  'yes-or-no': YesOrNo,
  'finish-sentence': FinishSentence,
  'category-naming': CategoryNaming,
  'loud-clear': LoudClear,
  'say-it-clearly': SayItClearly,
  'pacing-board': PacingBoard,
  'swallow-exercises': SwallowExercises,
  'swallow-plan': SwallowPlan,
  'swallow-strategies': SwallowStrategies,
  'odd-one-out': OddOneOut,
  analogies: Analogies,
  safety: Safety,
  inference: Inference,
  'whats-wrong': WhatsWrong,
  'put-in-order': PutInOrder,
  'pill-organizer': PillOrganizer,
  calendar: Calendar,
  'find-them-all': FindThemAll,
  'switch-it-up': SwitchItUp,
  'mental-workout': MentalWorkout,
  'chunk-it': ChunkIt,
  'names-pictures': NamesFaces,
  'what-am-i': WhatAmI,
  'word-links': WordLinks,
  'category-builder': CategoryBuilder,
  'read-and-do': ReadAndDo,
  deductions: Deductions,
  clocks: Clocks,
  planner: Planner,
  checkbook: Checkbook,
};
