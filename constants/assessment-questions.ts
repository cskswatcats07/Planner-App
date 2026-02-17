import type { AssessmentQuestion } from '../types/assessment';

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // Time Blindness (3 questions)
  {
    id: 'tb-1',
    text: 'How often do you lose track of time when doing something you enjoy?',
    category: 'timeBlindness',
  },
  {
    id: 'tb-2',
    text: 'How often are you late to appointments or commitments despite your best intentions?',
    category: 'timeBlindness',
  },
  {
    id: 'tb-3',
    text: 'How often do you underestimate how long a task will take?',
    category: 'timeBlindness',
  },

  // Finance (3 questions)
  {
    id: 'fi-1',
    text: 'How often do you make unplanned purchases that you later regret?',
    category: 'finance',
  },
  {
    id: 'fi-2',
    text: 'How often do you forget to pay bills on time?',
    category: 'finance',
  },
  {
    id: 'fi-3',
    text: 'How difficult is it for you to keep track of your spending?',
    category: 'finance',
  },

  // Task Prioritization (3 questions)
  {
    id: 'tk-1',
    text: 'How often do you struggle to decide which task to start first?',
    category: 'tasks',
  },
  {
    id: 'tk-2',
    text: 'How often do you start many tasks but have trouble finishing them?',
    category: 'tasks',
  },
  {
    id: 'tk-3',
    text: 'How often do you feel overwhelmed by your to-do list?',
    category: 'tasks',
  },

  // Memory / Forgetfulness (3 questions)
  {
    id: 'me-1',
    text: 'How often do you forget things people have told you recently?',
    category: 'memory',
  },
  {
    id: 'me-2',
    text: 'How often do you misplace everyday items like keys or your phone?',
    category: 'memory',
  },
  {
    id: 'me-3',
    text: 'How often do you walk into a room and forget why you went there?',
    category: 'memory',
  },

  // Dopamine / Boredom (3 questions)
  {
    id: 'dp-1',
    text: 'How often do you feel restless or bored even when you have things to do?',
    category: 'dopamine',
  },
  {
    id: 'dp-2',
    text: 'How often do you need something to feel exciting or new to stay engaged?',
    category: 'dopamine',
  },
  {
    id: 'dp-3',
    text: 'How difficult is it for you to stay motivated on routine or repetitive tasks?',
    category: 'dopamine',
  },

  // Speech Articulation (3 questions)
  {
    id: 'sp-1',
    text: 'How often do you struggle to organize your thoughts before speaking?',
    category: 'speech',
  },
  {
    id: 'sp-2',
    text: 'How often do you feel like the words come out differently than what you meant?',
    category: 'speech',
  },
  {
    id: 'sp-3',
    text: 'How often do others ask you to repeat or clarify what you said?',
    category: 'speech',
  },

  // Endless Thoughts (3 questions)
  {
    id: 'th-1',
    text: 'How often does your mind race with many thoughts at once?',
    category: 'thoughts',
  },
  {
    id: 'th-2',
    text: 'How difficult is it for you to quiet your mind when trying to relax or sleep?',
    category: 'thoughts',
  },
  {
    id: 'th-3',
    text: 'How often do you feel mentally drained from overthinking?',
    category: 'thoughts',
  },

  // Impulse Control (3 questions)
  {
    id: 'im-1',
    text: 'How often do you say things without thinking them through first?',
    category: 'impulse',
  },
  {
    id: 'im-2',
    text: 'How often do you act on urges in the moment and think about consequences later?',
    category: 'impulse',
  },
  {
    id: 'im-3',
    text: 'How difficult is it for you to wait your turn in conversations?',
    category: 'impulse',
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  timeBlindness: 'Time Awareness',
  finance: 'Money Management',
  tasks: 'Task Prioritization',
  memory: 'Memory & Recall',
  dopamine: 'Motivation & Engagement',
  speech: 'Communication',
  thoughts: 'Thought Management',
  impulse: 'Impulse Management',
};
