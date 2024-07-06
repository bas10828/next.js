import { mysqlPool } from '@/utils/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, username, email, password, priority } = body;

    // ตรวจสอบว่ามีค่าที่จำเป็นครบถ้วน
    if (!id || !username || !email || !priority) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    let query, values;

    if (password) {
      // เข้ารหัสรหัสผ่านโดยใช้ bcrypt ถ้ามีการเปลี่ยนรหัสผ่าน
      const hashedPassword = await bcrypt.hash(password.toString(), 10);
      query = `
        UPDATE users
        SET username = ?, email = ?, password = ?, priority = ?
        WHERE id = ?
      `;
      values = [username, email, hashedPassword, priority, id];
    } else {
      query = `
        UPDATE users
        SET username = ?, email = ?, priority = ?
        WHERE id = ?
      `;
      values = [username, email, priority, id];
    }

    // เชื่อมต่อกับฐานข้อมูลและทำการ update ผ่าน connection pool ที่มี promise
    const promisePool = mysqlPool.promise();
    const [result] = await promisePool.query(query, values);

    return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}
