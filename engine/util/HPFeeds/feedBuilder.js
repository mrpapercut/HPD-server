const parsePayloadByPacketType = (packetType, data) => {
    let payload;
    let dv;

    switch (packetType) {
        case 0: // ERROR packet
            break;

        case 1: // INFO packet
            if (!data.hasOwnProperty('nonce')) {
                console.error('Missing data property: nonce');
                return false;
            }

            payload = new Uint8Array(data.nonce.length);
            dv = new DataView(payload.buffer);

            for (let i = 0; i < data.nonce.length; i++) {
                dv.setInt8(i, data.nonce.charCodeAt(i));
            }

            break;

        case 2: // AUTH packet
            if (!data.hasOwnProperty('authHash')) {
                console.error('Missing data property: authHash');
                return false;
            }

            payload = new Uint8Array(data.authHash.length);
            dv = new DataView(payload.buffer);

            for (let i = 0; i < data.authHash.length; i++) {
                dv.setInt8(i, data.authHash.charCodeAt(i));
            }

            break;

        case 3: // PUBLISH packet
            if (!data.hasOwnProperty('channel')) {
                console.error('Missing data property: channel');
                return false;
            }

            if (!data.hasOwnProperty('payload')) {
                console.error('Missing data property: payload');
                return false;
            }

            payload = new Uint8Array(1 + data.channel.length + data.payload.length);
            dv = new DataView(payload.buffer);

            // Channel length
            dv.setInt8(0, data.channel.length);

            // Channel
            for (let i = 0; i < data.channel.length; i++) {
                dv.setInt8(1 + i, data.channel.charCodeAt(i));
            }

            // Payload
            for (let i = 0; i < data.payload.length; i++) {
                if (data.payload instanceof Buffer) {
                    dv.setInt8(1 + data.channel.length + i, data.payload[i]);
                } else {
                    dv.setInt8(1 + data.channel.length + i, data.payload.charCodeAt(i));
                }
            }
    }

    return payload;
}

const feedBuilder = (packetType, identifier, data = {}) => {
    let payload = parsePayloadByPacketType(packetType, data);

    if (payload === false) {
        console.error('Error parsing payload');
        return false;
    }

    // Total packet length
    let packetLength = 4 + 1 + 1 + identifier.length + payload.byteLength;

    // Creating TypedArray
    let header = new Uint8Array(packetLength);
    let dv = new DataView(header.buffer);

    // Set Packet Length
    dv.setInt32(0, packetLength);

    // Set Packet Type
    dv.setInt8(4, packetType);

    // Set Identifier Length
    dv.setInt8(5, identifier.length);

    // Set Identifier
    for (let i = 0; i < identifier.length; i++) {
        dv.setInt8(6 + i, identifier.charCodeAt(i));
    }

    // Set Payload
    payload.forEach((entry, index) => {
        dv.setInt8(6 + identifier.length + index, entry);
    });

    return header;
};

export default feedBuilder;
