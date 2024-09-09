import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

// GET - Fetch record by model
export async function GET(request, { params }) {
  const { model } = params;
  const loggedIn = request.headers.get('loggedIn');

  if (!loggedIn || loggedIn !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const promisePool = mysqlPool.promise();
  const query = `SELECT * FROM library WHERE model = ?`;

  try {
    const [rows] = await promisePool.query(query, [model]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error executing query" }, { status: 500 });
  }
}
