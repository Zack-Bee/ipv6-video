// TODO: 将加密后的密码存入数据库

const moment = require('moment');
const generateKey = require('../utils/generateKey');

/**
 * 定义user模块, 在mysql中表示为:
 * +-------------+--------------+------+-----+---------+-------+
 * | Field       | Type         | Null | Key | Default | Extra |
 * +-------------+--------------+------+-----+---------+-------+
 * | id          | varchar(255) | NO   | PRI | NULL    |       |
 * | password    | varchar(255) | YES  |     | NULL    |       |
 * | authority   | int(11)      | YES  |     | NULL    |       |
 * | channelName | varchar(255) | YES  |     | NULL    |       |
 * | createdAt   | datetime     | NO   |     | NULL    |       |
 * | updatedAt   | datetime     | NO   |     | NULL    |       |
 * +-------------+--------------+------+-----+---------+-------+
 */
module.exports = (sequelize, DataTypes) =>
  sequelize.define('user', {
    id: {
      type: DataTypes.STRING,
      validate: {
        isAlphanumeric: true,
      },
      primaryKey: true,
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        isAlphanumeric: true,
      },
      defaultValue: '12345678',
    },
    channelName: {
      type: DataTypes.STRING,
    },
    key: {
      type: DataTypes.STRING,
      defaultValue: generateKey,
    },
    title: {
      type: DataTypes.STRING,
      defaultValue: '测试标题',
    },
    createdAt: {
      type: DataTypes.DATE,
      get() {
        return moment(this.getDataValue('updatedAt')).format(
          'YYYY-MM-DD HH:mm:ss',
        );
      },
    },
    updateAt: {
      type: DataTypes.DATE,
      get() {
        return moment(this.getDataValue('updatedAt')).format(
          'YYYY-MM-DD HH:mm:ss',
        );
      },
    },
  });
