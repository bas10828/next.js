import { mysqlPool } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function PUT(req) {
  try {
    const { id, project,statusStock  } = await req.json();

    const query = `
      UPDATE equipment 
      SET project=? , status_stock=?
      WHERE id=?
    `;

    const values = [project,statusStock , id];

    const promisePool = mysqlPool.promise();

    const [result] = await promisePool.query(query, values);

    if (result.affectedRows > 0) {
      return NextResponse.json({ message: 'Project updated successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'No data updated' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ message: 'Failed to update project' }, { status: 500 });
  }
}
