import { Schema, model } from "mongoose";
import type { Question } from "../../interfaces/Question";

export const questionSchema = new Schema<Question>(
  {
    userName: { type: String, required: true, trim: true, lowercase: true },
    questionText: { type: String, required: true, trim: true },
  },
  { timestamps: true,
    collection: 'Questions'
   }
);

export const QuestionModel = model<Question>("Questions", questionSchema);