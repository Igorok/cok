module.exports = {
    prod: true,
    mongo: {
        host: "localhost",
        port: 27017,
        db: "chat_db",
        auth: false,
        user: "",
        password: "",
        opts: {
            auto_reconnect: true,
            poolSize: 40
        }
    },
    redis: {
        host: "localhost",
        port: 6379,
        auth: false,
        password: ""
    }
};
