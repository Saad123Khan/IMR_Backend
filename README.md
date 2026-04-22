# Backend - Remit Now API

## Quick Start

### Local Development

```sh
npm install
npm run start:debug
```

### Docker

```sh
# Build Docker image
docker build -t client_portal:1.0.0 .

# Run with docker-compose (includes PostgreSQL)
docker-compose up -d

# Stop services
docker-compose down
```

## API Documentation

- **Swagger UI**: http://localhost:3000/api
- **Base URL**: http://localhost:3000/api/v1

## Testing with Postman

### Import Collection

1. Open Postman
2. Import `postman_collection.json`
3. Set environment variable: `base_url = http://localhost:3000/api/v1`

### Run Tests

- Use Postman Collection Runner to execute all tests sequentially
- Tests automatically save tokens and IDs for dependent requests
- Coverage includes 80+ test cases across all endpoints

## Environment Variables

```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=remit_db
NODE_ENV=production
PORT=3000
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login

### Users

- `GET /api/v1/users/profile` - Get current user
- `POST /api/v1/users/employees` - Create employee
- `GET /api/v1/users/employees` - List employees
- `GET /api/v1/users/employees/:id` - Get employee
- `PATCH /api/v1/users/employees/:id` - Update employee
- `DELETE /api/v1/users/employees/:id` - Delete employee

### Organizations

- `GET /api/v1/organizations/my-organization` - Get organization details

### Corridors

- `POST /api/v1/corridors` - Create corridor
- `GET /api/v1/corridors` - List corridors (with filters)
- `GET /api/v1/corridors/:id` - Get corridor
- `PATCH /api/v1/corridors/:id` - Update corridor
- `DELETE /api/v1/corridors/:id` - Delete corridor

### Fees Management

- Fixed Fees: `/api/v1/corridors/:corridorId/fixed-fees`
- Fees Slabs: `/api/v1/corridors/:corridorId/fees-slabs`
- Bank Fees: `/api/v1/corridors/:corridorId/bank-fees`
- Timing Fees: `/api/v1/corridors/:corridorId/timing-fees`

## Supported Filter Parameters

Query endpoints with:

- `country` - Filter by country
- `mto` - Filter by MTO provider
- `status` - Filter by corridor status
- `paymentChannel` - Filter by payment channel
- `currency` - Filter by currency
- `feeType` - Filter by fee type

Example: `GET /api/v1/corridors?country=USA&status=ACTIVE&currency=USD`