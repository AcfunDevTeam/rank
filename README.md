# rank
使用Redis做时间区间排行榜


redis配置文件要写：`notify-keyspace-events "KEA"`

### 使用

```
$ redis-server redis.conf
$ npm start
$ curl http://127.0.0.1:9000/increment/acfun/aki/1/20
$ curl http://127.0.0.1:9000/acfun/0/10/20
```

### 接口规则


增加分数
`/increment/:channelId/:id/:score/:timeout`

- `channelId`: 频道ID
- `id`: 一般为av号
- `score`: 分数。默认写 1
- `timeout`: 统计时间范围。单位是 second。


获取结果
`/:channelId/:start/:count/:timeout`

- `channelId`: 频道ID
- `start`: 第几名
- `count`: 数量
- `timeout`: 统计时间范围。单位是 second。与增加分数的接口对应

