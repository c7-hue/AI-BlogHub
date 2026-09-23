const db = require('./model/db');

(async () => {
  try {
    // 检查数据库连接
    const result = await db.query2('SELECT 1');
    console.log('Database connection successful');
    
    // 检查message表结构
    const tableInfo = await db.query2('DESCRIBE message');
    console.log('message table structure:', tableInfo);
    
    // 尝试插入一条新数据
    const insertResult = await db.query2('INSERT IGNORE INTO message(id, user_id, user_name, moment, content, isread) VALUES(6, \'111\', \'测试用户\', \'2026-03-29 17:30:00\', \'测试内容6\', 0)');
    console.log('Insert result:', insertResult);
    
    // 检查插入后的数据
    const selectResult = await db.query2('SELECT * FROM message');
    console.log('message table data:', selectResult);
  } catch (error) {
    console.error('Error:', error);
  }
})();