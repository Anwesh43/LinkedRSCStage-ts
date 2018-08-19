const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
class LinkedRSCStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    lrsc : LinkedRSC = new LinkedRSC()
    animator : Animator = new Animator()

    constructor() {
        this.initCanvas()
        this.render()
        this.handleTap()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.lrsc.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.lrsc.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.lrsc.update(() => {
                        this.animator.stop()
                        this.render()
                    })
                })
            })
        }
    }

    static init() {
        const stage : LinkedRSCStage = new LinkedRSCStage()
    }
}

class State {
    scale : number = 0
    prevScale : number = 0
    dir : number = 0
    update(cb : Function) {
        this.scale += this.dir * 0.05
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number
    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class RSCNode {
    state : State = new State()
    prev : RSCNode
    next : RSCNode
    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new RSCNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const gap : number = w / (nodes + 1)
        var sc1 : number = Math.max(0.5, this.state.scale) * 2
        const sc2 : number = Math.max(0.5, Math.min(0, this.state.scale - 0.5)) * 2
        const index : number = this.i % 2
        sc1 = (1 - index) * sc1 + (1 - sc1) * index
        context.save()
        context.translate(gap * this.i + gap / 2 + gap * sc2, h/2)
        context.strokeStyle = 'white'
        context.beginPath()
        context.arc(0, 0, gap/4, 0, 2 * Math.PI)
        context.stroke()
        context.fillStyle = '#f44336'
        context.beginPath()
        context.arc(0, 0, gap / 8 + (gap / 8) * sc1, 0, 2 * Math.PI)
        context.fill()
        context.restore()
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : RSCNode {
        var curr : RSCNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedRSC {
    private curr : RSCNode = new RSCNode(0)
    private dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
