'use client'

import { useEffect, useState, useRef } from 'react'
import { Editor } from '@monaco-editor/react'
import { useSocket } from '@/lib/useSocket'
import { debounce } from 'lodash'
import { ChevronDown, Copy, LogOut, MoreVertical, Save, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { languages } from '@/lib/languages'
import { handleSaveFile } from '@/lib/utils'
import Terminal from '@/components/Terminal'

interface RoomProps {
  roomId: string
}

export default function Room({ roomId }: RoomProps) {
  const [code, setCode] = useState<string>('')
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [language, setLanguage] = useState<string>('javascript')
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false)
  const [filename, setFilename] = useState<string>('')
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const [output, setOutput] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const socket = useSocket()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

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

    const handleLanguageUpdate = (newLanguage: string) => {
      console.log('Language update received', newLanguage)
      setLanguage(newLanguage)
    }

    const handleRoomJoined = (joinedRoomId: string) => {
      console.log('Joined room:', joinedRoomId)
    }

    const handleRoomError = (error: string) => {
      console.error('Room error:', error)
      toast.error("Room is not available.")
      router.push('/room')
    }


    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('codeUpdate', handleCodeUpdate)
    socket.on('languageUpdate', handleLanguageUpdate)
    socket.on('roomJoined', handleRoomJoined)
    socket.on('roomError', handleRoomError)


    const handleReconnect = () => {
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
  }, [socket, roomId, router])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleChange = debounce((newValue: string | undefined) => {
    if (newValue === undefined) return
    setCode(newValue)
    socket?.emit('codeChange', { roomId, newCode: newValue })
  }, 500)

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value
    setLanguage(newLanguage)
    socket?.emit('languageChange', { roomId, newLanguage })
  }

  const handleCopyRoomId = () => {
    toast.success("Copied to clipboard")
    navigator.clipboard.writeText(roomId)
  }

  const handleLeaveRoom = () => {
    socket?.emit('leaveRoom', { roomId })
    router.push('/room')
  }

  const handleSave = () => {
    setIsSaveModalOpen(true)
    setIsDropdownOpen(false)
  }

  const handleSaveFileToDevice = async () => {
    if (!filename) {
      toast.error("Please enter a filename.")
      return
    }
    try {
      await handleSaveFile(filename, code, language)
      setFilename('')
      setIsSaveModalOpen(false)
    } catch (error) {
      console.error("Failed to save file:", error)
      toast.error("Failed to save file.")
    }
  }

  const handleRunCode = async () => {
    setIsLoading(true)
    setOutput('')
    try {
      console.log({ language, code,})
      const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ language, code})
      })
      const data = await res.json()
      console.log(data)
      if (data.run) {
        setOutput(data.run.output)
      } else {
        setOutput(data.output.stderr || "No output received.")
      }
    } catch (error) {
      console.error("Failed to run code:", error)
      setOutput("An error occurred while running the code.")
    }finally{
      setIsLoading(false)
    }
    
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gradient-to-b from-[#2f2f2e] to-[#1f1f1f] text-white py-3 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <h1 className="text-lg font-semibold truncate">Room: {roomId}</h1>
            <span className={`text-xs px-2 py-1 rounded-full md:w-auto text-center ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex flex-wrap items-center space-x-2 md:space-x-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0 min-w-[120px] w-full md:w-auto mb-2 md:mb-0">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="w-full appearance-none bg-white text-gray-700 px-3 py-2 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 w-4 h-4" />
            </div>
            <div className="flex space-x-2 w-full md:w-auto">
              <button
                onClick={handleCopyRoomId}
                className="flex-grow md:flex-grow-0 text-sm bg-white text-gray-700 px-3 py-2 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label="Copy Room ID"
              >
                <Copy className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Copy ID</span>
              </button>
              <button 
                onClick={handleLeaveRoom}
                className="flex-grow md:flex-grow-0 text-sm bg-red-500 text-white px-3 py-2 rounded-md flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label="Leave Room"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Leave</span>
              </button>
              <button
                onClick={handleRunCode}
                className="flex-grow md:flex-grow-0 text-sm bg-green-500 text-white px-3 py-2 rounded-md flex items-center justify-center hover:bg-green-600 transition-colors"
                aria-label="Run Code"
              >
                <Play className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Run</span>
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="p-2 rounded-md hover:bg-blue-700 transition-colors"
                  aria-label="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <button
                        onClick={handleSave}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                        role="menuitem"
                      >
                        <Save className="inline-block mr-2 h-4 w-4" />
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow relative flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 h-1/2 md:h-full">
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
        </div>
        <div className="w-full md:w-1/2 h-1/2 md:h-full p-4">
          <Terminal output={output} isLoading={isLoading} />
        </div>
      </main>
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Save File</h3>
              <p className="text-sm text-gray-500 mb-4">
                Enter a filename to save your code. The appropriate file extension will be added automatically.
              </p>
              <div className="mb-4">
                <label htmlFor="filename" className="block text-sm font-medium text-gray-700 mb-1">
                  Filename
                </label>
                <input
                  type="text"
                  id="filename"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsSaveModalOpen(false)}
                  className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFileToDevice}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}