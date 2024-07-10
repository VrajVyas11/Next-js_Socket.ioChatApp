"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const RoomComponent = () => {
    const searchParams = (0, navigation_1.useSearchParams)();
    const router = (0, navigation_1.useRouter)();
    const [message, setMessage] = (0, react_1.useState)("");
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [showToken, setShowToken] = (0, react_1.useState)(false);
    const [userName, setUserName] = (0, react_1.useState)("Guest");
    const [roomName, setRoomName] = (0, react_1.useState)("default-room");
    const [participants, setParticipants] = (0, react_1.useState)({});
    const socketRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (typeof window !== 'undefined') {
            const room = searchParams.get("room") || "default-room";
            const name = searchParams.get("name") || "Guest";
            setRoomName(room);
            setUserName(name);
            // Initialize socket connection
            socketRef.current = (0, socket_io_client_1.default)({
                path: "/api/socket",
            });
            socketRef.current.emit("joinRoom", { room, name });
            // Handle incoming messages
            socketRef.current.on("message", (msg) => {
                setMessages((prevMessages) => [...prevMessages, msg]);
            });
            socketRef.current.on("participants", (updatedRooms) => {
                // Initialize updatedParticipants as an empty object
                let updatedParticipants = {};
                updatedRooms.forEach((roomData) => {
                    updatedParticipants[roomData.room] = roomData.participants;
                });
                console.log("this is the updatedParticipants ", updatedParticipants);
                setParticipants(updatedParticipants);
            });
            // Handle room updates (including participants count)
            socketRef.current.on("updateRooms", (updatedRooms) => {
            });
            // Cleanup on unmount
            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }
    }, [searchParams]);
    const leaveRoom = () => {
        socketRef?.current?.emit("leaveRoom", { room: roomName, name: userName });
        router.push("/"); // Redirect to home or another page after leaving room
    };
    const sendMessage = () => {
        if (message.trim() && socketRef.current) {
            socketRef.current.emit("message", {
                room: roomName,
                message,
                name: userName,
            });
            setMessage("");
        }
    };
    return (react_1.default.createElement("div", { style: {
            background: `url("/bg.svg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
        }, className: "min-h-screen bg-gray-100 flex items-center justify-center" },
        react_1.default.createElement("div", { className: "bg-black bg-opacity-55  rounded-lg shadow-md w-full max-w-md" },
            react_1.default.createElement("h1", { className: "relative text-2xl p-2 flex justify-center flex-col items-start rounded-lg font-bold  shadow-md shadow-gray-800 z-10 bg-teal-500 bg-opacity-80" },
                react_1.default.createElement("div", { className: "flex justify-center items-center w-full" },
                    react_1.default.createElement("button", { onClick: leaveRoom, className: "bg-red-500 bg-opacity-75 text-sm py-2 text-white w-3/5 rounded-lg hover:bg-red-700" }, "Leave"),
                    react_1.default.createElement("span", { className: "text-lg font-serif tracking-wider text-end bg-opacity-40 py-2.5 w-full font-bold text-white rounded-l-lg" }, "Chat Room"),
                    react_1.default.createElement("div", { className: "w-full flex justify-end items-center" },
                        react_1.default.createElement("div", { className: "bg-white text-sm text-center bg-opacity-60 p-2.5 px-1 rounded-full w-fit drop-shadow-lg shadow-sm shadow-black" },
                            react_1.default.createElement("span", { className: "font-normal px-4 py-2 bg-opacity-90 bg-green-600 rounded-full text-sm" },
                                "Active : ",
                                react_1.default.createElement("span", { className: "font-bold" }, participants && participants[roomName] !== undefined ? participants[roomName] : 0)))))),
            react_1.default.createElement("div", { className: " w-full flex justify-center items-center" },
                react_1.default.createElement("div", { className: "absolute flex justify-center items-center z-0" },
                    react_1.default.createElement("button", { onClick: () => setShowToken((prev) => !prev), style: { width: "320px" }, className: `drop-shadow-lg sm:w-full shadow-sm transform translate-y-3 shadow-black bg-opacity-60 px-5 pt-2  font-bold text-black rounded-xl rounded-t-none transition-colors duration-300 ${showToken ? "text-[12px] pt-1 font-extrabold bg-lime-300" : "text-sm pt-1 bg-sky-500 hover:bg-sky-600"}` }, showToken ? roomName : "Room Code"))),
            react_1.default.createElement("div", { className: " mx-6 mt-10 mb-4  bg-gray-500 bg-opacity-25 rounded h-96 overflow-y-auto", style: {
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(0, 0, 0, 0.6) rgba(0, 0, 0, 0.1)",
                } }, messages.map((msg, index) => {
                if (userName === msg.name && roomName === msg.room) {
                    return (react_1.default.createElement("div", { key: index, className: "p-2  flex justify-end items-center w-full" },
                        react_1.default.createElement("div", { className: "bg-emerald-500 text-sm px-4 py-4 flex flex-col justify-center items-center rounded-xl rounded-br-none min-w-fit max-w-14" },
                            react_1.default.createElement("span", null, msg.message))));
                }
                else if (msg.name === "SystemJoin" && roomName === msg.room) {
                    return (react_1.default.createElement("div", { key: index, className: "p-2 my-2  flex justify-center items-center w-full" },
                        react_1.default.createElement("div", { className: "bg-emerald-500 p-2 text-xs flex flex-col justify-center items-center rounded-lg min-w-fit max-w-14" },
                            react_1.default.createElement("span", null, msg.message))));
                }
                else if (msg.name === "SystemLeft" && roomName === msg.room) {
                    return (react_1.default.createElement("div", { key: index, className: "p-2 my-2  flex justify-center items-center w-full" },
                        react_1.default.createElement("div", { className: "bg-red-500 p-2 text-xs flex flex-col justify-center items-center rounded-lg min-w-fit max-w-14" },
                            react_1.default.createElement("span", null, msg.message))));
                }
                else if (roomName === msg.room) {
                    return (react_1.default.createElement("div", { key: index, className: "p-2  flex justify-start items-center w-full" },
                        react_1.default.createElement("div", { className: "bg-gray-500 flex flex-col justify-start items-start rounded-xl rounded-tl-none min-w-fit max-w-14" },
                            react_1.default.createElement("span", { className: "w-full text-sm pl-6 p-2 rounded-xl bg-red-600 rounded-tl-none border-b-4 font-extrabold" }, msg.name.toUpperCase()),
                            react_1.default.createElement("span", { className: "p-1 text-sm px-11 m-2 mt-0 border-gray-500" }, msg.message))));
                }
            })),
            react_1.default.createElement("div", { className: "flex p-4 items-center" },
                react_1.default.createElement("input", { type: "text", value: message, onChange: (e) => setMessage(e.target.value), placeholder: "Type your message...", className: "bg-gray-200 text-black p-2 w-full rounded-md outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" }),
                react_1.default.createElement("button", { onClick: sendMessage, className: "ml-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md" }, "Send")))));
};
const RoomPage = () => {
    return (react_1.default.createElement(react_1.Suspense, { fallback: react_1.default.createElement("div", { style: {
                background: `url("/bg.svg")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }, className: "min-h-screen text-black text-2xl font-bold flex items-center justify-center" }, "Loading...") },
        react_1.default.createElement(RoomComponent, null)));
};
exports.default = RoomPage;
