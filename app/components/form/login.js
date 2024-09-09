"use client"
import React, { useEffect, useState } from 'react';
import { Button, Checkbox, FormControlLabel, TextField, Typography, Paper, Box } from "@mui/material";
import './login.css'; // เรียกใช้ไฟล์ CSS ที่สร้างขึ้น

export function Login() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState('');
    const username = React.useRef(null);
    const password = React.useRef(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const loggedIn = localStorage.getItem("isLoggedIn");
        if (loggedIn) {
            setIsLoggedIn(true);
            window.location.href = "/home";
        }
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            window.location.href = "/home";
        }
    }, [isLoggedIn]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const usernameValue = username.current.value;
        const passwordValue = password.current.value;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                loginIdentifier: usernameValue,
                password: passwordValue
            })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", data.user.username); // เก็บชื่อผู้ใช้ใน localStorage
            localStorage.setItem("email", data.user.email); // เก็บอีเมล์ใน localStorage
            localStorage.setItem("priority", data.user.priority); // เก็บ priority ใน localStorage
            setIsLoggedIn(true);
        } else {
            setError(`Login failed: ${response.statusText}`);
        }
    };

    return (
        <div className="login-container">
        <Paper elevation={10} className="login-paper">
            <Box p={3}>
                <Typography variant="h4" gutterBottom>
                    Login
                </Typography>
                {error && <Typography variant="body2" color="error">{error}</Typography>}
                <form onSubmit={handleSubmit} className="login-form">
                    <TextField
                        inputRef={username}
                        label="Username"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        inputRef={password}
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                                color="primary"
                            />
                        }
                        label="Show Password"
                        className="show-password"
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth className="login-button">
                        Login
                    </Button>
                </form>
            </Box>
        </Paper>
    </div>
    );
}
