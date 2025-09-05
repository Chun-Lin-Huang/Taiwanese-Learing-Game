export type ScenarioStartReq = { chatChooseId: string };

export type ScenarioStartResp = {
  session_id: string;
  npc_text: string;
  score: number;
  finished: boolean;
};

export type TurnTextReq = { session_id: string; text: string };

export type TurnResp = {
  transcript: string;
  reply_text: string;
  finished: boolean;
  score: number;
  turn: number;
};