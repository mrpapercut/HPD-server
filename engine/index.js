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
import elasticsearch from 'elasticsearch';

import mainConfig from '../config/mainConfig';

import {
    parser as feedParser,
    builder as feedBuilder
} from './util/HPFeeds';

import concatUint8Arrays from './util/HPFeeds/concatUint8Arrays';

import writePayloadToFile from './util/writePayloadToFile';
import mapCaptureJson from './util/mapCaptureJson';
import sendNotification from './util/sendNotification';

import getGeodata from './enrichers/getGeodata';
import getVirusTotalData from './enrichers/getVirustotalData';

class HPDEngine {
    constructor() {
        this.port = mainConfig.engine.port || 10000;

        this.identifier = mainConfig.engine.identifier || 'HPFeedsNodeJSServer';

        this.liveSockets = {};
        this.counter = 0;

        this.esclient = new elasticsearch.Client({
            host: `http://${mainConfig.elastic.host}:${mainConfig.elastic.port}`,
            httpAuth: `${mainConfig.elastic.user}:${mainConfig.elastic.password}`
        });
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

                // Add common values
                feed.json.connection_channel = feed.packetIdentifier;
                feed.json.timestamp = +new Date();
                feed.json.sensor = feed.identifier;

                if (feed.channel === 'mwbinary.dionaea.sensorunique') {
                    this.processBinaryFeed(feed);
                } else {
                    this.processJSONFeed(feed);
                }
        }
    }

    processBinaryFeed(feed) {
        feed.json.hash = feed.binaryHash;

        if (feed.binary) {
            writePayloadToFile(feed.binaryHash, feed.binary);

            // Binaries can be enriched with VirusTotal data
            getVirusTotalData(feed.json.hash).then(vtdata => {
                feed.json = Object.assign({}, feed.json, vtdata);

                this.insertIntoElastic(feed.json);
                sendNotification(feed.json);
            });
        }
    }

    processJSONFeed(feed) {
        // Remap values to values of 'dionaea.connections' object
        if (feed.channel === 'dionaea.capture') {
            feed.json = mapCaptureJson(feed);
        }

        // Enrich with geodata
        getGeodata(feed.json.remote_host).then(({latitude, longitude, city, country}) => {
            feed.json = Object.assign({}, feed.json, {
                coordinates: [latitude, longitude],
                longitude,
                latitude,
                city,
                country
            });

            this.insertIntoElastic(feed);
        });
    }

    insertIntoElastic(feed) {
        // Only insert the .json object inside feed
        this.esclient.index({
            index: 'hpfeeds',
            type: 'feed',
            body: feed.json
        });
    }
}

export default HPDEngine;
