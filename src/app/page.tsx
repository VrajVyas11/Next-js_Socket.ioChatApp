"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';

let socket:any;

export default function Home() {
  const [roomName, setRoomName] = useState('');
  const [customRoomName, setCustomRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [existingRooms, setExistingRooms] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/rooms')
      .then((response) => response.json())
      .then((data) => setExistingRooms(data));

    socket = io({
      path: '/api/socket',
    });

    socket.on('updateRooms', (rooms:any) => {
      setExistingRooms(rooms);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCreateRoom = () => {
    if (customRoomName.trim().length < 5) {
      toast.error("Room name must be at least 5 characters long.");
      return;
    }

    if (customRoomName.trim().length > 24) {
      toast.error("Room name must not be more than 24 characters long.");
      return;
    }
    if (existingRooms.includes(customRoomName)) {
      toast.error("Room is already in use.");
      return;
    }

    if (customRoomName.trim()) {
      router.push(`/room?room=${customRoomName}&name=${userName}`);
    }
  };

  const handleJoinRoom = () => {
    if (roomName.trim().length < 5) {
      toast.error("Room name must be at least 5 characters long.");
      return;
    }

    if (!existingRooms.includes(roomName)) {
      toast.error("Room does not exist.");
      return;
    }

    if (roomName.trim()) {
      router.push(`/room?room=${roomName}&name=${userName}`);
    }
  };

  return (
    <div style={{ background: `url("/bg.svg")`, backgroundSize: "cover", backgroundPosition: "center" }} className="min-h-screen flex items-center justify-center">
      <Toaster />
      <div className="bg-white bg-opacity-30 backdrop-blur-sm p-8 rounded shadow-md w-full max-w-md">
        <h1 className="flex justify-center items-center text-2xl font-bold text-black mb-4">Welcome to Chat App</h1>

        <div className="mb-4">
          <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
            Your Name
          </label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md text-black"
          />
        </div>

        {userName.trim().length > 0 ? (
          <>
            <div className="flex justify-center items-center space-x-4">
              <div className="mb-4">
                <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">
                  Custom Room Name
                </label>
                <input
                  type="text"
                  id="roomName"
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                  className="mt-1 p-2 w-full border rounded-md text-black"
                />
              </div>

              <button
                onClick={handleCreateRoom}
                className={`bg-blue-500 text-white mt-2 px-4 py-2 rounded-md hover:bg-blue-600 ${(userName.trim().length <= 0 || customRoomName.trim().length <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={(userName.trim().length <= 0 || customRoomName.trim().length <= 0)}
              >
                Create Room
              </button>
            </div>
            <div className='flex justify-evenly items-center space-x-4'>
              <div className="mb-4">
                <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">
                  Room Name
                </label>
                <input
                  type="text"
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="mt-1 p-2 w-full border rounded-md text-black"
                />
              </div>
              <button
                disabled={(userName.trim().length <= 0 || roomName.trim().length <= 0)}
                onClick={handleJoinRoom}
                className={`bg-green-500 mt-2 text-white px-6 py-2 rounded-md hover:bg-green-600 ${(userName.trim().length <= 0 || roomName.trim().length <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Join Room
              </button>
            </div>
          </>
        ) : ""}
      </div>
    </div>
  );
}
