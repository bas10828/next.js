import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request, { params }) {
  const { proid } = params;
  const promisePool = mysqlPool.promise();
  
  const query = "SELECT * FROM equipment WHERE proid = ?";

  try {
    const [rows] = await promisePool.query(query, [proid]);
    if (rows.length === 0) {
      return NextResponse.json({ message: 'No records found' }, { status: 404 });
    }
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error executing query" }, { status: 500 });
  }
}
