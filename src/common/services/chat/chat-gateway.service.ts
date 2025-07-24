import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatRooms } from 'src/common/types/chat/chat-rooms.type';
import { ConnectedUsers } from 'src/common/types/chat/connected-users.type';
import { LeaveChatUser } from 'src/common/types/chat/leave-chat-user.type';
import { MessagePayload } from 'src/common/types/chat/message-payload.type';
import { SocketConstants } from 'src/common/constants/socket-constants.constant';

@Injectable()
export class ChatGatewayService {
  private server!: Server;
  private connectedUsers: ConnectedUsers = {};
  private chatRooms: ChatRooms = {};

  public setServer(server: Server): void {
    this.server = server;
  }

  public handleConnection(client: Socket): void {
    const userName: string = client.handshake.query.userName as string;

    if (userName) {
      this.connectedUsers[userName] = client.id;
      this.server.emit(
        SocketConstants.UPDATE_ACTIVE_USERS,
        Object.keys(this.connectedUsers),
      );
    }

    client.on(SocketConstants.JOIN_CHAT, (chatId: string): void => {
      this.handleJoinChat(chatId, client);
    });

    client.on(SocketConstants.LEAVE_CHAT, (chatId: string): void => {
      this.handleLeaveChat(chatId, client);
    });

    client.on(
      SocketConstants.LEAVE_CHAT_USER,
      (leaveChatUser: LeaveChatUser): void => {
        this.handleLeaveChatUser(leaveChatUser);
      },
    );
  }

  public handleJoinChat(chatId: string, client: Socket): void {
    client.join(chatId);

    const userName: string | undefined = Object.keys(this.connectedUsers).find(
      (key) => this.connectedUsers[key] === client.id,
    );

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
      const activeUsersInChat: string[] = Array.from(this.chatRooms[chatId]);
      this.server
        .to(chatId)
        .emit(SocketConstants.UPDATE_ACTIVE_USERS, activeUsersInChat);
    }
  }

  public handleLeaveChat(chatId: string, client: Socket): void {
    const userName: string | undefined = Object.keys(this.connectedUsers).find(
      (key) => this.connectedUsers[key] === client.id,
    );

    if (userName && this.chatRooms[chatId]) {
      this.chatRooms[chatId].delete(userName);
      const activeUsersInChat: string[] = Array.from(this.chatRooms[chatId]);
      this.server
        .to(chatId)
        .emit(SocketConstants.UPDATE_ACTIVE_USERS, activeUsersInChat);
    }
  }

  public handleLeaveChatUser(leaveChatUser: LeaveChatUser): void {
    const { chatId, userName }: LeaveChatUser = leaveChatUser;

    if (this.chatRooms[chatId]) {
      this.chatRooms[chatId].delete(userName);
      const socketId: string | undefined = this.connectedUsers[userName];
      if (socketId) {
        const socket: Socket | undefined =
          this.server.sockets.sockets.get(socketId);
        if (socket) {
          socket.leave(chatId);
        }
      }

      const activeUsersInChat: string[] = Array.from(this.chatRooms[chatId]);
      this.server
        .to(chatId)
        .emit(SocketConstants.UPDATE_ACTIVE_USERS, activeUsersInChat);
    }
  }

  public handleDisconnect(client: Socket): void {
    const userName: string | undefined = Object.keys(this.connectedUsers).find(
      (key) => this.connectedUsers[key] === client.id,
    );

    if (userName) {
      delete this.connectedUsers[userName];

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
    }
  }

  public handleMessage(data: MessagePayload, client: Socket): void {
    this.server.to(data.chatId).emit(SocketConstants.NEW_MESSAGE, data);
  }
}
