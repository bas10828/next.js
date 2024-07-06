// C:\Users\kanta\Desktop\Dev\NEXT.js\my-appv2\app\home\manageusers\page.js
"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  Button
} from '@mui/material';
import styles from './page.module.css';

const fetchData = () => {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
    headers: {
      'loggedIn': localStorage.getItem('isLoggedIn') === 'true' ? 'true' : 'false'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response.json();
    });
};

const deleteUserData = async (id) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/delete/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      console.log(`User with ID ${id} deleted successfully`);
      // Optionally, you can fetch updated data or update state after deletion
    } else {
      console.error('Failed to delete user');
      // Handle failure to delete user
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    // Handle error deleting user
  }
};

const Page = () => {
  const [data, setData] = useState([]);
  const [refresh, setRefresh] = useState(false); // State สำหรับ refresh หน้าเว็บ
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      setIsLoggedIn(false);
      window.location.href = "/";
    }else {
      setIsLoggedIn(true);      
    }
    fetchData()
      .then(fetchedData => {
        setData(fetchedData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        // Handle error state if needed
      });
  }, [refresh]); // เพิ่ม refresh เป็น dependency ใน useEffect

  const refreshPage = () => {
    setRefresh(prevRefresh => !prevRefresh); // สลับค่า refresh ระบบจะทำการ refresh หน้าเว็บ
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (confirmDelete) {
      await deleteUserData(id);
      refreshPage(); // รีเฟรชหน้าเว็บหลังจากการลบสำเร็จ
    }
  };
  
  if (!isLoggedIn) {
    return null; // or any other non-form content like a login prompt
  }

  return (
    <Box sx={{ width: '100%', padding: '16px' }} className={styles['fullscreen-container']}>
      <Link href={`/home/manageusers/register`} passHref>
        <Button variant="contained" color="primary" sx={{ mb: 2 }}>
          Add User
        </Button>
      </Link>
      <TableContainer component={Paper} className={styles['table-container']}>
        <Table className={styles.table}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Edit</TableCell>
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(users => (
              <TableRow key={users.id}>
                <TableCell>{users.id}</TableCell>
                <TableCell>{users.username}</TableCell>
                <TableCell>{users.email}</TableCell>
                <TableCell>{users.priority}</TableCell>
                <TableCell>
                  <Link href={`/home/manageusers/updateuser/${users.id}`} passHref>
                    <Button variant="contained" color="warning">
                      Edit
                    </Button>
                  </Link>
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="secondary" onClick={() => handleDelete(users.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Page;
