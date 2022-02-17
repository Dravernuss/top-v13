import { User } from "../models/index.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.find({ email });
  const userDB = user[0];

  if (user.length === 0) res.status(403).send();

  // Validate hash
  const passToHash = `${password}${userDB.document}`;
  bcrypt.compare(passToHash, userDB.password, (err, isPassValid) => {
    if (email === userDB.email && isPassValid) {
      jwt.sign(
        { email: userDB.email },
        process.env.SECRET_KEY,
        (error, token) => {
          if (!error) {
            res.status(200).json({
              token,
            });
          } else {
            res.status(403).send();
          }
        }
      );
    } else {
      res.status(403).send();
    }
  });
};

export const createUser = async (req, res) => {
  const { password, document } = req.body;

  const passToHash = `${password}${document}`;
  const hash = await bcrypt.hash(passToHash, 10);

  const newUser = new User({ ...req.body, password: hash });

  try {
    await newUser.save();
    res.status(201).send();
  } catch (err) {
    res.status(500).send(err);
  }
};
