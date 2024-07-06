import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request, { params }) {
  const { id } = params;
  const promisePool = mysqlPool.promise();
  
  const query = "SELECT * FROM equipment WHERE id = ?";

  try {
    const [rows] = await promisePool.query(query, [id]);
    if (rows.length === 0) {
      return NextResponse.json({ message: 'No records found' }, { status: 404 });
    }
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error executing query" }, { status: 500 });
  }
}
