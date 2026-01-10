
export enum AppStatus {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  ANXIOUS = 'ANXIOUS',
  SOOTHING_VOICE = 'SOOTHING_VOICE',
  SOOTHING_MUSIC = 'SOOTHING_MUSIC'
}

export interface AnxietyLog {
  time: string;
  intensity: number;
}

export interface HistoryRecord {
  date: string;
  status: 'good' | 'anxious';
  logs: AnxietyLog[];
  successRate: number;
  totalInterventions: number;
}
