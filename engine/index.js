/**
 * HPP - Engine
 *
 * Accepts incoming HPfeeds from Honeypots,
 * parses the HPfeed,
 * enriches the data,
 * stores in Elasticsearch
 *
 */

import net from 'net';

import mainConfig from '../config/mainConfig';

import {
    parser as feedParser,
    builder as feedBuilder
} from './util/HPFeeds';

import concatUint8Arrays from './util/HPFeeds/concatUint8Arrays';

import writePayloadToFile from './util/writePayloadToFile';
import mapCaptureJson from './util/mapCaptureJson';

class HPDEngine {
    constructor() {
        this.port = mainConfig.engine.port || 10000;

        this.identifier = mainConfig.engine.identifier || 'HPFeedsNodeJSServer';

        this.liveSockets = {};
        this.counter = 0;
    }

    listen() {
        net.createServer(socket => {
            // Assign id to socket
            socket.id = this.counter++;

            // Store socket in object
            this.liveSockets[socket.id] = {
                socket,
                data: new Uint8Array(0)
            };

            // Send a reply back to socket
            socket.write(Buffer.from(this.replyMessage().buffer));

            // Accumulate socket data
            socket.on('data', data => {
                this.liveSockets[socket.id].data = concatUint8Arrays(this.liveSockets[socket.id].data, data);
            });

            socket.on('end', data => {
                // Parse socket data
                const parsedFeed = feedParser(this.liveSockets[socket.id].data);

                // Remove socket from stored sockets
                delete this.liveSockets[socket.id];

                this.processParsedFeed(parsedFeed);
            });

        }).listen(this.port);

        console.log(`Listening on port ${this.port}`);
    }

    replyMessage() {
        const packetType = 1;
        const nonce = 'BBBB';

        return feedBuilder(packetType, this.identifier, {nonce});
    }

    processParsedFeed(feed) {
        switch (feed.packetType) {
            case 0: // ERROR packet
            case 1: // INFO packet
            case 2: // AUTH packet
                break;

            case 3: // PUBLISH packet
                if (feed.json instanceof Object === false) {
                    feed.json = {};
                }

                feed.json.connection_channel = feed.packetIdentifier;
                feed.json.timestamp = +new Date();
                feed.json.sensor = feed.identifier;

                switch(feed.channel) {
                    case 'dionaea.connections':
                        console.log(feed.json);
                        break;

                    case 'dionaea.capture':
                        feed.json = mapCaptureJson(feed.json);
                        console.log(feed.json);
                        break;

                    case 'mwbinary.dionaea.sensorunique':
                        feed.json.hash = feed.binaryHash;

                        if (feed.binary) {
                            writePayloadToFile(feed.binaryHash, feed.binary);
                        }
                        console.log(feed.json);

                        break;
                }
        }
    }
}

export default HPDEngine;
