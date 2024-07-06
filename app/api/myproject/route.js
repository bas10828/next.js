import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export function GET(request) {
  const promisePool = mysqlPool.promise();

  return promisePool.query(
    `SELECT project, COUNT(project) AS countproject FROM equipment GROUP BY project;`
  )
  .then(([rows, fields]) => {
    return NextResponse.json(rows);
  })
  .catch(error => {
    console.error('Database query error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  });
}
