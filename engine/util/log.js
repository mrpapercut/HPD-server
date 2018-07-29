import fs from 'fs';
import path from 'path';

const getTS = () => {
    let d = new Date();
    let p = str => ('0' + str).substr(-2);

    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

export const logError = (...messages) => {
    fs.appendFile(path.resolve(path.join('.', 'log', 'error.log')), `${getTS()}\t${messages.join('\n')}\n`, 'utf8', err => {
        if (err) throw err;
    });
};

export const logInfo = (...messages) => {
    fs.appendFile(path.resolve(path.join('.', 'log', 'server.log')), `${getTS()}\t${messages.join('\n')}\n`, 'utf8', err => {
        if (err) throw err;
    });
};
