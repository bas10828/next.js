import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function POST(request) {
  const promisePool = mysqlPool.promise();

  try {
    const { details, project, date_start, date_end, user } = await request.json();

    // ตั้งค่า time zone สำหรับการเชื่อมต่อ
    await promisePool.query(`SET time_zone = '+07:00';`);

    // เพิ่มข้อมูลใหม่ลงในฐานข้อมูล
    const [result] = await promisePool.query(
      `INSERT INTO schedule (details, project, date_start, date_end, user, timestamp) 
       VALUES (?, ?, ?, ?, ?, NOW());`,
      [details, project, date_start, date_end, user]
    );

    const newId = result.insertId;

    // ดึงแถวที่เพิ่มใหม่มาเพื่อตอบกลับ
    const [newRow] = await promisePool.query(
      `SELECT * FROM schedule WHERE id = ?;`,
      [newId]
    );

    return NextResponse.json(newRow[0], { status: 201 });
  } catch (error) {
    console.error('Error inserting data:', error);
    return NextResponse.json({ error: 'Failed to add data' }, { status: 500 });
  }
}
