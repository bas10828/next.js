"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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

const fetchData = () => {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/soldout`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response.json();
    });
};

const Page = () => {
  const [data, setData] = useState([]);
  const [priority, setPriority] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      setIsLoggedIn(false);
      window.location.href = "/";
    }else {
      setIsLoggedIn(true);      
    }
    const storedPriority = localStorage.getItem('priority');
    if (storedPriority) {
      setPriority(storedPriority);
    }
  }, []);


  useEffect(() => {
    fetchData()
      .then(fetchedData => {
        setData(fetchedData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        // Handle error state if needed
      });
  }, []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(equipment => ({
      ID: equipment.id,
      รหัสครุภัณฑ์: equipment.proid,
      BRAND: equipment.brand,
      MODEL: equipment.model,
      SERIAL: equipment.serial,
      MAC: equipment.mac,
      ราคา: equipment.price,
      ซื้อมาจาก: equipment.purchase,
      STATUS: equipment.status_stock,
      วันซื้อ: equipment.into_stock,
      วันขาย: equipment.out_stock,
      โครงการ: equipment.project,
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Instock");

    // Adjust column widths
    const maxWidths = [
      { width: 10 }, // ID
      { width: 20 }, // รหัสครุภัณฑ์
      { width: 15 }, // BRAND
      { width: 15 }, // MODEL
      { width: 20 }, // SERIAL
      { width: 20 }, // MAC
      { width: 10 }, // ราคา
      { width: 20 }, // ซื้อมาจาก
      { width: 10 }, // STATUS
      { width: 15 }, // วันซื้อ
      { width: 15 }, // วันขาย
      { width: 20 }  // โครงการ
    ];

    worksheet["!cols"] = maxWidths;

    XLSX.writeFile(workbook, "Soldout.xlsx");
  };

  if (!isLoggedIn) {
    return null; // or any other non-form content like a login prompt
  }

  return (
    <Box sx={{ width: '100%', padding: '16px' }} className={styles['fullscreen-container']}>
      <TableContainer component={Paper} className={styles['table-container']}>
        {priority === 'admin' || priority === 'user' ? (
          <Button onClick={exportToExcel}>
            export excel
          </Button>
        ) : null}
        <Table className={styles.table}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>รหัสครุภัณฑ์</TableCell>
              <TableCell>brand</TableCell>
              <TableCell>model</TableCell>
              <TableCell>serial</TableCell>
              <TableCell>mac</TableCell>
              <TableCell>ราคา</TableCell>
              <TableCell>ซื้อมาจาก</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>วันซื้อ</TableCell>
              <TableCell>วันขาย</TableCell>
              <TableCell>โครงการ</TableCell>
              {priority === 'user' || priority === 'admin' ? (
                <>
                  <TableCell>แก้ไข</TableCell>
                  <TableCell>ลบ</TableCell>
                </>
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(equipment => (
              <TableRow key={equipment.id}>
                <TableCell>{equipment.id}</TableCell>
                <TableCell>{equipment.proid}</TableCell>
                <TableCell>{equipment.brand}</TableCell>
                <TableCell>{equipment.model}</TableCell>
                <TableCell>{equipment.serial}</TableCell>
                <TableCell>{equipment.mac}</TableCell>
                <TableCell>{equipment.price}</TableCell>
                <TableCell>{equipment.purchase}</TableCell>
                <TableCell>{equipment.status_stock}</TableCell>
                <TableCell>{equipment.into_stock}</TableCell>
                <TableCell>{equipment.out_stock}</TableCell>
                <TableCell>{equipment.project}</TableCell>
                {priority === 'user' || priority === 'admin' ? (
                  <>
                    <TableCell>
                      <Link href={`/home/soldout/update/${equipment.id}`} passHref>
                        <Button variant="outlined">แก้ไข</Button>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Button variant="outlined" color="error" onClick={() => handleDelete(equipment.id)}>
                        ลบ
                      </Button>
                    </TableCell>
                  </>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Page;
