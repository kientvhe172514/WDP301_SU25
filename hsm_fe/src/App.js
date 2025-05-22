import React, { useState, useEffect, Fragment } from 'react';
import { Layout, Menu, Avatar, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';

import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import * as AccountService from "./services/accountService";
import { isJsonString } from "./utils";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { routes } from './routes/routes';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import { resetAccount, updateAccount } from './redux/accountSlice';
import { persistStore } from 'redux-persist';
import { store } from './redux/store';
import axios from 'axios';
const { Sider, Content, Header } = Layout;
const publicRoutes = ["/login", "/verification"];

const App = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const account = useSelector((state) => state.account);
    const userPermissions = account?.permissions || [];

    useEffect(() => {
        if (publicRoutes.some((route) => location.pathname.startsWith(route))) return;
        const checkToken = () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                console.warn("Token removed, logging out...");
                dispatch(resetAccount());
                navigate("/login");
            }
        };
        const interval = setInterval(checkToken, 2000);
        return () => clearInterval(interval);
    }, [dispatch, navigate, location]);

    useEffect(() => {
        if (publicRoutes.some((route) => location.pathname.startsWith(route))) return;
        if (account?.id) return;

        const handleAuthCheck = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                console.warn("No valid token found, redirecting to login...");
                dispatch(resetAccount());
                navigate("/login");
                return;
            }

            try {
                const decoded = jwtDecode(token);
                if (!decoded?.id) {
                    throw new Error("Invalid token");
                }

                console.log("User authenticated. Fetching account details...");
                const res = await AccountService.getDetailsAccount(decoded.id, token);
                if (res?.data) {
                    // Fetch employee details if available
                    let employeeData = null;
                    try {
                        const employeeRes = await AccountService.getEmployeeByAccountId(decoded.id, token);
                        if (employeeRes?.data) {
                            employeeData = employeeRes.data;
                        }
                    } catch (error) {
                        console.error("Error fetching employee details:", error);
                    }

                    dispatch(
                        updateAccount({
                            ...res.data,
                            access_token: token,
                            employee: employeeData
                        })
                    );
                }
            } catch (error) {
                console.error("Auth check error:", error);
                dispatch(resetAccount());
                navigate("/login");
            }
        };

        handleAuthCheck();
    }, [account?.id, dispatch, navigate]);

    // Simple axios interceptor that only adds the access token
    axios.interceptors.request.use((config) => {
        if (config.url.includes('/refresh-token')) {
            return config;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const accessToken = localStorage.getItem("access_token");
        const decodedAccessToken = accessToken ? jwtDecode(accessToken) : null;

        if (!accessToken || decodedAccessToken?.exp < currentTime) {
            return AccountService.refreshToken({ withCredentials: true })
                .then((response) => {
                    localStorage.setItem("access_token", response?.access_token);
                    config.headers["token"] = `Bearer ${response?.access_token}`;
                    return config;
                })
                .catch((error) => {
                    if (error.response?.status === 403) {
                        console.error("Refresh token expired or invalid.");
                        handleLogout();
                    }

                    return Promise.reject(error);
                });
        }

        config.headers["token"] = `Bearer ${accessToken}`;
        return config;
    }, (error) => Promise.reject(error));



    const handleLogout = async () => {
        try {
            const access_token = localStorage.getItem("access_token");
            if (access_token) {
                await AccountService.logout(access_token);
            }
            dispatch(resetAccount());
            persistStore(store).flush().then(() => persistStore(store).purge());
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            // Still clear local state even if server request fails
            dispatch(resetAccount());
            localStorage.removeItem("access_token");
            persistStore(store).flush().then(() => persistStore(store).purge());
            navigate("/login");
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Routes>
                {routes.map(route => {
                    if (route.children) {
                        return route.children.map(subRoute => (
                            <Route
                                key={subRoute.path}
                                path={subRoute.path}
                                element={
                                    <ProtectedRoute
                                        element={
                                            subRoute.isShowHeader ?? route.isShowHeader ? ( // 🔥 Inherit from parent
                                                <Layout>
                                                    {/* HEADER */}
                                                    <Header style={{ background: "#79D7BE", display: "flex", justifyContent: "space-between", padding: "0 27px" }}>
                                                        <div style={{ fontSize: "20px", fontWeight: "bold", color: "#00363D", display: "flex", alignItems: "center", gap: "20px" }}>
                                                            <span>HMS System</span>
                                                            {account?.employee?.FullName && (
                                                                <span style={{ fontWeight: "normal" }}>
                                                                    | Hello {account.employee.FullName}
                                                                    {account.employee.permission?.PermissionName &&
                                                                        ` (${account.employee.permission.PermissionName})`}
                                                                    {account.employee.hotels?.length > 0 &&
                                                                        ` from ${account.employee.hotels.map(h => h.NameHotel).join(", ")}`}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                                            <Button
                                                                type="text"
                                                                style={{ color: "#00363D" }}
                                                                onClick={handleLogout}
                                                            >
                                                                Logout
                                                            </Button>
                                                            <Avatar style={{ backgroundColor: "#00363D" }} icon={<UserOutlined />} />
                                                        </div>
                                                    </Header>

                                                    {/* SIDEBAR */}
                                                    <Layout>
                                                        <Sider
                                                            width={190}
                                                            style={{
                                                                background: "#79D7BE",
                                                                height: "100vh", // Full height
                                                                minWidth: "60px",
                                                                overflowY: "auto", // Scroll inside sidebar if needed
                                                                position: "sticky",
                                                                top: 0
                                                            }}
                                                        >

                                                            <Menu mode="inline" defaultSelectedKeys={["dashboard"]} style={{ background: "#79D7BE", color: "#00363D", fontSize: "16px" }} selectedKeys={[location.pathname]}>
                                                                {routes
                                                                    .filter(route => route.isShowHeader && (!route.permissions || route.permissions.some(p => userPermissions.includes(p))))
                                                                    .map(route => {
                                                                        if (route.children) {
                                                                            return (
                                                                                <Menu.SubMenu key={route.name} title={route.name} icon={route.icon} >
                                                                                    {route.children.map(subRoute => (
                                                                                        <Menu.Item key={subRoute.path} icon={subRoute.icon} >
                                                                                            <Link style={{ textDecoration: "none" }} to={subRoute.path}>{subRoute.name}</Link>
                                                                                        </Menu.Item>
                                                                                    ))}
                                                                                </Menu.SubMenu>
                                                                            );
                                                                        }
                                                                        return (
                                                                            <Menu.Item key={route.path} icon={route.icon}>
                                                                                <Link style={{ textDecoration: "none" }} to={route.path}>{route.name}</Link>
                                                                            </Menu.Item>
                                                                        );
                                                                    })}
                                                            </Menu>
                                                        </Sider>

                                                        {/* MAIN CONTENT */}
                                                        <Layout style={{ minHeight: "100vh", display: "flex" }}>

                                                            <Content style={{ padding: "17px", background: "#fff", flex: 1, overflow: "auto" }}>

                                                                <subRoute.page />
                                                            </Content>
                                                        </Layout>
                                                    </Layout>
                                                </Layout>
                                            ) : (
                                                <subRoute.page />
                                            )
                                        }
                                        requiredPermissions={subRoute.permissions}
                                    />
                                }
                            />
                        ));
                    }

                    return (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                <ProtectedRoute
                                    element={
                                        route.isShowHeader ? (
                                            <Layout>
                                                {/* HEADER */}
                                                <Header style={{ background: "#79D7BE", display: "flex", justifyContent: "space-between", padding: "0 27px" }}>
                                                    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#00363D", display: "flex", alignItems: "center", gap: "20px" }}>
                                                        <span>HMS System</span>
                                                        {account?.employee?.FullName && (
                                                            <span style={{ fontWeight: "normal" }}>
                                                                | Hello {account.employee.FullName}
                                                                {account.employee.permission?.PermissionName &&
                                                                    ` (${account.employee.permission.PermissionName})`}
                                                                {account.employee.hotels?.length > 0 &&
                                                                    ` from ${account.employee.hotels.map(h => h.NameHotel).join(", ")}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                                        <Button
                                                            type="text"
                                                            style={{ color: "#00363D" }}
                                                            onClick={handleLogout}
                                                        >
                                                            Logout
                                                        </Button>
                                                        <Avatar style={{ backgroundColor: "#00363D" }} icon={<UserOutlined />} />
                                                    </div>
                                                </Header>

                                                {/* SIDEBAR */}
                                                <Layout>
                                                    <Sider width={190} style={{ background: "#79D7BE", borderRadius: "5px" }}>
                                                        <Menu mode="inline" defaultSelectedKeys={["dashboard"]} style={{ background: "#79D7BE", color: "#00363D", fontSize: "16px" }}>
                                                            {routes
                                                                .filter(route => route.isShowHeader && (!route.permissions || route.permissions.some(p => userPermissions.includes(p))))
                                                                .map(route => {
                                                                    if (route.children) {
                                                                        return (
                                                                            <Menu.SubMenu key={route.name} title={route.name} icon={route.icon}>
                                                                                {route.children.map(subRoute => (
                                                                                    <Menu.Item key={subRoute.path} icon={subRoute.icon}>
                                                                                        <Link style={{ textDecoration: 'none' }} to={subRoute.path}>{subRoute.name}</Link>
                                                                                    </Menu.Item>
                                                                                ))}
                                                                            </Menu.SubMenu>
                                                                        );
                                                                    }
                                                                    return (
                                                                        <Menu.Item key={route.path} icon={route.icon}>
                                                                            <Link style={{ textDecoration: 'none' }} to={route.path}>{route.name}</Link>
                                                                        </Menu.Item>
                                                                    );
                                                                })}
                                                        </Menu>
                                                    </Sider>

                                                    {/* MAIN CONTENT */}
                                                    <Layout>
                                                        <Content style={{ padding: "17px", background: "#fff" }}>
                                                            <route.page />
                                                        </Content>
                                                    </Layout>
                                                </Layout>
                                            </Layout>
                                        ) : (
                                            <route.page />
                                        )
                                    }
                                    requiredPermissions={route.permissions}
                                />
                            }
                        />
                    );
                })}

                {/* Fallback for unknown routes */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>

        </Layout>
    );
};

export default App;



const ProtectedRoute = ({ element, requiredPermissions }) => {
    const account = useSelector((state) => state.account);
    const userPermissions = account?.permissions || [];
    const location = useLocation();
    if (publicRoutes.some((route) => location.pathname.startsWith(route))) return element;
    // If account.id is not set, show a loading screen
    if (!account?.id) {
        console.log("Waiting for account to load...");
        return <div>Loading...</div>; // Prevents immediate redirect to login
    }

    if (requiredPermissions && !requiredPermissions.some(p => userPermissions.includes(p))) {
        if (userPermissions.includes("Janitor")) {
            return element; // Cho phép Janitor truy cập nếu có
        }
        console.log("You don't have the permission to view this");
        return <Navigate to="/dashboard" />;
    }

    return element;
};