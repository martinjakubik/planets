import { calculateGravity, calculatePosition } from './gravity.mjs';

class SpaceTimeController {
    static copySpaceSnapshot0 (aCoordinates) {
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

    static copySpaceSnapshot1 (oSpaceSnapshot) {
        let oSpaceSnapshotCopy = {};
        Object.keys(oSpaceSnapshot).forEach(sKey => {
            const oBody = oSpaceSnapshot[sKey];
            oSpaceSnapshotCopy[sKey] = oBody;
        });
        return oSpaceSnapshotCopy;
    }

    static getKeyFromXY (x, y) {
        return `${x}-${y}`;
    }

    constructor (oAppConfiguration) {
        this.appConfiguration = oAppConfiguration;
        this.time = 0;
        this.spaceTimeModel0 = [];
        this.spaceTimeModel1 = {};
        this.bodyPositions = {};
        this.modelSize0 = 0;
        this.modelSize1 = 0;
    }

    isModelSizeAcceptable () {
        console.table([`model 0 size: ${this.modelSize0}`, `model 1 size: ${this.modelSize1}`]);
        return this.modelSize0 < this.appConfiguration.maxSpaceTimeSize;
    }

    setTime (nTime) {
        this.time = nTime;
    }

    getTime () {
        return this.time;
    }

    incrementTime (nTicks = 1) {
        const oSpaceSnapshot0 = this.getSpaceSnapshot0At(this.time);
        const oSpaceSnapshot1 = this.getSpaceSnapshot1At(this.time);
        let oSpaceSnapshotCopy0;
        if (oSpaceSnapshot0 || oSpaceSnapshot1) {
            this.time = this.time + nTicks;
        }
        if (oSpaceSnapshot0) {
            oSpaceSnapshotCopy0 = SpaceTimeController.copySpaceSnapshot0(oSpaceSnapshot0);
            if (!this.getSpaceSnapshot0()) {
                this.addSpaceSnapshot0(oSpaceSnapshotCopy0);
                this.calculateAllGravity0();
                this.calculateAllPositions0();
                const nSnapshotSize = JSON.stringify(oSpaceSnapshotCopy0).length;
                this.modelSize0 = this.modelSize0 + nSnapshotSize;
            }
        }
        let oSpaceSnapshotCopy1;
        if (oSpaceSnapshot1) {
            oSpaceSnapshotCopy1 = SpaceTimeController.copySpaceSnapshot1(oSpaceSnapshot1);
            if (!this.getSpaceSnapshot1()) {
                this.addSpaceSnapshot1(oSpaceSnapshotCopy1);
                this.calculateAllGravity1();
                this.calculateAllPositions1();
                const nSnapshotSize = JSON.stringify(oSpaceSnapshotCopy1).length;
                this.modelSize1 = this.modelSize1 + nSnapshotSize;
            }
        }
    }

    initializeSpaceSnapshotAt (nTime) {
        if (!this.spaceTimeModel1[nTime]) {
            this.spaceTimeModel1[nTime] = {};
        }
    }

    getBodyWithId (key) {
        return this.bodyPositions[key];
    }

    getBody0At (dx, dy) {
        const nTime = this.time;
        const x = Math.floor(dx);
        const y = Math.floor(dy);
        const aSpace = this.spaceTimeModel0[nTime];
        const aXAxis = aSpace ? aSpace[x] : null;
        return aXAxis ? aXAxis[y] : null;
    }

    getBody1At (dx, dy) {
        const sKey = SpaceTimeController.getKeyFromXY(dx, dy);
        const nTime = this.time;
        const aSpaceSnapshot = this.spaceTimeModel1[nTime];
        return aSpaceSnapshot ? aSpaceSnapshot[sKey] : null;
    }

    updateBody0At (dx, dy, oBody) {
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
            this.deleteBody0At(x, y);
            if (!this.spaceTimeModel0[nTime][nMoveToX]) {
                this.spaceTimeModel0[nTime][nMoveToX] = [];
            }
            this.spaceTimeModel0[nTime][nMoveToX][nMoveToY] = oBody;
            this.bodyPositions[oBody.id] = { x: nMoveToX, y: nMoveToY };
        }
    }

    updateBody1At (dx, dy, oBody) {
        const nTime = this.time;
        this.initializeSpaceSnapshotAt(nTime);
        this.deleteBody1At(dx, dy);
        const sKey = SpaceTimeController.getKeyFromXY(oBody.position.x, oBody.position.y);
        this.spaceTimeModel1[nTime][sKey] = oBody;
    }

    deleteBody0At (dx, dy) {
        const nTime = this.time;
        const x = Math.floor(dx);
        const y = Math.floor(dy);
        if (this.spaceTimeModel0[nTime] && this.spaceTimeModel0[nTime][x] && this.spaceTimeModel0[nTime][x][y]) {
            delete this.spaceTimeModel0[nTime][x][y];
        }
    }

    deleteBody1At (dx, dy) {
        const nTime = this.time;
        const sKey = SpaceTimeController.getKeyFromXY(dx, dy);
        if (this.spaceTimeModel1[nTime] && this.spaceTimeModel1[nTime][sKey]) {
            delete this.spaceTimeModel0[nTime][sKey];
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
        this.spaceTimeModel1 = [];
    }

    addSpaceSnapshot0 (oSpaceSnapshot) {
        const nTime = this.time;
        this.spaceTimeModel0[nTime] = oSpaceSnapshot;
    }

    addSpaceSnapshot1 (oSpaceSnapshot) {
        const nTime = this.time;
        this.spaceTimeModel1[nTime] = oSpaceSnapshot;
    }

    getSpaceSnapshot0 () {
        const nTime = this.time;
        return this.getSpaceSnapshot0At(nTime);
    }

    getSpaceSnapshot1 () {
        const nTime = this.time;
        return this.getSpaceSnapshot1At(nTime);
    }

    getBodies0 () {
        let aBodies = [];
        const nTime = this.time;
        const aCoordinates = this.getSpaceSnapshot0At(nTime);
        aCoordinates.forEach(aXAxis => {
            aXAxis.forEach((oBody) => {
                aBodies.push(oBody);
            });
        });
        return aBodies;
    }

    getSpaceSnapshot0At (nTime) {
        return this.spaceTimeModel0[nTime];
    }

    getSpaceSnapshot1At (nTime) {
        return this.spaceTimeModel1[nTime];
    }

    getSpaceSnapshotAt (nTime) {
        return this.spaceTimeModel1[nTime];
    }

    calculateAllGravity0 () {
        const aBodies = this.getBodies0();
        aBodies.forEach(oBody => {
            aBodies.forEach(oNeighbour => {
                if (oNeighbour.id !== oBody.id) {
                    const oRecalculatedBody = calculateGravity(oBody, oNeighbour);
                    const oCoordinates = oBody.position;
                    this.updateBody0At(oCoordinates.x, oCoordinates.y, oRecalculatedBody);
                }
            });
        });
    }

    calculateAllGravity1 () {
        const aBodies = this.getBodies0();
        aBodies.forEach(oBody => {
            aBodies.forEach(oNeighbour => {
                if (oNeighbour.id !== oBody.id) {
                    const oRecalculatedBody = calculateGravity(oBody, oNeighbour);
                    const oCoordinates = oBody.position;
                    this.updateBody1At(oCoordinates.x, oCoordinates.y, oRecalculatedBody);
                }
            });
        });
    }

    calculateAllPositions0 () {
        const aBodies = this.getBodies0();
        aBodies.forEach(oBody => {
            const oCoordinates = oBody.position;
            calculatePosition(oBody, this.getTime());
            this.updateBody0At(oCoordinates.x, oCoordinates.y, oBody);
        });
    }
    calculateAllPositions1 () {
        const aBodies = this.getBodies0();
        aBodies.forEach(oBody => {
            const oCoordinates = oBody.position;
            calculatePosition(oBody, this.getTime());
            this.updateBody1At(oCoordinates.x, oCoordinates.y, oBody);
        });
    }
}

export { SpaceTimeController };