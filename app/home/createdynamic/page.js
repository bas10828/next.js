"use client"
import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, Paper, Typography, IconButton, Drawer, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DeleteIcon from '@mui/icons-material/Delete'; // Import DeleteIcon
import styles from './page.module.css';

export default function CreateProjectDynamicPage() {

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
    project: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuFormData, setMenuFormData] = useState({ proid: '' });
  const [additionalFields, setAdditionalFields] = useState([]);
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
          setFormData({
            ...initialFormData,
            proid: proid,
            brand: brand,
            model: model
          });
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

  const handleAddField = () => {
    setAdditionalFields([...additionalFields, {
      serial: '',
      mac: ''
    }]);
  };

  const handleRemoveField = (index) => {
    const updatedFields = [...additionalFields];
    updatedFields.splice(index, 1);
    setAdditionalFields(updatedFields);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSend = [
      { ...formData }
    ];

    additionalFields.forEach(field => {
      dataToSend.push({
        ...formData,
        serial: field.serial,
        mac: field.mac
      });
    });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    })
      .then((response) => {
        if (response.ok) {
          console.log('Projects created successfully');
          setIsFormSubmitted(true);
        } else {
          console.error('Failed to create projects');
        }
      })
      .catch((error) => {
        console.error('Error creating projects:', error);
      });
  };

  useEffect(() => {
    if (isFormSubmitted) {
      window.location.href = `/home`;
    }
  }, [isFormSubmitted]);

  const handleAdditionalFieldChange = (e, index, fieldName) => {
    const { value } = e.target;
    const updatedFields = [...additionalFields];
    updatedFields[index][fieldName] = value;
    setAdditionalFields(updatedFields);
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
            เพิ่มข้อมูลใหม่
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
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              label="serial"
              name="serial"
              value={formData.serial}
              onChange={handleChange}
              className={styles.textField}
            />

            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              label="mac"
              name="mac"
              value={formData.mac}
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
              inputProps={{
                pattern: '\\d{4}-\\d{2}-\\d{2}',
              }}
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
              inputProps={{
                pattern: '\\d{4}-\\d{2}-\\d{2}',
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
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              label="Project"
              name="project"
              value={formData.project}
              onChange={handleChange}
              className={styles.textField}
            />

            {/* Additional fields for serial and mac */}
            {additionalFields.map((field, index) => (
              <div key={index} className={styles.additionalField}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  label={`Serial ${index + 2}`}
                  name={`serial-${index}`}
                  value={field.serial}
                  onChange={(e) => handleAdditionalFieldChange(e, index, 'serial')}
                  className={styles.textField}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  label={`MAC Address ${index + 2}`}
                  name={`mac-${index}`}
                  value={field.mac}
                  onChange={(e) => handleAdditionalFieldChange(e, index, 'mac')}
                  className={styles.textField}
                />
                <IconButton onClick={() => handleRemoveField(index)} className={styles.removeButton}>
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}

            {/* Button to add additional fields */}
            <Button type="button" variant="contained" onClick={handleAddField} className={styles.submitButton}>
              Add Field
            </Button>

            <Button type="submit" variant="contained" className={styles.submitButton}>
              Create new
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
