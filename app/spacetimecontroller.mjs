import { calculateGravity, calculatePosition } from './gravity.mjs';

class SpaceTimeController {
    static copySpaceSnapshot(oSpaceSnapshot) {
        let oSpaceSnapshotCopy = {};
        Object.keys(oSpaceSnapshot).forEach(sKey => {
            const oBody = oSpaceSnapshot[sKey];
            oSpaceSnapshotCopy[sKey] = oBody;
        });
        return oSpaceSnapshotCopy;
    }

    static getKeyFromXY(x, y) {
        return `${x}-${y}`;
    }

    constructor(oAppConfiguration) {
        this.appConfiguration = oAppConfiguration;
        this.time = 0;
        this.spaceTimeModel = {};
        this.bodyPositions = {};
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
        const oSpaceSnapshot = this.getSpaceSnapshotAt(this.time);
        if (oSpaceSnapshot) {
            this.time = this.time + nTicks;
        }
        let oSpaceSnapshotCopy;
        if (oSpaceSnapshot) {
            oSpaceSnapshotCopy = SpaceTimeController.copySpaceSnapshot(oSpaceSnapshot);
            if (!this.getSpaceSnapshot()) {
                this.addSpaceSnapshot(oSpaceSnapshotCopy);
                this.calculateAllGravity();
                this.calculateAllPositions();
                const nSnapshotSize = JSON.stringify(oSpaceSnapshotCopy).length;
                this.modelSize = this.modelSize + nSnapshotSize;
            }
        }
    }

    initializeSpaceSnapshotAt(nTime) {
        if (!this.spaceTimeModel[nTime]) {
            this.spaceTimeModel[nTime] = {};
        }
    }

    getBodyWithId(key) {
        return this.bodyPositions[key];
    }

    getBodyAt(dx, dy) {
        const sKey = SpaceTimeController.getKeyFromXY(dx, dy);
        const nTime = this.time;
        const aSpaceSnapshot = this.spaceTimeModel[nTime];
        return aSpaceSnapshot ? aSpaceSnapshot[sKey] : null;
    }

    getSpaceship() {
        const aBodies = this.getBodies();
        const oSpaceship = aBodies.find(
            (oBody) => oBody.id === '0:45:45'
        )
        return oSpaceship;
    }

    updateBodyAt(dx, dy, oBody) {
        const nTime = this.time;
        this.initializeSpaceSnapshotAt(nTime);
        this.deleteBodyAt(dx, dy);
        const sKey = SpaceTimeController.getKeyFromXY(oBody.position.x, oBody.position.y);
        this.spaceTimeModel[nTime][sKey] = oBody;
    }

    updateSpaceship(oBody) {
        this.updateBodyAt(45, 45, oBody);
    }

    deleteBodyAt(dx, dy) {
        const nTime = this.time;
        const sKey = SpaceTimeController.getKeyFromXY(dx, dy);
        if (this.spaceTimeModel[nTime] && this.spaceTimeModel[nTime][sKey]) {
            delete this.spaceTimeModel[nTime][sKey];
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

    getBodies() {
        let aBodies = [];
        const nTime = this.time;
        const oSpaceSnapshot = this.getSpaceSnapshotAt(nTime);
        Object.values(oSpaceSnapshot).forEach(oBody => {
            aBodies.push(oBody);
        });
        return aBodies;
    }

    getSpaceSnapshotAt(nTime) {
        return this.spaceTimeModel[nTime];
    }

    calculateAllGravity() {
        const aBodies = this.getBodies();
        let oBoundary = {
            w: this.appConfiguration.gridSize,
            h: this.appConfiguration.gridSize
        }
        let iBody, iNeighbour = 0;
        for (iBody = 0; iBody < aBodies.length; iBody++) {
            let oBody = aBodies[iBody];
            for (iNeighbour = iBody + 1; iNeighbour < aBodies.length; iNeighbour++) {
                let oNeighbour = aBodies[iNeighbour];
                const oRecalculatedBody = calculateGravity(oBody, oNeighbour, oBoundary);
                const oCoordinates = oBody.position;
                this.updateBodyAt(oCoordinates.x, oCoordinates.y, oRecalculatedBody);
            }
        }
    }

    calculateAllPositions() {
        const aBodies = this.getBodies();
        aBodies.forEach(oBody => {
            const oCoordinates = oBody.position;
            const oRecalculatedBody = calculatePosition(oBody, this.getTime());
            this.updateBodyAt(oCoordinates.x, oCoordinates.y, oRecalculatedBody);
        });
    }
}

export { SpaceTimeController };