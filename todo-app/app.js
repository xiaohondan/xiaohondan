document.addEventListener('DOMContentLoaded', function() {
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    
    // 从本地存储加载待办事项
    loadTodos();

    // 添加待办事项
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    function addTodo() {
        const todoText = todoInput.value.trim();
        if (todoText) {
            // 创建新的待办事项元素
            const li = document.createElement('li');
            li.className = 'todo-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.addEventListener('change', toggleComplete);
            
            const span = document.createElement('span');
            span.className = 'todo-text';
            span.textContent = todoText;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '删除';
            deleteBtn.addEventListener('click', deleteTodo);
            
            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);
            
            todoList.appendChild(li);
            
            // 清空输入框
            todoInput.value = '';
            
            // 保存到本地存储
            saveTodos();
        }
    }

    function toggleComplete(e) {
        const todoItem = e.target.parentElement;
        const todoText = todoItem.querySelector('.todo-text');
        todoText.classList.toggle('completed');
        saveTodos();
    }

    function deleteTodo(e) {
        const todoItem = e.target.parentElement;
        todoItem.remove();
        saveTodos();
    }

    function saveTodos() {
        const todos = [];
        document.querySelectorAll('.todo-item').forEach(item => {
            todos.push({
                text: item.querySelector('.todo-text').textContent,
                completed: item.querySelector('input[type="checkbox"]').checked
            });
        });
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function loadTodos() {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.completed;
            checkbox.addEventListener('change', toggleComplete);
            
            const span = document.createElement('span');
            span.className = 'todo-text';
            span.textContent = todo.text;
            if (todo.completed) {
                span.classList.add('completed');
            }
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '删除';
            deleteBtn.addEventListener('click', deleteTodo);
            
            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);
            
            todoList.appendChild(li);
        });
    }
});