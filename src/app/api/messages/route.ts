import { Database, DB, Payload, readDB, writeDB } from "@lib/DB";
import { checkToken } from "@lib/checkToken";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  readDB();
  const roomId = request.nextUrl.searchParams.get("roomId");
  const foundroom = (<Database>DB).rooms.find((x) => x.roomId === roomId);
  if (!foundroom) {
  return NextResponse.json(
    {
      ok: false,
      message: `Room is not found`,
    },
    { status: 404 }
  );
  }
  return NextResponse.json({
    ok: true,
    messages : (<Database>DB).messages.filter((x) => x.roomId === roomId),
  });
};

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const { roomId, messageText } = body;
  readDB();
  const foundRoom = (<Database>DB).rooms.find((x) => x.roomId === roomId);
  if (!foundRoom) {
  return NextResponse.json(
    {
      ok: false,
      message: `Room is not found`,
    },
    { status: 404 }
  );
  }

  const messageId = nanoid();

  (<Database>DB).messages.push({
    roomId,
    messageId,
    messageText,
  });
  writeDB();

  return NextResponse.json({
    ok: true,
    messageId,
    message: "Message has been sent",
  });
};

export const DELETE = async (request: NextRequest) => {
  const payload = checkToken();
  const { role } = <Payload>payload;
  if (!payload || role!=="SUPER_ADMIN") {
  return NextResponse.json(
    {
      ok: false,
      message: "Invalid token",
    },
    { status: 401 }
  );
  }

  readDB();

  const body = await request.json();
  const { messageId } = body;
  const foundMessage = (<Database>DB).messages.findIndex((x) => x.messageId === messageId);
  if (foundMessage=== -1) {
  return NextResponse.json(
      {
        ok: false,
        message: "Message is not found",
      },
      { status: 404 }
    );
  }
  
  //(<Database>DB).messages.filter((x)=>x.messageId!==messageId);
  (<Database>DB).messages.splice(foundMessage, 1);
  writeDB();

  return NextResponse.json({
    ok: true,
    message: "Message has been deleted",
  });
};
