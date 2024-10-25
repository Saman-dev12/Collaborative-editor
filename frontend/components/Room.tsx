'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSocket } from '@/lib/useSocket'
import { toast } from 'sonner'

export default function Home() {
  const [roomId, setRoomId] = useState('')
  const socket = useSocket()
  const router = useRouter()

  const handleCreateRoom = () => {
    socket.emit('createRoom')
  }

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      socket.emit('joinRoom', roomId)
    } else {
      alert('Please enter a valid room ID')
    }
  }

  useEffect(() => {
    if (!socket) return

    const handleRoomCreated = (newRoomId: string) => {
      console.log('Room created:', newRoomId)
      toast.success('Room created successfully')
      router.push(`/room/${newRoomId}`)
    }

    const handleRoomJoined = (joinedRoomId: string) => {
      console.log('Room joined:', joinedRoomId)
      toast.success('Room joined successfully')
      router.push(`/room/${joinedRoomId}`)
    }

    const handleRoomError = (error: string) => {
      toast.error(error)
    }

    socket.on('roomCreated', handleRoomCreated)
    socket.on('roomJoined', handleRoomJoined)
    socket.on('roomError', handleRoomError)

    return () => {
      socket.off('roomCreated', handleRoomCreated)
      socket.off('roomJoined', handleRoomJoined)
      socket.off('roomError', handleRoomError)
    }
  }, [socket, router])

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Collaborative Code Editor</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Room</CardTitle>
            <CardDescription>Start a new collaborative coding session</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateRoom} className="w-full">Create Room</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Join Existing Room</CardTitle>
            <CardDescription>Enter a room ID to join an existing session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <Button onClick={handleJoinRoom} className="w-full">Join Room</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}