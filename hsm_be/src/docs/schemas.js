/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: ERR
 *         message:
 *           type: string
 *     LoginResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: OK
 *         message:
 *           type: string
 *         access_token:
 *           type: string
 *         refresh_token:
 *           type: string
 *     Amenity:
 *       type: object
 *       required:
 *         - AmenitiesName
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         AmenitiesName:
 *           type: string
 *           description: Name of the amenity
 *         Note:
 *           type: string
 *           description: Additional notes about the amenity
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     RoomAmenity:
 *       type: object
 *       required:
 *         - room
 *         - amenity
 *         - quantity
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         room:
 *           type: string
 *           description: Reference to the Room
 *         amenity:
 *           type: string
 *           description: Reference to the Amenity
 *         quantity:
 *           type: number
 *           minimum: 1
 *           default: 1
 *           description: Quantity of the amenity in the room
 *         status:
 *           type: string
 *           enum: [Functioning, Broken, Missing, Other]
 *           default: Functioning
 *           description: Current status of the amenity
 * 
 *     Booking:
 *       type: object
 *       required:
 *         - customers
 *         - rooms
 *         - Time
 *         - SumPrice
 *         - Status
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         customers:
 *           type: string
 *           description: Reference to Customer ID
 *         rooms:
 *           type: string
 *           description: Reference to Room ID
 *         Time:
 *           type: object
 *           properties:
 *             Checkin:
 *               type: string
 *               format: date-time
 *             Checkout:
 *               type: string
 *               format: date-time
 *         SumPrice:
 *           type: number
 *         Status:
 *           type: string
 *           enum: [Pending, Confirmed, Cancelled]
 * 
 *     Transaction:
 *       type: object
 *       required:
 *         - bookings
 *         - BuyTime
 *         - FinalPrice
 *         - Status
 *         - CreatedBy
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         bookings:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of Booking IDs
 *         services:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               serviceId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               pricePerUnit:
 *                 type: number
 *               totalPrice:
 *                 type: number
 *         BuyTime:
 *           type: string
 *           format: date-time
 *         FinalPrice:
 *           type: number
 *         PaidAmount:
 *           type: number
 *           default: 0
 *         Pay:
 *           type: string
 *           enum: [Unpaid, Partial, Paid]
 *         Status:
 *           type: string
 *           enum: [Pending, Completed, Cancelled]
 *         PaymentMethod:
 *           type: string
 *         PaymentReference:
 *           type: string
 *         CreatedBy:
 *           type: string
 *         UpdatedBy:
 *           type: string
 *     Customer:
 *       type: object
 *       required:
 *         - full_name
 *         - phone
 *         - cccd
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         full_name:
 *           type: string
 *           description: Full name of the customer
 *         phone:
 *           type: string
 *           description: Phone number (must be unique)
 *         cccd:
 *           type: string
 *           description: Citizen ID number (must be unique)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     DashboardData:
 *       type: object
 *       properties:
 *         metrics:
 *           type: object
 *           properties:
 *             totalHotels:
 *               type: number
 *             totalRooms:
 *               type: number
 *             totalEmployees:
 *               type: number
 *             totalBookings:
 *               type: number
 *             monthlyRevenue:
 *               type: number
 *             averageOccupancyRate:
 *               type: string
 *         statistics:
 *           type: object
 *           properties:
 *             hotelPerformance:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   hotelId:
 *                     type: string
 *                   name:
 *                     type: string
 *                   totalRooms:
 *                     type: number
 *                   occupancyRate:
 *                     type: string
 *                   revenue:
 *                     type: number
 *         recentActivity:
 *           type: array
 *           items:
 *             type: object
 *         charts:
 *           type: object
 *
 *     RevenueData:
 *       type: object
 *       properties:
 *         totalRevenue:
 *           type: number
 *           description: Total revenue for the period
 *         previousRevenue:
 *           type: number
 *           description: Revenue from previous period
 *         bookingRevenue:
 *           type: number
 *           description: Revenue from bookings
 *         serviceRevenue:
 *           type: number
 *           description: Revenue from additional services
 *         revenueByDay:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               revenue:
 *                 type: number
 *               bookings:
 *                 type: number
 *               services:
 *                 type: number
 *         recentTransactions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               type:
 *                 type: string
 *                 enum: [Service, Booking]
 *               amount:
 *                 type: number
 *               status:
 *                 type: string
 *     Room:
 *       type: object
 *       required:
 *         - RoomName
 *         - Price
 *         - Floor
 *         - roomtype
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         RoomName:
 *           type: string
 *           description: Name of the room
 *         Price:
 *           type: number
 *           minimum: 0
 *           description: Price per night
 *         Status:
 *           type: string
 *           enum: [Available, Available - Need Cleaning, Available - Cleaning]
 *           default: Available
 *         Floor:
 *           type: number
 *           description: Floor number
 *         roomtype:
 *           type: string
 *           description: Reference to room type ID
 *         hotel:
 *           type: string
 *           description: Reference to hotel ID
 *         Description:
 *           type: string
 *         Image:
 *           type: string
 *         IsDelete:
 *           type: boolean
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Service:
 *       type: object
 *       required:
 *         - ServiceName
 *         - Price
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         ServiceName:
 *           type: string
 *           description: Name of the service
 *         Price:
 *           type: number
 *           description: Price of the service
 *         Note:
 *           type: string
 *           description: Additional notes about the service
 *         Active:
 *           type: boolean
 *           default: true
 *           description: Whether the service is currently active
 *         IsDelete:
 *           type: boolean
 *           default: false
 *           description: Soft delete flag
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Hotel:
 *       type: object
 *       required:
 *         - CodeHotel
 *         - NameHotel
 *         - LocationHotel
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         CodeHotel:
 *           type: string
 *           description: Unique code for the hotel
 *         NameHotel:
 *           type: string
 *           description: Name of the hotel
 *         Introduce:
 *           type: string
 *           description: Hotel introduction/description
 *         LocationHotel:
 *           type: string
 *           description: Hotel location/address
 *         image:
 *           type: string
 *           description: URL of the hotel image
 *         Active:
 *           type: boolean
 *           default: true
 *           description: Whether the hotel is currently active
 *         IsDelete:
 *           type: boolean
 *           default: false
 *           description: Soft delete flag
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     RoomType:
 *       type: object
 *       required:
 *         - TypeName
 *         - Note
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         TypeName:
 *           type: string
 *           description: Name of the room type
 *         Note:
 *           type: string
 *           description: Additional notes about the room type
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     HousekeepingTask:
 *       type: object
 *       required:
 *         - room
 *         - taskType
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         room:
 *           type: string
 *           description: Reference to Room ID
 *         assignedTo:
 *           type: string
 *           description: Reference to Account ID of housekeeper
 *         taskType:
 *           type: string
 *           enum: [Cleaning, Maintenance]
 *           description: Type of housekeeping task
 *         status:
 *           type: string
 *           enum: [In Progress, Completed, Cancelled]
 *           default: In Progress
 *         notes:
 *           type: string
 *           description: Additional notes about the task
 *         createdAt:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 *     HousekeepingLog:
 *       type: object
 *       required:
 *         - roomId
 *         - status
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         roomId:
 *           type: string
 *           description: Reference to Room ID
 *         staffId:
 *           type: string
 *           description: Reference to Account ID of staff member
 *         status:
 *           type: string
 *           enum: [Needs Cleaning, In Progress, Cleaned]
 *         notes:
 *           type: string
 *           description: Additional notes about the cleaning
 *         timestamp:
 *           type: string
 *           format: date-time
 */ 