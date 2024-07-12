import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function PUT(request, { params }) {
  const promisePool = mysqlPool.promise();
  const { id } = params;

  try {
    const { details, project, date_start, date_end, user } = await request.json();

    // ตั้งค่า time zone สำหรับการเชื่อมต่อ
    await promisePool.query(`SET time_zone = '+07:00';`);

    // อัปเดตข้อมูลในฐานข้อมูล
    const [result] = await promisePool.query(
      `UPDATE schedule 
       SET details = ?, project = ?, date_start = ?, date_end = ?, user = ?, timestamp = NOW() 
       WHERE id = ?;`,
      [details, project, date_start, date_end, user, id]
    );

    // ดึงแถวที่อัปเดตมาเพื่อตอบกลับ
    const [updatedRow] = await promisePool.query(
      `SELECT * FROM schedule WHERE id = ?;`,
      [id]
    );

    return NextResponse.json(updatedRow[0], { status: 200 });
  } catch (error) {
    console.error('Error updating data:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}
