"use client";
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io("http://localhost:8000");

export default function Home() {
  const [code, setCode] = useState("");

  useEffect(() => {
    socket.on('codeUpdate', (newCode) => {
      // console.log("Received code update from server:", newCode);
      setCode(newCode);  
    });

    return () => {
      socket.off('codeUpdate');
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = event.target.value;
    setCode(newCode);  
    socket.emit('codeChange', newCode);  
  };

  return (
    <div>
      <textarea
        name="code"
        id="code"
        value={code}
        onChange={handleChange}
        cols={30}
        rows={10}
        className="border-2 border-black"
        style={{ width: '100%', height: '90vh' }}
      />
    </div>
  );
}
