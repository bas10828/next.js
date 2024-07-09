import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request, { params }) {
  const { serial } = params;
  const promisePool = mysqlPool.promise();
  
  const query = "SELECT COUNT(*) AS count FROM comment WHERE serial = ?";

  try {
    const [rows] = await promisePool.query(query, [serial]);
    if (rows.length === 0) {
      return NextResponse.json({ message: 'No records found' }, { status: 404 });
    }
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error executing query" }, { status: 500 });
  }
}