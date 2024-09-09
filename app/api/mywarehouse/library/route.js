import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

// GET - Fetch all records
export async function GET(request) {
  const loggedIn = request.headers.get('loggedIn');

  if (!loggedIn || loggedIn !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const promisePool = mysqlPool.promise();
  const query = `SELECT * FROM library`;

  try {
    const [rows] = await promisePool.query(query);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error executing query" }, { status: 500 });
  }
}

// POST - Create a new record
export async function POST(request) {
  const loggedIn = request.headers.get('loggedIn');

  if (!loggedIn || loggedIn !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { model, device_type, detail } = await request.json();

  if (!model || !device_type || !detail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const promisePool = mysqlPool.promise();
  const query = `INSERT INTO library (model, device_type, detail) VALUES (?, ?, ?)`;

  try {
    const [result] = await promisePool.query(query, [model, device_type, detail]);
    const newEntry = {
      id: result.insertId,
      model,
      device_type,
      detail      
    };
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error inserting data" }, { status: 500 });
  }
}

// PUT - Update a record
export async function PUT(request) {
  const loggedIn = request.headers.get('loggedIn');

  if (!loggedIn || loggedIn !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, model, device_type, detail } = await request.json();

  if (!id || !model || !device_type || !detail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const promisePool = mysqlPool.promise();
  const query = `UPDATE library SET model = ?, device_type = ?, detail = ? WHERE id = ?`;

  try {
    await promisePool.query(query, [model, device_type, detail, id]);
    return NextResponse.json({ message: "Record updated successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error updating data" }, { status: 500 });
  }
}

// DELETE - Delete a record
export async function DELETE(request) {
  const loggedIn = request.headers.get('loggedIn');

  if (!loggedIn || loggedIn !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const promisePool = mysqlPool.promise();
  const query = `DELETE FROM library WHERE id = ?`;

  try {
    await promisePool.query(query, [id]);
    return NextResponse.json({ message: "Record deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error deleting data" }, { status: 500 });
  }
}
