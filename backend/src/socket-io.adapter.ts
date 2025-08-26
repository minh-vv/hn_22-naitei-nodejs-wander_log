import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext, Logger } from '@nestjs/common';

export class SocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIOAdapter.name);

  constructor(app: INestApplicationContext) {
    super(app);
    this.logger.log('SocketIOAdapter initialized');
  }

  createIOServer(port: number, options?: any): any {
    this.logger.log(`Creating Socket.IO server on port ${port}`);
    
    const corsOptions = {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    };

    const serverOptions = {
      ...options,
      cors: corsOptions,
      transports: ['websocket', 'polling'],
      allowEIO3: true,
    };

    const server = super.createIOServer(port, serverOptions);

    server.on('connection', (socket: any) => {
      this.logger.log(`Socket.IO client connected: ${socket.id}`);
      
      socket.on('disconnect', (reason: string) => {
        this.logger.log(`Socket.IO client disconnected: ${socket.id}, reason: ${reason}`);
      });
    });

    this.logger.log('Socket.IO server created successfully');
    return server;
  }
}