// app/contexts/socket.context.tsx

import React from "react";
import io, { Socket } from "socket.io-client";
import { SERVER_URL } from '../services/config';

console.log('Connecting to server:', SERVER_URL);

export const socketEndpoint: string = SERVER_URL;

export const socket: Socket = io(socketEndpoint, {
  transports: ["websocket"],
});

export let hasConnection: boolean = false;

socket.on("connect", () => {
  console.log("connect:", socket.id);
  hasConnection = true;
});

socket.on("disconnect", () => {
  hasConnection = false;
  console.log("disconnected from server");
});

export const SocketContext = React.createContext<Socket | null>(null);
