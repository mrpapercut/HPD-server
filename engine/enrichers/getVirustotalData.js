import fetch from 'node-fetch';
import mainConfig from '../../config/mainConfig';

const getVirustotalData = hash => {
    const url = `https://www.virustotal.com/vtapi/v2/file/report?apikey=${mainConfig.virustotal.apikey}&resource=${hash}`;

    return new Promise((resolve, reject) => {
        fetch(url).then(
            res => res.json(),
            err => console.log(err)
        ).then(json => {
            if (json.response_code === 0) {
                resolve({detection: '0/0'});
            }

            const returnObj = {
                detection: `${json.positives}/${json.total}`,
                scan_date: json.scan_date,
                permalink: json.permalink,
                vendors: []
            };

            if (json.hasOwnProperty('scans')) {
                const prefVendors = ['ESET-NOD32', 'GData', 'Microsoft'];
                prefVendors.forEach(vendor => {
                    if (json.scans.hasOwnProperty(vendor) && json.scans[vendor].detected) {
                        returnObj.vendors.push({vendor, result: json.scans[vendor].result});
                    }
                });
            }

            resolve(returnObj);
        });
    });
};

export default getVirustotalData;
