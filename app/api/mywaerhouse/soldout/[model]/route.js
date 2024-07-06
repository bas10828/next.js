import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request, { params }) {
  const promisePool = mysqlPool.promise();
  const { model } = params; // Extract the model parameter from the URL

  try {
    const query = `SELECT * FROM equipment WHERE model = ? AND status_stock = 'sold out'`;
    const [rows, fields] = await promisePool.query(query, [model]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error executing query" }, { status: 500 });
  }
}
