'use client'

import { useEffect, useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { useSocket } from '@/lib/useSocket'
import { debounce } from 'lodash'
import { ChevronDown, Copy, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

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

    const handleLanguageUpdate = (language:string) => {
      console.log('Language update received', language)
      setLanguage(language)
    }

    const handleRoomJoined = (joinedRoomId: string) => {
      console.log('Joined room:', joinedRoomId)
      // Optionally, I can perform additional actions when the room is joined
      // For example, I might want to fetch the initial code or language settings
      // or notify the user that the room has been joined
      // socket.emit('joinRoom', roomId) // Rejoin the room if needed
    }

    const handleRoomError = (error: string) => {
      console.error('Room error:', error)
      router.push('/room')
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('codeUpdate', handleCodeUpdate)
    socket.on('languageUpdate', handleLanguageUpdate)
    socket.on('roomJoined', handleRoomJoined)
    socket.on('roomError', handleRoomError)

    const handleReconnect = () => {
      console.log('Attempting to reconnect...')
      socket.emit('joinRoom', roomId)
    }

    socket.io.on('reconnect', handleReconnect)

    if (socket.connected) {
      handleConnect()
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('codeUpdate', handleCodeUpdate)
      socket.off('languageUpdate', handleLanguageUpdate)
      socket.off('roomJoined', handleRoomJoined)
      socket.off('roomError', handleRoomError)
      socket.io.off('reconnect', handleReconnect)
    }
  }, [socket, roomId])

  const handleChange = debounce((newValue: string | undefined) => {
    if (newValue === undefined) return
    setCode(newValue)
    socket.emit('codeChange', { roomId, newCode: newValue })
  }, 500)

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value
    setLanguage(newLanguage)
    socket.emit('languageChange', { roomId, newLanguage })
  }

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId)
  }

  const handleLeaveRoom = () => {
    // Implement room leaving logic here
    console.log('Leaving room')
    // You might want to emit a 'leaveRoom' event to the server
    // socket.emit('leaveRoom', roomId)
    // Then redirect the user to the home page or room selection page
    // window.location.href = '/'
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground py-2 px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <h1 className="text-lg font-semibold">Room: {roomId}</h1>
          <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="flex flex-wrap items-center space-x-2 sm:space-x-4">
          <div className="relative">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="appearance-none bg-secondary text-secondary-foreground px-2 py-1 pr-6 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none text-secondary-foreground w-4 h-4" />
          </div>
          <button
            onClick={handleCopyRoomId}
            className="text-sm bg-secondary text-secondary-foreground p-1 rounded-md flex items-center hover:bg-secondary/80 transition-colors"
            aria-label="Copy Room ID"
          >
            <Copy className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Copy ID</span>
          </button>
          <button 
            onClick={handleLeaveRoom}
            className="text-sm bg-red-500 text-white p-1 rounded-md flex items-center hover:bg-red-600 transition-colors"
            aria-label="Leave Room"
          >
            <LogOut className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Leave</span>
          </button>
        </div>
      </header>
      <main className="flex-grow relative">
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
          className="w-full h-full"
        />
      </main>
    </div>
  )
}