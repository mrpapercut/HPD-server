import crypto from 'crypto';

const md5sum = message => {
    const hash = crypto.createHash('md5');

    hash.update(message);

    return hash.digest('hex');
};

export default md5sum;
