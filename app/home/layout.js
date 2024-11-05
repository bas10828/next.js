"use client";
import React, { useEffect, useState } from 'react';
import './layout.css';
import Link from 'next/link';
import {
  AppBar, Box, Toolbar, Button, IconButton, Drawer, List, ListItemButton, ListItemText, MenuItem, Select, Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export default function Layout({ children  }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [priority, setPriority] = useState('');
  const [selectedValue, setSelectedValue] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    const storedPriority = localStorage.getItem('priority');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    if (storedEmail) {
      setEmail(storedEmail);
    }
    if (storedPriority) {
      setPriority(storedPriority);
    }
  }, []);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn'); // ลบการล็อกอินออกจาก localStorage
    localStorage.removeItem('username'); // ลบชื่อผู้ใช้ออกจาก localStorage
    localStorage.removeItem('email'); // ลบอีเมล์ออกจาก localStorage
    localStorage.removeItem('priority'); // ลบ priority ออกจาก localStorage
    setUsername('');
    setEmail('');
    setPriority('');
  };

  const handleSelectChange = (event) => {
    setSelectedValue(event.target.value);
  };

  return (
    <>
    <Box className="main-container">
      <AppBar className="app-bar" position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            className="menu-icon"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" className="app-title">
            <Link href="/home" className="app-title-link">
              NETDOI
            </Link>
          </Typography>
          {username && (
            <Select
              value={selectedValue}
              onChange={handleSelectChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
              className="select-user"
            >
              <MenuItem value="" disabled>
                {username} : {priority}
              </MenuItem>
              {priority === 'admin' && (
                <MenuItem component="a" value={username} href="/home/manageusers">
                  {username} : manage users
                </MenuItem>
              )}
            </Select>
          )}
          <Link href="/" passHref>
            <Button className="logout-button" onClick={handleLogout}>Logout</Button>
          </Link>
        </Toolbar>
      </AppBar>
    </Box>
    <Drawer
      className="drawer"
      anchor="left"
      open={drawerOpen}
      onClose={toggleDrawer(false)}
    >
      <Box
        role="presentation"
        onClick={toggleDrawer(false)}
        onKeyDown={toggleDrawer(false)}
        className="drawer-content"
      >
        <List>
          {[
            'Create',
            'Createdynamic',
            'Createbyexcel',
            'Createserial',
            'Warehouse',
            'FindDeviceNumber',
            'WorkSchedule',
            'Instock',
            'Soldout',
            'Alldata',
            'GenerateReport'
          ].map((text) => (
            <ListItemButton key={text} component={Link} href={`/home/${text.toLowerCase()}`}>
              <ListItemText primary={text} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
    <Box className="content-container">
      {children}
    </Box>
  </>
  );
}
