import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { genSalt, hash, compare } from "bcryptjs";
import { generateToken } from "../utils/auth.js";

const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // check if user has already existed
  const userExists = await prisma.user.findUnique({
    where: { email: email },
  });

  if (userExists) {
    return res.status(400).json({
      error: "User already exists",
    });
  }

  // generate hashpassword
  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);

  // save user to db
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.status(201).json({
    status: "success",
    data: {
      user: userWithoutPassword,
    },
  });
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // check if user email exists in the table
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(401).json({
      error: "Invalid email or password",
    });
    return;
  }

  // verify password
  const isValid = await compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({
      error: "Invalid email or password",
    });
  }

  // generate jwt token
  const token = generateToken(user.id);

  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    },
  });
};

export { register, login };
