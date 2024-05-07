import { validationResult } from "express-validator";
import { User } from "../models/User";
import { Password } from "../helpers/password";

import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { Request, Response } from "express";
import { createCryptoWallet } from "../utils/wallet";

export const signUp = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    let _errors = errors.array().map((error) => {
      return {
        msg: error.msg,
        field: error.param,
        success: false,
      };
    })[0];
    return res.status(400).json(_errors);
  }

  let { email, password } = req.body;

  if (await User.exists({ email })) {
    return res.json({
      msg: "Email already exists",
      success: false,
    });
  }

  //validate password
  const { error } = Password.validate(password);
  if (error) {
    return res.json({
      msg: error,
      success: false,
    });
  }

  try {
    email = email.toLowerCase();

    //create user:
    const user = await User.create({
      email,
      password,
    });

    //create wallet
    const wallet = await createCryptoWallet(user.id);

    let _user = {
      email: email,
      wallet: wallet?.wallet_address,
    };

    const payload = {
      user: {
        id: user._id,
      },
    };
    sign(
      payload,
      config.JWT_SECRET,
      {
        expiresIn: "1h",
      },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token, success: true, _user });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    let _errors = errors.array().map((error) => {
      return {
        msg: error.msg,
        field: error.param,
        success: false,
      };
    })[0];
    return res.json(_errors);
  }

  let { password, email } = req.body;

  console.log(password, email);

  try {
    let user;

    email = email.toLowerCase();
    if (!(await User.exists({ email }))) {
      // throw error if user does not exist
      return res.json({
        msg: "User does not exist",
        success: false,
      });
    }

    user = await User.findOne({ email });

    if (!user || !(await Password.compare(user.password, password))) {
      return res.json({ msg: "Invalid credentials", success: false });
    }

    let _user = {
      username: user.username,
    };

    // login user
    const payload = {
      id: user.id,
    };
    sign(
      payload,
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_TOKEN_EXPIRES_IN,
      },
      (err, token) => {
        if (err) throw err;

        return res.json({
          token,
          success: true,
          _user,
        });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send("Internal server error");
  }
};
