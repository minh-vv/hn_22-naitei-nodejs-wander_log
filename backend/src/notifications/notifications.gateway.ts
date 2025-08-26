import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<string, Socket>(); 

  constructor(
    private notificationsService: NotificationsService,
    private jwtService: JwtService,
  ) {
    this.logger.log('NotificationsGateway initialized');
  }

  afterInit(server: Server) {
    this.logger.log('NotificationsGateway initialized successfully');
  }

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`New client attempting connection: ${client.id}`);
      
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      this.logger.log(`Token received: ${token ? 'YES (length: ' + token.length + ')' : 'NO'}`);
      
      if (!token) {
        this.logger.warn('Client connected without authentication token');
        client.emit('notification:error', { message: 'No authentication token provided' });
        client.disconnect();
        return;
      }

      this.logger.log('Verifying JWT token...');
      const payload = this.jwtService.verify(token);
      this.logger.log(`JWT verified. Payload: ${JSON.stringify(payload)}`);
      
      const userId = payload.sub;

      if (!userId) {
        this.logger.warn('Invalid token payload - no userId found');
        client.emit('notification:error', { message: 'Invalid token payload' });
        client.disconnect();
        return;
      }

      this.connectedUsers.set(userId, client);
      client.data.userId = userId;

      this.logger.log(`User ${userId} connected to notifications. Total connections: ${this.connectedUsers.size}`);

      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      this.logger.log(`Sending unread count to ${userId}: ${unreadCount}`);
      client.emit('notification:unreadCount', { count: unreadCount });

    } catch (error) {
      this.logger.error('Authentication error:', error.message);
      client.emit('notification:error', { message: 'Authentication failed: ' + error.message });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`User ${userId} disconnected from notifications`);
    }
  }

  @SubscribeMessage('notification:getAll')
  async handleGetAllNotifications(
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const notifications = await this.notificationsService.findAllByUser(userId);
    client.emit('notification:allNotifications', notifications);
  }

  @SubscribeMessage('notification:getUnread')
  async handleGetUnreadNotifications(
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const notifications = await this.notificationsService.findUnreadByUser(userId);
    client.emit('notification:unreadNotifications', notifications);
  }

  @SubscribeMessage('notification:markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    try {
      await this.notificationsService.markAsRead(data.notificationId, userId);
      
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('notification:unreadCount', { count: unreadCount });
      
      client.emit('notification:markAsReadSuccess', { notificationId: data.notificationId });
    } catch (error) {
      client.emit('notification:error', { message: 'Failed to mark notification as read' });
    }
  }

  @SubscribeMessage('notification:markAllAsRead')
  async handleMarkAllAsRead(
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    try {
      await this.notificationsService.markAllAsRead(userId);
      
      client.emit('notification:unreadCount', { count: 0 });
      client.emit('notification:markAllAsReadSuccess');
    } catch (error) {
      client.emit('notification:error', { message: 'Failed to mark all notifications as read' });
    }
  }

  async emitNewFollowNotification(followerId: string, followingId: string) {
    const notification = await this.notificationsService.createFollowNotification(followerId, followingId);
    
    if (notification) {
      const targetSocket = this.connectedUsers.get(followingId);
      if (targetSocket) {
        targetSocket.emit('notification:newFollow', notification);
        
        const unreadCount = await this.notificationsService.getUnreadCount(followingId);
        targetSocket.emit('notification:unreadCount', { count: unreadCount });
      }
    }

    return notification;
  }

  async emitNewInteractionNotification(type: 'comment' | 'like', fromUserId: string, postId: string) {
    let notification;
    
    if (type === 'comment') {
      notification = await this.notificationsService.createCommentNotification(fromUserId, postId);
    } else if (type === 'like') {
      notification = await this.notificationsService.createLikeNotification(fromUserId, postId);
    }

    if (notification) {
      const targetSocket = this.connectedUsers.get(notification.userId);
      if (targetSocket) {
        targetSocket.emit('notification:newInteraction', notification);
        
        const unreadCount = await this.notificationsService.getUnreadCount(notification.userId);
        targetSocket.emit('notification:unreadCount', { count: unreadCount });
      }
    }

    return notification;
  }
}
