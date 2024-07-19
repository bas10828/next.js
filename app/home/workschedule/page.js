"use client"
import React, { useEffect, useState,useCallback  } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
  Drawer,
  TextField,
} from '@mui/material';
import * as XLSX from 'xlsx';
import moment from 'moment-timezone';
import styles from './page.module.css';

const formatDate = (isoDate) => {
  return moment(isoDate).format('DD/MM/YYYY'); // แปลงเป็น วัน/เดือน/ปี
};

const fetchData = (type) => {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/schedule/today`;
  if (type === 'all') {
    url = `${process.env.NEXT_PUBLIC_API_URL}/api/schedule`;
  }

  return fetch(url, {
    headers: {
      'loggedIn': localStorage.getItem('isLoggedIn') === 'true' ? 'true' : 'false'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response.json();
    })
    .then(data => {
      // Convert timestamp to Thai timezone
      return data.map(item => ({
        ...item,
        timestamp: moment(item.timestamp).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
        date_start: formatDate(item.date_start),
        date_end: formatDate(item.date_end),
      }));
    });
};

const Page = () => {
  const [data, setData] = useState([]);
  const [priority, setPriority] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEditData, setCurrentEditData] = useState(null);
  const [isFindDrawerOpen, setIsFindDrawerOpen] = useState(false);
  const [isFindDetailsDrawerOpen, setIsFindDetailsDrawerOpen] = useState(false);
  const [findDate, setFindDate] = useState('');
  const [findDetails, setFindDetails] = useState('');
  const [formData, setFormData] = useState({
    details: '',
    project: '',
    date_start: '',
    date_end: '',
    user: ''
  });
  const [displayType, setDisplayType] = useState('today'); // เริ่มต้นแสดงข้อมูลจาก today

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

    const username = localStorage.getItem('username');
    if (username) {
      setFormData(prevFormData => ({ ...prevFormData, user: username }));
    }
  }, []);

  useEffect(() => {
    fetchData(displayType)
      .then(fetchedData => {
        setData(fetchedData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        // Handle error state if needed
      });
  }, [displayType]);

  const handleFindDrawerOpen = useCallback(() => {
    setIsFindDrawerOpen(true);
  }, []);

  const handleFindDrawerClose = useCallback(() => {
    setIsFindDrawerOpen(false);
  }, []);

  const handleFindDetailDrawerOpen = useCallback(() => {
    setIsFindDetailsDrawerOpen(true);
  }, []);

  const handleFindDetailsDrawerClose = useCallback(() => {
    setIsFindDetailsDrawerOpen(false);
  }, []);

  const handleFindDateChange = useCallback((event) => {
    setFindDate(event.target.value);
  }, []);

  const handleFindSubmit = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule/finddate/${findDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const fetchedData = await response.json();
      setData(fetchedData.map(item => ({
        ...item,
        timestamp: moment(item.timestamp).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
        date_start: formatDate(item.date_start),
        date_end: formatDate(item.date_end),
      })));
      handleFindDrawerClose();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [findDate]);

  const handleFindDetailsSubmit = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule/finddetail/${findDetails}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const fetchedData = await response.json();
      setData(fetchedData.map(item => ({
        ...item,
        timestamp: moment(item.timestamp).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
        date_start: formatDate(item.date_start),
        date_end: formatDate(item.date_end),
      })));
      handleFindDrawerClose();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [findDetails]);



  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(equipment => ({
      ID: equipment.id,
      timestamp: moment(equipment.timestamp).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
      user: equipment.user,
      project: equipment.project,
      date_start: (equipment.date_start),
      date_end: (equipment.date_end),
      details: equipment.details,
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Instock");

    // Adjust column widths if needed
    const maxWidths = [
      { wch: 10 }, // ID
      { wch: 20 }, // timestamp
      { wch: 10 }, // user
      { wch: 20 }, // project
      { wch: 15 }, // date_start
      { wch: 15 }, // date_end
      { wch: 30 }, // details
    ];

    worksheet["!cols"] = maxWidths;

    XLSX.writeFile(workbook, "Work_Schedule.xlsx");
  };


  const handleDelete = useCallback(async (id) => {
    if (window.confirm('ต้องการลบรายการนี้?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule/delete/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete data');
        }

        setData(data.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting data:', error);
      }
    }
  }, [data]);

  const handleDrawerOpen = useCallback((editData = null) => {
    if (editData) {
      setEditMode(true);
      setCurrentEditData(editData);
      setFormData({
        details: editData.details,
        project: editData.project,
        date_start: moment(editData.date_start, 'DD/MM/YYYY').isValid() ? moment(editData.date_start, 'DD/MM/YYYY').format('YYYY-MM-DD') : '', // ปรับให้เป็น ISO 8601
        date_end: moment(editData.date_end, 'DD/MM/YYYY').isValid() ? moment(editData.date_end, 'DD/MM/YYYY').format('YYYY-MM-DD') : '', // ปรับให้เป็น ISO 8601
        // date_start: moment(editData.date_start).format('YYYY-MM-DD'), // ปรับให้เป็น ISO 8601
        // date_end: moment(editData.date_end).format('YYYY-MM-DD'), // ปรับให้เป็น ISO 8601
        user: localStorage.getItem('username') || ''
      });
    } else {
      setEditMode(false);
      setFormData({
        details: '',
        project: '',
        date_start: '',
        date_end: '',
        user: localStorage.getItem('username') || ''
      });
    }
    setIsDrawerOpen(true);
  }, []);


  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
    setCurrentEditData(null);
    setFormData({
      details: '',
      project: '',
      date_start: '',
      date_end: '',
      user: ''
    });
  }, []);



  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === 'date_start' || name === 'date_end') {
      const formattedValue = moment(value).format('YYYY-MM-DD');
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }, [formData]);


  const handleSubmit = async () => {
    try {
      const url = editMode ? `${process.env.NEXT_PUBLIC_API_URL}/api/schedule/update/${currentEditData.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/schedule/create`;
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      const updatedData = await response.json();
      if (editMode) {
        setData(data.map(item => (item.id === currentEditData.id ? updatedData : item)));
      } else {
        setData([...data, updatedData]);
      }

      handleDrawerClose();
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('isLoggedIn');
    window.location.href = "/";
  }, []);

  if (!isLoggedIn) {
    return null; // or any other non-form content like a login prompt
  }

  const handleDisplayChange = async (event) => {
    const type = event.target.value;
    setDisplayType(type);

    try {
      const fetchedData = await fetchData(type);
      setData(fetchedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error state if needed
    }
  };
  console.log("dataform ",formData)


  return (
    <Box sx={{ width: '100%', padding: '16px' }} className={styles['fullscreen-container']}>
      <TableContainer component={Paper} className={styles['table-container']}>
        <div className={styles['button-container']}>
          <Button onClick={() => handleDisplayChange({ target: { value: 'today' } })}>Today</Button>
          <Button onClick={() => handleDisplayChange({ target: { value: 'all' } })}>All</Button>
          <Button onClick={handleFindDrawerOpen}>Find Month/Year</Button>
          <Button onClick={handleFindDetailDrawerOpen}>Find Details</Button>

          {priority === 'admin' || priority === 'user' ? (
            // <div className={styles['button-container']}>
            <>
              <Button onClick={() => handleDrawerOpen()} >Add</Button>
              <Button onClick={exportToExcel}>Export Excel</Button>
            </>
            // </div>
          ) : null}
        </div>
        <Table className={styles.table}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Date Start</TableCell>
              <TableCell>Date End</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Timestamp</TableCell>
              {priority === 'user' || priority === 'admin' ? (
                <>
                  <TableCell>Edit</TableCell>
                </>
              ) : null}
              {priority === 'admin' ? (
                <>
                  <TableCell>Delete</TableCell>
                </>
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(equipment => (
              <TableRow key={equipment.id}>
                <TableCell>{equipment.id}</TableCell>
                <TableCell>{equipment.details}</TableCell>
                <TableCell>{equipment.project}</TableCell>
                <TableCell>{equipment.date_start}</TableCell>
                <TableCell>{equipment.date_end}</TableCell>
                <TableCell>{equipment.user}</TableCell>
                <TableCell>{moment(equipment.timestamp).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                {priority === 'user' || priority === 'admin' ? (
                  <>
                    <TableCell>
                      <Button variant="contained" color="primary" onClick={() => handleDrawerOpen(equipment)}>
                        Edit
                      </Button>
                    </TableCell>

                  </>
                ) : null}
                {priority === 'admin' ? (
                  <>
                    <TableCell>
                      <Button variant="contained" color="secondary" onClick={() => handleDelete(equipment.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Drawer anchor="right" open={isDrawerOpen} onClose={handleDrawerClose}>
        <Box sx={{ width: 300, padding: '16px' }}>
        
          <TextField
            label="Details"
            name="details"
            value={formData.details}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Project"
            name="project"
            value={formData.project}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Start Date"
            name="date_start"
            type="date"
            value={formData.date_start}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="End Date"
            name="date_end"
            type="date"
            value={formData.date_end}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="User"
            name="user"
            value={formData.user}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            InputProps={{
              readOnly: true,
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              {editMode ? 'Update' : 'Submit'}
            </Button>
            <Button variant="outlined" onClick={handleDrawerClose}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Drawer anchor="right" open={isFindDrawerOpen} onClose={handleFindDrawerClose}>
        <Box sx={{ width: 300, padding: '16px' }}>
          <TextField
            label="Select Date"
            type="month"
            value={findDate}
            onChange={handleFindDateChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <Button variant="contained" color="primary" onClick={handleFindSubmit}>
              Submit
            </Button>
            <Button variant="outlined" onClick={handleFindDrawerClose}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Drawer for finding details */}
      <Drawer anchor="right" open={isFindDetailsDrawerOpen} onClose={handleFindDetailsDrawerClose}>
        <Box sx={{ width: 300, padding: '16px' }}>
          <TextField
            label="Find Details"
            value={findDetails}
            onChange={(e) => setFindDetails(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <Button variant="contained" color="primary" onClick={handleFindDetailsSubmit}>
              Submit
            </Button>
            <Button variant="outlined" onClick={handleFindDrawerClose}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>

    </Box>
  );
};

export default Page;
