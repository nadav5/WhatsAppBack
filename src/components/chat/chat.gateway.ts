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
    origin: ['http://localhost:4200'],
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server: Server;
  private connectedUsers: { [userName: string]: string } = {}; // username => socketId


  afterInit(server: Server) {
    console.log('Socket server initialized');
  }

  handleConnection(client: Socket) {
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
  });
}

  handleDisconnect(client: Socket) {
  const userName = Object.keys(this.connectedUsers).find(
    (key) => this.connectedUsers[key] === client.id
  );

  if (userName) {
    delete this.connectedUsers[userName];
    console.log(`User ${userName} disconnected`);

    this.server.emit('update_active_users', Object.keys(this.connectedUsers));
  } else {
    console.log(`Unknown client disconnected: ${client.id}`);
  }
}


  @SubscribeMessage('send_message')
  handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log(`Message from ${client.id}:`, data);

    this.server.to(data.chatId).emit('new_message', data);
  }
}
