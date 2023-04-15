import { calculateGravity, calculatePosition } from './gravity.mjs';

class SpaceTimeController {
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
        this.spaceTimeModel1 = {};
        this.bodyPositions = {};
        this.modelSize1 = 0;
    }

    isModelSizeAcceptable () {
        return this.modelSize1 < this.appConfiguration.maxSpaceTimeSize;
    }

    setTime (nTime) {
        this.time = nTime;
    }

    getTime () {
        return this.time;
    }

    incrementTime (nTicks = 1) {
        const oSpaceSnapshot1 = this.getSpaceSnapshot1At(this.time);
        if (oSpaceSnapshot1) {
            this.time = this.time + nTicks;
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

    getBody1At (dx, dy) {
        const sKey = SpaceTimeController.getKeyFromXY(dx, dy);
        const nTime = this.time;
        const aSpaceSnapshot = this.spaceTimeModel1[nTime];
        return aSpaceSnapshot ? aSpaceSnapshot[sKey] : null;
    }

    updateBody1At (dx, dy, oBody) {
        const nTime = this.time;
        this.initializeSpaceSnapshotAt(nTime);
        this.deleteBody1At(dx, dy);
        const sKey = SpaceTimeController.getKeyFromXY(oBody.position.x, oBody.position.y);
        this.spaceTimeModel1[nTime][sKey] = oBody;
    }

    deleteBody1At (dx, dy) {
        const nTime = this.time;
        const sKey = SpaceTimeController.getKeyFromXY(dx, dy);
        if (this.spaceTimeModel1[nTime] && this.spaceTimeModel1[nTime][sKey]) {
            delete this.spaceTimeModel1[nTime][sKey];
        }
    }

    getSpaceTimeModel () {
        return this.spaceTimeModel1;
    }

    setSpaceTimeModel (spaceTimeModel) {
        this.spaceTimeModel1 = spaceTimeModel;
    }

    resetSpaceTimeModel () {
        this.time = 0;
        this.spaceTimeModel1 = [];
    }

    addSpaceSnapshot1 (oSpaceSnapshot) {
        const nTime = this.time;
        this.spaceTimeModel1[nTime] = oSpaceSnapshot;
    }

    getSpaceSnapshot1 () {
        const nTime = this.time;
        return this.getSpaceSnapshot1At(nTime);
    }

    getBodies1 () {
        let aBodies = [];
        const nTime = this.time;
        const oSpaceSnapshot = this.getSpaceSnapshot1At(nTime);
        Object.values(oSpaceSnapshot).forEach(oBody => {
            aBodies.push(oBody);
        });
        return aBodies;
    }

    getSpaceSnapshot1At (nTime) {
        return this.spaceTimeModel1[nTime];
    }

    getSpaceSnapshotAt (nTime) {
        return this.spaceTimeModel1[nTime];
    }

    calculateAllGravity1 () {
        const aBodies = this.getBodies1();
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

    calculateAllPositions1 () {
        const aBodies = this.getBodies1();
        aBodies.forEach(oBody => {
            const oCoordinates = oBody.position;
            const oRecalculatedBody = calculatePosition(oBody, this.getTime());
            this.updateBody1At(oCoordinates.x, oCoordinates.y, oRecalculatedBody);
        });
    }
}

export { SpaceTimeController };