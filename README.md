# 📝 Pure JS Blog Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_Project-2ea44f?style=for-the-badge&logo=github)]([https://github.com/bobicentr/myblogsite])

A fully functional Single Page Application (SPA) blog built with **Vanilla JavaScript** and **Supabase**. No frontend frameworks (React/Vue) were used—only native DOM manipulation and modern JS features.

### 🎯 The Goal
To understand web application architecture "under the hood" without hiding behind abstractions. The main focus was on mastering asynchronous data flow, authentication logic, and secure API communication.

### 🛠 Tech Stack
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+).
*   **Backend-as-a-Service:** Supabase (PostgreSQL).
*   **Security:** Row Level Security (RLS) Policies.

### 🔥 Key Features
*   **Full CRUD:** Create, Read, and Delete posts dynamically.
*   **Admin Panel:** Custom authentication system. Admin controls are hidden for regular visitors.
*   **Security First:** API keys are exposed, but data is protected via strict RLS policies in the database.
*   **Smart Rendering:** Dynamic DOM generation based on JSON data from the cloud.
*   **Routing:** Navigation logic using URL query parameters (e.g., `?id=123`).
