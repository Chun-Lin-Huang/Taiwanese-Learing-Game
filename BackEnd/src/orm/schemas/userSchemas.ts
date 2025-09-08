// src/orm/schemas/userSchemas.ts
import { Schema, model, models, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUserDoc extends Document {
  name: string;
  userName: string; // 全部存小寫
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true, trim: true },
    userName: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    password: { type: String, required: true },
  },
  { timestamps: true, collection: "Users" }
);

// 只要 password 有變更就雜湊
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const salt = await bcrypt.genSalt(rounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as any);
  }
});

// 實例方法：比對密碼
userSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.password);
};

export const UserModel = (models.Users as any) || model<IUserDoc>("Users", userSchema);