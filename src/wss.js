import { WebSocket, WebSocketServer } from 'ws';
import { getCurrentData } from './parsing.js';
import { utils } from './utils.js';
import axios from 'axios';


const createWSS = (server) => {
    const wss = new WebSocketServer({ server });



    const connections = new Map();



    function handleWebSocketMessage(message, serverId) {
        try {
            // connections.forEach((ws, id) => {
            //     if (id === assertedQueue.queue && ws.readyState === WebSocket.OPEN && id !== data.serverId) {
            //         ws.send(`Sent (${data.serverId}): ${data.message}`);
            //     }
            // });
        } catch (error) {
            console.log('error.message handleWebSocketMessage :>> ', error.message);
        }
    }


    async function handleWebSocketConnection(serverId) {

        try {
            
            setInterval(() => {
                connections.forEach((ws, id) => {
                    if (id === serverId && ws.readyState === WebSocket.OPEN) {
                        const data = utils.transformData(getCurrentData());
                        

                        ws.send(''+JSON.stringify(data));
                    }
                });
            }, 2000);

        } catch (error) {
            console.log('error.message handleWebSocketConnection :>> ', error.message);
        }
        return;
    }



    wss.on('connection', (ws) => {
        const serverId = Math.random().toString(36).substr(2, 9);
        console.log('serverId :>> ', serverId);

        connections.set(serverId, ws);

        handleWebSocketConnection(serverId, ws);

        ws.on('message', (message) => {
            handleWebSocketMessage(message, serverId);
        });

        ws.on('close', () => {
            connections.delete(serverId);
        });

    });



    return wss;
};


export {
    createWSS
}

