const mapCaptureJson = json => {
    json.remote_port = parseInt(json.sport, 10);
    delete json.sport;

    json.remote_host = json.saddr;
    delete json.saddr;

    json.local_port = parseInt(json.dport, 10);
    delete json.dport;

    json.local_host = json.daddr;
    delete json.daddr;

    return json;
};

export default mapCaptureJson;
