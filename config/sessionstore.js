const { connection } = require("./database-config");

const session_options = {
    createDatabaseTable: true,
    schema: {
        tableName: "custom_sessions",
        columnNames: {
            session_id: "custom_session_id",
            expires: "custom_expires_column_name",
            data: "custom_data_column_name,"
        },
    }
};

module.exports = function(session) {
    const MySQLStore = require("express-mysql-session") (session);
    const sessionStore = new MySQLStore(session_options, connection);
    return sessionStore;
}
