import { Schema, model } from "mongoose";
import { IUser } from "../types/IUser";
import { Password } from "../helpers/password";

const UserSchema = new Schema<IUser>({
  username: {
    //required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
  state: {
    //required: true,
    type: String,
    default: "jubaland",
  },
  phone_number: {
    //required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
});

UserSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.Hash(this.get("password"));
    this.set("password", hashed);
  }

  done();
});

export const User = model<IUser>("user", UserSchema);
