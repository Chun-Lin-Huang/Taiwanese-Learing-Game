import { model, Schema } from "mongoose";
import { Users } from "../../interfaces/Users";

export const userSchemas = new Schema<Users>({
    name:{ type: String, required: true },
    userName:{ type: String, required: true },
    password:{ type: String, required: true },
}, { timestamps: true,
     collection: 'Users'
 });

export const userModel = model<Users>('Users', userSchemas);