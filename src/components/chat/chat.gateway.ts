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
import { ChatGatewayService } from './../../common/services/chat/chat-gateway.service';
import { SocketConstants } from 'src/common/constants/socket-constants.constant';
import { MessagePayload } from 'src/common/types/chat/message-payload.type';
import { LeaveChatUser } from 'src/common/types/chat/leave-chat-user.type';

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

  constructor(private readonly chatGatewayService: ChatGatewayService) {}

  public afterInit(server: Server): void {
    this.chatGatewayService.setServer(server);
  }

  public handleConnection(client: Socket): void {
    this.chatGatewayService.handleConnection(client);
  }

  public handleDisconnect(client: Socket): void {
    this.chatGatewayService.handleDisconnect(client);
  }

  @SubscribeMessage(SocketConstants.SEND_MESSAGE)
  public handleMessage(
    @MessageBody() data: MessagePayload,
    @ConnectedSocket() client: Socket,
  ): void {
    this.chatGatewayService.handleMessage(data, client);
  }

  @SubscribeMessage(SocketConstants.JOIN_CHAT)
  public handleJoinChat(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    this.chatGatewayService.handleJoinChat(chatId, client);
  }

  @SubscribeMessage(SocketConstants.LEAVE_CHAT)
  public handleLeaveChat(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    this.chatGatewayService.handleLeaveChat(chatId, client);
  }

  @SubscribeMessage(SocketConstants.LEAVE_CHAT_USER)
  public handleLeaveChatUser(
    @MessageBody() leaveChatUser: LeaveChatUser,
    @ConnectedSocket() client: Socket,
  ): void {
    this.chatGatewayService.handleLeaveChatUser(leaveChatUser);
  }
}
