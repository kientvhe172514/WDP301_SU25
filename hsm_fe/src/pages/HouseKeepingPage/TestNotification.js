import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useSelector } from "react-redux";

const socket = io("http://localhost:9999", { transports: ["websocket"] });

const TestNotification = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [showReactions, setShowReactions] = useState(null); // Lưu timestamp của tin nhắn đang hiện reactions
    const messagesEndRef = useRef(null);
    const reactionMenuRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0); // Thêm state đếm tin nhắn chưa đọc
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    const user = useSelector((state) => state.account);

    // Danh sách emoji reactions
    const reactions = ["👍", "❤️", "😆", "😮", "😢", "😡"];

    // Hàm kiểm tra và xóa tin nhắn cũ hơn 1 tháng
    const cleanOldMessages = (messages) => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        return messages.filter(msg => {
            const msgDate = new Date(msg.timestamp);
            return msgDate > oneMonthAgo;
        });
    };

    // Hàm lưu tin nhắn vào localStorage
    const saveMessagesToStorage = (messages) => {
        const cleanedMessages = cleanOldMessages(messages);
        localStorage.setItem("chat_messages", JSON.stringify(cleanedMessages));
        return cleanedMessages;
    };

    // Hàm format thời gian
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes} - ${day}/${month}/${year}`;
    };

    // Thêm useEffect để xử lý click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (reactionMenuRef.current && !reactionMenuRef.current.contains(event.target)) {
                setShowReactions(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        try {
            // Lấy tin nhắn từ localStorage và xóa tin nhắn cũ
            const storedMessages = JSON.parse(localStorage.getItem("chat_messages")) || [];
            const cleanedMessages = cleanOldMessages(storedMessages);
            setMessages(cleanedMessages);

            if (user) {
                socket.emit("register", user?.fullName || "Guest");
            }

            socket.emit("get_messages");

            socket.on("load_messages", (serverData) => {
                setMessages(prevMessages => {
                    // Kết hợp tin nhắn từ server với tin nhắn trong localStorage
                    const allMessages = [...prevMessages];

                    // Thêm tin nhắn mới từ server nếu chưa có
                    serverData.forEach(serverMsg => {
                        if (!allMessages.some(msg => msg.timestamp === serverMsg.timestamp)) {
                            allMessages.push(serverMsg);
                        }
                    });

                    // Sắp xếp tin nhắn theo thời gian
                    const sortedMessages = allMessages.sort((a, b) =>
                        new Date(a.timestamp) - new Date(b.timestamp)
                    );

                    // Lọc tin nhắn cũ và lưu vào localStorage
                    const cleanedMessages = cleanOldMessages(sortedMessages);
                    localStorage.setItem("chat_messages", JSON.stringify(cleanedMessages));

                    return cleanedMessages;
                });
            });

            socket.on("receive_message", (data) => {
                console.log("📩 Tin nhắn nhận từ server:", data);

                setMessages((prev) => {
                    if (!prev.some(msg => msg.timestamp === data.timestamp)) {
                        const updatedMessages = [...prev, data];
                        const sortedMessages = updatedMessages.sort((a, b) =>
                            new Date(a.timestamp) - new Date(b.timestamp)
                        );
                        const cleanedMessages = cleanOldMessages(sortedMessages);
                        localStorage.setItem("chat_messages", JSON.stringify(cleanedMessages));
                        return cleanedMessages;
                    }
                    return prev;
                });

                // Nếu chưa mở chat, tăng số tin nhắn chưa đọc
                if (!isOpen) {
                    setUnreadCount((prev) => prev + 1);
                }
            });

            socket.on("reaction_updated", (updatedMessage) => {
                console.log("Nhận được reaction mới:", updatedMessage);
                if (!updatedMessage || !updatedMessage.timestamp) return;

                // Nếu người dùng hiện tại là người gửi tin nhắn và có người khác thả cảm xúc
                if (user?.fullName === updatedMessage.messageOwner && user?.fullName !== updatedMessage.user) {
                    // Tăng số tin nhắn chưa đọc nếu chat chưa mở
                    if (!isOpen) {
                        setUnreadCount(prev => prev + 1);
                    }
                }

                setMessages(prev => {
                    const updatedMessages = prev.map(msg => {
                        if (msg.timestamp === updatedMessage.timestamp) {
                            // Cập nhật tin nhắn với reactions mới
                            const currentReactions = msg.reactions || {};
                            return {
                                ...msg,
                                reactions: {
                                    ...currentReactions,
                                    [updatedMessage.user]: updatedMessage.reaction
                                }
                            };
                        }
                        return msg;
                    });
                    localStorage.setItem("chat_messages", JSON.stringify(updatedMessages));
                    return updatedMessages;
                });
            });

            return () => {
                socket.off("load_messages");
                socket.off("receive_message");
                socket.off("reaction_updated");
            };
        } catch (error) {
            console.error("Lỗi khi kết nối WebSocket:", error);
        }
    }, [user, isOpen]);

    useEffect(() => {
        if (isOpen) {
            // Scroll to bottom immediately when chat opens
            messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
        }
    }, [isOpen]);

    // Add new useEffect for scrolling when new messages arrive
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Xử lý khi mở chat -> reset unreadCount về 0
    const toggleChat = () => {
        setIsOpen((prev) => {
            if (!prev) {
                setUnreadCount(0);
                // Scroll to bottom immediately when opening chat
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
                }, 0);
            }
            return !prev;
        });
    };

    const sendMessage = () => {
        if (message.trim() !== "" && user) {
            const msgData = {
                sender: user.fullName,
                content: message,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => {
                const updatedMessages = [...prev, msgData];
                const sortedMessages = updatedMessages.sort((a, b) =>
                    new Date(a.timestamp) - new Date(b.timestamp)
                );
                const cleanedMessages = cleanOldMessages(sortedMessages);
                localStorage.setItem("chat_messages", JSON.stringify(cleanedMessages));
                return cleanedMessages;
            });

            socket.emit("send_message", msgData);
            setMessage("");

            // Scroll to bottom after sending message
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 0);
        }
    };

    const handleMessageClick = (msg) => {
        setSelectedMessage(selectedMessage?.timestamp === msg.timestamp ? null : msg);
    };

    // Hàm xử lý khi chọn ảnh
    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Gửi ảnh ngay khi chọn
                const imageMessage = {
                    sender: user.fullName,
                    content: reader.result, // Base64 của ảnh
                    type: 'image',
                    timestamp: new Date().toISOString()
                };

                setMessages(prev => {
                    const updatedMessages = [...prev, imageMessage];
                    const sortedMessages = updatedMessages.sort((a, b) =>
                        new Date(a.timestamp) - new Date(b.timestamp)
                    );
                    const cleanedMessages = cleanOldMessages(sortedMessages);
                    localStorage.setItem("chat_messages", JSON.stringify(cleanedMessages));
                    return cleanedMessages;
                });

                socket.emit("send_message", imageMessage);

                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Cập nhật hàm xử lý reaction
    const handleReaction = (msgTimestamp, reaction) => {
        if (!user?.fullName) return;

        const messageToUpdate = messages.find(msg => msg.timestamp === msgTimestamp);
        if (!messageToUpdate) return;

        // Tạo object chứa thông tin reaction
        const reactionData = {
            timestamp: msgTimestamp,
            user: user.fullName,
            reaction: reaction,
            messageOwner: messageToUpdate.sender,
            content: `${user.fullName} đã thả ${reaction} vào tin nhắn của bạn` // Thêm nội dung thông báo
        };

        // Gửi reaction lên server
        socket.emit("update_reactions", reactionData);

        // Cập nhật state local
        setMessages(prev => {
            const updatedMessages = prev.map(msg => {
                if (msg.timestamp === msgTimestamp) {
                    const currentReactions = msg.reactions || {};
                    return {
                        ...msg,
                        reactions: {
                            ...currentReactions,
                            [user.fullName]: reaction
                        }
                    };
                }
                return msg;
            });
            localStorage.setItem("chat_messages", JSON.stringify(updatedMessages));
            return updatedMessages;
        });

        setShowReactions(null);
    };

    // Hiển thị reactions của tin nhắn
    const renderReactions = (msg) => {
        if (!msg.reactions) return null;

        const allReactions = Object.entries(msg.reactions).map(([username, reaction]) => ({
            username,
            reaction
        }));

        return allReactions.map(({ username, reaction }) => (
            <div
                key={username}
                style={{
                    backgroundColor: username === user.fullName ? "#e3f2fd" : "#f0f0f0",
                    padding: "2px 5px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    margin: "2px",
                    display: "inline-block"
                }}
            >
                {reaction} {username}
            </div>
        ));
    };

    // Cập nhật hàm render tin nhắn
    const renderMessage = (msg) => {
        const isOwnMessage = msg.sender === user?.fullName;

        return (
            <div style={{
                maxWidth: "75%",
                minWidth: "150px", // Thêm độ rộng tối thiểu cho tin nhắn
                backgroundColor: isOwnMessage ? "#007bff" : "#e9ecef",
                color: isOwnMessage ? "white" : "black",
                fontSize: "14px",
                padding: "8px",
                borderRadius: "10px",
                textAlign: "left",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                position: "relative",
                marginRight: !isOwnMessage ? "30px" : "0", // Thêm margin bên phải cho tin nhắn của người khác
                marginLeft: isOwnMessage ? "30px" : "0" // Thêm margin bên trái cho tin nhắn của mình
            }}>
                <div style={{ position: "relative", minWidth: "100%" }}>
                    {msg.type === 'image' ? (
                        <img
                            src={msg.content}
                            alt="Sent"
                            style={{
                                maxWidth: "100%",
                                borderRadius: "5px",
                                cursor: "pointer"
                            }}
                            onClick={() => window.open(msg.content, '_blank')}
                        />
                    ) : (
                        <span style={{ display: "inline-block", minWidth: "100%" }}>{msg.content}</span>
                    )}

                    {/* Chỉ hiển thị nút reaction cho tin nhắn của người khác */}
                    {!isOwnMessage && (
                        <div
                            style={{
                                position: "absolute",
                                right: "-30px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                fontSize: "16px",
                                opacity: "0.7",
                                width: "25px",
                                height: "25px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#f0f0f0",
                                borderRadius: "50%"
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowReactions(showReactions === msg.timestamp ? null : msg.timestamp);
                            }}
                        >
                            😊
                        </div>
                    )}

                    {/* Menu reactions */}
                    {showReactions === msg.timestamp && !isOwnMessage && (
                        <div
                            ref={reactionMenuRef}
                            style={{
                                position: "absolute",
                                right: "-70px",
                                bottom: "100%",
                                marginBottom: "5px",
                                transform: "none",
                                backgroundColor: "white",
                                border: "1px solid #ddd",
                                borderRadius: "15px",
                                padding: "3px",
                                display: "flex",
                                gap: "2px",
                                zIndex: 1000,
                                boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            {reactions.map(reaction => {
                                const isSelected = msg.reactions?.[user.fullName] === reaction;
                                return (
                                    <span
                                        key={reaction}
                                        style={{
                                            cursor: "pointer",
                                            padding: "3px",
                                            fontSize: "16px", // Giảm kích thước emoji
                                            backgroundColor: isSelected ? "#e3f2fd" : "transparent",
                                            borderRadius: "50%",
                                            transition: "all 0.2s",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "25px", // Cố định kích thước
                                            height: "25px",
                                            ":hover": {
                                                transform: "scale(1.2)",
                                                backgroundColor: "#f0f0f0"
                                            }
                                        }}
                                        onClick={() => handleReaction(msg.timestamp, reaction)}
                                    >
                                        {reaction}
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Hiển thị reactions */}
                <div style={{
                    marginTop: "5px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "2px"
                }}>
                    {renderReactions(msg)}
                </div>

                {selectedMessage?.timestamp === msg.timestamp && (
                    <div style={{
                        position: "absolute",
                        bottom: "-20px",
                        right: "0",
                        fontSize: "10px",
                        color: "#666",
                        backgroundColor: "#f0f0f0",
                        padding: "2px 5px",
                        borderRadius: "3px",
                        whiteSpace: "nowrap"
                    }}>
                        {formatTimestamp(msg.timestamp)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            <div
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    backgroundColor: "orange",
                    color: "white",
                    padding: "10px 15px",
                    borderRadius: "20px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)"
                }}
                onClick={toggleChat}
            >
                {!isOpen && ( // Chỉ hiển thị khi chat chưa mở
                    <>
                        <span style={{ marginRight: "10px" }}>
                            Bạn có <span style={{ color: "red", fontSize: "20px" }}>{unreadCount}</span> tin nhắn mới!
                        </span>
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQchVHkgc9oJ8hD_H5nioWD8KhtghObbPYO4A&s"
                            alt="bot"
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                border: "2px solid white"
                            }}
                        />
                    </>
                )}
            </div>

            {isOpen && (
                <div style={{
                    position: "fixed",
                    bottom: "80px",
                    right: "20px",
                    padding: "15px",
                    maxWidth: "350px",
                    width: "100%",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    backgroundColor: "#f9f9f9",
                    boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
                    marginBottom: "-70px"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px"
                    }}>
                        <h2 style={{ fontSize: "18px", margin: 0 }}>🔹 Chat Nhóm</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: "red",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "25px",
                                height: "25px",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontWeight: "bold"
                            }}
                        >
                            ✖
                        </button>
                    </div>

                    <div style={{
                        border: "1px solid gray",
                        padding: "10px",
                        height: "350px",
                        overflowY: "auto",
                        backgroundColor: "#fff",
                        borderRadius: "5px",
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                    }}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: msg.sender === user?.fullName ? "flex-end" : "flex-start",
                                    margin: "5px 0",
                                    cursor: "pointer",
                                    position: "relative"
                                }}
                                onClick={() => handleMessageClick(msg)}
                            >
                                <div style={{
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    color: msg.sender === user?.fullName ? "#007bff" : "#555",
                                    marginBottom: "3px"
                                }}>
                                    {msg.sender}
                                </div>
                                {renderMessage(msg)}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
                        <input
                            type="text"
                            placeholder="Nhập tin nhắn..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            style={{
                                flex: 1,
                                padding: "8px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                                fontSize: "14px"
                            }}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                padding: "8px 12px",
                                borderRadius: "5px",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "14px"
                            }}
                        >
                            <i className="bi bi-image"></i>
                        </button>
                        <button
                            onClick={sendMessage}
                            style={{
                                padding: "8px 12px",
                                borderRadius: "5px",
                                backgroundColor: "blue",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "14px"
                            }}
                        >
                            <i className="bi bi-send-arrow-up-fill"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default TestNotification;