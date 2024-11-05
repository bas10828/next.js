// C:\Users\kanta\Desktop\Dev\test_app_next\app\home\page.js
"use client"
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
  TextField
} from '@mui/material';
import styles from './page.module.css';

export function getData() {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/myproject`, {
    headers: {
      'loggedIn': localStorage.getItem('isLoggedIn') === 'true' ? 'true' : 'false'
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }
      return res.json();
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      return [];
    });
}

export default function Page() {
  const [data, setData] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      setIsLoggedIn(false);
      window.location.href = "/";
    } else {
      setIsLoggedIn(true);
      getData().then(data => {
        setData(data);
      });
    }
  }, []);

  useEffect(() => {
    const filtered = data.filter((equipment) =>
      equipment.project.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log("Filtered Data:", filtered); // ตรวจสอบข้อมูลที่กรองได้
    setFilteredData(filtered);
  }, [searchTerm, data]);

  if (!isLoggedIn) {
    return <p>กำลังตรวจสอบการเข้าสู่ระบบ...</p>;
  }

  return (
    <div className="container-fluid mt-5"> {/* Bootstrap container */}
      <Box sx={{ width: '100%', padding: '16px' }} className={styles['fullscreen-container']}>
        <h5>ค้นหาโครงการ</h5>
        <TextField
          label="ค้นหาโครงการ"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles['search-input']}
          sx={{ marginBottom: '20px' }}
        />
        <TableContainer component={Paper} className={styles['table-container']}>
          <Table className={styles.table}>
            <TableHead>
              <TableRow>
                <TableCell>โครงการ</TableCell>
                <TableCell>จำนวนอุปกรณ์</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((equipment) => (
                  <TableRow key={equipment.project} className={styles.tableRow}>
                    <TableCell>
                      <Link href={`/home/${equipment.project}`} passHref>
                        {equipment.project}
                      </Link>
                    </TableCell>
                    <TableCell>{equipment.countproject}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    ไม่พบข้อมูล
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  );
}
