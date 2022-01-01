let createBody = function (x, y) {

    return {
        id: `${x}:${y}`,
        mass: 1,
        position: {
            x: x,
            y: y
        },
        force: 0,
        angle: 0
    };

};

let calculateGravity = function (body, neighbour) {

    let nDistanceSquared = (body.position.x - neighbour.position.x) ** 2 + (body.position.y - neighbour.position.y) ** 2;
    let neighbourVector = {
        force: body.mass * neighbour.mass / nDistanceSquared,
        angle: Math.atan2(neighbour.position.y - body.position.y, neighbour.position.x - body.position.x)
    };
    let vectorSum = addVectors(body, neighbourVector);
    let sumOfMagnitudes = vectorSum.magnitude;
    let sumOfAngles = vectorSum.angle;
    body.angle = sumOfAngles;
    body.force = sumOfMagnitudes;

    return body;

};

let calculatePosition = function (body, time) {

    // x(t) = x0 + v0 * t + 1/2 at^2,
    // see: https://phys.libretexts.org/Bookshelves/University_Physics/Book%3A_University_Physics_%28OpenStax%29/Book%3A_University_Physics_I_-_Mechanics_Sound_Oscillations_and_Waves_%28OpenStax%29/03%3A_Motion_Along_a_Straight_Line/3.08%3A_Finding_Velocity_and_Displacement_from_Acceleration
    let initialPosition = body.position;
    let v0 = 0;
    let acceleration = body.force / body.mass;
    let displacementMagnitude = v0 * time + 1/2 * acceleration;
    let xDisplacement = Math.cos(body.angle) * displacementMagnitude;
    let yDisplacement = Math.sin(body.angle) * displacementMagnitude;
    body.position = {
        x: initialPosition.x + xDisplacement,
        y: initialPosition.y + yDisplacement
    };
    return body.position;

};

let addVectors = function (v1, v2) {

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

let convertRadialVectorToCartesian = function (v) {

    return {
        x: Math.cos(v.angle) * v.force,
        y: Math.sin(v.angle) * v.force
    };

};

export { createBody, calculateGravity, calculatePosition };