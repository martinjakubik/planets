import { calculateGravity, calculatePosition } from './gravity.mjs';

class SpaceTimeController {
    static copySpaceSnapshot(aCoordinates) {
        let aSpaceSnapshot = [];
        aCoordinates.forEach(aXAxis => {
            aXAxis.forEach(oBody => {
                const x = Math.floor(oBody.position.x);
                const y = Math.floor(oBody.position.y);
                if (!aSpaceSnapshot[x]) {
                    aSpaceSnapshot[x] = [];
                }
                aSpaceSnapshot[x][y] = oBody;
            });
        });
        return aSpaceSnapshot;
    }

    constructor(oAppConfiguration) {
        this.appConfiguration = oAppConfiguration;
        this.time = 0;
        this.spaceTimeModel = [];
        this.modelSize = 0;
    }

    isModelSizeAcceptable() {
        return this.modelSize < this.appConfiguration.maxSpaceTimeSize;
    }

    setTime(nTime) {
        this.time = nTime;
    }

    getTime() {
        return this.time;
    }

    incrementTime(nTicks = 1) {
        const oSpaceSnapshot = SpaceTimeController.copySpaceSnapshot(this.getSpaceSnapshotAt(this.time));
        this.time = this.time + nTicks;
        if (!this.getSpaceSnapshot()) {
            this.addSpaceSnapshot(oSpaceSnapshot);
            this.calculateAllGravity();
            this.calculateAllPositions();
            const nSnapshotSize = JSON.stringify(oSpaceSnapshot).length;
            this.modelSize = this.modelSize + nSnapshotSize;
        }
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
        return this.spaceTimeModel;
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

    calculateAllGravity() {
        const aCoordinates = this.getSpaceSnapshot();
        if (aCoordinates) {
            aCoordinates.forEach(aXAxis => {
                aXAxis.forEach((oBody) => {
                    aCoordinates.forEach(aXAxis => {
                        aXAxis.forEach(oNeighbour => {
                            if (oNeighbour.id !== oBody.id) {
                                const oRecalculatedBody = calculateGravity(oBody, oNeighbour);
                                const oCoordinates = oBody.position;
                                this.updateBodyAt(oCoordinates.x, oCoordinates.y, oRecalculatedBody);
                            }
                        });
                    });
                });
            });
        }
    }

    calculateAllPositions() {
        const aCoordinates = this.getSpaceSnapshot();
        if (aCoordinates) {
            aCoordinates.forEach(aXAxis => {
                aXAxis.forEach(oBody => {
                    const oCoordinates = oBody.position;
                    calculatePosition(oBody, this.getTime());
                    this.updateBodyAt(oCoordinates.x, oCoordinates.y, oBody);
                });
            });
        }
    }
}

export { SpaceTimeController };