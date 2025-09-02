"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/compat/router";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div>
        <div>
          <input className="rounded p-1.5 "
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value);
            }}
            placeholder="Enter the room id"
          ></input>
          <button className="p-1.5 border rounded hover:bg-green-300"
            onClick={() => {
              if (router && !router.isReady) {
                router.push(`room/${roomId}`);
              }
            }}
          >
            Join Room
          </button>
        </div>
        <div className="">Hello and welcome to my new Website</div>
      </div>
    </div>
  );
}
