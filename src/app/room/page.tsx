"use client"
import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import io, { Socket } from "socket.io-client";
import Image from "next/image";

const RoomComponent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<{ name: string; message: string; room: string }[]>([]);
    const [showToken, setShowToken] = useState(false);
    const [userName, setUserName] = useState<string>("Guest");
    const [roomName, setRoomName] = useState<string>("default-room");
    const [participants, setParticipants] = useState<Record<string, number>>({});
    const socketRef = useRef<Socket | null>(null);
    const [bg_color, setBg_color] = useState<String>("bg-red-500");
    const tailwindColors = [
        "bg-red-500",
        "bg-yellow-500",
        "bg-green-500",
        "bg-blue-500",
        "bg-indigo-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-teal-500",
        "bg-blue-300",
        "bg-green-300",
        "bg-yellow-300",
        "bg-red-300",
        "bg-purple-300",
    ];

    const getRandomTailwindColor = () => {
        const randomIndex = Math.floor(Math.random() * tailwindColors.length);
        return tailwindColors[randomIndex];
    };

    useEffect(() => {
        setBg_color(getRandomTailwindColor());
    }, [])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const room = searchParams.get("room") || "default-room";
            const name = searchParams.get("name") || "Guest";
            setRoomName(room);
            setUserName(name);

            // Initialize socket connection
            socketRef.current = io({
                path: "/api/socket",
            });

            socketRef.current.emit("joinRoom", { room, name });

            // Handle incoming messages
            socketRef.current.on(
                "message",
                (msg: { name: string; message: string; room: string }) => {
                    setMessages((prevMessages) => [...prevMessages, msg]);
                }
            );
            socketRef.current.on("participants", (updatedRooms: Record<string, number>[]) => {
                // Initialize updatedParticipants as an empty object
                let updatedParticipants: Record<string, number> = {};

                updatedRooms.forEach((roomData) => {
                    updatedParticipants[roomData.room] = roomData.participants;
                });
                console.log("this is the updatedParticipants ", updatedParticipants)
                setParticipants(updatedParticipants);
            });

            // Handle room updates (including participants count)
            socketRef.current.on("updateRooms", (updatedRooms: Record<string, number>) => {
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

    return (
        <div
            style={{
                background: `url("/bg.svg")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
            className="min-h-screen bg-gray-100 flex items-center justify-center"
        >
            <div className="bg-black bg-opacity-55  rounded-lg shadow-md w-full max-w-md">

                <h1 className="relative bg-opacity-70 p-4 py-0 flex gap-4 justify-around items-center rounded-lg rounded-br-none  border-2 border-x-4 border-b-0 border-white border-opacity-70 rounded-bl-none font-bold  bg-sky-400 text-white z-10">
                    <div className="flex justify-between gap-2 w-full items-center">
                        <button
                            onClick={leaveRoom}
                            className="bg-red-500 bg-opacity-95 text-sm mr-3 py-2 px-3 rounded-lg hover:bg-red-700 transition duration-300"
                        >
                            Leave
                        </button>
                        <div>
                            {/* <div className=" absolute flex flex-row bg-green-500 border-black border-x-2  rounded-full rounded-tr-none rounded-bl-none px-4   py-2 items-center">
                                <div className="w-12 h-12 p-1 bg-slate-300 shadow-sm shadow-black rounded-full overflow-hidden mr-2">
                                    <Image src="/group.svg" alt="User" width={40} height={40} className="w-full h-full" />
                                </div>
                                <span className="text-lg text-black font-bold font-serif tracking-wide">Chat Room</span>
                            </div> */}

                            <div className="flex flex-row bg-white bg-opacity-65 border-gray-300 border-2 border-y-0   rounded-full rounded-br-none rounded-tl-none px-6 py-2 items-center">

                                <div className="w-12 h-12 p-1 bg-slate-300 shadow-sm shadow-black rounded-full overflow-hidden mr-2">
                                    <Image src="/group.svg" alt="User" width={40} height={40} className="w-full h-full" />
                                </div>
                                <span className="text-lg text-black font-bold font-serif tracking-wide">Chat Room</span>
                            </div>
                        </div>
                        <details className="bg-transparent text-black hover:bg-opacity-80 p-2 rounded-full">
                            <summary className="flex items-center cursor-pointer">
                                <button
                                    onClick={() => setShowToken(prev => !prev)}
                                    className="bg-green-400  transition-transform transform hover:scale-105 flex justify-center items-center rounded-lg px-5 py-1.5"
                                >
                                    <Image src="/code.svg" height={25} width={25} alt="eye" />
                                </button>
                            </summary>
                        </details>

                        {showToken && (
                            <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
                                <div className="bg-green-500 rounded-xl p-1 flex flex-col shadow-xl w-full max-w-md  relative">
                                    <div className=" bg-zinc-200 bg-opacity-65 rounded-lg pb-2">
                                        <div className="flex flex-row w-full justify-between items-center mb-1">
                                            <div className="w-full flex justify-center">
                                                <h2 className="text-xl flex w-fit bg-white bg-opacity-70 font-serif  justify-between items-center  rounded-full text-center font-bold text-gray-800 mb-2">
                                                    <div
                                                        className="bg-black bg-opacity-75 border-4 border-white border-opacity-100  flex justify-center items-center rounded-full p-1"
                                                    >
                                                        <Image src="/code1.svg" height={40} width={40} alt="eye" className="" />
                                                    </div>
                                                    <span className="px-2 mx-10">
                                                        Room Code
                                                    </span>
                                                    <button
                                                        onClick={() => setShowToken(prev => !prev)}
className="bg-red-500 border-4 border-white border-opacity-100 hover:transition-all text-black hover:scale-105 hover:ease-out flex justify-center items-center rounded-full p-2 px-4"
                                                    >
                                                        x
                                                    </button>
                                                </h2>
                                            </div>
                                        </div>


                                        <div className=" flex mx-4 flex-row">
                                            <p className="text-2xl flex  items-center justify-center border-blue-600 border-2 border-r-0 bg-white rounded-lg rounded-r-none p-4 py-2  font-semibold text-black flex-1 text-center">
                                                {roomName}</p>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(roomName);
                                                    alert("Room code copied to clipboard!");
                                                }}
                                                className=" transition-all bg-opacity-70 transform scale-100 hover:scale-105 rounded-r-lg p-4 border-blue-600 border-2 bg-black duration-200 text-white"
                                                aria-label="Copy room code"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M16 6h2a2 2 0 012 2v10a2 2 0 01-2 2h-2m-4 0H8a2 2 0 01-2-2V8a2 2 0 012-2h2m4 0V4a2 2 0 00-2-2H8a2 2 0 00-2 2v2"
                                                    />
                                                </svg>
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </h1>


                <div className="w-full flex justify-center items-center">
                    <div className="relative flex justify-center w-full items-center z-0">
                        <div className="w-full flex justify-end items-center">
                            <div className="bg-white bg-opacity-70 text-sm text-center p-0.5 pt-0 px-1 rounded-full rounded-t-none w-full drop-shadow-lg shadow-sm shadow-black">
                                <div className=" px-2  w-full bg-green-500 bg-opacity-70 rounded-full rounded-t-none font-bold text-black text-sm">
                                    Active : <span className="font-extrabold">{participants && participants[roomName] !== undefined ? participants[roomName] : 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className=" mx-6 mt-5 mb-2  bg-gray-500 bg-opacity-25 rounded h-96 overflow-y-auto"
                    style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(0, 0, 0, 0.6) rgba(0, 0, 0, 0.1)",
                    }}
                >
                    {/* <style jsx>{`
            div::-webkit-scrollbar {
              width: 12px;
            }
            div::-webkit-scrollbar-thumb {
              background-color: rgba(0, 0, 0, 0.6); 
              border-radius: 10px;
            }
            div::-webkit-scrollbar-track {
              background-color: rgba(0, 0, 0, 0.1);
              border-radius: 10px;
            }
          `}</style> */}
                {messages.map((msg, index) => {
    if (userName === msg.name && roomName === msg.room) {
        return (
            <div key={index} className="p-2 flex justify-end gap-2 items-center h-fit w-full">
                <div className="bg-green-500 text-sm min-w-20 p-4 flex flex-col justify-center items-center rounded-xl rounded-tr-none break-words max-w-64">
                    <span className="break-words overflow-wrap break-word word-break break-all">{msg.message}</span>
                </div>
            </div>
        );
    } else if (msg.name === "SystemJoin" && roomName === msg.room) {
        return (
            <div key={index} className="p-2 my-2 flex justify-center items-center w-full">
                <div className="bg-green-500 p-2 text-xs flex flex-col justify-center items-center rounded-lg min-w-fit max-w-14">
                    <span className="break-words overflow-wrap break-word word-break break-all">{msg.message}</span>
                </div>
            </div>
        );
    } else if (msg.name === "SystemLeft" && roomName === msg.room) {
        return (
            <div key={index} className="p-2 my-2 flex justify-center items-center w-full">
                <div className="bg-red-500 p-2 text-xs flex flex-col justify-center items-center rounded-lg min-w-fit max-w-14">
                    <span className="break-words overflow-wrap break-word word-break break-all">{msg.message}</span>
                </div>
            </div>
        );
    } else if (roomName === msg.room) {
        return (
            <div
                key={index}
                className="p-2 gap-2 flex flex-row justify-start min-w-[60px] max-w-[85%] items-start"
            >
                <div className={`w-8 h-8 rounded-full ${bg_color} flex items-center justify-center text-white font-bold`}>
                    {msg.name.charAt(0)}
                </div>
                <div className="bg-gray-500 h-fit flex flex-col justify-start items-start rounded-xl rounded-tl-none min-w-[130px] max-w-full sm:max-w-[85%]">
                    <span
                        className={`w-full text-sm px-4 p-2 rounded-xl ${bg_color} rounded-tl-none border-b-4 font-extrabold break-words overflow-wrap break-word word-break break-all`}
                    >
                        {msg.name.toUpperCase()}
                    </span>
                    <span className="p-1 text-sm px-3 md:px-4 lg:px-5 my-2 mt-0 text-gray-100 break-words overflow-wrap break-word word-break break-all">
                        {msg.message}
                    </span>
                </div>
            </div>
        );
    }
})}

                </div>
                <div className="flex p-4 items-center">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="bg-gray-200 text-black p-2 w-full rounded-md outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                    />
                    <button
                        onClick={sendMessage}
                        className="ml-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                    >
                        Send
                    </button>
                </div>

            </div>
        </div>);
}

const RoomPage = () => {
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        background: `url("/bg.svg")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                    className="min-h-screen text-black text-2xl font-bold flex items-center justify-center"
                >
                    Loading...
                </div>
            }
        >
            <RoomComponent />
        </Suspense>
    )
};

export default RoomPage;
