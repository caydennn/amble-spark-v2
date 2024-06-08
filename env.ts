import { cleanEnv, num, str } from "envalid";

export const env = cleanEnv(process.env, {
  EVALUATE_INSTRUCTIONS: str(),
  GENERATE_PROMPT_INSTRUCTIONS: str(),
  DATABASE_URL: str(),
  OPENAI_API_KEY: str(),
  PROMPT_THRESHOLD: num(),
});
