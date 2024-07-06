// C:\Users\kanta\Desktop\Dev\NEXT.js\my-appv2\app\api\update\route.js

import { mysqlPool } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function PUT(req) {
  try {
    const { id, proid, serial, mac, status_stock, into_stock, out_stock, price, brand, model, project, purchase } = await req.json();

    const query = `
      UPDATE equipment 
      SET proid=?, serial=?, mac=?, status_stock=?, into_stock=?, out_stock=?, price=?, brand=?, model=?, project=?, purchase=? 
      WHERE id=?
    `;

    const values = [proid, serial, mac, status_stock, into_stock, out_stock, price, brand, model, project, purchase, id];

    const promisePool = mysqlPool.promise();

    const [result] = await promisePool.query(query, values);

    if (result.affectedRows > 0) {
      return NextResponse.json({ message: 'Data updated successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'No data updated' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating data:', error);
    return NextResponse.json({ message: 'Failed to update data' }, { status: 500 });
  }
}
