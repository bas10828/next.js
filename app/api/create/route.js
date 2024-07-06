import { mysqlPool } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const dataArray = await req.json(); // รับข้อมูลที่เป็นอาร์เรย์ของออบเจ็กต์

    // สร้าง query สำหรับการ insert หลายๆ แถวพร้อมกัน
    const query = `INSERT INTO equipment (proid, serial, mac, status_stock, into_stock, out_stock, price, brand, model, project, purchase) VALUES ?`;

    // สร้าง values array ที่มีลำดับของค่าสำหรับแต่ละแถว
    const values = dataArray.map(item => [
      item.proid,
      item.serial,
      item.mac,
      item.status_stock,
      item.into_stock,
      item.out_stock, 
      item.price,
      item.brand,
      item.model,
      item.project,
      item.purchase
    ]);

    // Create a promise-based connection
    const promisePool = mysqlPool.promise();

    // Execute the query with the values array
    await promisePool.query(query, [values]);

    return NextResponse.json({ message: 'Data created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error inserting data:', error);
    return NextResponse.json({ message: 'Failed to insert data' }, { status: 500 });
  }
}
