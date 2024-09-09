"use client";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
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
  TextField,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "./page.module.css";
import Link from "next/link";
import Image from 'next/image';

export const generateKey = () => {
  return uuidv4();
};

const Library = () => {
  const [data, setData] = useState([]);
  const [priority, setPriority] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newModel, setNewModel] = useState("");
  const [newDeviceType, setNewDeviceType] = useState("");
  const [newDetail, setNewDetail] = useState("");
  // const [newPicture, setNewPicture] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageStatus, setImageStatus] = useState({})

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (!loggedIn) {
      setIsLoggedIn(false);
      window.location.href = "/";
    } else {
      setIsLoggedIn(true);
    }
    const storedPriority = localStorage.getItem("priority");
    if (storedPriority) {
      setPriority(storedPriority);
    }
  }, []);

  useEffect(() => {
    const fetchData = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mywarehouse/library`, {
        headers: {
          loggedIn: localStorage.getItem("isLoggedIn") === "true" ? "true" : "false",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          return response.json();
        })
        .then((result) => {
          setData(result);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };

    if (process.env.NEXT_PUBLIC_API_URL) {
      fetchData();
    }
  }, []);

  const handleAdd = () => {
    const newEquipment = {
      id: generateKey(),
      model: newModel,
      device_type: newDeviceType,
      detail: newDetail,
      // picture: newPicture,
    };
    setData([...data, newEquipment]);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mywarehouse/library`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        loggedIn: localStorage.getItem("isLoggedIn") === "true" ? "true" : "false",
      },
      body: JSON.stringify(newEquipment),
    })
      .then((response) => response.json())
      .then((result) => {
        setData([...data, result]);
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Error adding data:", error);
      });
  };

  const handleEdit = (id) => {
    const itemToEdit = data.find((item) => item.id === id);
    if (itemToEdit) {
      setEditId(id);
      setNewModel(itemToEdit.model);
      setNewDeviceType(itemToEdit.device_type);
      setNewDetail(itemToEdit.detail);
      // setNewPicture(itemToEdit.picture);
      setShowForm(true);
      setEditMode(true);
    }
  };

  const handleSave = () => {
    if (editMode) {
      const updatedEquipment = {
        id: editId,
        model: newModel,
        device_type: newDeviceType,
        detail: newDetail,
        // picture: newPicture,
      };

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mywarehouse/library`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          loggedIn: localStorage.getItem("isLoggedIn") === "true" ? "true" : "false",
        },
        body: JSON.stringify(updatedEquipment),
      })
        .then((response) => response.json())
        .then((result) => {
          setData(data.map((item) => (item.id === editId ? result : item)));
          setShowForm(false);
          setEditMode(false);
        })
        .catch((error) => {
          console.error("Error updating data:", error);
        });
    } else {
      handleAdd();
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mywarehouse/library`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          loggedIn: localStorage.getItem("isLoggedIn") === "true" ? "true" : "false",
        },
        body: JSON.stringify({ id }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to delete data");
          }
          return response.json();
        })
        .then((result) => {
          setData(data.filter((item) => item.id !== id));
        })
        .catch((error) => {
          console.error("Error deleting data:", error);
        });
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Box sx={{ width: "100%", padding: "20px" }} className={styles["fullscreen-container"]}>
      <TableContainer component={Paper} className={styles["table-container"]}>
        {priority === "admin" || priority === "user" ? (
          <>
            <Button
              onClick={() => {
                setShowForm(true);
                setEditMode(false);
              }}
            >
              ADD
            </Button>

            <Drawer anchor="right" open={showForm} onClose={() => setShowForm(false)}>
              <Box sx={{ width: 300, padding: "20px" }}>
                <TextField
                  label="Model"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Device Type"
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                {/* <TextField
                  label="Picture URL"
                  value={newPicture}
                  onChange={(e) => setNewPicture(e.target.value)}
                  fullWidth
                  margin="normal"
                /> */}
                <TextField
                  label="Detail"
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  fullWidth
                  multiline
                  rows={12}
                  margin="normal"
                />
                <Button onClick={handleSave} sx={{ marginTop: "10px" }}>
                  {editMode ? "Update" : "Save"}
                </Button>
              </Box>
            </Drawer>
          </>
        ) : null}
        <Table className={styles.table}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Device Type</TableCell>
              <TableCell>Picture</TableCell>
              <TableCell>Detail</TableCell>
              <TableCell>Edit</TableCell>
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((equipment) => (
              <TableRow key={equipment.id}>
                <TableCell>{equipment.id}</TableCell>
                <TableCell>{equipment.model}</TableCell>
                <TableCell>{equipment.device_type}</TableCell>
                <TableCell>
                  {/* {equipment.picture ? (
                    <img
                      src={equipment.picture}
                      alt="Equipment"
                      style={{ cursor: 'pointer', maxWidth: '100px', maxHeight: '100px' }}
                      onClick={() => handleImageClick(equipment.picture)}
                    />
                  ) : (
                    <span>No Image</span> // หรือแสดงเป็นข้อความว่างเปล่าหรือกรอบว่างก็ได้
                  )} */}

                  <Image
                    src={equipment.model ? `/devicepic/${equipment.model}.png` : '/devicepic/default.png'}
                    alt={equipment.model || 'default'}
                    layout="intrinsic" // ปรับขนาดภาพตามสัดส่วนดั้งเดิม
                    objectFit="contain" // ทำให้ภาพอยู่ในกรอบและไม่โดนบี้
                    width={200} // กำหนดความกว้างสูงสุด 100px
                    height={200} // กำหนดความสูงสูงสุด 100px
                    className={styles.cardImage}
                    onClick={() => handleImageClick(`/devicepic/${equipment.model}.png`)}
                  />

                </TableCell>

                <TableCell>{equipment.detail}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEdit(equipment.id)}>Edit</Button>
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleDelete(equipment.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Enlarged Image */}
      <Dialog open={isModalOpen} onClose={closeModal} maxWidth="md" fullWidth>
        <DialogTitle>
          <IconButton
            edge="end"
            color="inherit"
            onClick={closeModal}
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Image
              src={selectedImage}
              alt="Enlarged"
              layout="responsive"
              width={700}  // ปรับขนาดตามความต้องการ
              height={475} // ปรับขนาดตามความต้องการ
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>

      </Dialog>
    </Box>
  );
};

export default Library;
