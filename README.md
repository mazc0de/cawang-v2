# Cawang - Personal Finance Tracker 💰

**Cawang** is a modern, feature-rich Personal Finance Management application built to help you track your income, expenses, budgets, and financial goals effortlessly. It offers an intuitive user interface, dynamic budgeting tools, and a cycle-based calendar tailored to your custom salary dates.

---

## ✨ Key Features

- **📊 Comprehensive Dashboard**
  Get a high-level overview of your Total Balance, Today's Income & Expense, and Remaining Budget for the current cycle.
- **💸 Transaction Management**
  Easily add, edit, or delete transactions (Income, Expense, Transfer). Features a day-by-day navigation grid to review your daily cash flow.
- **🎯 Dynamic Budgeting**
  Set spending limits per category. Cawang visually tracks your usage with 4 smart indicators: 
  - `Aman / Sisa` (< 80%)
  - `Hampir Habis` (80% - 99%)
  - `Pas Limit` (100%)
  - `Over Budget` (> 100%)
- **📅 Cycle-Based Calendar View**
  Unlike standard calendars that start on the 1st, Cawang's calendar dynamically aligns with your **custom salary cycle start date**, giving you a highly accurate timeline of your monthly financial run rate.
- **🏦 Multiple Accounts & Wallets**
  Manage different sources of funds (e.g., Cash, Bank, E-Wallets) and track their individual balances.
- **📁 Custom Categories**
  Organize your spending habits better by creating tailored categories with custom icons.
- **⚙️ Configurable Settings**
  Customize your application experience, set up automated recurring transactions, and define your personal salary date.
- **🔒 Secure Authentication**
  Powered by Supabase Auth for secure user registration and login.

---

## 🛠️ Tech Stack

**Frontend:**
- [React 18](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (Build tool)
- [Tailwind CSS](https://tailwindcss.com/) (Styling)
- [React Router v6](https://reactrouter.com/) (Navigation)
- [Lucide React](https://lucide.dev/) (Icons)
- [React Hot Toast](https://react-hot-toast.com/) (Notifications)

**Backend / Database:**
- [Supabase](https://supabase.com/) (PostgreSQL Database, Authentication, Row-Level Security)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- A [Supabase](https://supabase.com/) account and project.

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd cawang-v2
```

### 2. Install Dependencies
Navigate to the `frontend` folder and install the required NPM packages:
```bash
cd frontend
npm install
```

### 3. Setup Supabase
1. Create a new project in your Supabase dashboard.
2. Run the SQL migration scripts located in `supabase/migrations/0000_init.sql` (and any subsequent migration files) in your Supabase SQL Editor. This will create the required tables (`settings`, `accounts`, `categories`, `budgets`, `transactions`, `recurring_transactions`) and set up the necessary Row-Level Security (RLS) policies.

### 4. Configure Environment Variables
In the `frontend` directory, create a `.env` file and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the Application
Start the Vite development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

## 🗄️ Database Schema Overview

- **`users`** (Managed by Supabase Auth)
- **`settings`**: Stores user preferences, specifically `salary_cycle_start_date`.
- **`accounts`**: User's wallets/bank accounts and their running balances.
- **`categories`**: Transaction and budgeting categories (with `icon` references).
- **`budgets`**: Category-specific spending limits (`amount_limit`).
- **`transactions`**: The core ledger for all income, expense, and transfer records.
- **`recurring_transactions`**: Templates for scheduled/automated transactions.

---

## 📝 License
This project is proprietary and built for personal use.

---
*Built with ❤️ using React, Tailwind, and Supabase.*
