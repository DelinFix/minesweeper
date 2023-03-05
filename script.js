
 const TILE_STATUSES = {
    HIDDEN: 'hidden',
    MINE: 'mine',
    NUMBER: 'number',
    MARKED: 'marked',
    QUESTION: 'question',
    CLICKED_MINE: 'clicked_mine'
}

let clocktimer

const firstCountNum = document.querySelector('[data-count="first"]')
const secondCountNum = document.querySelector('[data-count="second"]')
const thirdCountNum = document.querySelector('[data-count="third"]')

const firstTimer = document.querySelector('[data-timer="first"]')
const secondTimer = document.querySelector('[data-timer="second"]')
const thirdTimer = document.querySelector('[data-timer="third"]')

function updateMinesCount(activeMines) {
    if(activeMines % 10 === 0) {
        firstCountNum.style.backgroundPosition = "-126px 0px"
    }
    if(Math.floor(activeMines / 10) === 0) {
        secondCountNum.style.backgroundPosition = "-126px 0px"
    }
    if (Math.floor(activeMines / 100) === 0) {
        thirdCountNum.style.backgroundPosition = "-126px 0px"
    }
    firstCountNum.style.backgroundPosition = `-${(activeMines % 10) * 14 - 14}px 0px`
    secondCountNum.style.backgroundPosition = `-${Math.floor(activeMines / 10 % 10) * 14 - 14}px 0px`
    thirdCountNum.style.backgroundPosition = `-${Math.floor(activeMines / 100) * 14 - 14}px 0px`
}

function updateTimer() {
    let timer = 1;
    if(!clocktimer) {
        clocktimer = setInterval(() => {
            timer+=1
            if(timer > 999) {
                return
            }
            if(timer % 10 === 0) {
                firstTimer.style.backgroundPosition = "-126px 0px"
            }
            if(Math.floor(timer / 10) === 0) {
                secondTimer.style.backgroundPosition = "-126px 0px"
            }
            if (Math.floor(timer / 100) === 0) {
                thirdTimer.style.backgroundPosition = "-126px 0px"
            }
            firstTimer.style.backgroundPosition = `-${(timer % 10) * 14 - 14}px 0px`
            secondTimer.style.backgroundPosition = `-${Math.floor(timer / 10 % 10) * 14 - 14}px 0px`
            thirdTimer.style.backgroundPosition = `-${Math.floor(timer / 100) * 14 - 14}px 0px`
        }, 1000)
    }
}

function createBoard(size, minesNum) {
    const board = []
    const minePositions = getMinePositions(size, minesNum)

    for(let x = 0; x < size; x++) {
        const row = []
        for(let y = 0; y < size; y++) {
            const element = document.createElement('div')
            element.dataset.status = TILE_STATUSES.HIDDEN
            const tile = {
                element,
                x,
                y,
                mine: minePositions.some(positionMatch.bind(null, {x,y})),
                get status() {
                    return element.dataset.status
                },
                set status(value) {
                    this.element.dataset.status = value
                }
            }

            row.push(tile)
        }
        board.push(row)
    }

    return board
}

function getMinePositions(size,minesNum) {
    const positions = []

    while(positions.length < minesNum) {
        const position = {
            x: randomNum(size),
            y: randomNum(size),
        }

        if(!positions.some(pos => positionMatch(pos, position))){
            positions.push(position)
        }
    }

    return positions
}

function positionMatch(a,b) {
    return a.x === b.x && a.y === b.y
}

function randomNum(size) {
    return Math.floor(Math.random() * size)
}

function markTile(tile) {
    if(tile.status !== TILE_STATUSES.HIDDEN && tile.status !== TILE_STATUSES.MARKED && tile.status !== TILE_STATUSES.QUESTION) return
    if(tile.status === TILE_STATUSES.MARKED) {
        tile.status = TILE_STATUSES.QUESTION
    } else if(tile.status === TILE_STATUSES.QUESTION){
        tile.status = TILE_STATUSES.HIDDEN
    }
    else {
        tile.status = TILE_STATUSES.MARKED
    }
}

function listMinesLeft() {
    const markedTilesCount = board.reduce((count, row) => {
        return count + row.filter(tile => tile.status === TILE_STATUSES.MARKED).length
    }, 0)
    updateMinesCount(NUM_OF_MINES - markedTilesCount)
}

function revealTile(board, tile) {
    if(tile.status !== TILE_STATUSES.HIDDEN) {
        return
    }

    if(tile.mine) {
        tile.status = TILE_STATUSES.CLICKED_MINE
        return
    }

    tile.status = TILE_STATUSES.NUMBER
    const adjacentTiles = nearbyTiles(board, tile)
    const mines = adjacentTiles.filter(t => t.mine)
    if(mines.length === 0) {
        adjacentTiles.forEach(revealTile.bind(null, board))
    } else {
        tile.element.dataset.number = mines.length
    }
}

function nearbyTiles(board, {x,y}) {
    const tiles = []

    for(let xOffset = -1; xOffset <= 1; xOffset ++) {
        for(let yOffset = -1; yOffset <= 1; yOffset ++) {
            const tile = board[x+xOffset]?.[y+yOffset]
            if(tile) tiles.push(tile)
        }
    }

    return tiles
}

function checkGameEnd() {
    const win = checkWin(board)
    const lose = checkLose(board)
    
    if(win || lose) {
        boardElem.addEventListener('click', stopProp, {capture: true})
        boardElem.addEventListener('contextmenu', stopProp, {capture: true})
        boardElem.addEventListener('mousedown', stopProp, {capture: true})
        boardElem.addEventListener('mouseup', stopProp, {capture: true})
        window.clearInterval(clocktimer)
    }
    
    if(win) {
        resetElem.style.backgroundPosition = "-80px -24px"
    }
    if(lose) {
        resetElem.style.backgroundPosition = "-108px -24px"
        board.forEach(row => {
            row.forEach(tile => {
                // if(tile.status === TILE_STATUSES.MARKED) markTile(tile)
                if(tile.mine && tile.status !== TILE_STATUSES.CLICKED_MINE) {
                    tile.status = TILE_STATUSES.MINE
                    // revealTile(board, tile)
                }
            })
        })
    }
}

function stopProp(e) {
    e.stopImmediatePropagation()
}

function checkWin(board) {
    return board.every(row => {
        return row.every(tile => {
            return tile.status === TILE_STATUSES.NUMBER ||
                (tile.mine &&
                    (tile.status === TILE_STATUSES.HIDDEN ||
                        tile.status === TILE_STATUSES.MARKED))
        })
    })
}

function checkLose(board) {
    return board.some(row => {
        return row.some(tile => {
            return tile.status === TILE_STATUSES.MINE || tile.status === TILE_STATUSES.CLICKED_MINE
        })
    })
}

const BOARD_SIZE = 16
const NUM_OF_MINES = 15

let board
const boardElem = document.querySelector('.board')
const resetElem = document.querySelector('.reset')

resetElem.addEventListener('click', () => {
    resetElem.style.backgroundPosition = "-27px -24px"
    board = createBoard(BOARD_SIZE, NUM_OF_MINES)
    boardElem.innerHTML = ''
    fillBoard()
    boardElem.removeEventListener('click', stopProp, {capture: true})
    boardElem.removeEventListener('contextmenu', stopProp, {capture: true})
    boardElem.removeEventListener('mousedown', stopProp, {capture: true})
    boardElem.removeEventListener('mouseup', stopProp, {capture: true})
    setTimeout(() => {
        resetElem.style.backgroundPosition = "0px -24px"
    }, 100)
})

boardElem.style.setProperty('--size', BOARD_SIZE)

function fillBoard() {
    board.forEach(row => {
        row.forEach(tile => {
            boardElem.append(tile.element)
            tile.element.addEventListener('click', () => {
                revealTile(board, tile)
                checkGameEnd()
                updateTimer()
            })
            tile.element.addEventListener('mousedown', () => {
                resetElem.style.backgroundPosition = "-54px -24px"
            })
            tile.element.addEventListener('mouseup', () => {
                resetElem.style.backgroundPosition = "0px -24px"
            })
            tile.element.addEventListener('contextmenu', e => {
                e.preventDefault()
                markTile(tile)
                listMinesLeft()
            })
        })
    })
    updateMinesCount(NUM_OF_MINES)
}

window.onload = function() {
    board = createBoard(BOARD_SIZE, NUM_OF_MINES)
    fillBoard()
}