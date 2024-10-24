"use client";
import { useEffect, useMemo } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (): Socket => {

 const socket = useMemo(() => io(process.env.NEXT_PUBLIC_SOCKET_URL), []);

  return socket;
};
