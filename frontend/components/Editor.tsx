'use client'

import { useEffect, useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { useSocket } from '@/lib/useSocket'
import { debounce } from 'lodash'
import { ChevronDown } from 'lucide-react'

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
]

export default function Room({roomId}:{roomId:string}) {
  const [code, setCode] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [language, setLanguage] = useState('javascript')
  const socket = useSocket()

  useEffect(() => {
    if (!socket || !roomId) return

    const handleConnect = () => {
      setIsConnected(true)
      console.log('Connected to server')
      socket.emit('joinRoom', roomId)
    }

    const handleDisconnect = () => {
      setIsConnected(false)
      console.log('Disconnected from server')
    }

    const handleCodeUpdate = (newCode: string) => {
      console.log('Code update received:', newCode)
      setCode(newCode)
    }

    const handleRoomJoined = (joinedRoomId: string) => {
      console.log('Joined room:', joinedRoomId)
    }

    const handleRoomError = (error: string) => {
      console.error('Room error:', error)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('codeUpdate', handleCodeUpdate)
    socket.on('roomJoined', handleRoomJoined)
    socket.on('roomError', handleRoomError)

    if (isConnected) {
      socket.emit('joinRoom', roomId)
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('codeUpdate', handleCodeUpdate)
      socket.off('roomJoined', handleRoomJoined)
      socket.off('roomError', handleRoomError)
    }
  }, [socket, roomId, isConnected])

  const handleChange = debounce((newValue: string | undefined) => {
    if (newValue === undefined) return
    setCode(newValue)
    socket.emit('codeChange', { roomId, newCode: newValue })
  }, 500)

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value
    setLanguage(newLanguage)
    // You might want to emit this change to other users
    // socket.emit('languageChange', { roomId, newLanguage })
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground py-4 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold">Room: {roomId}</h1>
          <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="appearance-none bg-secondary text-secondary-foreground px-3 py-1 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-secondary-foreground w-4 h-4" />
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(roomId)}
            className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-md flex items-center hover:bg-secondary/80 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
            Copy ID
          </button>
        </div>
      </header>
      <main className="flex-grow">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={handleChange}
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            lineNumbers: 'on',
            lineNumbersMinChars: 2,
            lineDecorationsWidth: 0,
          }}
        />
      </main>
    </div>
  )
}