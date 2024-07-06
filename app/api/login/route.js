import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { mysqlPool } from '@/utils/db';

export async function POST(request) {
  try {
    const { loginIdentifier, password } = await request.json();
    const promisePool = mysqlPool.promise();

    const [rows] = await promisePool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [loginIdentifier, loginIdentifier]
    );

    if (rows.length > 0) {
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        return NextResponse.json({ message: 'Login successful', user });
      } else {
        return NextResponse.json({ message: 'Invalid login credentials' }, { status: 401 });
      }
    } else {
      return NextResponse.json({ message: 'Invalid login credentials' }, { status: 401 });
    }
  } catch (err) {
    console.error('Error during login:', err);
    return NextResponse.json({ error: 'Error during login' }, { status: 500 });
  }
}
