"use client";
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button
} from '@mui/material';
import * as XLSX from 'xlsx';
import styles from './page.module.css';
import Link from 'next/link';


export const generateKey = () => {
  return uuidv4();
};

const Waerhouse = () => {
  const [data, setData] = useState([]);
  const [priority, setPriority] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      setIsLoggedIn(false);
      window.location.href = "/";
    } else {
      setIsLoggedIn(true);
    }
    const storedPriority = localStorage.getItem('priority');
    if (storedPriority) {
      setPriority(storedPriority);
    }
  }, []);

  useEffect(() => {
    const fetchData = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mywaerhouse`, {
        headers: {
          'loggedIn': localStorage.getItem('isLoggedIn') === 'true' ? 'true' : 'false'
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
          return response.json();
        })
        .then(result => {
          setData(result);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    };

    if (process.env.NEXT_PUBLIC_API_URL) {
      fetchData();
    }
  }, []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Warehouse Data");

    // Rename headers
    const headers = ["ยี่ห้อ", "โมเดล", "จำนวนอุปกรณ์ทั้งหมด", "จำนวนอุปกรณ์ที่ยังอยู่ในคลัง", "จำนวนอุปกรณ์ที่ขายแล้ว"];
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

    // Adjust column widths
    const maxWidths = data.reduce((widths, row) => {
      return [
        Math.max(widths[0], row.brand.length),
        Math.max(widths[1], row.model.length),
        Math.max(widths[2], row.total_model.toString().length),
        Math.max(widths[3], row.in_stock.toString().length),
        Math.max(widths[4], row.sold_out.toString().length)
      ];
    }, headers.map(header => header.length));

    worksheet["!cols"] = maxWidths.map(width => ({ width }));

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, "WarehouseData.xlsx");
  };

  if (!isLoggedIn) {
    return null; // or any other non-form content like a login prompt
  }

  return (
    <Box sx={{ width: '100%', padding: '100px' }} className={styles['fullscreen-container']}>
      <TableContainer component={Paper} className={styles['table-container']}>
        {priority === 'admin' || priority === 'user' ? (
          <Button className={styles.exportButton} onClick={exportToExcel}>
            Export to Excel
          </Button>
        ) : null}
        <Table className={styles.table}>
          <TableHead>
            <TableRow>
              <TableCell>ยี่ห้อ</TableCell>
              <TableCell>โมเดล</TableCell>              
              <TableCell>จำนวนอุปกรณ์ที่ยังอยู่ในคลัง</TableCell>
              <TableCell>จำนวนอุปกรณ์ที่ขายแล้ว</TableCell>
              <TableCell>จำนวนอุปกรณ์ทั้งหมด</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(equipment => (
              <TableRow key={generateKey()}>
                <TableCell>{equipment.brand}</TableCell>
                <TableCell>{equipment.model}</TableCell>                
                <TableCell>
                  <Link href={`/home/warehouse/${equipment.model}/instock`} passHref>
                    {equipment.in_stock}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/home/warehouse/${equipment.model}/soldout`} passHref>
                    {equipment.sold_out}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/home/warehouse/${equipment.model}/allmodel`} passHref>
                    {equipment.total_model}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Waerhouse;
