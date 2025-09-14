export interface Card {
  _id: string;
  code: string;
  type: "reward" | "penalty" | "chance";
  description: string;
  action: "move" | "teleport" | "skip" | "money" | "item";
  value: number | string;
  createdAt?: Date;
  updatedAt?: Date;
}
