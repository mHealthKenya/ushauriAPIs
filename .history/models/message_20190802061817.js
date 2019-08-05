const sequelize = require("../db_config");
const sequelize = require("sequelize");

const Message = sequelize.sequelize.define(
    "tbl_messages", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        message: Sequelize.TEXT,
        target_group: Sequelize.ENUM("All", "Adult", "Adolescent", "Male", "Female")

    }
)