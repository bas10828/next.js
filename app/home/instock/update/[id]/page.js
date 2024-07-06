"use client";
import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, Paper, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import Link from 'next/link';

export default function UpdateUserPage({ params }) {
  const { id } = params;
  const [formData, setFormData] = useState({
    id: '',
    proid: '',
    serial: '',
    mac: '',
    status_stock: '',
    into_stock: '',
    price: '',
    brand: '',
    model: '',
    project: '',
    out_stock: '',
    purchase: '',
  });
  const [loading, setLoading] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [project, setProject] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      setIsLoggedIn(false);
      window.location.href = "/";
    }else {
      setIsLoggedIn(true);      
    }
    const getData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/find_by_id/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const userData = await response.json();
        if (userData && userData.length > 0) {
          setFormData(userData[0]);
          setProject(userData[0].project); // Set the project from fetched data
          setLoading(false);
        } else {
          console.error('No data found for the given id');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (id) {
      getData();
    }
  }, [id]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      setUpdateSuccess(true);
      alert('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (!isLoggedIn) {
    return null; // or any other non-form content like a login prompt
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
      <Grid item xs={10} sm={8} md={6} lg={4}>
        <Paper elevation={3} style={{ padding: '80px' }}>
          <Typography variant="h4" gutterBottom>
            แก้ไข ID: {formData.id}
          </Typography>
          <form onSubmit={handleFormSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="proid"
                  name="proid"
                  label="รหัสครุภัณฑ์"
                  variant="outlined"
                  value={formData.proid}
                  onChange={(e) => setFormData({ ...formData, proid: e.target.value })}
                  
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="brand"
                  name="brand"
                  label="Brand"
                  variant="outlined"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="model"
                  name="model"
                  label="Model"
                  variant="outlined"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="serial"
                  name="serial"
                  label="Serial"
                  variant="outlined"
                  value={formData.serial}
                  onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                  
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="mac"
                  name="mac"
                  label="Mac"
                  variant="outlined"
                  value={formData.mac}
                  onChange={(e) => setFormData({ ...formData, mac: e.target.value })}
                  
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="price"
                  name="price"
                  label="Price"
                  type="number"
                  variant="outlined"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="purchase"
                  name="purchase"
                  label="Purchase"
                  // type="date"
                  variant="outlined"
                  value={formData.purchase}
                  onChange={(e) => setFormData({ ...formData, purchase: e.target.value })}
                  
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="project"
                  name="project"
                  label="Project"
                  variant="outlined"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel id="status-stock-label">Status</InputLabel>
                  <Select
                    labelId="status-stock-label"
                    id="status_stock"
                    name="status_stock"
                    value={formData.status_stock}
                    onChange={(e) => setFormData({ ...formData, status_stock: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="in stock">In Stock</MenuItem>
                    <MenuItem value="sold out">Sold Out</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="into_stock"
                  name="into_stock"
                  label="Into Stock"
                  type="date"
                  variant="outlined"
                  value={formData.into_stock}
                  onChange={(e) => setFormData({ ...formData, into_stock: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    // Date format mask for DD/MM/YYYY
                    pattern: '\\d{2}/\\d{2}/\\d{4}',
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="out_stock"
                  name="out_stock"
                  label="Out Stock"
                  type="date"
                  variant="outlined"
                  value={formData.out_stock}
                  onChange={(e) => setFormData({ ...formData, out_stock: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    // Date format mask for DD/MM/YYYY
                    pattern: '\\d{2}/\\d{2}/\\d{4}',
                  }}
    
                />
              </Grid>

            </Grid>
            <Button type="submit" variant="contained" color="primary" style={{ marginTop: '20px' }}>
              Update Equipment
            </Button>
          </form>
          {updateSuccess && (
            <Link href={`/home/instock`}>
              <Button variant="contained" color="secondary" style={{ marginTop: '20px' }}>
                Back to Finddevicenumber
              </Button>
            </Link>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
