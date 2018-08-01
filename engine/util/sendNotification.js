import Telegram from './Telegram';
import {logInfo} from './log';

const sendNotification = (payload) => {
    const flame = '🔥';
    const telegram = new Telegram();

    let message = [
        `${flame}${flame}${flame} New binary caught! ${payload.hash} (VT: ${payload.detection})`
    ];

    if (payload.hasOwnProperty('vendors') && payload.vendors.length > 0) {
        message.push(...[
            `Vendors:`,
            ...payload.vendors.map((v => `${v.vendor}: ${v.result}`))
        ])
    }

    if (payload.hasOwnProperty('permalink')) {
        // Disabling for now (leads to big messages)
        // message.push(...[payload.permalink]);
    }

    logInfo(`Sending message: ${message}`);

    telegram.sendMessage(message.join('\n')).then(res => {
        logInfo(`Message sent: ${message}`)
    });
}

export default sendNotification;
