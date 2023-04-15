import { calculateGravity, calculatePosition } from './gravity.mjs';

class SpaceTimeController {
    static copySpaceSnapshot (aCoordinates) {
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

    constructor (oAppConfiguration) {
        this.appConfiguration = oAppConfiguration;
        this.time = 0;
        this.spaceTimeModel0 = [];
        this.bodyPositions = {};
        this.modelSize = 0;
    }

    isModelSizeAcceptable () {
        return this.modelSize < this.appConfiguration.maxSpaceTimeSize;
    }

    setTime (nTime) {
        this.time = nTime;
    }

    getTime () {
        return this.time;
    }

    incrementTime (nTicks = 1) {
        const oSpaceSnapshot = this.getSpaceSnapshotAt(this.time);
        let oSpaceSnapshotCopy;
        if (oSpaceSnapshot) {
            oSpaceSnapshotCopy = SpaceTimeController.copySpaceSnapshot(oSpaceSnapshot);
            this.time = this.time + nTicks;
            if (!this.getSpaceSnapshot()) {
                this.addSpaceSnapshot(oSpaceSnapshotCopy);
                this.calculateAllGravity();
                this.calculateAllPositions();
                const nSnapshotSize = JSON.stringify(oSpaceSnapshotCopy).length;
                this.modelSize = this.modelSize + nSnapshotSize;
            }
        }
    }

    getBodyWithId (key) {
        return this.bodyPositions[key];
    }

    getBodyAt (dx, dy) {
        const nTime = this.time;
        const x = Math.floor(dx);
        const y = Math.floor(dy);
        const aSpace = this.spaceTimeModel0[nTime];
        const aXAxis = aSpace ? aSpace[x] : null;
        return aXAxis ? aXAxis[y] : null;
    }

    updateBodyAt (dx, dy, oBody) {
        const nTime = this.time;
        const x = Math.floor(dx);
        const y = Math.floor(dy);
        const nMoveToX = Math.floor(oBody.position.x);
        const nMoveToY = Math.floor(oBody.position.y);
        if (!this.spaceTimeModel0[nTime]) {
            this.spaceTimeModel0[nTime] = [];
        }
        if (x === oBody.position.x && y === oBody.position.y) {
            if (!this.spaceTimeModel0[nTime][x]) {
                this.spaceTimeModel0[nTime][x] = [];
            }
            this.spaceTimeModel0[nTime][x][y] = oBody;
            this.bodyPositions[oBody.id] = { x: x, y: y };
        } else {
            this.deleteBodyAt(x, y);
            if (!this.spaceTimeModel0[nTime][nMoveToX]) {
                this.spaceTimeModel0[nTime][nMoveToX] = [];
            }
            this.spaceTimeModel0[nTime][nMoveToX][nMoveToY] = oBody;
            this.bodyPositions[oBody.id] = { x: nMoveToX, y: nMoveToY };
        }
    }

    deleteBodyAt (dx, dy) {
        const nTime = this.time;
        const x = Math.floor(dx);
        const y = Math.floor(dy);
        if (this.spaceTimeModel0[nTime] && this.spaceTimeModel0[nTime][x] && this.spaceTimeModel0[nTime][x][y]) {
            delete this.spaceTimeModel0[nTime][x][y];
        }
    }

    getSpaceTimeModel () {
        return this.spaceTimeModel0;
    }

    setSpaceTimeModel (spaceTimeModel) {
        this.spaceTimeModel0 = spaceTimeModel;
    }

    resetSpaceTimeModel () {
        this.time = 0;
        this.spaceTimeModel0 = [];
    }

    addSpaceSnapshot (oSpaceSnapshot) {
        const nTime = this.time;
        this.spaceTimeModel0[nTime] = oSpaceSnapshot;
    }

    getSpaceSnapshot () {
        const nTime = this.time;
        return this.getSpaceSnapshotAt(nTime);
    }

    getBodies () {
        let aBodies = [];
        const nTime = this.time;
        const aCoordinates = this.getSpaceSnapshotAt(nTime);
        aCoordinates.forEach(aXAxis => {
            aXAxis.forEach((oBody) => {
                aBodies.push(oBody);
            });
        });
        return aBodies;
    }

    getSpaceSnapshotAt (nTime) {
        return this.spaceTimeModel0[nTime];
    }

    calculateAllGravity () {
        const aBodies = this.getBodies();
        aBodies.forEach(oBody => {
            aBodies.forEach(oNeighbour => {
                if (oNeighbour.id !== oBody.id) {
                    const oRecalculatedBody = calculateGravity(oBody, oNeighbour);
                    const oCoordinates = oBody.position;
                    this.updateBodyAt(oCoordinates.x, oCoordinates.y, oRecalculatedBody);
                }
            });
        });
    }

    calculateAllPositions () {
        const aBodies = this.getBodies();
        aBodies.forEach(oBody => {
            const oCoordinates = oBody.position;
            calculatePosition(oBody, this.getTime());
            this.updateBodyAt(oCoordinates.x, oCoordinates.y, oBody);
        });
    }
}

export { SpaceTimeController };