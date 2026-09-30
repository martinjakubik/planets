import { SpaceTimeView } from './spacetimeview.mjs';
import { SpaceTimeController } from './spacetimecontroller.mjs';

const getSiteRoot = function () {
    return 'https://www.supertitle.org';
}

const oAppConfiguration = {
    gridSize: 90,
    maxSpaceTimeSize: 10 ** 6,
    resources: {
        hoverSound: 'chirp.mp3',
        volumeIconOn: 'volume-on.png',
        volumeIconOff: 'volume-off.png',
        settingsIcon: 'settings.png',
        turnRightIcon: 'clockwise.png',
        turnLeftIcon: 'counterclockwise.png',
        thrustIcon: 'up.png',
        phaserIcon: 'content/planets/app/phaser.png'
    },

    getResource: function (sResourceKey) {
        const aResourceKeys = Object.keys(this.resources);
        if (aResourceKeys.indexOf(sResourceKey) < 0) {
            return null;
        }
        const sSiteRoot = getSiteRoot();
        const sResourceValue = this.resources[sResourceKey];
        let sResourcePath = '';
        switch (sResourceKey) {
            case 'hoverSound':
            case 'volumeIconOn':
            case 'volumeIconOff':
            case 'settingsIcon':
            case 'turnRightIcon':
            case 'turnLeftIcon':
            case 'thrustIcon':
            case 'phaserIcon':
                sResourcePath = `${sSiteRoot}/${sResourceValue}`;
                break;
            default:
                return null;
        }
        return sResourcePath;
    }
};

function getRandomStarElement() {
    const starX = Math.random() < .5 ? 20 : oAppConfiguration.gridSize - 20;
    const starY = Math.random() < .5 ? 20 : oAppConfiguration.gridSize - 20;
    return `x${starX}y${starY}`;
}

const oSpaceTimeController = new SpaceTimeController(oAppConfiguration);
const oSpaceTimeView = new SpaceTimeView(oAppConfiguration, oSpaceTimeController);
oSpaceTimeView.makeSpaceGrid();
oSpaceTimeView.makeSpaceTimeButtonBar();
const sStarElementId = getRandomStarElement();
oSpaceTimeView.spaceClickedAtElementId(sStarElementId);
