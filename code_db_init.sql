-- Supabase 初始化脚本
-- 将此 SQL 粘贴到 Supabase SQL Editor 中执行

-- 1. 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  quota_limit INT DEFAULT 5,
  quota_used INT DEFAULT 0,
  quota_reset_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 任务表
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  website TEXT NOT NULL,
  keyword TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  skyvern_task_id TEXT,
  filters JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 3. 结果表
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  raw_html TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- 4. 浏览器会话表
CREATE TABLE browser_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  website TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 5. 索引优化
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_results_task_id ON results(task_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_browser_profiles_user_id ON browser_profiles(user_id);

-- 6. 行级权限策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- 用户只能看到自己的数据
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can read own tasks"
  ON tasks
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth.uid() = id
    )
  );

CREATE POLICY "Users can read own results"
  ON results
  FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM tasks
      WHERE user_id IN (
        SELECT id FROM users WHERE auth.uid() = id
      )
    )
  );

-- 7. 触发器：自动更新时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. 函数：重置月度配额
CREATE OR REPLACE FUNCTION reset_monthly_quota()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET quota_used = 0, quota_reset_date = CURRENT_TIMESTAMP
  WHERE DATE(quota_reset_date) < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 9. 视图：用户的采集概览
CREATE VIEW user_task_summary AS
SELECT
  u.id,
  u.email,
  COUNT(t.id) as total_tasks,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN t.status = 'failed' THEN 1 END) as failed_tasks,
  SUM(CASE WHEN t.status = 'completed' THEN COALESCE(json_array_length(r.data), 0) ELSE 0 END) as total_results
FROM users u
LEFT JOIN tasks t ON u.id = t.user_id
LEFT JOIN results r ON t.id = r.task_id
GROUP BY u.id, u.email;

-- 10. 插入示例用户 (可选)
INSERT INTO users (email, token, plan, quota_limit)
VALUES ('test@example.com', 'test_token_12345', 'free', 5)
ON CONFLICT (email) DO NOTHING;

-- 验证表是否创建成功
-- SELECT * FROM pg_tables WHERE schemaname = 'public';
