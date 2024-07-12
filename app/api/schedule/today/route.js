import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";
import moment from "moment-timezone";

export async function GET(request) {
  const loggedIn = request.headers.get('loggedIn');

  if (!loggedIn || loggedIn !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = moment().startOf('day').format('YYYY-MM-DD');
  const promisePool = mysqlPool.promise();

  try {
    const [rows, fields] = await promisePool.query(
      `SELECT * FROM schedule 
       WHERE DATE(date_start) >= ? OR DATE(date_end) >= ?
       ORDER BY date_start ASC;;`,
      [today, today]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
