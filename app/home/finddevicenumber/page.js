"use client"
import React, { useState, useEffect, useCallback } from 'react';
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
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';

// Define the styled TextField using MUI's styled function
const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.dark,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-outlined': {
    color: theme.palette.primary.main,
  },
  '& .MuiInputLabel-outlined.Mui-focused': {
    color: theme.palette.primary.dark,
  }
}));

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: '#fff',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

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
  const [commentCounts, setCommentCounts] = useState([]);
  
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

  // Function to fetch comment count from API for each row in data
  const fetchCommentCounts = useCallback(async () => {
    try {
      const counts = [];

      for (const equipment of data) {
        if (!equipment.serial) {
          counts.push("olo");
          continue; // ข้ามไปยัง iteration ถัดไป
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comment/countcomment/${equipment.serial}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch comment count for serial: ${equipment.serial}`);
        }
        const result = await res.json();
        counts.push(result[0].count || 0);
      }

      setCommentCounts(counts);
    } catch (error) {
      console.error('Error fetching comment counts:', error);
    }
  }, [data]);



  useEffect(() => {
    if (data.length > 0) {
      fetchCommentCounts(); // Call the function to fetch comment counts only when data changes
    }
  }, [data, fetchCommentCounts]);

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

    // Reset commentCounts to empty array when submitting new search
    setCommentCounts([]);

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
    <>
      <Box className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>

          <Box className={styles.formControls}>
            <Typography variant="h4" gutterBottom className={styles.title}>
              ค้นหาอุปกรณ์
            </Typography>
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
            <CustomButton type="submit">
              Search
            </CustomButton>

            <CustomButton onClick={handleExportExcel}>
              Export Excel
            </CustomButton>
            <CustomButton onClick={toggleDrawer(true)} startIcon={<AddIcon />} >
              Cart ({cart.length})
            </CustomButton>
          </Box>

        </form>
        {error && (
          <Typography color="error" className={styles.error}>
            {error}
          </Typography>
        )}
      </Box>

      <TableContainer component={Paper} className={styles.tableContainer}>
        <Table className={styles.table}>
          <TableHead className={styles.tableHead}>
            <TableRow>
              {/* <TableCell className={styles.tableCell}>ID</TableCell> */}
              <TableCell className={styles.tableCell}>รหัสครุภัณฑ์</TableCell>
              <TableCell className={styles.tableCell}>Brand</TableCell>
              <TableCell className={styles.tableCell}>Model</TableCell>
              <TableCell className={styles.tableCell}>Serial</TableCell>
              <TableCell className={styles.tableCell}>MAC</TableCell>
              <TableCell className={styles.tableCell}>ราคา</TableCell>
              <TableCell className={styles.tableCell}>ซื้อมาจาก</TableCell>
              <TableCell className={styles.tableCell}>Status</TableCell>
              <TableCell className={styles.tableCell}>วันซื้อ</TableCell>
              <TableCell className={styles.tableCell}>วันขาย</TableCell>
              <TableCell className={styles.tableCell}>โครงการ</TableCell>
              {priority === 'user' || priority === 'admin' ? (
                <>
                  <TableCell className={styles.tableCell}>แก้ไข</TableCell>
                  <TableCell className={styles.tableCell}>ลบ</TableCell>
                  <TableCell className={styles.tableCell}>ADD</TableCell>
                </>
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody className={styles.tableBody}>
            {data.map(equipment => (
              <TableRow key={equipment.id} className={styles.tableRow}>
                {/* <TableCell className={styles.tableCell}>{equipment.id}</TableCell> */}
                <TableCell className={styles.tableCell}>{equipment.proid}</TableCell>
                <TableCell className={styles.tableCell}>{equipment.brand}</TableCell>
                <TableCell className={styles.tableCell}>{equipment.model}</TableCell>
                <TableCell className={styles.tableCell}>
                  {equipment.serial}
                  {commentCounts[data.indexOf(equipment)] !== 'olo' ? (
                    <Link href={`/home/comment/${equipment.serial}`} passHref>
                      <IconButton size="small">
                        <CommentOutlinedIcon />
                        {commentCounts[data.indexOf(equipment)]}
                      </IconButton>
                    </Link>
                  ) : null}

                </TableCell>
                <TableCell className={styles.tableCell}>{equipment.mac}</TableCell>
                <TableCell className={styles.tableCell}>{equipment.price}</TableCell>
                <TableCell className={styles.tableCell}>{equipment.purchase}</TableCell>
                <TableCell className={styles.tableCell}>{equipment.status_stock}</TableCell>
                <TableCell className={styles.tableCell}>{equipment.into_stock}</TableCell>
                <TableCell className={styles.tableCell}>{equipment.out_stock}</TableCell>
                <TableCell className={styles.tableCell}>{equipment.project}</TableCell>
                {priority === 'user' || priority === 'admin' ? (
                  <>
                    <TableCell className={styles.tableCell}>
                      <Link href={`/home/finddevicenumber/update/${equipment.id}`} passHref>
                        <Button className={`${styles.button} ${styles.buttonedit}`} variant="outlined">แก้ไข</Button>
                      </Link>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <Button className={`${styles.button} ${styles.buttondel}`} variant="outlined" onClick={() => handleDelete(equipment.id)}>
                        ลบ
                      </Button>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      {cart.some(item => item.id === equipment.id) ? (
                        <IconButton className={`${styles.iconButton} ${styles.buttondel}`} onClick={() => removeFromCart(equipment.id)}>
                          <DeleteIcon />
                        </IconButton>
                      ) : (
                        <IconButton className={`${styles.iconButton} ${styles.buttonadd}`} onClick={() => addToCart(equipment)}>
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
    </>
  );
}
