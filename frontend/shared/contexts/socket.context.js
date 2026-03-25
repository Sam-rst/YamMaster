// app/contexts/socket.context.js

import React from "react";
import io from "socket.io-client";
import { SERVER_URL } from '../services/config';

console.log('Connecting to server:', SERVER_URL);

export const socketEndpoint = SERVER_URL;

export const socket = io(socketEndpoint, {
  transports: ["websocket"],
});

export let hasConnection = false;

socket.on("connect", () => {
  console.log("connect:", socket.id);
  hasConnection = true;
});

socket.on("disconnect", () => {
  hasConnection = false;
  console.log("disconnected from server");
});

export const SocketContext = React.createContext();
