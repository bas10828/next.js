import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request, { params }) {
  const { brand } = params;
  const promisePool = mysqlPool.promise();

  const query = `
  SELECT * FROM equipment
  WHERE brand LIKE ? OR brand LIKE ?
  ORDER BY CASE WHEN status_stock = 'in stock' THEN 1 ELSE 2 END
`;
  const searchTerm = `%${brand}%`;

  try {
    const [rows] = await promisePool.query(query, [searchTerm, searchTerm]);
    if (rows.length === 0) {
      return NextResponse.json({ message: 'No records found' }, { status: 404 });
    }
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error executing query" }, { status: 500 });
  }
}
