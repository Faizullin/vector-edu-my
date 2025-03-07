if (!window.server_conf) {
    window.server_conf = {
        urls: {
            addUrl(key, url) {
                if (!this[key]) {
                    this[key] = url;
                } else {
                    console.error(`URL ${key} already exists`);
                }
            },
        },
    };
} else {
    console.error('server_conf already defined');
}