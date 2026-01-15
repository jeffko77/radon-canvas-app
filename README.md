# Radon Canvas App

A web application to help canvas neighborhoods about radon testing. This app helps you define at-risk neighborhoods and check in individual addresses with messaging optimized for each neighborhood.

## Features

- **Neighborhood Management**: Define at-risk neighborhoods with custom risk levels and messaging templates
- **Address Check-In**: Track individual addresses with neighborhood-specific messaging
- **Status Tracking**: Track visit status (not visited, visited, interested, scheduled, completed)
- **Notes**: Add notes for each address visit
- **Filtering**: Filter addresses by neighborhood

## Setup

### Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies using `uv`:
```bash
uv pip install -r requirements.txt
```

3. Run the FastAPI server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage

1. **Define Neighborhoods**: Go to the Neighborhoods page and add neighborhoods with:
   - Name and description
   - Risk level (low, medium, high)
   - Custom messaging template

2. **Add Addresses**: Go to the Addresses page and add addresses, optionally assigning them to neighborhoods.

3. **Check In**: When visiting an address, click "Check In" to see the optimized message template for that neighborhood and update the visit status and notes.

## Data Storage

Data is currently stored in JSON files in the `backend/data/` directory:
- `neighborhoods.json` - Stores neighborhood definitions
- `addresses.json` - Stores address information

## Technology Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React + TypeScript + Vite
- **Styling**: Custom CSS with modern design
