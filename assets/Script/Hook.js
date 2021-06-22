// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        HookStatus: 0,
        HookSpeed: 1,
        RotateSpeed: 0.5,
        Line: {
            default: null,
            type: cc.Component,
        },
        EmitHookBtn:{
            default: null,
            type: cc.Component,
        },
        ScoreController:{
            default: null,
            type: cc.Component,
        },
        Miner:{
            default: null,
            type: cc.Component,            
        },
        Main:{
            default: null,
            type: cc.Component,                
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

    // onLoad () {},

    start() {
        this.scorer=this.ScoreController.getComponent('Score')
        this.EmitHookBtn.node.on(cc.Node.EventType.TOUCH_END,this.EmitHookClick,this)
        this.anim=this.Miner.getComponent(cc.Animation)
        this.anim.play()
    },


    update(dt) {
        this.HookControl()

    },

    EmitHookClick(event){
        this.HookOut()
    },

    HookIn() {
        this.HookStatus = 2
        this.anim.play('MinerPullLight')
    },

    HookOut() {
        this.HookStatus = 1
    },

    onCollisionEnter(other, self) {
        if (this.HookStatus == 2) { return }
        if (other.node.group === 'wall') {
            this.HookIn()
        }
        if(other.node.group === "ore"){
            other.node.group="default"
            other.node.parent=this.getItem()
            other.node.setPosition(cc.v2(0,0))
            this.HookIn()
        }
    },

    getItem(){
        return this.node.getChildByName("Item")
    },

    // 收集上钩的物品
    cleanItem(){
        let items=this.getItem()
        items.children.forEach(item => {
            let score=item.getComponent('Ore').score
            this.scorer.addScore(score)
            let main=this.Main.getComponent('Main')
            main.OreNumber--
            item.destroy();
        });

    },

    HookRotate() {
        if (this.HookStatus == 0) {
            if (this.Line.node.angle <= -70) {
                this.RotateSpeed = Math.abs(this.RotateSpeed)
            } else if (this.Line.node.angle >= 70) {
                this.RotateSpeed = -Math.abs(this.RotateSpeed)
            }

            this.Line.node.angle += this.RotateSpeed
        }
    },

    onHookBack(){
        
    },

    HookControl(){
        //收回吊钩
        if (this.HookStatus == 2 && this.Line.node.height <= 30) {
            this.HookStatus = 0
            this.cleanItem()
            this.anim.play()
        }        
        switch (this.HookStatus) {
            case 0:
                this.HookRotate()
                break
            case 1:
                this.Line.node.height += this.HookSpeed
                break
            case 2:
                this.Line.node.height -= this.HookSpeed
                break
        }

    }

});
