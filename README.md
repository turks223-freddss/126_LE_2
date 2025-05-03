# Budget Tracker

A modern web application for tracking income, expenses, and managing personal budgets with intuitive charts and summaries. This application helps users maintain their financial health by providing detailed insights into their spending patterns and budget management.

## 🌟 Features
  For a more detailed feature description, file functionality descriptions, and distribution of tasks: https://docs.google.com/document/d/1Xr-hatRHuvvTij3U2Os7m6qQfQAFnuY6gUu7oQXu1Z0/edit?usp=sharing

- **User Authentication**
  - Secure login and registration system
  - Protected routes and API endpoints
  - Session management

- **Transaction Management**
  - Add income and expense transactions
  - Categorize transactions
  - Edit and delete existing transactions
  - Real-time balance updates

- **Financial Analytics**
  - Monthly budget summary
  - Interactive charts (doughnut & bar)
  - Visual representation of spending patterns
  - Income vs. expense analysis

- **Data Export**
  - Download transaction history as CSV
  - Customizable date range for exports
  - Formatted data for easy analysis

- **Responsive Design**
  - Mobile-first approach
  - Optimized for all screen sizes
  - Intuitive user interface
  - Cross-browser compatibility

## 🛠️ Tech Stack

### Frontend
- React (Latest version)
- Tailwind CSS for styling
- Chart.js for data visualization
- Vite for build tooling
- ESLint for code quality

### Backend
- Django 5.0.2+
- Django REST Framework 3.15.2+
- Django CORS Headers 4.6.0+
- SQLite Database

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8 or higher
- pip (Python package manager)
- npm (Node package manager)

### Frontend Setup
1. Navigate to the project root directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Press 'o' + Enter to open in browser
5. The frontend will be available at `http://localhost:5173`

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the development server:
   ```bash
   python manage.py runserver
   ```
6. The backend API will be available at `http://localhost:8000`

## ⚠️ Common Setup Issues and Solutions

### Frontend Issues

1. **Node Version Warning**
   ```bash
   npm WARN EBADENGINE Unsupported engine {
     "package": "your-package",
     "required": {"node": ">=14.0.0"},
     "current": {"node": "12.0.0"}
   }
   ```
   Solution: Update Node.js to the required version (v14 or higher)

2. **Dependency Conflicts**
   ```bash
   npm WARN ERESOLVE unable to resolve dependency tree
   ```
   Solution: Run `npm install --legacy-peer-deps` or `npm install --force`

3. **Port Already in Use**
   ```bash
   Error: listen EADDRINUSE: address already in use :::5173
   ```
   Solution: Kill the process using the port or change the port in `vite.config.js`

### Backend Issues

1. **Virtual Environment Not Found**
   ```bash
   'venv' is not recognized as an internal or external command
   ```
   Solution: Ensure Python is installed and in your PATH

2. **Pip Install Warnings**
   ```bash
   WARNING: You are using pip version 21.0.1; however, version 23.0.1 is available
   ```
   Solution: Update pip using `python -m pip install --upgrade pip`

3. **Django Version Conflicts**
   ```bash
   ModuleNotFoundError: No module named 'django'
   ```
   Solution: Ensure you're in the virtual environment and run `pip install -r requirements.txt` again

4. **Database Migration Errors**
   ```bash
   django.db.utils.OperationalError: no such table
   ```
   Solution: Run `python manage.py makemigrations` followed by `python manage.py migrate`

## 📁 Project Structure
```
budget-tracker/
├── backend/              # Django backend
│   ├── finances/        # Financial app
│   ├── users/          # User management
│   └── requirements.txt # Python dependencies
├── src/                 # React frontend
│   ├── components/     # React components
│   │   ├── auth/      # Authentication components
│   │   ├── dashboard/ # Dashboard components
│   │   ├── finance/   # Financial components
│   │   │   ├── AddBudgetForm.jsx
│   │   │   ├── BudgetSummary.jsx
│   │   │   ├── BudgetTable.jsx
│   │   │   ├── FinanceForm.jsx
│   │   │   ├── FinanceItem.jsx
│   │   │   ├── TransactionForm.jsx
│   │   │   ├── TransactionHistory.jsx
│   │   │   ├── TransactionTable.jsx
│   │   │   └── financeDetails.jsx
│   │   ├── layout/    # Layout components
│   │   └── ui/        # Reusable UI components
│   ├── contexts/      # React contexts
│   │   ├── AuthContext.jsx
│   │   ├── FinanceContext.jsx
│   │   └── ThemeContext.jsx
│   ├── App.jsx        # Main app component
│   ├── main.jsx       # Application entry point
│   └── index.css      # Global styles
└── package.json        # Node dependencies
```

## 🔧 Development Tips

1. **Running Both Servers**
   - Use two separate terminal windows
   - Frontend: `npm run dev` (runs on port 5173)
   - Backend: `python manage.py runserver` (runs on port 8000)

2. **Environment Variables**
   - Frontend: Create `.env` file in root directory
   - Backend: Create `.env` file in backend directory

3. **Database Management**
   - Use Django admin interface at `http://localhost:8000/admin`
   - Create superuser: `python manage.py createsuperuser`

