import { useState, useEffect } from 'react'

// GitHub备份功能
const backupToGitHub = async (todos, token) => {
  const response = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: 'Todo App Backup',
      public: false,
      files: {
        'todos.json': {
          content: JSON.stringify(todos, null, 2)
        }
      }
    })
  })
  return await response.json()
}

// 从GitHub恢复
const restoreFromGitHub = async (gistId, token) => {
  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      'Authorization': `token ${token}`
    }
  })
  const data = await response.json()
  return JSON.parse(data.files['todos.json'].content)
}

function App() {
  // 从localStorage加载待办事项
  const loadTodos = () => {
    const saved = localStorage.getItem('todos')
    return saved ? JSON.parse(saved) : []
  }

  // 待办事项列表状态
  const [todos, setTodos] = useState(loadTodos())
  // 输入框状态
  const [input, setInput] = useState('')
  // GitHub相关状态
  const [githubToken, setGithubToken] = useState('')
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [backupStatus, setBackupStatus] = useState('')

  // 保存待办事项到localStorage
  const saveTodos = (items) => {
    localStorage.setItem('todos', JSON.stringify(items))
  }

  // 添加待办事项
  const addTodo = () => {
    if (input.trim()) {
      const newTodos = [...todos, { text: input, completed: false }]
      setTodos(newTodos)
      saveTodos(newTodos)
      setInput('')
    }
  }

  // 切换完成状态
  const toggleTodo = (index) => {
    const newTodos = [...todos]
    newTodos[index].completed = !newTodos[index].completed
    setTodos(newTodos)
    saveTodos(newTodos)
  }

  // 删除待办事项
  const deleteTodo = (index) => {
    const newTodos = todos.filter((_, i) => i !== index)
    setTodos(newTodos)
    saveTodos(newTodos)
  }

  // 组件加载时从localStorage读取数据
  useEffect(() => {
    const saved = localStorage.getItem('todos')
    if (saved) {
      setTodos(JSON.parse(saved))
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">待办事项</h1>
        
        <div className="flex mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="添加新的待办事项..."
            className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addTodo}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition"
          >
            添加
          </button>
        </div>

        <ul className="space-y-2">
          {todos.map((todo, index) => (
            <li 
              key={index} 
              className={`flex items-center justify-between p-3 border rounded-lg ${todo.completed ? 'bg-gray-50' : ''}`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(index)}
                  className="h-5 w-5 text-blue-500 rounded mr-3"
                />
                <span className={`${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {todo.text}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(index)}
                className="text-red-500 hover:text-red-700"
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* GitHub备份区域 */}
      <div className="mt-8 p-4 border-t border-gray-200">
        <h2 className="text-lg font-semibold mb-3">GitHub备份</h2>
        
        {!githubToken ? (
          <div className="space-y-3">
            <p>输入GitHub个人访问令牌进行备份:</p>
            <input
              type="password"
              placeholder="GitHub访问令牌"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
            <button
              onClick={() => {
                setGithubToken(input)
                setInput('')
                setBackupStatus('已连接GitHub')
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
            >
              连接
            </button>
            <p className="text-sm text-gray-600">
              需要在GitHub创建有gist权限的访问令牌
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-green-600">{backupStatus || '已连接GitHub'}</p>
            <button
              onClick={async () => {
                setIsBackingUp(true)
                try {
                  const result = await backupToGitHub(todos, githubToken)
                  setBackupStatus(`备份成功! Gist ID: ${result.id}`)
                } catch (error) {
                  setBackupStatus('备份失败: ' + error.message)
                } finally {
                  setIsBackingUp(false)
                }
              }}
              disabled={isBackingUp}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {isBackingUp ? '备份中...' : '备份到GitHub'}
            </button>
            <button
              onClick={() => setGithubToken('')}
              className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              断开连接
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App