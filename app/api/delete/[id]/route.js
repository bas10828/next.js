import { mysqlPool } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  try {
    console.log('Params:', params); // Debugging line

    // ดึง ID จาก params
    const { id } = params;

    // ตรวจสอบว่ามี ID หรือไม่
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // SQL query สำหรับการลบผู้ใช้จากฐานข้อมูล
    const query = 'DELETE FROM equipment WHERE id = ?';
    const values = [id];

    // เชื่อมต่อกับฐานข้อมูลและทำการ delete ผ่าน connection pool ที่มี promise
    const promisePool = mysqlPool.promise();
    const [result] = await promisePool.query(query, values);

    // ตรวจสอบว่ามีการลบแถวใด ๆ หรือไม่
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ส่งคำตอบกลับให้กับ client ว่าลบสำเร็จแล้ว
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
  }
}
