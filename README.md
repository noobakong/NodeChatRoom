# happy chat

> node+express+socket.io+jquery+flex

## 实现功能
- 登录检测
- 系统提示在线人员状态（进入/离开）
- 接收与发送消息 
- 自定义消息字体颜色
- 支持发送表情
- 支持发送图片 
- 支持发送窗口震动
- 支持私聊



## Socket.io相关

- **io.on** ： 在客户端连接时被触发。

- **io.emit**：向所有连接的客户端发出事件

- **socket.emit** : 只触发当前用户的foo事件

  socket.emit（eventName [，... args][，ack]）（覆盖EventEmitter.emit）

  - eventName （串）
  - args
  - ack （功能）
  - 返回 Socket

- **socket.broadcast.emit**： 触发除了当前用户的其他用户的foo事件

- **socket.on（eventName，callback）**
  - （继承自EventEmitter）
    - eventName （串）
    - callback （功能）
    - 返回 Socke

## 私聊实现
- 前台判断发送对象是所有人/私人
- 是私聊的话前端传入发送人的socket id
- 通过前台传来的name来在server端匹配要发送到的socket
- 这样就能取到私聊的from 和 to
- 再分情况进行前台渲染即可实现私聊