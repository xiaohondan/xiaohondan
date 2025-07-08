document.addEventListener('DOMContentLoaded', () => {
    // 游戏主类
    class Game2048 {
        constructor() {
            this.gridSize = 4; // 4x4网格
            this.cells = [];
            this.score = 0;
            this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
            this.gameOver = false;
            this.won = false;
            this.waitingForMove = false;
            this.tileContainer = document.getElementById('tile-container');
            this.scoreDisplay = document.getElementById('score');
            this.bestScoreDisplay = document.getElementById('best-score');
            this.messageContainer = document.querySelector('.game-message');
            
            // 初始化游戏
            this.init();
        }

        // 初始化游戏
        init() {
            // 初始化空的单元格数组
            this.cells = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
            
            // 清空方块容器
            this.tileContainer.innerHTML = '';
            
            // 重置分数
            this.score = 0;
            this.updateScore();
            this.updateBestScore();
            
            // 重置游戏状态
            this.gameOver = false;
            this.won = false;
            this.waitingForMove = false;
            
            // 隐藏游戏消息
            this.messageContainer.classList.remove('game-over', 'game-won');
            this.messageContainer.style.opacity = '0';
            this.messageContainer.querySelector('p').textContent = '';
            
            // 添加初始方块
            this.addRandomTile();
            this.addRandomTile();
            
            // 设置键盘事件监听
            this.setupEventListeners();
        }

        // 设置事件监听
        setupEventListeners() {
            // 键盘事件
            document.addEventListener('keydown', this.handleKeyPress.bind(this));
            
            // 触摸事件（移动端）
            let touchStartX, touchStartY, touchEndX, touchEndY;
            document.addEventListener('touchstart', (event) => {
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
            }, { passive: true });
            
            document.addEventListener('touchend', (event) => {
                touchEndX = event.changedTouches[0].clientX;
                touchEndY = event.changedTouches[0].clientY;
                
                const dx = touchEndX - touchStartX;
                const dy = touchEndY - touchStartY;
                
                // 确定滑动方向
                if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) {
                    // 水平滑动
                    if (dx > 0) {
                        this.move('right');
                    } else {
                        this.move('left');
                    }
                } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 20) {
                    // 垂直滑动
                    if (dy > 0) {
                        this.move('down');
                    } else {
                        this.move('up');
                    }
                }
            }, { passive: true });
            
            // 重新开始按钮
            document.getElementById('restart').addEventListener('click', () => {
                this.init();
            });
            
            // 再试一次按钮
            document.querySelector('.retry-button').addEventListener('click', () => {
                this.init();
            });
        }

        // 处理键盘按键
        handleKeyPress(event) {
            if (this.gameOver || this.waitingForMove) return;
            
            switch (event.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    event.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    event.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    event.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    event.preventDefault();
                    this.move('right');
                    break;
            }
        }

        // 移动方块
        move(direction) {
            if (this.gameOver || this.waitingForMove) return;
            
            this.waitingForMove = true;
            
            // 创建网格副本用于比较
            const previousGrid = this.cells.map(row => [...row]);
            
            // 根据方向移动方块
            let moved = false;
            
            if (direction === 'up') {
                moved = this.moveUp();
            } else if (direction === 'down') {
                moved = this.moveDown();
            } else if (direction === 'left') {
                moved = this.moveLeft();
            } else if (direction === 'right') {
                moved = this.moveRight();
            }
            
            // 如果有移动，添加新方块
            if (moved) {
                setTimeout(() => {
                    this.addRandomTile();
                    
                    // 检查游戏状态
                    if (this.checkWin()) {
                        this.showMessage('你赢了!', 'game-won');
                        this.won = true;
                    } else if (this.checkGameOver()) {
                        this.showMessage('游戏结束!', 'game-over');
                        this.gameOver = true;
                    }
                    
                    this.waitingForMove = false;
                }, 150);
            } else {
                this.waitingForMove = false;
            }
        }

        // 向上移动
        moveUp() {
            let moved = false;
            
            for (let col = 0; col < this.gridSize; col++) {
                for (let row = 1; row < this.gridSize; row++) {
                    if (this.cells[row][col] !== null) {
                        let currentRow = row;
                        
                        // 向上移动直到碰到另一个方块或边界
                        while (currentRow > 0 && this.cells[currentRow - 1][col] === null) {
                            this.cells[currentRow - 1][col] = this.cells[currentRow][col];
                            this.cells[currentRow][col] = null;
                            currentRow--;
                            moved = true;
                        }
                        
                        // 检查是否可以合并
                        if (currentRow > 0 && 
                            this.cells[currentRow - 1][col] !== null && 
                            this.cells[currentRow - 1][col].value === this.cells[currentRow][col].value &&
                            !this.cells[currentRow - 1][col].merged) {
                            
                            // 合并方块
                            const mergedValue = this.cells[currentRow][col].value * 2;
                            this.cells[currentRow - 1][col].value = mergedValue;
                            this.cells[currentRow - 1][col].merged = true;
                            this.cells[currentRow - 1][col].element.className = `tile tile-${mergedValue} tile-merged`;
                            this.cells[currentRow - 1][col].element.textContent = mergedValue;
                            
                            // 移除被合并的方块
                            this.tileContainer.removeChild(this.cells[currentRow][col].element);
                            this.cells[currentRow][col] = null;
                            
                            // 更新分数
                            this.updateScore(mergedValue);
                            moved = true;
                        }
                    }
                }
            }
            
            // 更新方块位置
            if (moved) {
                this.updateTilePositions();
            }
            
            return moved;
        }

        // 向下移动
        moveDown() {
            let moved = false;
            
            for (let col = 0; col < this.gridSize; col++) {
                for (let row = this.gridSize - 2; row >= 0; row--) {
                    if (this.cells[row][col] !== null) {
                        let currentRow = row;
                        
                        // 向下移动直到碰到另一个方块或边界
                        while (currentRow < this.gridSize - 1 && this.cells[currentRow + 1][col] === null) {
                            this.cells[currentRow + 1][col] = this.cells[currentRow][col];
                            this.cells[currentRow][col] = null;
                            currentRow++;
                            moved = true;
                        }
                        
                        // 检查是否可以合并
                        if (currentRow < this.gridSize - 1 && 
                            this.cells[currentRow + 1][col] !== null && 
                            this.cells[currentRow + 1][col].value === this.cells[currentRow][col].value &&
                            !this.cells[currentRow + 1][col].merged) {
                            
                            // 合并方块
                            const mergedValue = this.cells[currentRow][col].value * 2;
                            this.cells[currentRow + 1][col].value = mergedValue;
                            this.cells[currentRow + 1][col].merged = true;
                            this.cells[currentRow + 1][col].element.className = `tile tile-${mergedValue} tile-merged`;
                            this.cells[currentRow + 1][col].element.textContent = mergedValue;
                            
                            // 移除被合并的方块
                            this.tileContainer.removeChild(this.cells[currentRow][col].element);
                            this.cells[currentRow][col] = null;
                            
                            // 更新分数
                            this.updateScore(mergedValue);
                            moved = true;
                        }
                    }
                }
            }
            
            // 更新方块位置
            if (moved) {
                this.updateTilePositions();
            }
            
            return moved;
        }

        // 向左移动
        moveLeft() {
            let moved = false;
            
            for (let row = 0; row < this.gridSize; row++) {
                for (let col = 1; col < this.gridSize; col++) {
                    if (this.cells[row][col] !== null) {
                        let currentCol = col;
                        
                        // 向左移动直到碰到另一个方块或边界
                        while (currentCol > 0 && this.cells[row][currentCol - 1] === null) {
                            this.cells[row][currentCol - 1] = this.cells[row][currentCol];
                            this.cells[row][currentCol] = null;
                            currentCol--;
                            moved = true;
                        }
                        
                        // 检查是否可以合并
                        if (currentCol > 0 && 
                            this.cells[row][currentCol - 1] !== null && 
                            this.cells[row][currentCol - 1].value === this.cells[row][currentCol].value &&
                            !this.cells[row][currentCol - 1].merged) {
                            
                            // 合并方块
                            const mergedValue = this.cells[row][currentCol].value * 2;
                            this.cells[row][currentCol - 1].value = mergedValue;
                            this.cells[row][currentCol - 1].merged = true;
                            this.cells[row][currentCol - 1].element.className = `tile tile-${mergedValue} tile-merged`;
                            this.cells[row][currentCol - 1].element.textContent = mergedValue;
                            
                            // 移除被合并的方块
                            this.tileContainer.removeChild(this.cells[row][currentCol].element);
                            this.cells[row][currentCol] = null;
                            
                            // 更新分数
                            this.updateScore(mergedValue);
                            moved = true;
                        }
                    }
                }
            }
            
            // 更新方块位置
            if (moved) {
                this.updateTilePositions();
            }
            
            return moved;
        }

        // 向右移动
        moveRight() {
            let moved = false;
            
            for (let row = 0; row < this.gridSize; row++) {
                for (let col = this.gridSize - 2; col >= 0; col--) {
                    if (this.cells[row][col] !== null) {
                        let currentCol = col;
                        
                        // 向右移动直到碰到另一个方块或边界
                        while (currentCol < this.gridSize - 1 && this.cells[row][currentCol + 1] === null) {
                            this.cells[row][currentCol + 1] = this.cells[row][currentCol];
                            this.cells[row][currentCol] = null;
                            currentCol++;
                            moved = true;
                        }
                        
                        // 检查是否可以合并
                        if (currentCol < this.gridSize - 1 && 
                            this.cells[row][currentCol + 1] !== null && 
                            this.cells[row][currentCol + 1].value === this.cells[row][currentCol].value &&
                            !this.cells[row][currentCol + 1].merged) {
                            
                            // 合并方块
                            const mergedValue = this.cells[row][currentCol].value * 2;
                            this.cells[row][currentCol + 1].value = mergedValue;
                            this.cells[row][currentCol + 1].merged = true;
                            this.cells[row][currentCol + 1].element.className = `tile tile-${mergedValue} tile-merged`;
                            this.cells[row][currentCol + 1].element.textContent = mergedValue;
                            
                            // 移除被合并的方块
                            this.tileContainer.removeChild(this.cells[row][currentCol].element);
                            this.cells[row][currentCol] = null;
                            
                            // 更新分数
                            this.updateScore(mergedValue);
                            moved = true;
                        }
                    }
                }
            }
            
            // 更新方块位置
            if (moved) {
                this.updateTilePositions();
            }
            
            return moved;
        }

        // 更新方块位置
        updateTilePositions() {
            // 重置合并状态
            for (let row = 0; row < this.gridSize; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    if (this.cells[row][col] !== null) {
                        this.cells[row][col].merged = false;
                        
                        // 更新方块位置
                        const x = col * 25;
                        const y = row * 25;
                        this.cells[row][col].element.style.transform = `translate(${x}%, ${y}%)`;
                    }
                }
            }
        }

        // 添加随机方块
        addRandomTile() {
            // 获取所有空单元格
            const emptyCells = [];
            for (let row = 0; row < this.gridSize; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    if (this.cells[row][col] === null) {
                        emptyCells.push({ row, col });
                    }
                }
            }
            
            // 如果没有空单元格，返回
            if (emptyCells.length === 0) return;
            
            // 随机选择一个空单元格
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            
            // 90%概率生成2，10%概率生成4
            const value = Math.random() < 0.9 ? 2 : 4;
            
            // 创建新方块元素
            const tileElement = document.createElement('div');
            tileElement.className = `tile tile-${value} tile-new`;
            tileElement.textContent = value;
            
            // 设置方块位置
            const x = randomCell.col * 25;
            const y = randomCell.row * 25;
            tileElement.style.transform = `translate(${x}%, ${y}%)`;
            
            // 添加到方块容器
            this.tileContainer.appendChild(tileElement);
            
            // 更新单元格数组
            this.cells[randomCell.row][randomCell.col] = {
                value: value,
                element: tileElement,
                merged: false
            };
        }

        // 更新分数
        updateScore(addScore = 0) {
            this.score += addScore;
            this.scoreDisplay.textContent = this.score;
            
            // 更新最高分
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                this.updateBestScore();
                localStorage.setItem('bestScore', this.bestScore);
            }
        }

        // 更新最高分
        updateBestScore() {
            this.bestScoreDisplay.textContent = this.bestScore;
        }

        // 检查是否获胜
        checkWin() {
            for (let row = 0; row < this.gridSize; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    if (this.cells[row][col] !== null && this.cells[row][col].value === 2048) {
                        return true;
                    }
                }
            }
            return false;
        }

        // 检查游戏是否结束
        checkGameOver() {
            // 检查是否有空单元格
            for (let row = 0; row < this.gridSize; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    if (this.cells[row][col] === null) {
                        return false;
                    }
                }
            }
            
            // 检查是否有可合并的方块
            for (let row = 0; row < this.gridSize; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    const value = this.cells[row][col].value;
                    
                    // 检查右侧
                    if (col < this.gridSize - 1 && this.cells[row][col + 1].value === value) {
                        return false;
                    }
                    
                    // 检查下方
                    if (row < this.gridSize - 1 && this.cells[row + 1][col].value === value) {
                        return false;
                    }
                }
            }
            
            return true;
        }

        // 显示游戏消息
        showMessage(message, className) {
            this.messageContainer.querySelector('p').textContent = message;
            this.messageContainer.classList.add(className);
            this.messageContainer.style.opacity = '1';
        }
    }

    // 创建游戏实例
    const game = new Game2048();
});