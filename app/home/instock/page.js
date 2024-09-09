"use client";
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import * as XLSX from 'xlsx';
import styles from './page.module.css';
import Link from 'next/link';

const fetchData = () => {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/instock`, {
    headers: {
      'loggedIn': localStorage.getItem('isLoggedIn') === 'true' ? 'true' : 'false'
    }
  })
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
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' หรือ 'desc'
  const [sortBy, setSortBy] = useState('brand'); // 'brand' หรือ 'model'
  const [sortedData, setSortedData] = useState([]);
  const [filterColumn, setFilterColumn] = useState('brand'); // คอลัมน์ที่กรอง
  const [filterValue, setFilterValue] = useState('');

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
    fetchData()
      .then(fetchedData => {
        setData(fetchedData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  useEffect(() => {
    const filtered = data.filter(item => {
      if (filterValue === '') return true;
      return item[filterColumn].toString().toLowerCase().includes(filterValue.toLowerCase());
    });

    const sorted = filtered.sort((a, b) => {
      if (sortBy === 'brand') {
        return sortDirection === 'asc'
          ? a.brand.localeCompare(b.brand)
          : b.brand.localeCompare(a.brand);
      } else if (sortBy === 'model') {
        return sortDirection === 'asc'
          ? a.model.localeCompare(b.model)
          : b.model.localeCompare(a.model);
      }
      return 0;
    });

    setSortedData(sorted);
  }, [sortDirection, sortBy, data, filterColumn, filterValue]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(sortedData.map(equipment => ({
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

    XLSX.writeFile(workbook, "Instock.xlsx");
  };

  const handleDelete = async (id) => {
    if (window.confirm('ต้องการลบรายการนี้?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/delete/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete data');
        }

        setData(data.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting data:', error);
      }
    }
  };

  const handleSort = (field) => {
    if (field === sortBy) {
      setSortDirection(prevDirection => (prevDirection === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (event) => {
    setFilterValue(event.target.value);
  };

  const handleColumnChange = (event) => {
    setFilterColumn(event.target.value);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', padding: '16px' }} className={styles['fullscreen-container']}>

      <Box className={styles.filterContainer}>
        <FormControl className={styles.filterControl}>
          <InputLabel>Filter Column</InputLabel>
          <Select
            value={filterColumn}
            onChange={handleColumnChange}
            label="Filter Column"
          >
            <MenuItem value="proid">รหัสครุภัณฑ์</MenuItem>
            <MenuItem value="brand">Brand</MenuItem>
            <MenuItem value="model">Model</MenuItem>
            <MenuItem value="serial">Serial</MenuItem>
            <MenuItem value="mac">MAC</MenuItem>
            <MenuItem value="purchase">ซื้อมาจาก</MenuItem>
            <MenuItem value="project">โครงการ</MenuItem>
            
            {/* เพิ่มคอลัมน์อื่น ๆ ที่ต้องการกรอง */}
          </Select>
        </FormControl>
        <TextField
          className={styles.filterTextField}
          label="Filter Value"
          variant="outlined"
          value={filterValue}
          onChange={handleFilterChange}
        />
        {priority === 'admin' || priority === 'user' ? (
          <Button className={styles.exportButton} onClick={exportToExcel}>
            Export Excel
          </Button>
        ) : null}
      </Box>

      <TableContainer component={Paper} className={styles['table-container']}>
        <Table className={styles.table}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>รหัสครุภัณฑ์</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'brand'}
                  direction={sortBy === 'brand' ? sortDirection : 'asc'}
                  onClick={() => handleSort('brand')}
                >
                  Brand
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'model'}
                  direction={sortBy === 'model' ? sortDirection : 'asc'}
                  onClick={() => handleSort('model')}
                >
                  Model
                </TableSortLabel>
              </TableCell>
              <TableCell>Serial</TableCell>
              <TableCell>MAC</TableCell>
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
            {sortedData.map(equipment => (
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
                    <TableCell className={styles.tableCellButton}>
                      <Link href={`/home/instock/update/${equipment.id}`} passHref>
                        <Button variant="outlined">แก้ไข</Button>
                      </Link>
                    </TableCell>
                    <TableCell className={styles.tableCellButton}>
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
