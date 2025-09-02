import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import {prismaClient} from '@repo/db/client'

const wss = new WebSocketServer({ port: 8080 });

interface Users {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const rooms: string[] = [];
const users: Users[] = [];

function checkUser(token: string): string | null {
  const secret = process.env.jwt_SECRET;
  if (!secret) {
    console.error("jwt_SECRET is not set in environment");
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });

    if (typeof decoded === "string") {
      return null;
    }

    const payload = decoded as jwt.JwtPayload;
    const userId = payload.userId;

    if (typeof userId !== "string" || userId.length === 0) {
      return null;
    }

    return userId;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn("JWT expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn("Invalid JWT");
    } else {
      console.error("JWT verification failed:", error);
    }
    return null;
  }
}

// Add connection event listener
wss.on("listening", () => {
  console.log("WebSocket server is listening on port 8080");
});

// Add error event listener for server
wss.on("error", (error) => {
  console.error("WebSocket server error:", error);
});

wss.on("connection", (ws, request) => {
  console.log("New connection attempt from:", request.socket.remoteAddress);

  try {
    const url = request.url;
    console.log("Request URL:", url);

    if (!url) {
      console.log("No URL provided");
      ws.send(JSON.stringify({ type: "error", message: "No connection URL" }));
      ws.close();
      return;
    }

    // Handle URLs that might not have query parameters
    const urlParts = url.split("?");
    if (urlParts.length < 2) {
      console.log("No query parameters found");
      ws.send(JSON.stringify({ type: "error", message: "Token required" }));
      ws.close();
      return;
    }

    const queryParam = new URLSearchParams(urlParts[1]);
    const token = queryParam.get("token");

    if (!token) {
      console.log("No token provided");
      ws.send(JSON.stringify({ type: "error", message: "Token required" }));
      ws.close();
      return;
    }

    const userId = checkUser(token);

    if (userId == null) {
      console.log("Invalid token for user");
      ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
      ws.close();
      return;
    }

    console.log(`User ${userId} connected successfully`);

    const newUser: Users = {
      ws,
      rooms: [],
      userId,
    };

    users.push(newUser);

    // Send connection success message
    ws.send(JSON.stringify({ type: "connected", userId }));

    ws.on("message", async function message(data) {
      console.log("Received message:", data.toString());

      let parsedData: any;
      try {
        parsedData = JSON.parse(data.toString());
      } catch (error) {
        console.log("JSON parse error:", error);
        ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
        return;
      }

      if (parsedData.type === "join_room") {
        const roomId: string = parsedData.roomId;
        const user = users.find((x) => x.ws === ws);
        if (!user || !roomId) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Invalid room join request",
            }),
          );
          return;
        }

        // TRACK ROOM EXISTENCE
        if (!rooms.includes(roomId)) {
          rooms.push(roomId);
          console.log(`Created new room: ${roomId}`);
        }

        if (!user.rooms.includes(roomId)) {
          user.rooms.push(roomId);
          console.log(`User ${user.userId} joined room ${roomId}`);
        }

        // Send acknowledgment to client
        ws.send(JSON.stringify({ type: "joined_room", roomId }));
      }

      if (parsedData.type === "leave_room") {
        const user = users.find((x) => x.ws === ws);
        if (!user) {
          return;
        }

        const roomId = parsedData.roomId;
        user.rooms = user.rooms.filter((x) => x !== roomId);
        console.log(`User ${user.userId} left room ${roomId}`);

        ws.send(
          JSON.stringify({
            type: "left_room",
            message: `You have left room ${roomId}`,
            roomId,
          }),
        );
      }

      if (parsedData.type === "chat") {
        const roomId = parsedData.roomId;
        const message1 = parsedData.message;
        const sender = users.find((x) => x.ws === ws);

        await prismaClient.chat.create({
          data:{
            roomId: Number(roomId),
            message: message1,
            userId
          }
        });

        if (!sender) {
          ws.send(JSON.stringify({ type: "error", message: "User not found" }));
          return;
        }

        if (!sender.rooms.includes(roomId)) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "You are not in this room",
            }),
          );
          return;
        }

        console.log(`Chat message in room ${roomId}: ${message}`);

        // Broadcast to all users in the room
        users.forEach((user) => {
          if (user.rooms.includes(roomId)) {
            user.ws.send(
              JSON.stringify({
                type: "chat",
                message: message,
                roomId: roomId,
                userId: sender.userId,
                timestamp: new Date().toISOString(),
              }),
            );
          }
        });
      }
    });

    // Handle WebSocket close event
    ws.on("close", (code, reason) => {
      console.log(
        `User ${userId} disconnected. Code: ${code}, Reason: ${reason}`,
      );
      // Remove user from users array
      const userIndex = users.findIndex((user) => user.ws === ws);
      if (userIndex !== -1) {
        users.splice(userIndex, 1);
      }
    });

    // Handle WebSocket error event
    ws.on("error", (error) => {
      console.error(`WebSocket error for user ${userId}:`, error);
    });
  } catch (e: any) {
    console.error("Connection error:", e);
    ws.send(JSON.stringify({ type: "error", message: "Server error" }));
    ws.close();
  }
});

console.log("Starting WebSocket server on port 8080...");
