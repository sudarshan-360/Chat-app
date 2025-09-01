// server/lib/socket.js
let io;
let onlineMap;

export const initSocket = (socketInstance, userSocketMap) => {
  io = socketInstance;
  onlineMap = userSocketMap;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const emitToUser = (userId, event, data) => {
  if (!io || !onlineMap) {
    throw new Error('Socket.io not initialized!');
  }
  
  const userSockets = onlineMap.get(userId);
  if (userSockets) {
    userSockets.forEach(socketId => {
      io.to(socketId).emit(event, data);
    });
  }
};

export const emitToUsers = (userIds, event, data) => {
  userIds.forEach(userId => {
    try {
      emitToUser(userId, event, data);
    } catch (error) {
      console.log(`Failed to emit to user ${userId}:`, error.message);
    }
  });
};