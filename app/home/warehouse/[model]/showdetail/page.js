"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import Image from 'next/image';
import styles from './page.module.css'; // นำเข้าไฟล์ CSS ที่สร้างไว้

export default function ShowdetailPage({ params }) {
  const { model } = params;
  const decodedProject = decodeURIComponent(model);
  const [data, setData] = useState([]);
  const [priority, setPriority] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  function getData(model) {
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mywarehouse/library/${model}`, {
      headers: {
        'loggedIn': localStorage.getItem('isLoggedIn') === 'true' ? 'true' : 'false'
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        return res.json();
      });
  }

  useEffect(() => {
    const storedPriority = localStorage.getItem('priority');
    if (storedPriority) {
      setPriority(storedPriority);
    }
  }, []);

  useEffect(() => {
    getData(model)
      .then(data => {
        console.log(data); // ตรวจสอบข้อมูลที่ได้รับ
        if (!Array.isArray(data)) {
          data = [data]; // ถ้าเป็น object ให้แปลงเป็น array
        }
        if (data.length === 0) {
          notFound();
        }
        setData(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [model]);

  return (
    <Box className={styles['fullscreen-container']}>
      {Array.isArray(data) && data.length > 0 ? (
        data.map((equipment) => (
          <Card key={equipment.id} className={styles.card}>
            <Box className={styles.cardImageContainer}>
              {/* <img
                src={equipment.picture || '/default-image.png'}
                alt={equipment.model}
                className={styles.cardImage}
              /> */}
              <Image
                src={`/devicepic/${equipment.model}.png`} // เรียกรูปตามชื่อ model
                alt={equipment.model}
                width={500} // กำหนดขนาดตามที่ต้องการ
                height={300} // กำหนดขนาดตามที่ต้องการ
                className={styles.cardImage}
              />
            </Box>
            <CardContent className={styles.cardContent}>
              <Typography className={styles.cardTitle} variant="h5" component="div">
                {equipment.model}
              </Typography>
              <Typography className={styles.cardSubtitle} color="text.secondary">
                {equipment.device_type}
              </Typography>
              <Typography className={styles.cardText} variant="body2">
                {equipment.detail.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
              </Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography align="center" className={styles.noData}>
          No data available
        </Typography>
      )}
      <Box className={styles.buttonBack}>
        <Link href="/home/warehouse">
          <Button variant="contained" className={styles.buttonContained}>
            Back to Warehouse
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
