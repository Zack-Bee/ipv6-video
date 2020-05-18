// 请确保你的mysql数据库使用utf8编码
// 可以使用`SET NAMES 'utf8';`

const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const hostConfig = require('../config/config');
const generateKey = require('./utils/generateKey');
const MemoryStore = require('session-memory-store')(session);
const OPERATE = Sequelize.Op;
const {adminList} = [];
const Op = Sequelize.Op;

// 将正在播放的列表存储在内存中, 用于减少mysql的负载
const liveList = [
  {
    title: '新闻联播',
    groupOwners: [],
    channelId: '978169778',
    channelName: 'cctv',
  },
  {
    title: '直播课堂',
    groupOwners: [],
    channelId: '12345678',
    channelName: 'teacher',
  },
  {
    title: '直播课堂',
    groupOwners: [],
    channelId: '123',
    channelName: 'teacher',
  },
];

// 使用中间件
const app = express();
app.use(cookieParser());
app.use(
  session({
    name: 'LIVE_SESSION',
    secret: 'LIVE_SESSION',
    store: new MemoryStore(),
    resave: false,
    saveUninitialized: true,
  }),
);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(cors());

// 建立数据库
const sequelize = new Sequelize('video', 'root', '', {
  host: '127.0.0.1',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
  timezone: '+08:00',
});
const User = sequelize.import(path.resolve(__dirname, './models/User.js'));

// 同步数据库
sequelize.sync({force: false}).then(
  res => {
    console.log('同步数据库成功!');
    app.listen(80);
  },
  error => {
    console.log('同步数据库失败!');
    throw new Error(error);
  },
);

// 获得播放列表
app.get(hostConfig.channelListRouter, (req, res) => {
  console.log('get liveList');
  console.log(req.session);
  res.status(200).json({
    isSuccess: true,
    data: liveList,
  });
});

// 注册
// TODO: 验证数据合法性
app.post(hostConfig.signupRouter, (req, res) => {
  const {id, password, channelName} = req.body;
  console.log({id, password, channelName});
  User.findOne({
    where: {[Op.or]: [{id}, {channelName}]},
  }).then(user => {
    if (user) {
      const plainUser = user.get({plain: true});
      if (plainUser.id === id) {
        res.status(200).json({
          isSuccess: false,
          error: '该用户ID已被使用，换一个试试',
        });
      } else if (plainUser.channelName === channelName) {
        res.status(200).json({
          isSuccess: false,
          error: '该频道名已被使用，换一个试试',
        });
      }
      return;
    }
    User.create({
      id,
      password,
      channelName,
    }).then(() => {
      req.session.isLogin = true;
      req.session.userId = id;
      res.status(200).json({
        isSuccess: true,
      });
    });
  });
});

// 登录
app.post(hostConfig.loginRouter, (req, res) => {
  const {id, password} = req.body;
  User.findOne({
    where: {
      id,
      password,
    },
  }).then(user => {
    if (!user) {
      res.status(200).json({
        isSuccess: false,
        error: 'ID或密码错误',
      });
    } else {
      req.session.userId = id;
      req.session.isLogin = true;
      res.status(200).json({isSuccess: true});
    }
  });
});

// 推流认证路由
app.post('/authorize', (req, res) => {
  console.log('开始准备认证');
  const info = req.body;
  console.log(info);
  User.findOne({
    where: {
      id: info.name,
      key: info.key,
    },
  }).then(user => {
    if (!user) {
      res.sendStatus(404);
    } else {
      const plainUser = user.get({plain: true});

      res.sendStatus(200);
      // user.update({
      //   isLive: true,
      // });
      liveList.push({
        title: plainUser.title,
        channelId: plainUser.id,
        channelName: plainUser.channelName,
        groupOwners: [],
      });
      console.log(liveList);
    }
  });
});

// 注册组主
// TODO:
app.post(hostConfig.registerGroupOwnerRouter, (req, res) => {
  const {mac, id} = req.body;
  const groupOwners = liveList.find(detail => detail.channelId === id)
    .groupOwners;
  if (!groupOwners.includes(mac)) {
    groupOwners.push(mac);
  }
  console.log({groupOwners, mac, id, liveList});
});

// 组主移除当前组
// TODO:
app.post(hostConfig.removeGroupRouter, (req, res) => {
  const {mac, id} = req.body;
  const groupOwners = liveList.find(detail => detail.channelId === id)
    .groupOwners;
  if (groupOwners.includes(mac)) {
    groupOwners.splice(groupOwners.indexOf(mac), 1);
  }
  console.log({groupOwners, mac, id, liveList});
});

// 节目推流完毕后从liveList中删除
app.post('/liveDone', (req, res) => {
  const info = req.body;
  console.log('live done');
  let index = -1;
  for (let i = 0; i < liveList.length; i++) {
    if (liveList[i].channelId === info.name) {
      index = i;
      break;
    }
  }
  liveList.splice(index, 1);
  console.log(liveList);
});

// 获取权限信息
app.get(hostConfig.authorityRouter, (req, res) => {
  const id = req.session.userId;
  const authority = adminList.includes(id) ? 2 : 1;
  res.status(200).json({
    isSuccess: true,
    authority,
  });
});

// 获取频道名称
app.get(hostConfig.channelNameRouter, (req, res) => {
  const id = req.session.userId;
  User.findOrCreate({
    where: {
      id,
    },
    defaults: {
      channelName: id,
    },
  }).then(users => {
    const plainUser = users[0].get({plain: true});
    res.status(200).json({
      channelName: plainUser.channelName,
    });
  });
});

// 获取直播详细信息
app.get(hostConfig.liveDetailRouter, (req, res) => {
  const id = req.session.userId;
  if (!id) {
    res.status(200).json({
      isSuccess: false,
      error: '尚未登录',
      errorCode: 403,
    });
    return;
  }
  User.findOrCreate({
    where: {
      id,
    },
    defaults: {
      channelName: id,
    },
  }).then(users => {
    const plainUser = users[0].get({plain: true});
    res.status(200).json({
      isSuccess: true,
      id,
      key: plainUser.key,
      channelName: plainUser.channelName,
      title: plainUser.title,
      updatedAt: plainUser.updatedAt,
    });
  });
});

app.get(hostConfig.refreshKeyRouter, (req, res) => {
  const id = req.session.userId;
  User.findOne({
    where: {
      id,
    },
  }).then(user => {
    if (!user) {
      res.status({
        isSuccess: false,
        error: '未查询到该账号的相关信息',
      });
    } else {
      const newKey = generateKey();
      user
        .update({
          key: newKey,
        })
        .then(
          () => {
            res.status(200).json({
              isSuccess: true,
              key: newKey,
            });
          },
          () => {
            res.status(200).json({
              isSuccess: false,
              error: '数据库出了点差错, 请稍后再试',
            });
          },
        );
    }
  });
});

// 修改直播标题
app.post(hostConfig.changeLiveTitleRouter, (req, res) => {
  console.log('req.body', req.body);
  const id = req.session.userId;
  User.findOne({
    where: {
      id,
    },
  }).then(user => {
    if (!user) {
      res.status({
        isSuccess: false,
        error: '未查询到该账号的相关信息',
      });
    } else {
      user
        .update({
          title: req.body.title,
        })
        .then(
          () => {
            res.status(200).json({
              isSuccess: true,
            });
          },
          () => {
            res.status(200).json({
              isSuccess: false,
              error: '数据库出了点差错, 请稍后再试',
            });
          },
        );
    }
  });
});

// 获取黑名单
app.get(hostConfig.blackListRouter, (req, res) => {
  const id = req.session.userId;
  if (!adminList.includes(id)) {
    res.sendStatus(401);
    return;
  }
  User.findAll({
    where: {
      isInBlackList: true,
    },
  }).then(users => {
    const list = [];
    for (let user of users) {
      user = user.get({plain: true});
      list.push([user.id, user.channelName, user.title]);
    }
    res.status(200).json({
      isSuccess: true,
      list,
    });
  });
});

// 向黑名单加入用户
app.post(hostConfig.addUserToBlackListRouter, (req, res) => {
  const id = req.session.userId;
  if (!adminList.includes(id)) {
    res.sendStatus(401);
    return;
  }
  User.findOrCreate({
    where: {
      id: req.body,
    },
    defaults: {
      channelName: req.body,
      isInBlackList: true,
    },
  }).then(users => {
    const user = users[0];
    user
      .update({
        isInBlackList: true,
      })
      .then(
        () => {
          res.status(200).json({
            isSuccess: true,
          });
        },
        () => {
          res.status(200).json({
            isSuccess: false,
            error: '数据库出了点差错, 请稍后再试',
          });
        },
      );
  });
});

// 从黑名单中删除用户
app.post(hostConfig.deleteUserFromBlackListRouter, (req, res) => {
  const id = req.session.userId;
  if (!adminList.includes(id)) {
    res.sendStatus(401);
    return;
  }
  const parsedBody = JSON.parse(req.body);
  User.findAll({
    where: {
      id: {
        [OPERATE.or]: parsedBody.list,
      },
    },
  })
    .then(users => {
      for (const user of users) {
        user.update({
          isInBlackList: false,
        });
      }
    })
    .then(() => {
      res.status(200).json({
        isSuccess: true,
      });
    });
});

// 获取白名单
app.get(hostConfig.whiteListRouter, (req, res) => {
  const id = req.session.userId;
  if (!adminList.includes(id)) {
    res.sendStatus(401);
    return;
  }
  User.findAll({
    where: {
      isInWhiteList: true,
    },
  }).then(users => {
    const list = [];
    for (let user of users) {
      user = user.get({plain: true});
      list.push([user.id, user.channelName, user.title]);
    }
    res.status(200).json({
      isSuccess: true,
      list,
    });
  });
});

// 向白名单添加用户
app.post(hostConfig.addUserToWhiteListRouter, (req, res) => {
  const id = req.session.userId;
  if (!adminList.includes(id)) {
    res.sendStatus(401);
    return;
  }
  User.findOrCreate({
    where: {
      id: req.body,
    },
    defaults: {
      channelName: req.body,
      isInWhiteList: true,
    },
  }).then(users => {
    const user = users[0];
    user
      .update({
        isInWhiteList: true,
      })
      .then(
        () => {
          res.status(200).json({
            isSuccess: true,
          });
        },
        () => {
          res.status(200).json({
            isSuccess: false,
            error: '数据库出了点差错, 请稍后再试',
          });
        },
      );
  });
});

// 从白名单删除用户
app.post(hostConfig.deleteUserFromWhiteListRouter, (req, res) => {
  const id = req.session.userId;
  if (!adminList.includes(id)) {
    res.sendStatus(401);
    return;
  }
  const parsedBody = JSON.parse(req.body);
  User.findAll({
    where: {
      id: {
        [OPERATE.or]: parsedBody.list,
      },
    },
  })
    .then(users => {
      for (const user of users) {
        user.update({
          isInWhiteList: false,
        });
      }
    })
    .then(() => {
      res.status(200).json({
        isSuccess: true,
      });
    });
});

// 获取是否允许所有人直播的设置
app.get(hostConfig.isAllowEveryOneLiveRouter, (req, res) => {
  const id = req.session.userId;
  if (!adminList.includes(id)) {
    res.sendStatus(401);
    return;
  }
  res.status(200).json({
    isAllowEveryOneLive: hostConfig.getIsEveryOneCanLive(),
  });
});

// 允许所有人直播, 只禁止黑名单内用户
app.get(hostConfig.allowEveryOneLiveRouter, (req, res) => {
  const id = req.session.userId;
  if (!adminList.includes(id)) {
    res.sendStatus(401);
    return;
  }
  hostConfig.allowEveryOneLive();
  res.status(200).json({
    isSuccess: true,
  });
});

// 禁止所有人直播, 只允许白名单内用户
app.get(hostConfig.forbidEveryOneLiveRouter, (req, res) => {
  const id = req.session.userId;
  if (!adminList.includes(id)) {
    res.sendStatus(401);
    return;
  }
  hostConfig.forbidEveryOneLive();
  res.status(200).json({
    isSuccess: true,
  });
});

// 退出登陆
app.get(hostConfig.logoutRouter, (req, res) => {
  req.session.isLogin = false;
  res.status(200).json({isSuccess: true});
});
