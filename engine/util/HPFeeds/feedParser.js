/**
 * HPfeed structure
 *
 * [Length of packet (4 bytes)][Type of Packet (1 byte)][Length of identifier (1 byte)][Identifier][Data]
 *
 * Types of Packets:
 * 0 = ERROR
 * 1 = INFO
 * 2 = AUTH
 * 3 = PUBLISH
 * 4 = SUBSCRIBE
 *
 * The structure of Data depends on which Packet Type is used;
 * INFO
 * [Nonce]
 *
 * AUTH
 * [AuthHash]
 *
 * PUBLISH
 * [Channel length (1 byte)][Channel][Payload]
 *
 * Possible channels:               Type of payload:
 * dionaea.connections              JSON object
 * dionaea.capture                  JSON object
 * mwbinary.dionaea.sensorunique    Binary
 */

import md5sum from '../md5sum';

const feedParser = (socketData, verbose = false) => {
    const dv = new DataView(socketData.buffer);

    const packetTypes = ['ERROR', 'INFO', 'AUTH', 'PUBLISH'];
    const channels = ['dionaea.connections', 'dionaea.capture', 'mwbinary.dionaea.sensorunique'];

    const socketLength = dv.getUint32(0);
    const packetType = dv.getUint8(4);
    const packetIdentifierLength = dv.getUint8(5);
    const packetIdentifier = String.fromCharCode.apply(null, new Uint8Array(socketData.buffer, 6, packetIdentifierLength));
    const payloadOffset = packetIdentifierLength + 6;
    const payloadData =  new Uint8Array(socketData.buffer, payloadOffset);

    let channelLength;
    let channel;
    let binary;
    let binaryHash;
    let json;

    if (packetType === 3) {
        channelLength = dv.getUint8(payloadOffset);
        channel = String.fromCharCode.apply(null, new Uint8Array(socketData.buffer, payloadOffset + 1, channelLength));

        if (channels.indexOf(channel) !== -1) {
            if (channel === 'mwbinary.dionaea.sensorunique') {
                binary = new Uint8Array(socketData.buffer, payloadOffset + 1 + channelLength);
                binaryHash = md5sum(binary);
            } else {
                const jsonString = new Uint8Array(socketData.buffer, payloadOffset + 1 + channelLength);
                json = JSON.parse(String.fromCharCode.apply(null, jsonString));
            }
        }
    }

    const feed = {
        socketLength,
        packetType,
        packetIdentifierLength,
        packetIdentifier,
        payloadData,
        channelLength,
        channel,
        binary,
        binaryHash,
        json
    };

    if (verbose) {
        console.log(`Length of socket: ${feed.socketLength}`);
        console.log(`Packet type: ${packetTypes[feed.packetType]}`);
        console.log(`Identifier length: ${feed.packetIdentifierLength}`);
        console.log(`Identifier: ${feed.packetIdentifier}`);

        switch(packetType) {
            case 1: // INFO
                console.log(`Info nonce: ${feed.payloadData}`);
                break;

            case 2: // AUTH
                console.log(`AuthHash: ${feed.payloadData}`);
                break;

            case 3: // PUBLISH
                console.log(`Channel length: ${feed.channelLength}`);
                console.log(`Channel: ${feed.channel}`);

                if (feed.json) console.log(`JSON: ${JSON.stringify(feed.json, null, 2)}`);
                if (feed.binary) console.log(`Payload-Length: ${feed.binary.length}`);
                if (channels.indexOf(feed.channel) === -1) console.error(`Unknown channel! ${feed.channel}`);
                break;
        }

    }

    return feed;
}

export default feedParser;
