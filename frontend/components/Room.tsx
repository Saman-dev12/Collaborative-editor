"use client";
import { useSocket } from "@/lib/useSocket"; // Assuming you have a useSocket hook to initialize socket.io client
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function Room() {
  const [roomId, setRoomId] = useState(""); 
  const socket = useSocket(); 
  const router = useRouter();


  const handleCreateRoom = () => {
    socket.emit("createRoom");
    console.log("Creating room...");
  };


  useEffect(() => {
    if (socket) {
      socket.on("roomCreated", (newRoomId: string) => {
        console.log("Room created:", newRoomId);
        setRoomId(newRoomId); 
        router.push(`/room/${newRoomId}`);
      });

      
      socket.on("roomJoined", (joinedRoomId: string) => {
        console.log("Room joined:", joinedRoomId);
        setRoomId(joinedRoomId);
        router.push(`/room/${joinedRoomId}`); 
      });
    }

    return () => {
      if (socket) {
        socket.off("roomCreated");
        socket.off("roomJoined");
      }
    };
  }, [socket, router]);

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      socket.emit("joinRoom", roomId); // Send the roomId to join
      console.log("Joining room:", roomId);
    } else {
      alert("Please enter a valid room ID");
    }
  };

  return (
    <div>
      {/* Rooms Section */}
      <section id="rooms" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            Create or Join a Room
          </h2>
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:flex-1 p-8 border-r border-gray-200">
                <h3 className="text-2xl font-semibold mb-4">Create a New Room</h3>
                <p className="text-gray-600 mb-6">
                  Start a new collaborative session and invite your team members.
                </p>
                <button
                  onClick={handleCreateRoom}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700 transition duration-300 shadow-md"
                >
                  Create Room
                </button>
              </div>
              <div className="md:flex-1 p-8">
                <h3 className="text-2xl font-semibold mb-4">Join Existing Room</h3>
                <input
                  type="text"
                  placeholder="Enter Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleJoinRoom}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-full text-lg hover:bg-green-700 transition duration-300 shadow-md"
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Room;
