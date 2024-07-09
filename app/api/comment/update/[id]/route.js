import { NextResponse } from 'next/server';
import { mysqlPool } from '@/utils/db';

export async function PUT(request, { params }) {
  try {
    // Extract the 'id' parameter from the URL
    const { id } = params;

    // Extract data from the request
    const { serial, user, comment_text } = await request.json();

    // Validate input data
    if (!id) {
      return NextResponse.json({ error: "Missing 'id' parameter" }, { status: 400 });
    }
    if (!serial) {
      return NextResponse.json({ error: "Missing 'serial' parameter" }, { status: 400 });
    }

    // Generate the current timestamp in the correct format
    const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Prepare the SQL query
    const query = `
      UPDATE comment
      SET user = ?, timestamp = CONVERT_TZ(?, '+00:00', '+07:00'), comment_text = ?, serial = ?
      WHERE id = ?;
    `;

    // Execute the query
    const promisePool = mysqlPool.promise();
    const [result] = await promisePool.query(query, [user, currentTimestamp, comment_text, serial, id]);

    // Check if the update was successful
    if (result.affectedRows > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "No comment found to update" }, { status: 404 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error executing query" }, { status: 500 });
  }
}
