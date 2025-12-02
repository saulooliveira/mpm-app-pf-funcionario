# Escalas & Feriados

**Escalas & Feriados** is a web application designed to manage employee schedules and holiday synchronization. It provides a simple interface for viewing schedules, requesting swaps, and managing holiday data.

## Features

- **Employee Management**: View and manage a list of employees.
- **Schedule Management**: Organize and view work schedules.
- **Swap Requests**: Handle requests for schedule swaps between employees.
- **Holiday Synchronization**: Sync holidays based on state (UF) and city (IBGE code).
- **Preferences**: Configure application settings like default location and API keys.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: You need to have Node.js installed to run the backend server.
- **MongoDB**: A local or remote MongoDB instance is required for data persistence.

## Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd mpm-app-pf-funcionario
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Configuration

The application uses environment variables for configuration. You can set them in your environment or just rely on the defaults for local development.

- `MONGODB_URI`: Connection string for MongoDB (default: `mongodb://localhost:27017`)
- `PORT`: Server port (default: `3000`)

## Usage

1.  **Start the server**:
    ```bash
    node server.js
    ```
    Or using the start script:
    ```bash
    npm start
    ```
    *Note: The `start` script in `package.json` currently uses `lite-server`, but the main backend logic is in `server.js`.*

2.  **Access the application**:
    Open your browser and navigate to `http://localhost:3000`.

## Documentation

For more detailed technical information, please refer to the documentation in the `docs/` folder:

- [API Documentation](docs/API.md): Details about the backend API endpoints.
- [Architecture](docs/ARCHITECTURE.md): Overview of the project structure and design.
