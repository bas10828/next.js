import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";
import moment from "moment-timezone";

export async function GET(req, { params }) {
  const { monthYear } = params;
  console.log("monthyear", monthYear);

  // Validate monthYear format (YYYY-MM)
  if (!moment(monthYear, 'YYYY-MM', true).isValid()) {
    return NextResponse.json({ error: 'Invalid monthYear format. Use YYYY-MM' }, { status: 400 });
  }

  // Construct start and end dates for the specified monthYear
  const startDate = moment(monthYear, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
  const endDate = moment(monthYear, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');

  const promisePool = mysqlPool.promise();

  try {
    const [rows, fields] = await promisePool.query(
      `SELECT * FROM schedule 
       WHERE DATE(date_start) >= ? AND DATE(date_end) <= ?
       ORDER BY date_start ASC;`,
      [startDate, endDate]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
