import fs from 'fs';
import path from 'path';

const writePayloadToFile = (payloadhash, payload) => {
    const payloadsDirectory = path.resolve(path.join('.', '/payloads/'));
    const filepath = path.join(payloadsDirectory, `${payloadhash}.bin`);

    return new Promise((resolve, reject) => {
        fs.lstat(payloadsDirectory, (err, res) => {
            if (err) {
                fs.mkdir(payloadsDirectory, (err, res) => {
                    if (err) {
                        logError('Error creating directory `payloads`');
                    } else {
                        fs.writeFile(filepath, payload, (err, res) => {
                            if (err) logError(`Could not write payload ${payloadhash}`);
                        });
                    }

                    resolve();
                });
            } else {
                fs.writeFile(filepath, payload, (err, res) => {
                    if (err) logError(`Could not write payload ${payloadhash}`);
                    resolve();
                });
            }
        });
    });
}

export default writePayloadToFile;
