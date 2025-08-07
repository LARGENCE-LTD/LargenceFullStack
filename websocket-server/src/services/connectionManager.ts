import { WebSocket } from 'ws';
import { AuthenticatedWebSocket } from '../types';

export class ConnectionManager {
  private connections: Map<string, AuthenticatedWebSocket> = new Map();

  /**
   * Add a new connection, closing any existing connection for the same user
   */
  addConnection(userId: string, ws: AuthenticatedWebSocket): void {
    // Close existing connection if it exists (last connection wins)
    const existingConnection = this.connections.get(userId);
    if (existingConnection && existingConnection.readyState === WebSocket.OPEN) {
      console.log(`Closing existing connection for user ${userId}`);
      existingConnection.close(1000, 'New connection established');
    }

    // Add the new connection
    this.connections.set(userId, ws);
    console.log(`Connection added for user ${userId}. Total connections: ${this.connections.size}`);
  }

  /**
   * Remove a connection
   */
  removeConnection(userId: string): void {
    const removed = this.connections.delete(userId);
    if (removed) {
      console.log(`Connection removed for user ${userId}. Total connections: ${this.connections.size}`);
    }
  }

  /**
   * Get a connection for a specific user
   */
  getConnection(userId: string): AuthenticatedWebSocket | undefined {
    return this.connections.get(userId);
  }

  /**
   * Check if a user has an active connection
   */
  hasConnection(userId: string): boolean {
    const connection = this.connections.get(userId);
    return connection?.readyState === WebSocket.OPEN;
  }

  /**
   * Send a message to a specific user
   */
  sendToUser(userId: string, message: any): boolean {
    const connection = this.connections.get(userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      try {
        connection.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error(`Failed to send message to user ${userId}:`, error);
        this.removeConnection(userId);
        return false;
      }
    }
    return false;
  }

  /**
   * Get all active connections
   */
  getAllConnections(): AuthenticatedWebSocket[] {
    const activeConnections: AuthenticatedWebSocket[] = [];
    
    for (const [userId, connection] of this.connections.entries()) {
      if (connection.readyState === WebSocket.OPEN) {
        activeConnections.push(connection);
      } else {
        // Clean up closed connections
        this.connections.delete(userId);
      }
    }

    return activeConnections;
  }

  /**
   * Get the total number of active connections
   */
  getConnectionCount(): number {
    // Clean up closed connections first
    for (const [userId, connection] of this.connections.entries()) {
      if (connection.readyState !== WebSocket.OPEN) {
        this.connections.delete(userId);
      }
    }

    return this.connections.size;
  }

  /**
   * Close all connections
   */
  closeAllConnections(): void {
    for (const [userId, connection] of this.connections.entries()) {
      if (connection.readyState === WebSocket.OPEN) {
        connection.close(1000, 'Server shutdown');
      }
    }
    this.connections.clear();
    console.log('All connections closed');
  }

  /**
   * Get connection statistics
   */
  getStats(): { total: number; active: number } {
    let active = 0;
    const toRemove: string[] = [];

    for (const [userId, connection] of this.connections.entries()) {
      if (connection.readyState === WebSocket.OPEN) {
        active++;
      } else {
        toRemove.push(userId);
      }
    }

    // Clean up closed connections
    toRemove.forEach(userId => this.connections.delete(userId));

    return {
      total: this.connections.size,
      active
    };
  }
} 