import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import express from "express";
import jwt from "jsonwebtoken";
import { prismaClient } from "@repo/db/client";
import {
  CreateRoomSchema,
  CreateUserSchema,
  SigninSchema,
} from "@repo/common/types";
import middleware from "./middleware";
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from HTTP Backend");
});

app.post("/signup", async (req, res) => {
  try {
    const parsedData = CreateUserSchema.safeParse(req.body);
    console.log(parsedData);
    if (!parsedData.success) {
      res.json({
        msg: parsedData.error,
      });
      return;
    }
    const confirm = await prismaClient.user.create({
      data: {
        email: parsedData.data?.username,
        password: parsedData.data?.password,
        name: parsedData.data?.name,
      },
    });
    res.json({
      msg: "You are signed up!",
      confirm: confirm.id,
    });
  } catch (e: any) {
    console.log(e);
  }
});

app.post("/signin", async (req, res) => {
  const parsedData = SigninSchema.safeParse(req.body); // zod schema
  if (!parsedData.success) {
    // checking for the input credentials
    res.json({
      msg: "Incorrect Credentials",
    });
    return;
  }
  const confirm = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data?.username,
      password: parsedData.data?.password,
    },
  });

  if (!confirm) {
    res.json({
      msg: "Not authenticated",
    });
    return;
  }

  const token = jwt.sign(
    {
      userId: confirm?.id,
    },
    process.env.jwt_SECRET as string,
  );

  res.json({
    token: token,
  });
});

app.post("/room", middleware, async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);

  try {
    if (!parsedData.success) {
      res.json({
        msg: "Incorrect inputs",
      });
      return;
    }
    //@ts-ignore
    const userId = req.user?.userId;

    await prismaClient.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
      },
    });
    res.send({
      msg: "Room is created",
    });
  } catch (e) {
    res.json({
      msg: "room already exist"
    })
  }
});

app.listen(3003);
