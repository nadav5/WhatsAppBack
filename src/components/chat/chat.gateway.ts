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
import { SocketConstants } from 'src/common/constants/socket-constants.constant';
import { ChatRooms } from 'src/common/types/chat/chat-rooms.type';
import { ConnectedUsers } from 'src/common/types/chat/connected-users.type';
import { LeaveChatUser } from 'src/common/types/chat/leave-chat-user.type';
import { MessagePayload } from 'src/common/types/chat/message-payload.type';

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
  public server!: Server;

  private connectedUsers: ConnectedUsers = {};
  private chatRooms: ChatRooms = {};

  public afterInit(server: Server): void {
    console.log('Socket server initialized');
  }

  public handleConnection(client: Socket): void {
    const userName: string = client.handshake.query.userName as string;

    if (userName) {
      this.connectedUsers[userName] = client.id;
      console.log(`User ${userName} connected with socket ${client.id}`);

      this.server.emit(
        SocketConstants.UPDATE_ACTIVE_USERS,
        Object.keys(this.connectedUsers),
      );
    } else {
      console.log(`Client connected without userName: ${client.id}`);
    }



    client.on(SocketConstants.JOIN_CHAT, (chatId: string): void => {
      client.join(chatId);
      console.log(`Client ${client.id} joined chat ${chatId}`);

      const userName: string | undefined = Object.keys(
        this.connectedUsers,
      ).find((key) => this.connectedUsers[key] === client.id);

      if (!this.chatRooms[chatId]) {
        this.chatRooms[chatId] = new Set();
      }

      if (userName) {
        for (const roomId in this.chatRooms) {
          if (this.chatRooms[roomId].has(userName)) {
            this.chatRooms[roomId].delete(userName);
            const activeUsersInOldChat: string[] = Array.from(
              this.chatRooms[roomId],
            );
            this.server
              .to(roomId)
              .emit(SocketConstants.UPDATE_ACTIVE_USERS, activeUsersInOldChat);
          }
        }

        this.chatRooms[chatId].add(userName);
        console.log(this.chatRooms);

        const activeUsersInChat: string[] = Array.from(this.chatRooms[chatId]);
        this.server
          .to(chatId)
          .emit(SocketConstants.UPDATE_ACTIVE_USERS, activeUsersInChat);
      }
    });




    client.on(SocketConstants.LEAVE_CHAT, (chatId: string): void => {
      const userName: string | undefined = Object.keys(
        this.connectedUsers,
      ).find((key) => this.connectedUsers[key] === client.id);

      if (userName && this.chatRooms[chatId]) {
        this.chatRooms[chatId].delete(userName);
        console.log(`User ${userName} left chat ${chatId}`);

        const activeUsersInChat: string[] = Array.from(this.chatRooms[chatId]);
        this.server
          .to(chatId)
          .emit(SocketConstants.UPDATE_ACTIVE_USERS, activeUsersInChat);
      }
    });




    client.on(
      SocketConstants.LEAVE_CHAT_USER,
      (leaveChatUser: LeaveChatUser): void => {
        const { chatId, userName } = leaveChatUser;

        if (this.chatRooms[chatId]) {
          this.chatRooms[chatId].delete(userName);
          console.log(
            `User ${userName} removed from chat ${chatId} via socket`,
          );

          const socketId: string | undefined = this.connectedUsers[userName];
          if (socketId) {
            const socket: Socket | undefined =
              this.server.sockets.sockets.get(socketId);
            if (socket) {
              socket.leave(chatId);
              console.log(`Socket ${socketId} left room ${chatId}`);
            }
          }

          const activeUsersInChat: string[] = Array.from(
            this.chatRooms[chatId],
          );
          this.server
            .to(chatId)
            .emit(SocketConstants.UPDATE_ACTIVE_USERS, activeUsersInChat);
        }
      },
    );
  }


  
  public handleDisconnect(client: Socket): void {
    const userName: string | undefined = Object.keys(this.connectedUsers).find(
      (key) => this.connectedUsers[key] === client.id,
    );

    if (userName) {
      delete this.connectedUsers[userName];
      console.log(`User ${userName} disconnected`);

      for (const chatId in this.chatRooms) {
        if (this.chatRooms[chatId].has(userName)) {
          this.chatRooms[chatId].delete(userName);
          const activeUsersInChat: string[] = Array.from(
            this.chatRooms[chatId],
          );
          this.server
            .to(chatId)
            .emit(SocketConstants.UPDATE_ACTIVE_USERS, activeUsersInChat);
        }
      }

      this.server.emit(
        SocketConstants.UPDATE_ACTIVE_USERS,
        Object.keys(this.connectedUsers),
      );
    } else {
      console.log(`Unknown client disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage(SocketConstants.SEND_MESSAGE)
  public handleMessage(
    @MessageBody() data: MessagePayload,
    @ConnectedSocket() client: Socket,
  ): void {
    console.log(`Message from ${client.id}:`, data);
    this.server.to(data.chatId).emit('new_message', data);
  }
}
