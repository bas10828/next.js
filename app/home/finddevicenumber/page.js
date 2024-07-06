"use client"
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Drawer,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './page.module.css'; // Import CSS module for general styles
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import * as XLSX from 'xlsx';

// Define the styled TextField using MUI's styled function
const CustomTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#007acc',
    },
    '&:hover fieldset': {
      borderColor: '#005f99',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#003f66',
    },
  },
  '& .MuiInputLabel-outlined': {
    color: '#007acc',
  },
  '& .MuiInputLabel-outlined.Mui-focused': {
    color: '#003f66',
  }
});

export default function FindDeviceNumber() {
  const [searchType, setSearchType] = useState('proid');
  const [searchValue, setSearchValue] = useState('');
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [priority, setPriority] = useState('');
  const [cart, setCart] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [project, setProject] = useState('');
  const [statusStock, setStatusStock] = useState('sold out');
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
    if (cart.length > 0) {
      setProject(cart[0].project);
    } else {
      setProject('');
    }
  }, [cart]);

  const handleInputChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!searchValue) {
      setError('Please enter a valid value');
      return;
    }
    setError('');

    let apiUrl = '';

    switch (searchType) {
      case 'proid':
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/findproid/${searchValue}`;
        break;
      case 'brand':
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/findbrand/${searchValue}`;
        break;
      case 'model':
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/findmodel/${searchValue}`;
        break;
      case 'serial':
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/findserial/${searchValue}`;
        break;
      case 'purchase':
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/findpurchase/${searchValue}`;
        break;
      case 'project':
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/findproject/${searchValue}`;
        break;
      default:
        setError('Invalid search type');
        return;
    }

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error(error);
      setError('Error fetching data');
    }
  };

  const handleSelectChange = (event) => {
    setSearchType(event.target.value);
    setSearchValue(''); // Clear previous search value when changing search type
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'exported_data.xlsx');
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
        // window.location.reload();
      } catch (error) {
        console.error('Error deleting data:', error);
      }
    }
  };

  const addToCart = (equipment) => {
    if (!cart.some(item => item.id === equipment.id)) {
      setCart([...cart, equipment]);
    } else {
      alert('สินค้านี้ถูกเพิ่มไปยังตะกร้าแล้ว');
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleProjectChange = (event) => {
    setProject(event.target.value);
  };

  const handleStatusStockChange = (event) => {
    setStatusStock(event.target.value);
  };

  const handleCartSubmit = async (event) => {
    event.preventDefault();
    for (let item of cart) {
      try {
        const response = await fetch(`/api/updateproject`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: item.id, project, statusStock }),
        });

        if (!response.ok) {
          throw new Error('Failed to update data');
        }

        const result = await response.json();
        console.log(result.message);
      } catch (error) {
        console.error('Error updating data:', error);
      }
    }
    setCart([]);
    setDrawerOpen(false);

    await handleSubmit(new Event('submit'));
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  if (!isLoggedIn) {
    return null; // or any other non-form content like a login prompt
  }

  return (
    <Box sx={{ width: '100%', padding: '16px' }} className={styles['fullscreen-container']}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Typography variant="h4" gutterBottom>
          ค้นหาอุปกรณ์
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl variant="outlined" className={styles.input}>
            <InputLabel id="search-type-label">ประเภทค้นหา</InputLabel>
            <Select
              labelId="search-type-label"
              id="search-type-select"
              value={searchType}
              onChange={handleSelectChange}
              label="ประเภทค้นหา"
            >
              <MenuItem value="proid">รหัสครุภัณฑ์</MenuItem>
              <MenuItem value="brand">Brand</MenuItem>
              <MenuItem value="model">Model</MenuItem>
              <MenuItem value="serial">Serial</MenuItem>
              <MenuItem value="purchase">Purchase</MenuItem>
              <MenuItem value="project">Project</MenuItem>
            </Select>
          </FormControl>
          <CustomTextField
            label={`ค้นหาด้วย ${searchType === 'proid' ? 'รหัสครุภัณฑ์' : searchType.charAt(0).toUpperCase() + searchType.slice(1)}`}
            value={searchValue}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
            required
            className={styles.input} // Use CSS module class for individual styling
          />
          <Button type="submit" variant="contained" color="primary" className={styles.button}>
            Search
          </Button>
        </Box>
        <Button className={styles.customButton} onClick={handleExportExcel}>
          export excel
        </Button>
        <Button type="button" variant="contained" color="primary" onClick={toggleDrawer(true)} startIcon={<AddIcon />} className={styles['cart-button']}>
          Cart ({cart.length})
        </Button>
      </form>
      {error && (
        <Typography color="error" sx={{ marginTop: '16px' }}>
          {error}
        </Typography>
      )}
      <TableContainer component={Paper} className={styles['table-container']} sx={{ marginTop: '32px' }}>
        <Table className={styles.table}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>รหัสครุภัณฑ์</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Model</TableCell>
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
                  <TableCell>ADD</TableCell>
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
                      <Link href={`/home/finddevicenumber/update/${equipment.id}`} passHref>
                        <Button variant="outlined">แก้ไข</Button>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Button variant="outlined" color="error" onClick={() => handleDelete(equipment.id)}>
                        ลบ
                      </Button>
                    </TableCell>
                    <TableCell>
                      {cart.some(item => item.id === equipment.id) ? (
                        <IconButton color="secondary" onClick={() => removeFromCart(equipment.id)}>
                          <DeleteIcon />
                        </IconButton>
                      ) : (
                        <IconButton color="primary" onClick={() => addToCart(equipment)}>
                          <AddIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 350, padding: '16px' }}>
          <Typography variant="h5" gutterBottom>
            ตะกร้าสินค้า
          </Typography>
          {cart.length === 0 ? (
            <Typography variant="body1">ไม่มีสินค้าในตะกร้า</Typography>
          ) : (
            <TableContainer component={Paper}>
              <form onSubmit={handleCartSubmit}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>รหัสครุภัณฑ์</TableCell>
                      <TableCell>Brand</TableCell>
                      <TableCell>Model</TableCell>
                      <TableCell>ลบ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.proid}</TableCell>
                        <TableCell>{item.brand}</TableCell>
                        <TableCell>{item.model}</TableCell>
                        <TableCell>
                          <IconButton color="error" onClick={() => removeFromCart(item.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Box sx={{ marginTop: '16px' }}>
                  <CustomTextField
                    label="Project"
                    value={project}
                    onChange={handleProjectChange}
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="status-stock-label">Status Stock</InputLabel>
                    <Select
                      labelId="status-stock-label"
                      id="status-stock-select"
                      value={statusStock}
                      onChange={handleStatusStockChange}
                      label="Status Stock"
                      required
                    >
                      <MenuItem value="in stock">In Stock</MenuItem>
                      <MenuItem value="sold out">Sold Out</MenuItem>
                    </Select>
                  </FormControl>
                  <Button type="submit" variant="contained" color="primary" sx={{ marginTop: '8px' }}>
                    Submit
                  </Button>
                </Box>
              </form>
            </TableContainer>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
