import AccountPage from "../pages/AccountPage/AccountPage";
import LoginPage from "../pages/AccountPage/LoginPage";
import BookingPage from "../pages/BookingPage/BookingPage";
import Dashboard from "../pages/Dashboard/Dashboard";
import AddEmployees from "../pages/EmployeesPage/AddEmployees/AddEmployee";
import HomePage from "../pages/HomePage/HomePage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import RevenuePage from "../pages/RevenuePage/RevenuePage";
import AddRoom from "../pages/RoomPage/AddRoom";
import RoomDashboard from "../pages/RoomPage/RoomDashboard";
import { SettingOutlined, AppstoreAddOutlined, HomeOutlined, BarChartOutlined, LineChartOutlined, PlusCircleOutlined, TableOutlined, BorderOuterOutlined, ProfileOutlined, BankOutlined, CalendarOutlined, DesktopOutlined, WifiOutlined, DollarCircleOutlined, OrderedListOutlined } from '@ant-design/icons';
import RoomList from "../pages/RoomPage/RoomList";
import EmployeesPage from "../pages/EmployeesPage/EmployeesPage";
import EmployeeDetail from "../pages/EmployeesPage/EmployeeDetail/EmployeeDetail";
import AddHotel from "../pages/HotelPage/AddHotel";
import HotelList from "../pages/HotelPage/HotelList";
import ReservationPage from "../pages/ReservationPage/ReservationPage";
import ReservationList from "../pages/ReservationPage/ReservationListPage";
import VerificationPage from "../pages/ReservationPage/VerificationPayment";
import Housekeeping from "../pages/HouseKeepingPage/HouseKeepingPage";
import HousekeepingHistory from "../pages/HouseKeepingPage/House History/HouseHistoryPage";
import BookingLogs from "../pages/BookingPage/BookingLogs";
import AmenityListPage from '../pages/AmenityPage/AmenityListPage/AmenityPageList';
import ServicePage from "../pages/ServicePage/ServicePage";
import BookingHistory from "../pages/BookingPage/BookingHistory";


export const routes = [
    {
        path: "/",
        name: "Login",
        page: LoginPage,
        isShowHeader: false,
    },
    {
        path: "/verification",
        name: "Verification Payment",
        page: VerificationPage,
        isShowHeader: false,
    },
    {
        path: "/dashboard",
        name: "Dashboard",
        page: Dashboard,
        isShowHeader: true,
        icon: <HomeOutlined />,
        permissions: ["Admin", "Receptionist", "Hotel-Admin"], // Accessible by all
    },
    {
        path: "/login",
        name: "login",
        page: LoginPage,
        icon: <SettingOutlined />,
        isShowHeader: false,
    },
    {
        path: "/employees",
        name: "Employee",
        isShowHeader: true,
        permissions: ["Admin", "Hotel-Admin"],
        children: [
            {
                path: "/employees/add",
                name: "Add Employee",
                isShowHeader: true,
                icon: <AppstoreAddOutlined />,
                page: AddEmployees,
                permissions: ["Admin", "Receptionist", "Janitor", "Hotel-Admin"],
            },
            {
                path: "/employees/list",
                name: "Employees",
                isShowHeader: true,
                page: EmployeesPage,
                icon: <AppstoreAddOutlined />,
                permissions: ["Admin", "Receptionist", "Janitor", "Hotel-Admin"],
            },
            {
                path: "/employee-detail/:id",
                name: "Employee Detail",
                page: EmployeeDetail,
                isShowHeader: true,
                icon: <SettingOutlined />,
                permissions: ["Admin", "Receptionist", "Janitor"],
            },
        ],
    },
    {
        path: "/revenue",
        name: "Revenue",
        page: RevenuePage,
        isShowHeader: true,
        icon: <SettingOutlined />,
        permissions: ["Admin", "Receptionist", "Hotel-Admin"],
    },
    {
        path: "/hotel",
        name: "Hotel",
        isShowHeader: true,
        permissions: ["Admin", "Hotel-Admin"],
        icon: <BankOutlined />,
        children: [
            {
                path: "/hotel/hotel-list",
                name: "Hotel List",
                isShowHeader: true,
                icon: <ProfileOutlined />,
                page: HotelList,
                roles: ["Admin", "Hotel-Admin"],
            },
            {
                path: "/hotel/add-hotel",
                name: "Add Hotel",
                isShowHeader: true,
                page: AddHotel,
                icon: <BorderOuterOutlined />,
                roles: ["Admin", "Hotel-Admin"],
            },
        ],
    },
    {
        path: "/booking",
        name: "Booking",
        isShowHeader: true,
        permissions: ["Admin", "Receptionist", "Hotel-Admin"],
        icon: <CalendarOutlined />,
        children: [
            {
                path: "/booking/booking-calendar",
                name: "Booking Calendar",
                isShowHeader: true,
                icon: <ProfileOutlined />,
                page: BookingPage,
                roles: ["Admin", "Receptionist", "Hotel-Admin"],
            },
            {
                path: "/booking/booking-list",
                name: "Booking List",
                isShowHeader: true,
                icon: <ProfileOutlined />,
                page: BookingLogs,
                roles: ["Admin", "Receptionist", "Hotel-Admin"],
            },
            {
                path: "/booking-history",
                name: "Booking History",
                page: BookingHistory,
                isShowHeader: true,
                icon: <SettingOutlined />,
                roles: ["Admin", "Hotel-Admin"],
            }
        ],
    },
    {
        path: "/reservations",
        name: "Reservation",
        isShowHeader: true,
        permissions: ["Admin", "Receptionist", "Hotel-Admin"],
        icon: <DollarCircleOutlined />,
        children: [{
            path: "/createreservation",
            name: "Create Reservation",
            page: ReservationPage,
            isShowHeader: true,
            icon: <OrderedListOutlined />,
            permissions: ["Admin", "Receptionist", "Hotel-Admin"],
        }, {
            path: "/reservationlist",
            name: "Reservation History",
            page: ReservationList,
            isShowHeader: true,
            icon: <TableOutlined />,
            permissions: ["Admin", "Receptionist", "Hotel-Admin"],
        }
        ]
    },
    {
        path: "/rooms",
        name: "Rooms",
        isShowHeader: true,
        permissions: ["Admin", "Receptionist", "Hotel-Admin"],
        icon: <BarChartOutlined />,
        children: [
            {
                path: "/rooms/room-dashboard",
                name: "Room Dashboard",
                isShowHeader: true,
                page: RoomDashboard,
                icon: <LineChartOutlined />,
                permissions: ["Admin", "Receptionist", "Hotel-Admin"],
            },
            {
                path: "/rooms/room-list",
                name: "Room List",
                isShowHeader: true,
                page: RoomList,
                icon: <TableOutlined />,
                permissions: ["Admin", "Receptionist", "Hotel-Admin"],
            },
            {
                path: "/rooms",
                name: "Add Room",
                isShowHeader: true,
                icon: <PlusCircleOutlined />,
                page: AddRoom,
                permissions: ["Admin", "Receptionist", "Hotel-Admin"],
            },
        ],
    },
    {
        path: "/housekeepinghistory",
        name: "House Keeping History",
        page: HousekeepingHistory,
        isShowHeader: true,
        icon: <TableOutlined />,
        permissions: ["Admin", "Hotel-Admin"],
    },
    {
        path: "/housekeeping",
        name: "House Keeping",
        page: Housekeeping,
        isShowHeader: true,
        icon: <TableOutlined />,
        permissions: ["Janitor", "Hotel-Admin"],
    },
    // {
    //     path: "/account",
    //     name: "Account",
    //     page: AccountPage,
    //     isShowHeader: true,
    //     icon: <HomeOutlined />,
    //     permissions: ["Admin", "Receptionist"],
    // },
    {
        path: "/amenities",
        name: "Amenities",
        page: AmenityListPage,
        isShowHeader: true,
        icon: <WifiOutlined />,
        permissions: ["Admin"], // Only Admin can access
    },
    {
        path: "/service",
        name: "Service",
        page: ServicePage,
        isShowHeader: true,
        icon: <DesktopOutlined />,
        permissions: ["Admin"],
    },
    {
        path: "*",
        page: NotFoundPage,
    },
];

