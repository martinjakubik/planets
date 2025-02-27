const G = 6.674 * 10 ** -1;

const createBody = function (nTime, x, y) {
    return {
        id: `${nTime}:${x}:${y}`,
        mass: 1,
        position: {
            x: x,
            y: y
        },
        force: 0,
        angle: 0
    };
};

const copyBody = function (oBody) {
    let oBodyCopy = {};
    oBodyCopy.id = oBody.id;
    oBodyCopy.mass = oBody.mass;
    oBodyCopy.position = {};
    oBodyCopy.position.x = oBody.position.x;
    oBodyCopy.position.y = oBody.position.y;
    oBodyCopy.force = oBody.force;
    oBodyCopy.angle = oBody.angle;
    return oBodyCopy;
};

const getDistanceSquared = function (body, neighbour) {
    return (body.position.x - neighbour.position.x) ** 2 + (body.position.y - neighbour.position.y) ** 2;
};

const getNeighbourVector = function (body, neighbour, distanceSquared) {
    return {
        force: G * body.mass * neighbour.mass / distanceSquared,
        angle: Math.atan2(neighbour.position.y - body.position.y, neighbour.position.x - body.position.x)
    };
};

const invertVectorHorizontally = function (body) {
    const oBodyCopy = copyBody(body);
    let oCartesian = convertRadialVectorToCartesian(body);
    let oResultant = {
        x: oCartesian.x * -1,
        y: oCartesian.y
    };
    oBodyCopy.magnitude = oBodyCopy.magnitude * 0.9;
    oBodyCopy.angle = Math.atan2(oResultant.y, oResultant.x);
    return oBodyCopy;
}

const updateBodyAfterCollisionWithBoundary = function (body, oBoundary) {
    let oBodyCopy = copyBody(body);
    if (body.position.x <= 0) {
        oBodyCopy = invertVectorHorizontally(oBodyCopy);
    }
    return oBodyCopy
}

const calculateGravity = function (body, neighbour, oBoundary = { w: 100, h: 100 }) {
    let nDistanceSquared = getDistanceSquared(body, neighbour);
    let neighbourVector = getNeighbourVector(body, neighbour, nDistanceSquared);
    let vectorSum = addVectors(body, neighbourVector);
    let sumOfMagnitudes = vectorSum.magnitude;
    let sumOfAngles = vectorSum.angle;
    body.angle = sumOfAngles;
    body.force = sumOfMagnitudes;
    const oBodyCopy = updateBodyAfterCollisionWithBoundary(body, oBoundary);
    body.angle = oBodyCopy.angle;
    body.magnitude = oBodyCopy.magnitude;

    return body;
};

const calculatePosition = function (body, time) {
    // modified from:
    // x(t) = x0 + v0 * t + 1/2 at^2,
    // see: https://phys.libretexts.org/Bookshelves/University_Physics/Book%3A_University_Physics_%28OpenStax%29/Book%3A_University_Physics_I_-_Mechanics_Sound_Oscillations_and_Waves_%28OpenStax%29/03%3A_Motion_Along_a_Straight_Line/3.08%3A_Finding_Velocity_and_Displacement_from_Acceleration
    let oBodyCopy = copyBody(body);
    let initialPosition = oBodyCopy.position;
    let v0 = 0;
    let acceleration = oBodyCopy.force / oBodyCopy.mass;
    let displacementMagnitude = v0 * time + 1 / 2 * acceleration;
    let xDisplacement = Math.cos(body.angle) * displacementMagnitude;
    let yDisplacement = Math.sin(body.angle) * displacementMagnitude;
    oBodyCopy.position = {
        x: initialPosition.x + xDisplacement,
        y: initialPosition.y + yDisplacement
    };
    return oBodyCopy;
};

const addVectors = function (v1, v2) {
    let v1Cartesian = convertRadialVectorToCartesian(v1);
    let v2Cartesian = convertRadialVectorToCartesian(v2);

    let resultant = {
        x: v1Cartesian.x + v2Cartesian.x,
        y: v1Cartesian.y + v2Cartesian.y
    };

    return {
        magnitude: Math.sqrt(resultant.x * resultant.x + resultant.y * resultant.y),
        angle: Math.atan2(resultant.y, resultant.x)
    };
};

const convertRadialVectorToCartesian = function (v) {
    return {
        x: Math.cos(v.angle) * v.force,
        y: Math.sin(v.angle) * v.force
    };
};

export { createBody, calculateGravity, calculatePosition, addVectors, getDistanceSquared, getNeighbourVector };