export const QUIZ_CONSTANTS = {
  WARNING_TIME_SECONDS: 300, // 5 minutes
  CRITICAL_TIME_SECONDS: 60, // 1 minute
  MAX_TAB_SWITCHES: 3,
  TAB_SWITCH_WARNING: "Warning: Switching tabs during the quiz may result in automatic submission.",
  TIME_UP_MESSAGE: "Time is up! Your quiz has been automatically submitted.",
} as const;
