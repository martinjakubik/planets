#!/bin/bash

if [[ ! -d app ]] ; then
    mkdir app
fi

inkscape resources/apptemplate-icon.svg -j -C -o resources/favicon.png
inkscape resources/apptemplate-logo.svg -j -C -o resources/logo.png
inkscape resources/apptemplate-settings.svg -j -C -o resources/settings.png
inkscape resources/apptemplate-volume.svg -i "layer2;layer4" -j -C -o resources/volume-on.png
inkscape resources/apptemplate-volume.svg -i "layer2;layer5" -j -C -o resources/volume-off.png
