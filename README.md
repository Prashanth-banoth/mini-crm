# Mini CRM

This is a simple CRM application that I built to manage customer leads.

The application allows users to add new leads, view existing leads, update their details, and delete leads when they are no longer needed.

## What I Built

- Dashboard to view total leads and their status.
- Add new customer leads.
- Edit and delete lead details.
- View individual lead information.
- Search leads by name or email.
- Filter leads based on status.
- Navigate through leads using pagination.
- Export lead details as a CSV file.
- Switch between light and dark themes.

## Technologies Used

- React.js
- Tailwind CSS
- Node.js
- Express.js
- MongoDB
- Mongoose

## Project Setup

First, clone the repository:

```bash
git clone https://github.com/Prashanth-banoth/mini-crm.git
```

Go to the project folder:

```bash
cd mini-crm
```

Install frontend packages:

```bash
npm install
```

Install backend packages:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder and add your MongoDB connection:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Start the backend:

```bash
npm run dev
```

Open another terminal in the main project folder and start the frontend:

```bash
npm run dev
```

## About This Project

I built this project to practice React, backend API development, and connecting a frontend application with MongoDB.

## GitHub

https://github.com/Prashanth-banoth/mini-crm

**Developed by Banoth Prashanth**