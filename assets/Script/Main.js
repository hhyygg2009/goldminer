
// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        OreNumber: 0,
        MaxOreNumber: 20,
        Time: 60,

        Hook: {
            default: null,
            type: cc.Component,
        },
        OreArea: {
            default: null,
            type: cc.Component
        },
        OreData: {
            default: null,
            type: cc.JsonAsset
        },
        Ore: {
            default: null,
            type: cc.Prefab
        },

        GameOverUI: {
            default: null,
            type: cc.Component
        },
        ScoreController: {
            default: null,
            type: cc.Component
        }


        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        var manager = cc.director.getCollisionManager();//获取碰撞检测系统
        manager.enabled = true;//默认碰撞检测系统是禁用的，需要手动开启碰撞检测系统
        // manager.enabledDebugDraw = true;//开启后可在debug中显示碰撞区域        
    },



    start() {
        this.scorer = this.ScoreController.getComponent('Score')
        this.scorer.loadLevel()
        this.startTimer()
    },

    update(dt) {
        if (this.OreNumber < this.MaxOreNumber) {
            let num = Math.round(Math.random() * (this.OreData.json.length - 1))
            let data = this.OreData.json[num]
            this.generateOres(data)
        }
    },

    generateOres(data) {
        let ore = cc.instantiate(this.Ore)
        cc.resources.load('Atlas/level-sheet', cc.SpriteAtlas, function (err, atlas) {
            if (!err) {
                let spriteFrame = atlas.getSpriteFrame(data.res)
                ore.getComponent('Ore').score = data.score
                ore.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            } else {
                console.log(err)
            }
        });//更换图片外观

        ore.y = Math.random() * this.OreArea.node.height
        ore.x = Math.random() * this.OreArea.node.width

        this.OreArea.node.addChild(ore)
        this.OreNumber++
    },

    _GamePauseAminationCallBack() {
        cc.game.pause();
    },

    showGameOver(){
        this.GameOverUI.node.active=true
    },

    GameOver() {
        this.stopTimer()

        // this.showGameOver()
        // cc.game.pause()

        //显示弹出框
        let finished = cc.callFunc(this._GamePauseAminationCallBack, this);
        let action = cc.sequence(cc.scaleTo(0.3, 1, 1), finished);

        // action.easing(cc.easeBounceOut(0.3));
        var gameover = this.GameOverUI.getComponent('GameOver')
        if (this.scorer.Money > this.scorer.MaxScore) {
            this.scorer.setMaxScore()
        }
        if (this.scorer.canNext()) {
            gameover.setGameOverText(`恭喜你，通过本关！\n你的得分是${this.scorer.Money}\n当前最高得分为${this.scorer.MaxScore}`)
            this.scorer.LevelUp()

        } else {
            gameover.setGameOverText('时间到！游戏结束')
            this.scorer.setLevel(1)
            this.scorer.setMemMoney(0)
        }


        this.GameOverUI.node.runAction(action);
    },



    Next() {
        // GameOverUI.active=false
        // this.init()
        cc.game.resume()
        // clearInterval(this.timer)

        cc.director.loadScene('Game')

    },


    startTimer() {
        this.timer = setInterval(() => {
            this.Time--
            this.scorer.updateTime(this.Time)

            if (this.Time < 1) {
                this.GameOver()
            }

        }, 1000)
    },

    stopTimer() {
        clearInterval(this.timer)
    }


});
