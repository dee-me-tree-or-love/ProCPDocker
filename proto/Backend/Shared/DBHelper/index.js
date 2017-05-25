"use strict";

const config = require('./connection');
const mysql = require('mysql');

module.exports.getConnection = () => {

	return mysql.createConnection(config);
};