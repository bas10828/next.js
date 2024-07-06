"use client"
import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, Paper, Typography, IconButton, Drawer, Box,Select,MenuItem, FormControl, InputLabel } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import styles from './page.module.css';

export default function CreateProjectPage({ params }) {
  const { project } = params;
  const decodedProject = decodeURIComponent(project);

  const initialFormData = {
    proid: '',
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuFormData, setMenuFormData] = useState({ proid: '' });
  const [serials, setSerials] = useState(['']);
  const [macs, setMacs] = useState(['']);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {    
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      setIsLoggedIn(false);
      window.location.href = "/";
    }else {
      setIsLoggedIn(true);      
    }
    // Set default value for status_stock
    setFormData(prevState => ({
      ...prevState,
      status_stock: 'in stock'
    }));
  }, []);

  useEffect(() => {
    if (isFormSubmitted) {
      // Redirect to the home page of the project
      window.location.href = `/home/${project}`;
    }
  }, [isFormSubmitted, project]);

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
          setDrawerOpen(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const repeatedData = serials.map((serial, index) => ({
      ...formData,
      serial: serial,
      mac: macs[index] || ''
    }));

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
          setIsFormSubmitted(true);
        } else {
          console.error('Failed to create project');
        }
      })
      .catch((error) => {
        console.error('Error creating project:', error);
      });
  };

  const handleAdditionalFieldChange = (e, index, fieldType) => {
    const { value } = e.target;
    if (fieldType === 'serial') {
      const updatedSerials = [...serials];
      updatedSerials[index] = value;
      setSerials(updatedSerials);
    } else if (fieldType === 'mac') {
      const updatedMacs = [...macs];
      updatedMacs[index] = value;
      setMacs(updatedMacs);
    }
  };

  const handleAddField = () => {
    setSerials([...serials, '']);
    setMacs([...macs, '']);
  };

  const handleRemoveField = (index) => {
    const updatedSerials = serials.filter((_, i) => i !== index);
    const updatedMacs = macs.filter((_, i) => i !== index);
    setSerials(updatedSerials);
    setMacs(updatedMacs);
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
              
              className={styles.textField}
            />
            <FormControl fullWidth variant="outlined" margin="normal" className={styles.textField}>
              <InputLabel>Status Stock</InputLabel>
              <Select
                label="Status Stock"
                name="status_stock"
                value={formData.status_stock}
                onChange={handleChange}
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
              InputLabelProps={{
                shrink: true,
              }}
              required
              className={styles.textField}
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
              InputLabelProps={{
                shrink: true,
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
              
              className={styles.textField}
            />

            {/* Dynamic fields for serial and mac */}
            {serials.map((serial, index) => (
              <div key={index} className={styles.additionalFieldContainer}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  label={`Serial ${index + 1}`}
                  name={`serial-${index}`}
                  value={serial}
                  onChange={(e) => handleAdditionalFieldChange(e, index, 'serial')}
                  
                  className={styles.textField}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  label={`MAC Address ${index + 1}`}
                  name={`mac-${index}`}
                  value={macs[index] || ''}
                  onChange={(e) => handleAdditionalFieldChange(e, index, 'mac')}
                  
                  className={styles.textField}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleRemoveField(index)}
                  className={styles.removeButton}
                >
                  Remove
                </Button>
              </div>
            ))}

            <div className={styles.buttonGroup}>
              <Button variant="outlined" onClick={handleAddField} className={styles.addButton}>
                Add Field
              </Button>

              <Button type="submit" variant="contained" className={styles.submitButton}>
                Create Project
              </Button>
            </div>
          </form>
        </Paper>
      </Grid>
      <Drawer
        anchor="left"
        open={drawerOpen}
        >
        {list()}
      </Drawer>
    </Grid>
  );
}
