import { Database, DB, readDB, Payload, writeDB } from "@lib/DB";
import { checkToken } from "@lib/checkToken";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  readDB();
  return NextResponse.json({
    ok: true,
    rooms: (<Database>DB).rooms,
    totalRooms:  (<Database>DB).rooms.length,
  });
};

export const POST = async (request: NextRequest) => {
  const payload = checkToken();
  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  readDB();

  const { role } = <Payload>payload;

  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    const body = await request.json();
    const { roomName } = body;
    readDB();
    const foundRoom = (<Database>DB).rooms.find((x) => x.roomName === roomName);
    if (foundRoom) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room ${roomName} already exists`,
      },
      { status: 400 }
    );
    }

    const roomId = nanoid();

    //call writeDB after modifying Database
    (<Database>DB).rooms.push({
      roomName,
      roomId,
    });
    writeDB();

    return NextResponse.json({
      ok: true,
      roomId : roomId,
      message: `Room ${roomName} has been created`,
    });
  }
  return NextResponse.json(
    {
      ok: false,
      message: "Invalid token",
    },
    { status: 401 }
  );
};
