for (let tick = 0; tick < 12; tick++) {
    let floorPosition = {
        x: tick * 6,
        y: 10
    }
    const mass = 1;
    const isPenDown = true;
    const sElementID = SpaceTimeView.getIDFromXY(floorPosition.x, floorPosition.y);
    const oNewTarget = document.getElementById(sElementID);
    SpaceTimeView.drawBodyWithMass(oNewTarget, mass);
    SpaceTimeView.drawSpaceshipWings(floorPosition, isPenDown, tick, this.spaceship.pixels, this.appConfiguration.gridSize);
}
