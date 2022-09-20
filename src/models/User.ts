import { DataTypes } from "sequelize";
import db from "../config/Database";

const Users = db.define(
  "users",
  {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    refresh_token: DataTypes.TEXT,
  },
  { freezeTableName: true }
);

export default Users;

(async () => {
  db.sync();
})();
