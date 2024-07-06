// C:\Users\kanta\Desktop\Dev\test_app_next\app\api\myproject\route.js

import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request) {
  const loggedIn = request.headers.get('loggedIn');

  if (!loggedIn || loggedIn !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const promisePool = mysqlPool.promise();

  try {
    const [rows, fields] = await promisePool.query(
      `SELECT project, COUNT(project) AS countproject FROM equipment GROUP BY project;`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
