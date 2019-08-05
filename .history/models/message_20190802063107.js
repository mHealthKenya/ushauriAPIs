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
        target_group: Sequelize.ENUM("All", "Adult", "Adolescent", "Male", "Female"),
        message_type_id: Sequelize.INTEGER,
        logic_flow: Sequelize.INTEGER,
        languade_id: Sequelize.INTEGER,

        created_by: Sequelize.INTEGER,
        updated_by: Sequelize.INTEGER,




    }
)