const fs = require('fs');
const readline = require('readline');

// 加载待办数据
let todos = JSON.parse(fs.readFileSync('todos.json', 'utf8'));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function saveTodos() {
  fs.writeFileSync('todos.json', JSON.stringify(todos, null, 2));
}

function displayTodos() {
  console.log('\n当前待办事项:');
  todos.todos.forEach(todo => {
    console.log(`[${todo.completed ? '✓' : ' '}] ${todo.id}: ${todo.title}`);
    if (todo.description) {
      console.log(`   描述: ${todo.description}`);
    }
  });
  console.log('');
}

function addTodo() {
  rl.question('请输入待办事项标题: ', title => {
    if (!title.trim()) {
      console.log('错误: 标题不能为空');
      return showMenu();
    }
    
    rl.question('请输入描述(可选): ', description => {
      const newTodo = {
        id: todos.nextId++,
        title: title.trim(),
        description: (description || '').trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      todos.todos.push(newTodo);
      saveTodos();
      console.log('已添加新待办事项!');
      displayTodos();
      showMenu();
    });
  });
}

function toggleComplete() {
  rl.question('请输入要标记的待办事项ID: ', id => {
    if (!id || isNaN(id)) {
      console.log('错误: 请输入有效的数字ID');
      return showMenu();
    }
    
    const todo = todos.todos.find(t => t.id === parseInt(id));
    if (todo) {
      todo.completed = !todo.completed;
      saveTodos();
      console.log(`已更新待办事项 ${id}`);
    } else {
      console.log(`错误: 未找到ID为 ${id} 的待办事项`);
    }
    displayTodos();
    showMenu();
  });
}

function deleteTodo() {
  rl.question('请输入要删除的待办事项ID: ', id => {
    if (!id || isNaN(id)) {
      console.log('错误: 请输入有效的数字ID');
      return showMenu();
    }

    const index = todos.todos.findIndex(t => t.id === parseInt(id));
    if (index !== -1) {
      todos.todos.splice(index, 1);
      saveTodos();
      console.log(`已删除待办事项 ${id}`);
    } else {
      console.log(`错误: 未找到ID为 ${id} 的待办事项`);
    }
    displayTodos();
    showMenu();
  });
}

function showMenu() {
  console.log(`
待办事项管理器
1. 查看所有待办事项
2. 添加新待办事项
3. 标记完成/未完成
4. 删除待办事项
5. 退出
`);

  rl.question('请选择操作(1-5): ', choice => {
    if (!['1','2','3','4','5'].includes(choice)) {
      console.log('错误: 请输入1-5之间的有效数字');
      return showMenu();
    }

    switch(choice) {
      case '1':
        displayTodos();
        showMenu();
        break;
      case '2':
        addTodo();
        break;
      case '3':
        toggleComplete();
        break;
      case '4':
        deleteTodo();
        break;
      case '5':
        rl.question('确定要退出吗？(y/n): ', answer => {
          if (answer.toLowerCase() === 'y') {
            rl.close();
          } else {
            showMenu();
          }
        });
        break;
    }
  });
}

// 启动应用
displayTodos();
showMenu();