var w = window.innerWidth, h = window.innerHeight;
var nodes = 5;
var LinkedRSCStage = (function () {
    function LinkedRSCStage() {
        this.canvas = document.createElement('canvas');
        this.lrsc = new LinkedRSC();
        this.animator = new Animator();
        this.initCanvas();
        this.render();
        this.handleTap();
    }
    LinkedRSCStage.prototype.initCanvas = function () {
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    };
    LinkedRSCStage.prototype.render = function () {
        this.context.fillStyle = '#212121';
        this.context.fillRect(0, 0, w, h);
        this.lrsc.draw(this.context);
    };
    LinkedRSCStage.prototype.handleTap = function () {
        var _this = this;
        this.canvas.onmousedown = function () {
            _this.lrsc.startUpdating(function () {
                _this.animator.start(function () {
                    _this.render();
                    _this.lrsc.update(function () {
                        _this.animator.stop();
                        _this.render();
                    });
                });
            });
        };
    };
    LinkedRSCStage.init = function () {
        var stage = new LinkedRSCStage();
    };
    return LinkedRSCStage;
})();
var State = (function () {
    function State() {
        this.scale = 0;
        this.prevScale = 0;
        this.dir = 0;
    }
    State.prototype.update = function (cb) {
        this.scale += this.dir * 0.05;
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir;
            this.dir = 0;
            this.prevScale = this.scale;
            cb();
        }
    };
    State.prototype.startUpdating = function (cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale;
            cb();
        }
    };
    return State;
})();
var Animator = (function () {
    function Animator() {
        this.animated = false;
    }
    Animator.prototype.start = function (cb) {
        if (!this.animated) {
            this.animated = true;
            this.interval = setInterval(cb, 50);
        }
    };
    Animator.prototype.stop = function () {
        if (this.animated) {
            this.animated = false;
            clearInterval(this.interval);
        }
    };
    return Animator;
})();
var RSCNode = (function () {
    function RSCNode(i) {
        this.i = i;
        this.state = new State();
        this.addNeighbor();
    }
    RSCNode.prototype.addNeighbor = function () {
        if (this.i < nodes - 1) {
            this.next = new RSCNode(this.i + 1);
            this.next.prev = this;
        }
    };
    RSCNode.prototype.draw = function (context) {
        context.lineWidth = Math.min(w, h) / 60;
        var gap = w / (nodes + 1);
        var sc1 = Math.min(0.5, this.state.scale) * 2;
        var sc2 = Math.min(0.5, Math.max(0, this.state.scale - 0.5)) * 2;
        var index = this.i % 2;
        sc1 = (1 - index) * sc1 + (1 - sc1) * index;
        context.save();
        context.translate(gap * this.i + gap / 2 + gap * sc2, h / 2);
        context.strokeStyle = 'white';
        context.beginPath();
        context.arc(0, 0, gap / 4, 0, 2 * Math.PI);
        context.stroke();
        context.fillStyle = '#f44336';
        context.beginPath();
        context.arc(0, 0, gap / 8 + (gap / 8) * sc1, 0, 2 * Math.PI);
        context.fill();
        context.restore();
        if (this.next) {
            this.next.draw(context);
        }
    };
    RSCNode.prototype.update = function (cb) {
        this.state.update(cb);
    };
    RSCNode.prototype.startUpdating = function (cb) {
        this.state.startUpdating(cb);
    };
    RSCNode.prototype.getNext = function (dir, cb) {
        var curr = this.prev;
        if (dir == 1) {
            curr = this.next;
        }
        if (curr) {
            return curr;
        }
        cb();
        return this;
    };
    return RSCNode;
})();
var LinkedRSC = (function () {
    function LinkedRSC() {
        this.curr = new RSCNode(0);
        this.dir = 1;
    }
    LinkedRSC.prototype.draw = function (context) {
        this.curr.draw(context);
    };
    LinkedRSC.prototype.update = function (cb) {
        var _this = this;
        this.curr.update(function () {
            _this.curr = _this.curr.getNext(_this.dir, function () {
                _this.dir *= -1;
            });
            cb();
        });
    };
    LinkedRSC.prototype.startUpdating = function (cb) {
        this.curr.startUpdating(cb);
    };
    return LinkedRSC;
})();
