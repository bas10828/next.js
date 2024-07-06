// C:\Users\kanta\Desktop\Dev\NEXT.js\my-appv2\app\home\manageusers\register\page.js

"use client";

import { useState,useEffect } from 'react';
import { Button, Grid, Paper, Typography, IconButton, Drawer, Box, Select, MenuItem, TextField } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    priority: ''
  });

  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {    
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      setIsLoggedIn(false);
      window.location.href = "/";
    }else {
      setIsLoggedIn(true);      
    }
    
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setSuccess(true);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error);
        setSuccess(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred while registering.');
      setSuccess(false);
    }
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  if (!isLoggedIn) {
    return null; // or any other non-form content like a login prompt
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={toggleDrawer(true)}
        sx={{ m: 2 }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Typography variant="h6" sx={{ m: 2 }}>Menu</Typography>
          <Link href="/home/manageusers">
            <Button>Manage Users</Button>
          </Link>
        </Box>
      </Drawer>
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Register
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
              <Select
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="guest">Guest</MenuItem>
              </Select>
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                Register
              </Button>
            </form>
            {message && (
              <Typography variant="body2" color={success ? 'green' : 'error'} sx={{ mt: 2 }}>
                {message}
              </Typography>
            )}
            {success && (
              <Link href="/home/manageusers">
                <Button variant="contained" color="secondary" fullWidth sx={{ mt: 2 }}>
                  Go to Manage Users
                </Button>
              </Link>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
