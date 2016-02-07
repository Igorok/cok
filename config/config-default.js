module.exports = {
    prod:false,
    app: {
        expireTokenDay: 7,
        port: 3000,
        postStatus: [
            {_id: 'write', name: 'Write'},
            {_id: 'publish', name: 'Publish'},
            {_id: 'archive', name: 'Archive'},
        ],
    },
    mongo:{
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
