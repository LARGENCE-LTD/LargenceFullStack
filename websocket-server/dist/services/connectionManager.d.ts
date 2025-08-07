import { AuthenticatedWebSocket } from '../types';
export declare class ConnectionManager {
    private connections;
    addConnection(userId: string, ws: AuthenticatedWebSocket): void;
    removeConnection(userId: string): void;
    getConnection(userId: string): AuthenticatedWebSocket | undefined;
    hasConnection(userId: string): boolean;
    sendToUser(userId: string, message: any): boolean;
    getAllConnections(): AuthenticatedWebSocket[];
    getConnectionCount(): number;
    closeAllConnections(): void;
    getStats(): {
        total: number;
        active: number;
    };
}
//# sourceMappingURL=connectionManager.d.ts.map