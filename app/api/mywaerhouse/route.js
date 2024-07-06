import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request) {
  const promisePool = mysqlPool.promise();

  const query = `
    SELECT 
      brand,
      model,
      COUNT(*) AS total_model,
      SUM(CASE WHEN status_stock = 'in stock' THEN 1 ELSE 0 END) AS in_stock,
      SUM(CASE WHEN status_stock = 'sold out' THEN 1 ELSE 0 END) AS sold_out
    FROM 
      equipment 
    GROUP BY 
      brand, model
    ORDER BY 
      brand DESC
  `;

  try {
    const [rows, fields] = await promisePool.query(query);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error executing query" }, { status: 500 });
  }
}
