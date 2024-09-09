import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request) {
  const loggedIn = request.headers.get('loggedIn');

  if (!loggedIn || loggedIn !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const promisePool = mysqlPool.promise();

  const query = `
    SELECT 
      e.brand,
      e.model,
      COUNT(*) AS total_model,
      SUM(CASE WHEN e.status_stock = 'in stock' THEN 1 ELSE 0 END) AS in_stock,
      SUM(CASE WHEN e.status_stock = 'sold out' THEN 1 ELSE 0 END) AS sold_out,
      l.device_type
    FROM 
      equipment e
    LEFT JOIN 
      library l ON e.model = l.model
    GROUP BY 
      e.brand, e.model, l.device_type
    ORDER BY 
      e.brand DESC;

  `;

  try {
    const [rows, fields] = await promisePool.query(query);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error executing query" }, { status: 500 });
  }
}
