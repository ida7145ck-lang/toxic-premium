export interface AutopilotConfig {
  enabled: boolean;
  schedule: string[]; // ['07:00', '11:00', '15:00', '19:00', '22:00']
  lastRun?: string;
  niche: string;
}

export const defaultAutopilotConfig: AutopilotConfig = {
  enabled: false,
  schedule: ['07:00', '11:00', '15:00', '19:00', '22:00'],
  niche: 'Motivation'
};
