import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server: Server;

  private connectedUsers: { [userName: string]: string } = {};
  private chatRooms: { [chatId: string]: Set<string> } = {};

  afterInit(server: Server): void {
    console.log('Socket server initialized');
  }

  public handleConnection(client: Socket): void {
    const userName = client.handshake.query.userName as string;

    if (userName) {
      this.connectedUsers[userName] = client.id;
      console.log(`User ${userName} connected with socket ${client.id}`);

      this.server.emit('update_active_users', Object.keys(this.connectedUsers));
    } else {
      console.log(`Client connected without userName: ${client.id}`);
    }

    client.on('join_chat', (chatId) => {
      client.join(chatId);
      console.log(`Client ${client.id} joined chat ${chatId}`);

      const userName = Object.keys(this.connectedUsers).find(
        (key) => this.connectedUsers[key] === client.id,
      );

      if (!this.chatRooms[chatId]) {
        this.chatRooms[chatId] = new Set();
      }
      if (userName) {
        for (const roomId in this.chatRooms) {
          if (this.chatRooms[roomId].has(userName)) {
            this.chatRooms[roomId].delete(userName);
            const activeUsersInOldChat = Array.from(this.chatRooms[roomId]);
            this.server
              .to(roomId)
              .emit('update_active_users', activeUsersInOldChat);
          }
        }

        this.chatRooms[chatId].add(userName);
        console.log(this.chatRooms);

        const activeUsersInChat = Array.from(this.chatRooms[chatId]);
        this.server.to(chatId).emit('update_active_users', activeUsersInChat);
      }
    });

    client.on('leave_chat', (chatId) => {
      const userName = Object.keys(this.connectedUsers).find(
        (key) => this.connectedUsers[key] === client.id,
      );

      if (userName && this.chatRooms[chatId]) {
        this.chatRooms[chatId].delete(userName);
        console.log(`User ${userName} left chat ${chatId}`);

        const activeUsersInChat = Array.from(this.chatRooms[chatId]);
        this.server.to(chatId).emit('update_active_users', activeUsersInChat);
      }
    });

    client.on('leave_chat_user', ({ chatId, userName }) => {
  if (this.chatRooms[chatId]) {
    this.chatRooms[chatId].delete(userName);
    console.log(`User ${userName} removed from chat ${chatId} via socket`);

    const socketId = this.connectedUsers[userName];
    if (socketId) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(chatId);  
        console.log(`Socket ${socketId} left room ${chatId}`);
      }
    }

    const activeUsersInChat = Array.from(this.chatRooms[chatId]);
    this.server.to(chatId).emit('update_active_users', activeUsersInChat);
  }
});

  }

  public handleDisconnect(client: Socket): void {
    const userName = Object.keys(this.connectedUsers).find(
      (key) => this.connectedUsers[key] === client.id,
    );

    if (userName) {
      delete this.connectedUsers[userName];
      console.log(`User ${userName} disconnected`);

      for (const chatId in this.chatRooms) {
        if (this.chatRooms[chatId].has(userName)) {
          this.chatRooms[chatId].delete(userName);
          const activeUsersInChat = Array.from(this.chatRooms[chatId]);
          this.server.to(chatId).emit('update_active_users', activeUsersInChat);
        }
      }

      this.server.emit('update_active_users', Object.keys(this.connectedUsers));
    } else {
      console.log(`Unknown client disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage('send_message')
  public handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): void {
    console.log(`Message from ${client.id}:`, data);

    this.server.to(data.chatId).emit('new_message', data);
  }
}
