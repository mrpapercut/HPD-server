import fs from 'fs';

import {
    builder as feedBuilder,
    parser as feedParser
} from './index';

// Test functions
const identifier = '634fffb0-11e0-a676-8015-fad50931acf';

const buildInfoPacket = () => {
    const packetType = 1;
    const nonce = 'BBBB';

    return feedBuilder(packetType, identifier, {nonce});
}

const buildAuthPacket = () => {
    const packetType = 2;
    const authHash = 'LUååü"5Ì i£E÷ú³ûFú';

    return feedBuilder(packetType, identifier, {authHash});
}

const buildConnectionPacket = () => {
    const packetType = 3;

    const channel = 'dionaea.connections';
    const payload = JSON.stringify({
        connection_type: "accept",
        connection_protocol: "smbd",
        local_host: "255.255.255.255",
        connection_transport: "tcp",
        remote_host: "103.113.230.14",
        local_port: 445,
        remote_port: 3217,
        remote_hostname: ""
    });

    return feedBuilder(packetType, identifier, {channel, payload});
}

const buildCapturePacket = () => {
    const packetType = 3;

    const channel = 'dionaea.capture';
    const payload = JSON.stringify({
        daddr: "255.255.255.255",
        saddr: "95.183.234.236",
        sport: "41236",
        md5: "996c2b2ca30180129c69352a3a3515e4",
        sha512: "da2acf9fd0553b473802b6dd8cf35a0ac4e734f0a790f9c260db06f46f84ff452bd888297f662540bf60a895a3f196368d3e24d13dd9e0d4ca9e83d3cc1076de",
        dport: "445",
        url: "",
        time: "2018-07-28 15:33:34.544929 GMT +0000"
    });

    return feedBuilder(packetType, identifier, {channel, payload});
}

const buildBinaryPacket = filename => {
    const packetType = 3;
    const channel = 'mwbinary.dionaea.sensorunique';
    const payload = fs.readFileSync(filename);

    return feedBuilder(packetType, identifier, {channel, payload});
}

const infoFeed = buildInfoPacket();
feedParser(infoFeed, true);
console.log('---');

const authFeed = buildAuthPacket();
feedParser(authFeed, true);
console.log('---');

const captureFeed = buildCapturePacket();
console.log(feedParser(captureFeed));
console.log('---');

const connectionFeed = buildConnectionPacket();
feedParser(connectionFeed, true);
console.log('---');

const binaryFeed1 = buildBinaryPacket('./calc.bin');
feedParser(binaryFeed1, true);
console.log('---');

const binaryFeed2 = buildBinaryPacket('./7z1604-x64.bin');
feedParser(binaryFeed2, true);
