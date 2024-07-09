import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function POST(request) {
  const { serial, user, comment_text } = await request.json();

  // Create a timestamp in the correct format for MySQL
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

  const promisePool = mysqlPool.promise();

  const query = `
    INSERT INTO comment (serial, user, timestamp, comment_text)
    VALUES (?, ?, ?, ?)
  `;

  try {
    const [result] = await promisePool.query(query, [serial, user, timestamp, comment_text]);
    return NextResponse.json({ id: result.insertId, serial, user, timestamp, comment_text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error executing query" }, { status: 500 });
  }
}
