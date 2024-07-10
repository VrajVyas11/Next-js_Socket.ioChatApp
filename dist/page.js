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
exports.default = Home;
const react_1 = __importDefault(require("react"));
const react_2 = require("react");
const navigation_1 = require("next/navigation");
const react_hot_toast_1 = __importStar(require("react-hot-toast"));
const socket_io_client_1 = __importDefault(require("socket.io-client"));
let socket;
function Home() {
    const [roomName, setRoomName] = (0, react_2.useState)('');
    const [customRoomName, setCustomRoomName] = (0, react_2.useState)('');
    const [userName, setUserName] = (0, react_2.useState)('');
    const [existingRooms, setExistingRooms] = (0, react_2.useState)([]);
    const router = (0, navigation_1.useRouter)();
    (0, react_2.useEffect)(() => {
        fetch('/api/rooms')
            .then((response) => response.json())
            .then((data) => setExistingRooms(data));
        socket = (0, socket_io_client_1.default)({
            path: '/api/socket',
        });
        socket.on('updateRooms', (rooms) => {
            setExistingRooms(rooms);
        });
        return () => {
            socket.disconnect();
        };
    }, []);
    const handleCreateRoom = () => {
        if (customRoomName.trim().length < 5) {
            react_hot_toast_1.default.error("Room name must be at least 5 characters long.");
            return;
        }
        if (customRoomName.trim().length > 24) {
            react_hot_toast_1.default.error("Room name must not be more than 24 characters long.");
            return;
        }
        if (existingRooms.includes(customRoomName)) {
            react_hot_toast_1.default.error("Room is already in use.");
            return;
        }
        if (customRoomName.trim()) {
            router.push(`/room?room=${customRoomName}&name=${userName}`);
        }
    };
    const handleJoinRoom = () => {
        if (roomName.trim().length < 5) {
            react_hot_toast_1.default.error("Room name must be at least 5 characters long.");
            return;
        }
        if (!existingRooms.includes(roomName)) {
            react_hot_toast_1.default.error("Room does not exist.");
            return;
        }
        if (roomName.trim()) {
            router.push(`/room?room=${roomName}&name=${userName}`);
        }
    };
    return (react_1.default.createElement("div", { style: { background: `url("/bg.svg")`, backgroundSize: "cover", backgroundPosition: "center" }, className: "min-h-screen flex items-center justify-center" },
        react_1.default.createElement(react_hot_toast_1.Toaster, null),
        react_1.default.createElement("div", { className: "bg-white bg-opacity-30 backdrop-blur-sm p-8 rounded shadow-md w-full max-w-md" },
            react_1.default.createElement("h1", { className: "flex justify-center items-center text-2xl font-bold text-black mb-4" }, "Welcome to Chat App"),
            react_1.default.createElement("div", { className: "mb-4" },
                react_1.default.createElement("label", { htmlFor: "userName", className: "block text-sm font-medium text-gray-700" }, "Your Name"),
                react_1.default.createElement("input", { type: "text", id: "userName", value: userName, onChange: (e) => setUserName(e.target.value), className: "mt-1 p-2 w-full border rounded-md text-black" })),
            userName.trim().length > 0 ? (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("div", { className: "flex justify-center items-center space-x-4" },
                    react_1.default.createElement("div", { className: "mb-4" },
                        react_1.default.createElement("label", { htmlFor: "roomName", className: "block text-sm font-medium text-gray-700" }, "Custom Room Name"),
                        react_1.default.createElement("input", { type: "text", id: "roomName", value: customRoomName, onChange: (e) => setCustomRoomName(e.target.value), className: "mt-1 p-2 w-full border rounded-md text-black" })),
                    react_1.default.createElement("button", { onClick: handleCreateRoom, className: `bg-blue-500 text-white mt-2 px-4 py-2 rounded-md hover:bg-blue-600 ${(userName.trim().length <= 0 || customRoomName.trim().length <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`, disabled: (userName.trim().length <= 0 || customRoomName.trim().length <= 0) }, "Create Room")),
                react_1.default.createElement("div", { className: 'flex justify-evenly items-center space-x-4' },
                    react_1.default.createElement("div", { className: "mb-4" },
                        react_1.default.createElement("label", { htmlFor: "roomName", className: "block text-sm font-medium text-gray-700" }, "Room Name"),
                        react_1.default.createElement("input", { type: "text", id: "roomName", value: roomName, onChange: (e) => setRoomName(e.target.value), className: "mt-1 p-2 w-full border rounded-md text-black" })),
                    react_1.default.createElement("button", { disabled: (userName.trim().length <= 0 || roomName.trim().length <= 0), onClick: handleJoinRoom, className: `bg-green-500 mt-2 text-white px-6 py-2 rounded-md hover:bg-green-600 ${(userName.trim().length <= 0 || roomName.trim().length <= 0) ? 'opacity-50 cursor-not-allowed' : ''}` }, "Join Room")))) : "")));
}
