# Worker Booking System - Implementation Documentation

## Overview

This document describes the complete implementation of the Worker Booking System that automatically matches user bookings with nearby workers within a 5 KM radius based on geolocation and service matching.

## Key Features

- **5 KM Geolocation-based Worker Matching**: Automatically finds eligible workers within 5 KM of booking location
- **Service Matching**: Only sends requests to workers who offer the required service
- **Real-time Request Management**: Workers can accept/reject booking requests in real-time
- **Atomic Assignment**: Prevents race conditions when multiple workers try to accept the same booking
- **Admin Monitoring**: Complete visibility into booking lifecycle and worker assignments
- **Edge Case Handling**: Handles no workers available, worker rejections, and worker cancellations
- **Security**: Full authentication and authorization for all worker and admin endpoints

## Architecture

```
User Booking → Backend → 5KM Geo Search → Service Filter → Send Requests → Worker Accept → Assignment
```

## Database Changes

### 1. Worker Model (`models/Worker.js`)
**Added:**
- `location` field with GeoJSON Point structure
- 2dsphere geospatial index for location queries

```javascript
location: {
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    default: [0, 0],
  },
}
```

### 2. Booking Model (`models/Booking.js`)
**Added:**
- `location` field with GeoJSON Point structure
- 2dsphere geospatial index for location queries
- `SEARCHING_WORKER` status to bookingStatus enum

```javascript
location: {
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    default: [0, 0],
  },
}
```

### 3. BookingRequest Model (`models/BookingRequest.js`) - NEW
**Purpose:** Track all worker requests for each booking

```javascript
{
  bookingId: ObjectId,
  workerId: ObjectId,
  userId: ObjectId,
  serviceId: ObjectId,
  distance: Number, // Distance in meters
  status: String, // PENDING, SENT, ACCEPTED, REJECTED, EXPIRED, CANCELLED
  sentAt: Date,
  acceptedAt: Date,
  rejectedAt: Date,
  expiredAt: Date,
  cancelledAt: Date,
}
```

**Indexes:**
- Unique index on `bookingId + workerId` to prevent duplicate requests
- Index on `workerId + status` for efficient worker queries
- Index on `bookingId + status` for booking lifecycle tracking

## New Services

### Worker Matching Service (`services/workerMatchingService.js`)

**Key Functions:**

1. `findNearbyWorkers(bookingLocation, serviceId)`
   - Searches for workers within 5 KM using MongoDB geospatial query
   - Filters by: approved status, availability ON, service matching
   - Returns workers with calculated distance

2. `sendBookingRequests(bookingId, workers)`
   - Creates BookingRequest documents for eligible workers
   - Prevents duplicate requests using unique index
   - Sets status to SENT with timestamp

3. `getWorkerRequests(workerId)`
   - Returns all pending/SENT requests for a specific worker
   - Populates booking, user, and service details

4. `acceptBookingRequest(requestId, workerId)`
   - Uses MongoDB transaction for atomic assignment
   - Prevents multiple workers from accepting same booking
   - Updates booking status and worker assignment
   - Expires all other pending requests for the booking

5. `rejectBookingRequest(requestId, workerId)`
   - Updates request status to REJECTED
   - Checks if all workers rejected and sets booking to SEARCHING_WORKER

6. `getAssignedBooking(workerId)`
   - Returns current assigned booking with customer details
   - Only exposes necessary customer information (name, phone)

7. `updateBookingStatus(bookingId, workerId, status)`
   - Allows worker to update booking status (started, completed, cancelled)
   - Handles cancellation by re-triggering worker search

8. `updateWorkerLocation(workerId, latitude, longitude)`
   - Updates worker's current location
   - Used for real-time location tracking

## Modified Services

### Booking Service (`services/bookingService.js`)

**Changes to `createBooking()`:**
- Now accepts `location` parameter with GeoJSON coordinates
- After booking creation, automatically triggers worker search
- If workers found, sends requests to eligible workers
- If no workers found, sets status to SEARCHING_WORKER

```javascript
if (payload.location && payload.location.coordinates) {
  const nearbyWorkers = await workerMatchingService.findNearbyWorkers(
    payload.location,
    serviceId
  );
  
  if (nearbyWorkers.length > 0) {
    await workerMatchingService.sendBookingRequests(booking._id, nearbyWorkers);
  } else {
    booking.bookingStatus = "SEARCHING_WORKER";
    await booking.save();
  }
}
```

## New Worker APIs

### Controller: `controllers/workerController.js`

**New Endpoints:**

1. `GET /api/worker/booking-requests`
   - Get all pending booking requests for the authenticated worker
   - Returns requests with booking, customer, and service details

2. `POST /api/worker/booking-requests/:requestId/accept`
   - Accept a booking request
   - Atomically assigns booking to worker
   - Returns booking and request details

3. `POST /api/worker/booking-requests/:requestId/reject`
   - Reject a booking request
   - Updates request status
   - Handles edge case of all workers rejecting

4. `GET /api/worker/assigned-booking`
   - Get currently assigned booking with customer details
   - Returns booking with customer name and phone

5. `PATCH /api/worker/bookings/:bookingId/status`
   - Update booking status (started, completed, cancelled)
   - Handles cancellation by re-triggering worker search

6. `PATCH /api/worker/location`
   - Update worker's current location
   - Accepts latitude and longitude
   - Updates GeoJSON location field

### Routes: `routes/workerRoutes.js`

All new routes are:
- Protected by JWT authentication (`protect` middleware)
- Restricted to worker role (`roleCheck("worker")` middleware)

## New Admin APIs

### Controller: `controllers/adminController.js`

**New Endpoints:**

1. `GET /api/admin/bookings/:bookingId/worker-details`
   - Get complete booking details with worker information
   - Returns booking, worker details, and all booking requests
   - Includes statistics: total, accepted, rejected, pending requests

2. `GET /api/admin/booking-requests`
   - Get all booking requests in the system
   - Fully populated with booking, worker, user, and service details
   - Useful for monitoring and analytics

### Routes: `routes/admin.js`

All new routes are:
- Protected by JWT authentication (`protect` middleware)
- Restricted to admin role (`authorizeRoles("admin")` middleware)

## Security Features

1. **Authentication**: All endpoints use existing JWT authentication
2. **Role-based Authorization**: Worker and admin roles enforced
3. **Worker Ownership Validation**: Workers can only access their own requests and bookings
4. **Data Privacy**: Only necessary customer data exposed to workers (name, phone)
5. **Atomic Operations**: MongoDB transactions prevent race conditions
6. **Duplicate Prevention**: Unique index on bookingId + workerId
7. **Input Validation**: All inputs validated before processing

## Edge Case Handling

### 1. No Workers Available
- Booking status set to `SEARCHING_WORKER`
- Logged for admin monitoring
- Can be retried manually or via scheduled job

### 2. All Workers Reject
- When last worker rejects, booking status set to `SEARCHING_WORKER`
- System can re-trigger search for new workers

### 3. Worker Cancels Assigned Booking
- Booking status changes to `SEARCHING_WORKER`
- Worker assignment cleared
- System automatically searches for new workers
- New requests sent to eligible workers

### 4. Race Condition Prevention
- MongoDB transactions used for acceptance
- Only first valid acceptance succeeds
- Others receive "Booking already assigned" error

## Integration with Existing User Flow

**IMPORTANT:** User booking flow remains completely unchanged.

### Existing User Booking API
```javascript
POST /api/bookings
{
  "address": "...",
  "products": [...],
  "bookingDate": "...",
  "bookingTime": "...",
  "totalAmount": 100,
  "location": {  // NEW - Optional parameter
    "type": "Point",
    "coordinates": [80.9462, 26.8467] // [longitude, latitude]
  }
}
```

### Backend Processing
1. Booking created as before
2. If location provided, worker search triggered automatically
3. Workers found within 5 KM receive requests
4. User booking status updates normally through existing system
5. No changes to user frontend required

## Testing the System

### 1. Setup Test Data
```javascript
// Create worker with location
await Worker.create({
  userId: user._id,
  name: "Test Worker",
  serviceCategory: [serviceId],
  availabilityStatus: "ON",
  status: "approved",
  location: {
    type: "Point",
    coordinates: [80.9462, 26.8467] // [longitude, latitude]
  }
});

// Create booking with location
await Booking.create({
  userId: customer._id,
  products: [{ productId: serviceId }],
  location: {
    type: "Point",
    coordinates: [80.9462, 26.8467] // Same location for testing
  }
});
```

### 2. Test Worker Flow
```bash
# Worker login
POST /api/worker/login
{ "email": "worker@test.com", "password": "password" }

# Get booking requests
GET /api/worker/booking-requests
Authorization: Bearer <token>

# Accept request
POST /api/worker/booking-requests/<requestId>/accept
Authorization: Bearer <token>

# Get assigned booking
GET /api/worker/assigned-booking
Authorization: Bearer <token>

# Update status
PATCH /api/worker/bookings/<bookingId>/status
{ "status": "started" }
Authorization: Bearer <token>
```

### 3. Test Admin Monitoring
```bash
# Get booking with worker details
GET /api/admin/bookings/<bookingId>/worker-details
Authorization: Bearer <admin_token>

# Get all booking requests
GET /api/admin/booking-requests
Authorization: Bearer <admin_token>
```

## Deployment Notes

### Database Migration
The new fields and indexes will be automatically created by MongoDB when the models are loaded. No manual migration required.

### Environment Variables
No new environment variables required. System uses existing:
- `JWT_SECRET` for authentication
- `MONGODB_URI` for database connection
- `BCRYPT_ROUNDS` for password hashing

### Performance Considerations
- Geospatial queries are efficient with proper indexing
- Worker search only triggered when location is provided
- BookingRequest collection can grow large - consider archiving old requests
- Use pagination for admin booking requests endpoint in production

## Future Enhancements

1. **Real-time Notifications**: Add WebSocket or push notifications for workers
2. **Worker Rating System**: Implement worker ratings based on completed jobs
3. **Dynamic Radius**: Make search radius configurable per service type
4. **Worker Availability Schedule**: Add time-based availability
5. **Bulk Assignment**: Allow assigning multiple workers for large jobs
6. **Analytics Dashboard**: Enhanced admin analytics for worker performance
7. **Retry Mechanism**: Automatic retry for bookings with no workers found

## Troubleshooting

### Workers not receiving requests
- Check worker status is "approved"
- Check worker availabilityStatus is "ON"
- Verify worker has correct serviceCategory
- Ensure worker location is set correctly
- Check booking location coordinates are valid

### Booking not assigned
- Check BookingRequest collection for request status
- Verify worker acceptance didn't fail with race condition
- Check booking status is not already assigned
- Review server logs for errors

### Admin not seeing data
- Verify admin role and authentication
- Check populate queries are working
- Ensure BookingRequest documents exist
- Review database indexes are created

## Summary

The Worker Booking System has been successfully implemented with:
- ✅ Geolocation-based worker matching (5 KM radius)
- ✅ Service matching and filtering
- ✅ Real-time request management
- ✅ Atomic assignment with race condition prevention
- ✅ Complete admin monitoring
- ✅ Edge case handling
- ✅ Full security and authorization
- ✅ Zero changes to existing user flow

The system is production-ready and can be deployed immediately.


 i have a admin page both backend and forntend  and i also to be use the postman app for testing the api url  when api is correct than add the api in apiService.js file and we want to be call in frontned page to  run the app and open  login page than dill all detail to be submit  when  com, to reponse right than login otherwise faild ok  
 dont's use any seed data to be login admin ok 
  i have a two way  for login admin postman and second one is dreact regideter andf loging ok 