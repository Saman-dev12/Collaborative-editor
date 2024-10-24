"use client";
import { useSocket } from '@/lib/useSocket';
import { Editor } from '@monaco-editor/react';
import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash'; 

interface EditorProps {
  roomId: string;
}

export default function Editorr({ roomId }: EditorProps) {
  const [code, setCode] = useState<string>(""); 
  const socket = useSocket();
  const room = roomId;

  useEffect(() => {
    if (!socket || !room) return;

    socket.on('codeUpdate', (newCode: string) => {
      console.log("Code update received from room:", room, "code:", newCode);

      if (newCode !== code) {
        setCode(newCode);
      }
    });

    return () => {
      socket.off('codeUpdate');
    };
  }, [socket, room]);

  
  const handleChange = (newValue: string | undefined) => {
    if (newValue === undefined) return;

    setCode(newValue); 

    
    debounce(() => {
      socket.emit('codeChange', { room, newValue });
    }, 500)(); 
  };

  return (
    <div style={{ height: "90vh" }}>
      <Editor
        height="100vh"
        value={code}
        onChange={handleChange} 
        theme="vs-dark" 
        language="javascript" 
        options={{
          selectOnLineNumbers: true,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
