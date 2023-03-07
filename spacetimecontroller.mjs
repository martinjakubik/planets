class SpaceTimeController {
    constructor() {
        this.time = 0;
        this.spaceTimeModel = [];
    }

    setTime(nTime) {
        this.time = nTime;
    }

    getTime() {
        return this.time;
    }

    incrementTime(nTicks = 1) {
        this.time = this.time + nTicks;
    }

    getBodyAt(dx, dy) {
        const nTime = this.time;
        const x = Math.floor(dx);
        const y = Math.floor(dy);
        const aSpace = this.spaceTimeModel[nTime];
        const aXAxis = aSpace ? aSpace[x] : null;
        return aXAxis ? aXAxis[y] : null;
    }

    updateBodyAt(dx, dy, oBody) {
        const nTime = this.time;
        const x = Math.floor(dx);
        const y = Math.floor(dy);
        const nMoveToX = Math.floor(oBody.position.x);
        const nMoveToY = Math.floor(oBody.position.y);
        if (!this.spaceTimeModel[nTime]) {
            this.spaceTimeModel[nTime] = [];
        }
        if (x === oBody.position.x && y === oBody.position.y) {
            if (!this.spaceTimeModel[nTime][x]) {
                this.spaceTimeModel[nTime][x] = [];
            }
            this.spaceTimeModel[nTime][x][y] = oBody;
        } else {
            this.deleteBodyAt(x, y);
            if (!this.spaceTimeModel[nTime][nMoveToX]) {
                this.spaceTimeModel[nTime][nMoveToX] = [];
            }
            this.spaceTimeModel[nTime][nMoveToX][nMoveToY] = oBody;
        }
    }

    deleteBodyAt(dx, dy) {
        const nTime = this.time;
        const x = Math.floor(dx);
        const y = Math.floor(dy);
        if (this.spaceTimeModel[nTime] && this.spaceTimeModel[nTime][x] && this.spaceTimeModel[nTime][x][y]) {
            delete this.spaceTimeModel[nTime][x][y];
        }
    }

    getSpaceTimeModel() {
        return spaceTimeModel;
    }

    setSpaceTimeModel(spaceTimeModel) {
        this.spaceTimeModel = spaceTimeModel;
    }

    resetSpaceTimeModel() {
        this.time = 0;
        this.spaceTimeModel = [];
    }

    addSpaceSnapshot(oSpaceSnapshot) {
        const nTime = this.time;
        this.spaceTimeModel[nTime] = oSpaceSnapshot;
    }

    getSpaceSnapshot() {
        const nTime = this.time;
        return this.getSpaceSnapshotAt(nTime);
    }

    getSpaceSnapshotAt(nTime) {
        return this.spaceTimeModel[nTime];
    }
}

export { SpaceTimeController };