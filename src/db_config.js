export default {
  dbName: 'dzAdmin', // *数据库名称
  version: 1, // 数据库版本号（默认为当前时间戳）
  tables: [
    {
      tableName: 'user', // *表名
      option: { keyPath: 'user_id' }, // 表配置，即ObjectStore配置，此处指明主键为id
      indexs: [
        // 数据库索引（建议加上索引）
        {
          key: 'user_id', // *索引名
          option: {
            // 索引配置，此处表示该字段不允许重复
            unique: true
          }
        },
        {
          key: 'name'
        },
        {
          key: 'phone'
        }
      ]
    },
    {
      tableName: 'balance',
      option: { keyPath: 'user_id' },
      indexs: [
        {
          key: 'user_id',
          option: {
            unique: true
          }
        },
        {
          key: 'price'
        }
      ]
    },
    {
      tableName: 'list', // *表名 另外一张表，同理
      option: { keyPath: 'list_id' },
      indexs: [
        {
          key: 'list_id',
          option: {
            unique: true
          }
        },
        {
          key: 'user_id'
        },
        {
          key: 'price1'
        },
        {
          key: 'price2'
        },
        {
          key: 'time'
        }
      ]
    }
  ]
}
