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
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed">
          <Toolbar>
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
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Link href="/home" style={{ textDecoration: 'none', color: 'white' }}>
                NETDOI
              </Link>
            </Typography>
            {username && (
              <Select
                value={selectedValue}
                onChange={handleSelectChange}
                displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}
                sx={{ color: 'white', marginRight: 2, borderColor: 'white' }}
              >
                <MenuItem value="" disabled>
                  {username} : {priority}
                </MenuItem>
                {priority === 'admin' && (
                  <MenuItem component="a" value={username} href="/home/manageusers">{username} : manage users</MenuItem>
                )}                
                {/* <MenuItem value={email}>Email: {email}</MenuItem>
                <MenuItem value={priority}>Priority: {priority}</MenuItem> */}
              </Select>
            )}
            <Link href="/" passHref>
              <Button className="logout-button" color="inherit" onClick={handleLogout}>Logout</Button>
            </Link>
          </Toolbar>
        </AppBar>
      </Box>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {[
              'Create',
              'Createdynamic',
              'Warehouse',
              'FindDeviceNumber',
              'WorkSchedule',
              'Instock',
              'Soldout',
              'Alldata'
            ].map((text, index) => (
              <ListItemButton key={text} component={Link} href={`/home/${text.toLowerCase()}`} onClick={toggleDrawer(false)}>
                <ListItemText primary={text} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box sx={{ padding: '0' }}>
        {children}
      </Box>
    </>
  );
}
