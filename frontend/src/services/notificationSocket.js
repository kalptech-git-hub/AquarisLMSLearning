// import { io } from "socket.io-client";

// const SOCKET_URL = import.meta.env.VITE_API_URL;

// export const socket = io(SOCKET_URL, {
//     withCredentials: true,
//     autoConnect: true
// });


import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

const token = sessionStorage.getItem("token");

export const socket = io(SOCKET_URL, {
    auth: {
        token
    },
    withCredentials: true,
    autoConnect: true
});

socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
    console.error("🔴 Socket connection error:", error.message);
});

socket.on("disconnect", (reason) => {
    console.log("🟡 Socket disconnected:", reason);
});