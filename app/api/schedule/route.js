import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request) {
  const loggedIn = request.headers.get('loggedIn');

  if (!loggedIn || loggedIn !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const promisePool = mysqlPool.promise()
  const [rows, fields] = await promisePool.query(
    `SELECT * FROM schedule ORDER BY date_start ASC;`
  )
  return NextResponse.json(rows)
}