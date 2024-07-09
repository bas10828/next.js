"use client"
import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, Paper, Typography, IconButton, Drawer, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import styles from './page.module.css';

export default function CreateProjectPage({ params }) {
  const { project } = params;
  const decodedProject = decodeURIComponent(project);

  const initialFormData = {
    proid: '',
    serial: '',
    mac: '',
    status_stock: '',
    into_stock: '',
    out_stock: '',
    price: '',
    brand: '',
    model: '',
    purchase: '',
    project: decodedProject
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [repeat, setRepeat] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuFormData, setMenuFormData] = useState({ proid: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Set default value for status_stock
    setFormData(prevState => ({
      ...prevState,
      status_stock: 'in stock'
    }));

    // Check if user is logged in
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      setIsLoggedIn(false);
      window.location.href = "/";
      // Redirect to login page or homepage
      console.log('User is not logged in, redirecting...');
      // You can use Link from Next.js for client-side navigation
      // Replace '/login' with your actual login page path
      // Example: <Link href="/login"><a>Login</a></Link>
      // Link tag should wrap around components that trigger navigation
    }else {
      setIsLoggedIn(true);      
    }
  }, []);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const list = () => (
    <Box role="presentation" className={styles.drawerForm}>
      <form onSubmit={handleMenuSubmit}>
        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          label="รหัสครุภัณฑ์"
          name="proid"
          value={menuFormData.proid}
          onChange={handleMenuInputChange}
          required
        />
        <Button type="submit" variant="contained" color="primary" className={styles.submitButton}>
          Submit
        </Button>
      </form>
    </Box>
  );

  const handleMenuInputChange = (e) => {
    const { name, value } = e.target;
    setMenuFormData({
      ...menuFormData,
      [name]: value
    });
  };

  const handleMenuSubmit = (e) => {
    e.preventDefault();
    // Fetch data from the API
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create/get1stforcreate/${menuFormData.proid}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const { proid, brand, model } = data[0];
          setFormData(prevFormData => ({
            ...prevFormData,
            proid: proid,
            brand: brand,
            model: model
          }));
          setDrawerOpen(false); // Close the drawer after fetching the data
        } else {
          console.error('No data found for the given proid');
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRepeatChange = (e) => {
    setRepeat(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Example fetch request to POST data to the server
    const repeatedData = Array.from({ length: repeat }, () => ({ ...formData }));
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(repeatedData)
    })
      .then((response) => {
        if (response.ok) {
          console.log('Project created successfully');
          setIsFormSubmitted(true); // Set form submitted flag to true
        } else {
          console.error('Failed to create project');
        }
      })
      .catch((error) => {
        console.error('Error creating project:', error);
      });
  };

  useEffect(() => {
    if (isFormSubmitted) {
      // Redirect to the project page
      window.location.href = `/home/${project}`;
    }
  }, [isFormSubmitted, project]);

  const preventEnterKeySubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };
  if (!isLoggedIn) {
    return null; // or any other non-form content like a login prompt
  }
  
  return (
    <Grid container justifyContent="center" spacing={2} className={styles.container}>
      <Grid item xs={12} md={6}>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
        
        <Paper elevation={3} className={styles.paper}>
          <Typography variant="h5" gutterBottom className={styles.heading}>
            เพิ่มข้อมูลของโปรเจค {decodedProject}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              label="รหัสครุภัณฑ์"
              name="proid"
              value={formData.proid}
              onChange={handleChange}
              onKeyDown={preventEnterKeySubmit}
              className={styles.textField}
            />
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              label="Brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              onKeyDown={preventEnterKeySubmit}
              className={styles.textField}
            />
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              label="Model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              onKeyDown={preventEnterKeySubmit}
              className={styles.textField}
            />
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              label="Serial"
              name="serial"
              value={formData.serial}
              onChange={handleChange}
              onKeyDown={preventEnterKeySubmit}
              className={styles.textField}
            />
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              label="MAC Address"
              name="mac"
              value={formData.mac}
              onChange={handleChange}
              onKeyDown={preventEnterKeySubmit}
              className={styles.textField}
            />
            <FormControl fullWidth variant="outlined" margin="normal" className={styles.textField}>
              <InputLabel>Status Stock</InputLabel>
              <Select
                label="Status Stock"
                name="status_stock"
                value={formData.status_stock}
                onChange={handleChange}
                onKeyDown={preventEnterKeySubmit}
              >
                <MenuItem value="in stock">In Stock</MenuItem>
                <MenuItem value="sold out">Sold Out</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              label="Into Stock"
              type="date"
              name="into_stock"
              value={formData.into_stock}
              onChange={handleChange}
              onKeyDown={preventEnterKeySubmit}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                // Date format mask for DD/MM/YYYY
                pattern: '\\d{2}/\\d{2}/\\d{4}',
              }}
              className={styles.textField}
              required
            />
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              label="Out Stock"
              type="date"
              name="out_stock"
              value={formData.out_stock}
              onChange={handleChange}
              onKeyDown={preventEnterKeySubmit}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                // Date format mask for DD/MM/YYYY
                pattern: '\\d{2}/\\d{2}/\\d{4}',
              }}
              className={styles.textField}
            />
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              label="Price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              onKeyDown={preventEnterKeySubmit}
              className={styles.textField}
            />
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              label="Purchase"
              name="purchase"
              value={formData.purchase}
              onChange={handleChange}
              onKeyDown={preventEnterKeySubmit}
              className={styles.textField}
            />
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              label="Repeat"
              type="number"
              name="repeat"
              value={repeat}
              onChange={handleRepeatChange}
              onKeyDown={preventEnterKeySubmit}
              required
              className={styles.textField}
            />
            <Button type="submit" variant="contained" className={styles.submitButton}>
              Create Project
            </Button>
          </form>
        </Paper>
      </Grid>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {list()}
      </Drawer>
    </Grid>
  );
}
