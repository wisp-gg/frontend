import { Module } from 'vuex';
import socket, { SocketStore } from './socket';

export interface ServerStore {
    socket: SocketStore;
}

const server: Module<ServerStore, any> = {
    namespaced: true,

    modules: {
        socket,
    },
};

export default server;
