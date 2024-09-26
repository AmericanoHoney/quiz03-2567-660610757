import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json({
    ok: true,
    fullName: "Natrada Nuchit",
    studentId: "660610757",
  });
};
