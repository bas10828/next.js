"use client"
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
  Button,
  TableSortLabel,
  Select,
  MenuItem,
  TextField,
  Drawer,
  Typography
} from '@mui/material';
import * as XLSX from 'xlsx';
import styles from './page.module.css';
import Link from 'next/link';
import Image from 'next/image';
export const generateKey = () => {
  return uuidv4();
};

const Waerhouse = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]); // เก็บข้อมูลต้นฉบับ
  const [priority, setPriority] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [filterInput, setFilterInput] = useState('');

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
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mywarehouse`, {
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
          setOriginalData(result); // เก็บข้อมูลต้นฉบับ
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    };

    if (process.env.NEXT_PUBLIC_API_URL) {
      fetchData();
    }
  }, []);

  const handleSort = (column) => {
    const isAsc = sortBy === column && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(column);

    const sortedData = [...data].sort((a, b) => {
      const valueA = a[column] || '';
      const valueB = b[column] || '';

      if (isAsc) {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });

    setData(sortedData);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Warehouse Data");

    const headers = ["ยี่ห้อ", "โมเดล", "จำนวนอุปกรณ์ทั้งหมด", "จำนวนอุปกรณ์ที่ยังอยู่ในคลัง", "จำนวนอุปกรณ์ที่ขายแล้ว"];
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

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

    XLSX.writeFile(workbook, "WarehouseData.xlsx");
  };

  const handleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // ป้องกันการกด Enter จากการ submit form
      applyFilter(); // เรียกใช้ฟังก์ชัน applyFilter
    }
  };

  const applyFilter = () => {
    let filteredData = data;

    if (filterType === 'All') {
      filteredData = originalData; // ใช้ข้อมูลต้นฉบับทั้งหมด
    } else if (filterType !== 'All') {
      filteredData = originalData.filter(item =>
        (item[filterType] || '').toLowerCase().includes(filterInput.toLowerCase())
      );
    }

    setData(filteredData);
    setFilterOpen(false);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', padding: '100px' }} className={styles['fullscreen-container']}>
      <Typography variant="h4" className={styles['header-title']}>Warehouse Management</Typography>
      {priority === 'admin' || priority === 'user' ? (
        <>
          <Button
            className={styles.findButton}
            onClick={handleFilter}
          >
            FIND
          </Button>
          <Button className={styles.exportButton} onClick={exportToExcel}>
            Export to Excel
          </Button>
          <Button
            className={styles.libraryButton}
            component={Link}
            href="/home/warehouse/library"
          >
            Go to Library
          </Button>
        </>
      ) : null}
      <TableContainer component={Paper} className={styles['table-container']}>
        <Table className={styles.table}>
          <TableHead className={styles.tableHead}>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'brand'}
                  direction={sortOrder}
                  onClick={() => handleSort('brand')}
                >
                  ยี่ห้อ
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'model'}
                  direction={sortOrder}
                  onClick={() => handleSort('model')}
                >
                  โมเดล
                </TableSortLabel>
              </TableCell>
              <TableCell>รูป</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'device_type'}
                  direction={sortOrder}
                  onClick={() => handleSort('device_type')}
                >
                  ชนิดอุปกรณ์
                </TableSortLabel>
              </TableCell>
              <TableCell>ที่ยังอยู่ในคลัง</TableCell>
              <TableCell>ที่ขายแล้ว</TableCell>
              <TableCell>ทั้งหมด</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(equipment => (
              <TableRow key={generateKey()} className={styles.tableRow}>
                <TableCell className={styles.tableCell}>{equipment.brand}</TableCell>
                <TableCell className={styles.tableCell}>
                  <Link href={`/home/warehouse/${equipment.model}/showdetail`} passHref>
                    {equipment.model}
                  </Link>
                </TableCell>
                <TableCell>
                  <Image
                    src={equipment.model ? `/devicepic/${equipment.model}.png` : '/devicepic/default.png'}
                    alt={equipment.model || 'default'}
                    layout="intrinsic" // ปรับขนาดภาพตามสัดส่วนดั้งเดิม
                    objectFit="contain" // ทำให้ภาพอยู่ในกรอบและไม่โดนบี้
                    width={200} // กำหนดความกว้างสูงสุด 100px
                    height={200} // กำหนดความสูงสูงสุด 100px
                    className={styles.cardImage}
                  // onClick={() => handleImageClick(`/devicepic/${equipment.model}.png`)}
                  />
                </TableCell>
                <TableCell className={styles.tableCell}>{equipment.device_type}</TableCell>
                <TableCell className={styles.tableCell}>
                  <Link href={`/home/warehouse/${equipment.model}/instock`} passHref>
                    {equipment.in_stock}
                  </Link>
                </TableCell>
                <TableCell className={styles.tableCell}>
                  <Link href={`/home/warehouse/${equipment.model}/soldout`} passHref>
                    {equipment.sold_out}
                  </Link>
                </TableCell>
                <TableCell className={styles.tableCell}>
                  <Link href={`/home/warehouse/${equipment.model}/allmodel`} passHref>
                    {equipment.total_model}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Drawer anchor="right" open={filterOpen} onClose={handleFilter}>
        <Box className={styles.drawerContent}>
          <Select
            className={styles.selectField}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            fullWidth
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="brand">Brand</MenuItem>
            <MenuItem value="model">Model</MenuItem>
            <MenuItem value="device_type">Device Type</MenuItem>
          </Select>
          {filterType !== 'All' && (
            <TextField
              className={styles.textField}
              value={filterInput}
              onChange={(e) => setFilterInput(e.target.value)}
              label="Filter"
              fullWidth
              onKeyDown={handleKeyDown}
            />
          )}
          <Button
            className={styles.applyButton}
            variant="contained"
            onClick={applyFilter}
            fullWidth
          >
            Apply Filter
          </Button>
        </Box>
      </Drawer>

    </Box>
  );
};

export default Waerhouse;
