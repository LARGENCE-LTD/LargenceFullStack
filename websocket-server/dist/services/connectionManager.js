"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionManager = void 0;
const ws_1 = require("ws");
class ConnectionManager {
    connections = new Map();
    addConnection(userId, ws) {
        const existingConnection = this.connections.get(userId);
        if (existingConnection && existingConnection.readyState === ws_1.WebSocket.OPEN) {
            console.log(`Closing existing connection for user ${userId}`);
            existingConnection.close(1000, 'New connection established');
        }
        this.connections.set(userId, ws);
        console.log(`Connection added for user ${userId}. Total connections: ${this.connections.size}`);
    }
    removeConnection(userId) {
        const removed = this.connections.delete(userId);
        if (removed) {
            console.log(`Connection removed for user ${userId}. Total connections: ${this.connections.size}`);
        }
    }
    getConnection(userId) {
        return this.connections.get(userId);
    }
    hasConnection(userId) {
        const connection = this.connections.get(userId);
        return connection?.readyState === ws_1.WebSocket.OPEN;
    }
    sendToUser(userId, message) {
        const connection = this.connections.get(userId);
        if (connection && connection.readyState === ws_1.WebSocket.OPEN) {
            try {
                connection.send(JSON.stringify(message));
                return true;
            }
            catch (error) {
                console.error(`Failed to send message to user ${userId}:`, error);
                this.removeConnection(userId);
                return false;
            }
        }
        return false;
    }
    getAllConnections() {
        const activeConnections = [];
        for (const [userId, connection] of this.connections.entries()) {
            if (connection.readyState === ws_1.WebSocket.OPEN) {
                activeConnections.push(connection);
            }
            else {
                this.connections.delete(userId);
            }
        }
        return activeConnections;
    }
    getConnectionCount() {
        for (const [userId, connection] of this.connections.entries()) {
            if (connection.readyState !== ws_1.WebSocket.OPEN) {
                this.connections.delete(userId);
            }
        }
        return this.connections.size;
    }
    closeAllConnections() {
        for (const [userId, connection] of this.connections.entries()) {
            if (connection.readyState === ws_1.WebSocket.OPEN) {
                connection.close(1000, 'Server shutdown');
            }
        }
        this.connections.clear();
        console.log('All connections closed');
    }
    getStats() {
        let active = 0;
        const toRemove = [];
        for (const [userId, connection] of this.connections.entries()) {
            if (connection.readyState === ws_1.WebSocket.OPEN) {
                active++;
            }
            else {
                toRemove.push(userId);
            }
        }
        toRemove.forEach(userId => this.connections.delete(userId));
        return {
            total: this.connections.size,
            active
        };
    }
}
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=connectionManager.js.map