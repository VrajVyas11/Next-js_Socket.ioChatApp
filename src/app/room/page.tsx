"use client"
import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import io, { Socket } from "socket.io-client";
import Link from "next/link";

const RoomPage = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<
        { name: string; message: string; room: string }[]
    >([]);
    const [showToken, setShowToken] = useState(false);
    const [userName, setUserName] = useState<string>("Guest");
    const [roomName, setRoomName] = useState<string>("default-room");
    const [participants, setParticipants] = useState<Record<string, number>>({});
    const socketRef = useRef<Socket | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const room = searchParams.get("room") || "default-room";
        const name = searchParams.get("name") || "Guest";
        setRoomName(room);
        setUserName(name);

        // Initialize socket connection
        socketRef.current = io(process.env.DOMAIN!, {
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

                <h1 className="relative text-2xl p-2 flex justify-center flex-col items-start rounded-lg font-bold  shadow-md shadow-gray-800 z-10 bg-teal-500 bg-opacity-80">
                    <div className="flex justify-center items-center w-full">
                        <button
                            onClick={leaveRoom}
                            className="bg-red-500 bg-opacity-75 text-sm py-2 text-white w-3/5 rounded-lg hover:bg-red-700"
                        >
                            Leave
                        </button>
                        <span
                            className="text-lg font-serif tracking-wider text-end bg-opacity-40 py-2.5 w-full font-bold text-white rounded-l-lg"
                        >
                            Chat Room
                        </span>
                        <div className="w-full flex justify-end items-center">
                            <div className="bg-white text-sm text-center bg-opacity-60 p-2 px-1 rounded-full w-fit drop-shadow-lg shadow-sm shadow-black">
                                <span className="font-normal px-4 py-2 bg-opacity-90 bg-green-600 rounded-full text-sm">
                                   Avtive : <span className="font-bold">{participants && participants[roomName] !== undefined ? participants[roomName] : 0}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </h1>
                <div className=" w-full flex justify-center items-center">
                    <div className="absolute flex justify-center items-center z-0">
                        <button
                            onClick={() => setShowToken((prev) => !prev)}
                            style={{width:"320px"}}
                            className={`drop-shadow-lg sm:w-full shadow-sm transform translate-y-3 shadow-black bg-opacity-60 px-5 pt-2  font-bold text-black rounded-xl rounded-t-none transition-colors duration-300 ${showToken ? "text-[12px] pt-1 font-extrabold bg-lime-300" : "text-sm pt-1 bg-sky-500 hover:bg-sky-600"
                                }`}
                        >
                            {showToken ? roomName : "Room Code"}
                        </button>
                    </div>
                </div>




                <div
                    className=" mx-6 mt-10 mb-4  bg-gray-500 bg-opacity-25 rounded h-96 overflow-y-auto"
                    style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(0, 0, 0, 0.6) rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <style jsx>{`
            div::-webkit-scrollbar {
              width: 12px;
            }
            div::-webkit-scrollbar-thumb {
              background-color: rgba(0, 0, 0, 0.6); /* 60% opacity */
              border-radius: 10px;
            }
            div::-webkit-scrollbar-track {
              background-color: rgba(0, 0, 0, 0.1);
              border-radius: 10px;
            }
          `}</style>
                    {messages.map((msg, index) => {
                        if (userName === msg.name && roomName === msg.room) {
                            return (
                                <div key={index} className="p-2  flex justify-end items-center w-full">
                                    <div className="bg-emerald-500 px-4 py-4 flex flex-col justify-center items-center rounded-xl rounded-br-none min-w-fit max-w-14">
                                        <span>{msg.message}</span>
                                    </div>
                                </div>
                            );
                        } else if (msg.name === "SystemJoin" && roomName === msg.room) {
                            return (
                                <div
                                    key={index}
                                    className="p-2 my-2  flex justify-center items-center w-full"
                                >
                                    <div className="bg-emerald-500 p-2 text-xs flex flex-col justify-center items-center rounded-lg min-w-fit max-w-14">
                                        <span>{msg.message}</span>
                                    </div>
                                </div>
                            );
                        } else if (msg.name === "SystemLeft" && roomName === msg.room) {
                            return (
                                <div
                                    key={index}
                                    className="p-2 my-2  flex justify-center items-center w-full"
                                >
                                    <div className="bg-red-500 p-2 text-xs flex flex-col justify-center items-center rounded-lg min-w-fit max-w-14">
                                        <span>{msg.message}</span>
                                    </div>
                                </div>
                            );
                        } else if (roomName === msg.room) {
                            return (
                                <div key={index} className="p-2  flex justify-start items-center w-full">
                                    <div className="bg-gray-500 flex flex-col justify-start items-start rounded-xl rounded-tl-none min-w-fit max-w-14">
                                        <span className="w-full pl-6 p-2 rounded-xl bg-red-600 rounded-tl-none border-b-4 font-extrabold">
                                            {msg.name.toUpperCase()}
                                        </span>
                                        <span className="p-2 px-11 m-2 mt-0 border-gray-500">{msg.message}</span>
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
                        className="bg-gray-200 text-black p-2 w-full rounded-md outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                    <button
                        onClick={sendMessage}
                        className="ml-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                    >
                        Send
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RoomPage;
