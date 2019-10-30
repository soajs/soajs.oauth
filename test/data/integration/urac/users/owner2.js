'use strict';

let user = {
    _id: "5da57ff8abd7b1027390ef46",
    locked: true,
    username: "owner2",
    password: "$2a$12$geJJfv33wkYIXEAlDkeeuOgiQ6y6MjP/YxbqLdHdDSK7LDG.7n7Pq",
    firstName: "owner",
    lastName: "two",
    email: "owner@localhost.com",
    ts: 1552747600152,
    status: "active",
    profile: {},
    groups: [
        "owner"
    ],
    config: {
        packages: {},
        keys: {},
        allowedTenants: []
    },
    tenant: {
        id: "5c0e74ba9acc3c5a84a51259",
        code: "DBTN",
        pin: {
            code: "1239",
            allowed: false
        }
    }
};

module.exports = user;