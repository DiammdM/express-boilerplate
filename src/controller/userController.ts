import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";

const getUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      createAt: true,
    },
  });

  res.json({
    status: "success",
    data: {
      user,
    },
  });
};

export { getUser };
