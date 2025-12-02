# Project Architecture

## Overview

**Escalas & Feriados** is a web application built with a Node.js/Express backend and a vanilla JavaScript frontend. It uses MongoDB for persistence, storing the entire application state in a single document for simplicity.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Native Driver)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES Modules)

## Directory Structure

```
.
├── src/                # Frontend source code
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript modules
│   ├── partials/       # HTML partials for dynamic loading
│   └── index.html      # Main entry point
├── docs/               # Project documentation
├── server.js           # Main backend server file
├── package.json        # Project dependencies and scripts
└── README.md           # Project overview
```

## Data Model

The application uses a "Singleton Document" pattern. All data is stored in a collection named `data` within a single document with `_id: 'main'`.

### Data Structure

```javascript
{
  _id: 'main',
  data: {
    employees: Array<String>,       // List of employee names
    schedules: Object,              // Schedule data keyed by date/id
    swapRequests: Array<Object>,    // Pending swap requests
    holidaySyncedYears: Array<Number>, // Years with synced holidays
    prefs: {                        // Global preferences
      uf: String,
      ibgeCity: String,
      calendarificKey: String,
      invertextoToken: String,
      syncedUF: Object,
      syncedCity: Object
    }
  }
}
```

## Frontend Architecture

The frontend is served statically from the `src` directory. It uses ES Modules for code organization.

- **`index.html`**: The single page application shell.
- **`src/js/`**: Contains logic for different features (e.g., `modal.js` for modal handling).
- **`src/partials/`**: HTML fragments that are loaded dynamically or included to modularize the UI.
