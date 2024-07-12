import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request, { params }) {
  const { detail } = params;
  const promisePool = mysqlPool.promise();

  // แก้ไข query เพื่อใช้การค้นหาแบบ fuzzy search
  const query = `
  SELECT * FROM schedule 
  WHERE details LIKE ? OR details LIKE ?
  `;

  // กำหนด pattern ที่ใช้ในการค้นหาแบบ fuzzy (ในที่นี้คือค้นหาทั้ง ES210GS และ RG-ES210GS-P)
  const searchTerm = `%${detail}%`;

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
