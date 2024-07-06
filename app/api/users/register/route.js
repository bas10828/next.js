import { mysqlPool } from '@/utils/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    // ใช้ await req.json() เพื่อ parse body เป็น JSON
    const body = await req.json();
    const { username, email, password, priority } = body;

    // ตรวจสอบว่ามีค่าที่จำเป็นครบถ้วน
    if (!username || !email || !password || !priority) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // เข้ารหัสรหัสผ่านโดยใช้ bcrypt
    const hashedPassword = await bcrypt.hash(password.toString(), 10);

    // SQL query สำหรับการ insert ผู้ใช้ใหม่ลงในฐานข้อมูล รวมถึง priority
    const query = 'INSERT INTO users (username, email, password, priority) VALUES (?, ?, ?, ?)';
    const values = [username, email, hashedPassword, priority];

    // เชื่อมต่อกับฐานข้อมูลและทำการ insert ผ่าน connection pool ที่มี promise
    const promisePool = mysqlPool.promise();
    const [result] = await promisePool.query(query, values);

    // ส่งคำตอบกลับให้กับ client ว่าลงทะเบียนสำเร็จแล้ว
    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Error registering user' }, { status: 500 });
  }
}
