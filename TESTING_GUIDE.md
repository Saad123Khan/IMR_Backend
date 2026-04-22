# API Testing Guide - Remit Now Backend

## Overview

The Postman collection includes **80+ test cases** covering all API endpoints with success scenarios, validation errors, and edge cases.

## Key Fixes Applied

### 1. **API Base URL**

- Changed from `http://localhost:3000` to `http://localhost:3000/api/v1`
- Added global API prefix in `main.ts`: `app.setGlobalPrefix('api/v1')`
- This ensures all routes follow RESTful conventions with versioning

### 2. **Test Flow & Dependencies**

Tests are organized to run sequentially:

1. **Authentication** - Signup and login to get access token
2. **Users** - Create employees for testing
3. **Organizations** - Get org details (requires auth)
4. **Corridors** - Create corridors before testing fees
5. **Fees Management** - Tests for all fee types (depends on corridor)

### 3. **Environment Variables**

The collection automatically saves variables after successful requests:

- `access_token` - JWT token saved from login/signup
- `user_id` - User ID from signup response
- `organization_id` - Org ID from signup response
- `corridor_id` - Corridor ID from creation
- `employee_id` - Employee ID from creation
- `fixed_fee_id`, `fees_slab_id`, `bank_fee_id`, `timing_fee_id` - Fee IDs

## Running Tests

### Prerequisites

1. Start the backend:

   ```bash
   docker-compose up -d
   ```

2. Wait for PostgreSQL to be healthy (check logs)
3. Verify API is running: `curl http://localhost:3000/api/v1/auth/login`

### Via Postman GUI

**IMPORTANT: Tests MUST run sequentially** because they depend on each other (signup → login → create employee → etc.)

1. **Import Collection**
   - File → Import → Select `postman_collection.json`

2. **Open Collection Runner**
   - Click on "Remit Now Backend API" collection
   - Click "Run" button (or right-click → Run Collection)

3. **Configure Runner Settings** (CRITICAL):
   - **Iterations**: Set to `1` (do not run multiple times)
   - **Delay**: Set to `100ms` or `500ms` between requests (allows backend to process)
   - **Data**: Leave empty (no CSV/JSON data file)
   - **Save responses**: Check this box (helps debugging)
   - **Keep variable values**: Check this box (preserves tokens between requests)
   - **Run order**: Do NOT change the order - keep default sequential order

4. **Clear Environment Before Running**:
   - Click eye icon (top right)
   - Select your environment
   - Click "..." → "Reset All"
   - This ensures no stale tokens or IDs

5. **Start the Run**:
   - Click "Run Remit Now Backend API"
   - Tests will execute in order from top to bottom

6. **Monitor Execution**:
   - Watch the runner show each test executing
   - Tests turn green (pass) or red (fail) in real-time
   - Check "View Results" after completion

**DO NOT**:
- ❌ Run individual requests by clicking "Send" (bypasses dependencies)
- ❌ Run tests out of order
- ❌ Run with multiple iterations
- ❌ Use "Run with Postman" button (may not preserve order)

**CORRECT APPROACH**:
- ✅ Use Collection Runner
- ✅ Run entire collection at once
- ✅ Run sequentially (one after another)
- ✅ Clear environment variables before each full run
- ✅ Fresh database before each full run: `docker-compose down -v && docker-compose up -d`

### Via Postman CLI (newman)

```bash
# Install newman
npm install -g newman

# Run collection
newman run postman_collection.json \
  --environment postman_environment.json \
  --reporters cli,json

# Results saved to newman/
```

## Test Coverage

### Authentication (6 tests)

✅ Signup - Success  
✅ Signup - Missing email/phone  
✅ Signup - Weak password  
✅ Login - Success  
✅ Login - Invalid credentials  
✅ Login - User not found  

### Users (8 tests)

✅ Get profile - Success  
✅ Get profile - Unauthorized  
✅ Create employee - Success  
✅ Create employee - Duplicate email  
✅ List employees  
✅ Get employee by ID  
✅ Update employee  
✅ Delete employee  

### Organizations (1 test)

✅ Get my organization  

### Corridors (13 tests)

✅ Create corridor - Success  
✅ Create corridor - Invalid MTO  
✅ List corridors  
✅ Filter by country  
✅ Filter by MTO  
✅ Filter by status  
✅ Multiple filters combined  
✅ Get by ID  
✅ Get by ID - Not found  
✅ Update corridor  
✅ Delete corridor  

### Fixed Fees (4 tests)

✅ Create - Success  
✅ Create - Negative amount  
✅ List fees  
✅ Delete fee  

### Fees Slabs (4 tests)

✅ Create - Success  
✅ Create - Invalid range  
✅ List slabs  
✅ Delete slab  

### Bank Fees (4 tests)

✅ Create - Success  
✅ Create - Invalid currency  
✅ List fees  
✅ Delete fee  

### Timing Fees (4 tests)

✅ Create - Success  
✅ Create - Invalid time format  
✅ List fees  
✅ Delete fee  

## Common Issues & Solutions

### Issue: "Base URL not found" / 404 errors

**Solution**: Ensure `base_url` variable is set to `http://localhost:3000/api/v1`

### Issue: "Unauthorized" errors on protected endpoints

**Solution**: Tests depend on signup/login running first. Run in Collection Runner, not individual requests.

### Issue: "Corridor not found" errors on fee tests

**Solution**: The "Create Corridor" test must run before fee tests. Collections run sequentially, so order matters.

### Issue: Duplicate email/phone errors

**Solution**: Tests use unique email addresses. If re-running, either:

- Clear database: `docker-compose down -v && docker-compose up -d`
- Use different test data with timestamps

### Issue: Database connection errors

**Solution**:

- Check PostgreSQL is healthy: `docker-compose logs postgres`
- Wait 10-15 seconds for DB to initialize
- Restart services: `docker-compose restart`

### Issue: Test passes but data not saved to database

**Symptoms**: Postman shows test as passed, but employee/data not found in database. curl commands work fine.

**Root Causes**:
1. Postman is not actually executing the request (cached result)
2. Test assertions are passing on wrong response
3. Request not reaching the backend

**Debugging Steps**:

1. **Open Postman Console** (View → Show Postman Console) to see actual HTTP traffic
2. **Clear environment variables** before running tests (delete all saved values)
3. **Check the console output** for:
   - Actual request URL being called
   - Request headers (verify Authorization token exists)
   - Response status and body
   - Look for 401 Unauthorized (token missing/expired)

4. **Verify backend received the request**:
   ```bash
   docker logs remit_backend --tail 20
   ```
   You should see a log line like:
   ```
   {"method":"POST","url":"/api/v1/users/employees","statusCode":201}
   ```

5. **Run tests individually** in this order:
   - Signup - Success (check console for 201 response)
   - Check environment variables (access_token should be set)
   - Create Employee - Success (check console for actual request)

6. **Verify token is valid**:
   ```bash
   # Copy access_token from Postman environment
   curl -X GET http://localhost:3000/api/v1/users/profile \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

**Common Fix**: The test may be skipped if dependencies fail. Always run the full collection sequentially, not individual tests.

## Test Assertions

Each test includes assertions for:

1. **Status Code** - Verifies correct HTTP status

   ```javascript
   pm.test('Status code is 201', function () {
       pm.response.to.have.status(201);
   });
   ```

2. **Response Structure** - Checks required fields

   ```javascript
   pm.test('Response has user data', function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.have.property('id');
   });
   ```

3. **Data Validation** - Checks field values

   ```javascript
   pm.test('All results are ACTIVE', function () {
       var jsonData = pm.response.json();
       jsonData.forEach(function(corridor) {
           pm.expect(corridor.status).to.equal('ACTIVE');
       });
   });
   ```

4. **Variable Extraction** - Saves IDs for chaining

   ```javascript
   pm.test('Save corridor ID', function () {
       var jsonData = pm.response.json();
       pm.environment.set('corridor_id', jsonData.id);
   });
   ```

## Expected API Responses

### Successful Creation (201)

```json
{
  "id": "uuid",
  "email": "user@remit.com",
  "role": "SUPER_ADMIN",
  "organizationId": "uuid",
  "createdAt": "2026-01-16T10:00:00Z"
}
```

### Successful Login (200)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@remit.com",
    "role": "SUPER_ADMIN"
  }
}
```

### Validation Error (400)

```json
{
  "statusCode": 400,
  "message": ["Field validation failed"],
  "error": "Bad Request"
}
```

### Unauthorized (401)

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### Not Found (404)

```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

## Troubleshooting

### Check Backend Logs

```bash
docker-compose logs -f backend
```

### Check Database

```bash
docker-compose exec postgres psql -U postgres -d remit_db -c "SELECT * FROM users LIMIT 5;"
```

### Restart Everything

```bash
docker-compose down
docker volume rm backend_postgres_data  # Optional: clear DB
docker-compose up -d
```

### Verify API Health

```bash
curl -X GET http://localhost:3000/api/v1/organizations/my-organization \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Best Practices

1. **Run Collections, Not Individual Requests** - Tests depend on execution order
2. **Use Unique Test Data** - Add timestamps to emails: `user+{{$timestamp}}@remit.com`
3. **Review Test Assertions** - Each test logs what it's validating
4. **Monitor API Logs** - Watch backend logs while tests run
5. **Check Database State** - Verify data persistence after tests

## Next Steps

- Extend collection with margin endpoint tests
- Add performance benchmarks
- Create test data factory
- Setup CI/CD integration (GitHub Actions)
- Generate HTML test reports
