var GameServer = GameServer || {};

GameServer.serverNumber = -1;

GameServer.Phase = {READY: 0, COUNT: -1, START: 1, MAIN: 2, MUSIC: 3, GAMEEND: 4};
GameServer.connectCount = 0;
GameServer.disconnectCount = 0;

GameServer.currentPlayer = [];
GameServer.playingRoom = [];

GameServer.findRoom = function(roomId)
{
    for (let i = 0; i < GameServer.playingRoom.length; i++)
    {
        if (GameServer.playingRoom[i].roomId === roomId) return GameServer.playingRoom[i];
    }
    console.log(new Date().toLocaleTimeString('ko-KR') + ' [ERR] no room with num ' + roomId);
}
GameServer.findPlayerSocket = function(playerId)
{
    var idx = this.currentPlayer.findIndex(function(element)
    {
        return element.playerData.id === playerId;
    });
    if (idx != -1) return this.currentPlayer[idx];
    else
    {
        console.log(new Date().toLocaleTimeString('ko-KR') + ' [ERR] wrong playerId('+ playerId +') to find');
        return null;
    }
}
GameServer.enterEmptyRoom = function(playerSocket)
{
    let emptyRoomIndex = -1;
    for (let i = 0; i < this.playingRoom.length; i++)
    {
        if ((this.playingRoom[i].currentPhase === this.Phase.READY || this.playingRoom[i].currentPhase === this.Phase.COUNT)
         && this.playingRoom[i].maxPlayer > this.playingRoom[i].currentPlayer.length
         && this.playingRoom[i].checkHopae(playerSocket.playerData.nickname))
        {
            emptyRoomIndex = i;
            break;
        }
    }
    if (emptyRoomIndex != -1)
    {
        this.playingRoom[emptyRoomIndex].enterRoom(playerSocket);
    }
    else
    {
        let newRoom = new GameRoom();
        newRoom.enterRoom(playerSocket);
    }
}
GameServer.getPlayerNumber = function()
{
    do
    {
        var num = Math.floor(Math.random() * 1000 + 1);
        if (this.currentPlayer.findIndex(function(element)
        {
            return element.id === num;
        }) === -1) return num;
    } while (true)
}
GameServer.getRoomNumber = function()
{
    do
    {
        var num = Math.floor(Math.random() * 1000 + 1);
        if (this.playingRoom.findIndex(function(element)
        {
            return element.roomId === num;
        }) === -1) return num;
    } while (true)
}

class GameRoom
{
    constructor()
    {
        this.roomId = GameServer.getRoomNumber();
        this.roomIndex = -1;
        this.startCount = 5;
        this.maxPlayer = 100;
        this.nextRank = 100;

        this.startTime = 0;
        this.currentPlayer = [];
        this.aliveCount = 0;
        this.currentSocket = [];
        this.currentPhase = GameServer.Phase.READY;
        
        this.phaseChanger = -1;
        this.countEndTime = 0;
        this.rateArrangePoint = 300;
        this.maxTypingPlayer = null;
        this.minTypingPlayer = null;

        for (let i = 0; i < GameServer.playingRoom.length; i++)
        {
            if (GameServer.playingRoom[i] === null)
            {
                this.roomIndex = i;
                break;
            }
        }
        if (this.roomIndex === -1)
        {
            this.roomIndex = GameServer.playingRoom.length;
            GameServer.playingRoom.push(this);
        }
        else
        {
            GameServer.playingRoom[this.roomIndex] = this;
        }
        console.log(new Date().toLocaleTimeString('ko-KR') + ' [LOG] new room #'+this.roomId+' made, roomCount: ' + GameServer.playingRoom.length);
    }

    checkHopae(newHopae)
    {
        return !this.currentPlayer.includes((element) => element.nickname === newHopae);
    }

    enterRoom(playerSocket)
    {
        let playerInst = new Player(this, playerSocket.playerData);
        
        playerSocket.playerData.playingData = playerInst;
        playerSocket.playerData.currentRoom = this;
        playerSocket.playerData.isReceivable = true;

        playerSocket.emit('enterRoom');
        this.currentSocket.push(playerSocket);
        this.announceToTarget(playerInst.id, 'syncRoomScene', this.currentPlayer);
        this.currentPlayer.push(playerInst);

        console.log(new Date().toLocaleTimeString('ko-KR') + ' [' + playerInst.id + '] entered to room #' + this.roomId);

        this.aliveCount++;
        if (this.currentPlayer.length >= this.startCount)
        {
            if (this.currentPhase === GameServer.Phase.READY)
            {
                this.countStartTime = Date.now();
                this.endTime = 30000; // 방 대기 시간
                this.announceToRoom('setRoomCount', 
                {
                    isEnable: true, endTime: this.endTime, playerCount: this.currentPlayer.length,
                    isEnter: true, player: playerInst // 나중에는 플레이어의 외양데이터도 보내야됨
                });
                this.currentPhase = GameServer.Phase.COUNT;
            }
            else if (this.currentPhase === GameServer.Phase.COUNT)
            {
                this.endTime = this.endTime - (Time.now() - this.countStartTime);
                this.announceToRoom('setRoomCount', 
                {
                    isEnable: true, endTime: this.endTime, playerCount: this.currentPlayer.length,
                    isEnter: true, player: playerInst
                });
            }
        }
        else
        {
            this.announceToRoom('setRoomCount', 
            {
                isEnable: false, endTime: 0, playerCount: this.currentPlayer.length,
                isEnter: true, player: playerInst
            });
            this.currentPhase = GameServer.Phase.READY;
        }
    }

    exitRoom(playerId)
    {
        for (let i = 0; i < this.currentPlayer.length; i++)
        {
            if (this.currentPlayer[i].id === playerId)
            {
                for (let j = i+1; j < this.currentPlayer.length; j++)
                {
                    this.currentPlayer[j].index--;
                }
                this.aliveCount--;
                if (this.aliveCount < this.startCount)
                {
                    this.announceToRoom('setRoomCount', 
                    {
                        isEnable: false, endTime: 0, playerCount: this.currentPlayer.length,
                        isEnter: false, player: this.currentPlayer[i]
                    });
                    this.currentPhase = GameServer.Phase.READY;
                }
                else this.announceToRoom('setRoomCount', 
                    {
                        isEnable: true, endTime: this.endTime, playerCount: this.currentPlayer.length,
                        isEnter: false, player: this.currentPlayer[i]
                    });
                this.currentPlayer.splice(i, 1);
                this.currentSocket.splice(i, 1);
                return;
            }
        }
        console.log(new Date().toLocaleTimeString('ko-KR') + ' [ERR] No player who have ' + playerId);
        return;
    }

    refreshRoom()
    {
        this.currentPhase = GameServer.Phase.READY;
        this.aliveCount = this.currentPlayer.length;
        if (this.startTimer != undefined) 
        {
            clearTimeout(this.startTimer);
            this.startTimer = undefined;
        }
        if (this.currentPhase != GameServer.Phase.GAMEEND)
        {
            this.announceToRoom('enterRoom');
            this.announceToRoom('syncRoomScene', this.currentPlayer);
            this.announceToRoom('setRoomCount', {
                isEnable: false, endTime: 0, playerCount: this.currentPlayer.length,
                isEnter: false, player: {id: -1}
            });
            console.error(new Date().toLocaleTimeString('ko-KR') + ' [ROOM#' + this.roomId + '] room Refreshed');
        }
        else
        {
            this.startTime = 0;
            this.currentPlayer = [];
            this.aliveCount = 0;
            this.currentSocket = [];
            this.currentPhase = GameServer.Phase.READY;
            
            this.phaseChanger = -1;
            this.countEndTime = 0;
            this.rateArrangePoint = 300;
            this.maxTypingPlayer = null;
            this.minTypingPlayer = null;
            console.log(new Date().toLocaleTimeString('ko-KR') + ' [ROOM#' + this.roomId + '] room Refreshed with End of Game');
        }
    }
    
    startRoom()
    {
        this.currentPhase = GameServer.Phase.START;
        this.maxTypingPlayer = this.currentPlayer[0];
        this.minTypingPlayer = this.currentPlayer[0];
        this.nextRank = this.currentPlayer.length;
        this.aliveCount = this.currentPlayer.length;
        this.currentSocket.forEach(function(element)
        {
            element.playerData.isReceivable = true;
        });

        let toSync =
        {
            roomId: this.roomId,
            players: this.currentPlayer
        };
        this.announceToRoom('syncRoomData', toSync);

        console.log(new Date().toLocaleTimeString('ko-KR') + ' [ROOM#'+this.roomId+'] Game Start with ' + this.currentPlayer.length + ' players');
        console.table(this.currentPlayer);
        this.announceToRoom('startGame');
        this.startTime = Date.now();
        setTimeout(function()
        {
            if (this.currentPhase === GameServer.Phase.START) this.checkPhase(Date.now());
        }.bind(this), 6000);
    }

    checkPhase(checkTime)
    {
        if (this.currentPhase === GameServer.Phase.START)
        {
            if (checkTime - this.startTime > 6000)
            {
                this.currentPhase = GameServer.Phase.MAIN;
                this.rateArrangePoint = 150;
                this.announceToRoom('changePhase', GameServer.Phase.MAIN);
            }
        }
        else if (this.currentPhase === GameServer.Phase.MAIN)
        {
            let playerLimit = Math.max(Math.round(this.currentPlayer.length / 5), 3);
            if (this.aliveCount <= playerLimit)
            {
                this.currentPhase = GameServer.Phase.MUSIC;
                this.rateArrangePoint = 50;
                this.announceToRoom('changePhase', GameServer.Phase.MUSIC);
            }
        }
    }

    endRoom()
    {

    }

    destroyRoom()
    {
        if (this.aliveCount > 0)
        {
            console.log(new Date().toLocaleTimeString('ko-KR') + ' [ERR] can not destroy room#' + this.roomId + ', cause player left');
        }
        else
        {
            let idx = GameServer.playingRoom.findIndex(function(element)
            {
                return element.roomId === this.roomId;
            });
            if (idx != -1)
            {
                GameServer.playingRoom[idx] = null;
            }
        }
    }

    announceToRoom(_message, _data = null)
    {
        if (this.currentPhase != GameServer.Phase.GAMEEND)
        {
            this.currentSocket.forEach(function(element)
            {
                if(element.playerData.playingData.isInThisRoom) element.emit(_message, _data);
            });
        }
    }

    announceToTarget(targetId, _message, _data = null)
    {
        if (this.currentPhase != GameServer.Phase.GAMEEND)
        {
            let targetSocketIndex = this.currentSocket.findIndex(function(element)
            {
                return element.playerData.id === targetId;
            });
            //console.log('send to ' + targetSocketIndex + ', receivable? ' + this.currentSocket[targetSocketIndex].playerData.isReceivable);
            if (targetSocketIndex != -1 && this.currentSocket[targetSocketIndex].playerData.isReceivable) this.currentSocket[targetSocketIndex].emit(_message, _data);
        }
    }
}

class Player
{
    constructor(gameRoom, playerData)
    {
        this.id = playerData.id;
        this.gameRoomId = gameRoom.roomId;
        this.index = gameRoom.currentPlayer.length;
        this.nickname = playerData.nickname;
        this.playerImage = null;
        this.mat = null;
        this.position = null;
        this.killCount = 0;
        this.earnedStrongHopae = 0;
        this.attackSucceed = 0;
        this.skin = playerData.skin;

        this.isAlive = false;
        this.isInThisRoom = true;
        this.rank = -1;

        this.playerTyping = 0;
        this.lastAttacks = []; // { attackerId, attacker, wrongCount, word, wordGrade, time }
        this.lastAttack = null;
    }

    defeat()
    {
        let player = this;
        let room = GameServer.findRoom(this.gameRoomId);
        let socket = GameServer.findPlayerSocket(this.id);

        this.isAlive = false;
        this.rank = room.nextRank--;
        if (this.tabCheckTime != undefined) clearTimeout(this.tabCheckTime);
        socket.playerData.isReceivable = false;
        room.aliveCount--;

        if (room.aliveCount > 0)
        {
            room.checkPhase(Date.now());
            
            if (this.lastAttacks.length > 0)
            {
                this.lastAttack = this.lastAttacks[this.lastAttacks.length - 1];
                if (Date.now() - this.lastAttack.time > 20000) this.lastAttack = null;
                else
                {
                    this.lastAttacks.forEach(function(element)
                    {
                        if (Date.now() - element.time < 20000)
                        {
                            if (element.wrongCount > player.lastAttack.wrongCount) player.lastAttack = element;
                            else if (element.wrongCount === player.lastAttack.wrongCount && element.wordGrade > player.lastAttack.wordGrade) player.lastAttack = element;
                        } 
                    });
                }
            }

            room.announceToRoom('defeat', this);
            console.log(new Date().toLocaleTimeString('ko-KR') + ' [' + this.id + '] defeated, rank: ' + this.rank + ', ' + room.aliveCount + ' player left');

            if (room.aliveCount === 1)
            {
                let winner = room.currentPlayer.find(function(element)
                {
                    return element.isAlive;
                });
                if (winner.tabCheckTime != undefined) clearTimeout(winner.tabCheckTime);
                room.announceToRoom('gameEnd', winner.id);
                room.announceToTarget(winner.id, 'alert', 'gameWin');
                room.currentPhase = GameServer.Phase.GAMEEND;
                console.log(new Date().toLocaleTimeString('ko-KR') + ' ['+winner.id+']' + ' winner! ' + winner.nickname);
            }
        }
    }
}

module.exports = GameServer;