import fetch from 'node-fetch';

import mainConfig from '../../config/mainConfig';

class Telegram {
    constructor() {
        this.apiurl = 'https://api.telegram.org/';
        this.botname = mainConfig.telegram.botname;
        this.token = mainConfig.telegram.token;

        // To get chat_id, init chat and message "/my_id @botname"
        // Then perform this->getUpdates to retrieve chat_id
        this.chatid = mainConfig.telegram.chat_id;
    }

    getMe() {
        this.makeRequest('getMe').then(res => {
            console.log(JSON.parse(res));
        });
    }

    sendMessage(message) {
        return this.makeRequest('sendMessage', {
            chat_id: mainConfig.telegram.chat_id,
            text: message
        });
    }

    getChatMember($user_id = '') {
        this.makeRequest('getChatMember', {
            user_id: $user_id
        }).then(res => {
            console.log(JSON.parse(res));
        });
    }

    getUpdates() {
        this.makeRequest('getUpdates').then(res => {
            console.log(JSON.parse(res));
        });
    }

    makeRequest(cmd, body) {
        const url = `${this.apiurl}bot${this.token}/${cmd}`;

        return fetch(url, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

export default Telegram;