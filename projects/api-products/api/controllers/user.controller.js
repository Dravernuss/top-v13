import { User } from "../models/index.js";
import { senderMail } from "maria-service-send-mail";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginWithGoogle = async (req, res, next) => {
  const { googleToken, email } = req.body;
  if (!!!googleToken) next();

  const user = await User.findOne({ email });
  const { is_google_account: isGoogleAccount } = user || {};

  if (isGoogleAccount) {
    jwt.sign({ email }, process.env.SECRET_KEY, (error, token) => {
      if (!error) {
        res.status(200).json({
          token,
        });
      } else {
        res.status(403).send();
      }
    });
  } else {
    res.status(403).send();
  }
};

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

    // Send email
    senderMail.config = {
      host: "smtp.sendgrid.net",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "apikey", // generated ethereal user
        pass: process.env.SENDGRID_API_KEY, // generated ethereal password
      },
    };

    await senderMail.sendMail({
      from: '"Fred Foo 👻" <mariagiraldo4@gmail.com>', // sender address
      to: "mariagiraldo4@gmail.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Se ha creado el usuario correctamente en api products!", // plain text body
    });

    res.status(201).send();
  } catch (err) {
    res.status(500).send(err);
  }
};

// Register user by google
export const registerByGoogle = async (req, res) => {
  const { profileObj } = req.body;

  const user = {
    email: profileObj.email,
    name: profileObj.name,
    document: profileObj.googleId,
    is_google_account: true,
    google_account: profileObj,
  };

  const newUser = new User({ ...user });

  try {
    await newUser.save();

    // Send email
    senderMail.config = {
      host: "smtp.sendgrid.net",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "apikey", // generated ethereal user
        pass: process.env.SENDGRID_API_KEY, // generated ethereal password
      },
    };

    await senderMail.sendMail({
      from: '"Fred Foo 👻" <mariagiraldo4@gmail.com>', // sender address
      to: "mariagiraldo4@gmail.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Se ha creado el usuario correctamente en api products!", // plain text body
    });

    res.status(201).send();
  } catch (err) {
    res.status(500).send(err);
  }
};
