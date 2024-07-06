"use client"
import React, { useEffect, useState } from 'react';
import './login.css'; // เรียกใช้ไฟล์ CSS ที่สร้างขึ้น

export function Login() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState('');
    const username = React.useRef(null);
    const password = React.useRef(null);

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
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                {error && <div className="error-message">{error}</div>}
                <input type="text" ref={username} placeholder="Username" />
                <input type="password" ref={password} placeholder="Password" />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}
