import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request) {
  const promisePool = mysqlPool.promise();
  
  const query = "SELECT * FROM equipment WHERE status_stock = 'in stock'";

  try {
    const [rows, fields] = await promisePool.query(query);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error executing query" }, { status: 500 });
  }
}
