# API Documentation

The application exposes a simple RESTful API to manage the application state. All data is stored in a single document in MongoDB, effectively acting as a remote JSON store.

## Base URL

By default, the API is accessible at: `http://localhost:3000/api`

## Endpoints

### Get Application Data

Retrieves the current state of the application, including employees, schedules, and preferences.

- **URL**: `/data`
- **Method**: `GET`
- **Success Response**:
    - **Code**: 200 OK
    - **Content**: JSON object containing the application data.

    ```json
    {
      "employees": ["Ana", "Bruno", ...],
      "schedules": { ... },
      "swapRequests": [],
      "holidaySyncedYears": [],
      "prefs": {
        "uf": "SP",
        "ibgeCity": "3550308",
        ...
      }
    }
    ```

### Update Application Data

Updates the entire application state. This endpoint replaces the existing data with the provided payload.

- **URL**: `/data`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Data Params**: The complete JSON object representing the new state.
- **Success Response**:
    - **Code**: 200 OK
    - **Content**: `{"status": "ok"}`
