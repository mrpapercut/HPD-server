import fetch from 'node-fetch';
import {logError} from '../util/log';

const getGeodata = (ipaddr) => {
    const url = `http://getcitydetails.geobytes.com/GetCityDetails?fqcn=${ipaddr}`;

    return new Promise((resolve, reject) => {
        fetch(url).then(
            res => res.json(),
            err => {
                logError(err);
                reject(err, {
                    latitude: 0.0,
                    longitude: 0.0,
                    city: '',
                    country: ''
                })
            }
        ).then(geodata => {
            resolve({
                latitude: parseFloat(geodata.geobyteslatitude),
                longitude: parseFloat(geodata.geobyteslongitude),
                city: geodata.geobytescity,
                country: geodata.geobytescountry
            });
        });
    });
};

export default getGeodata;
