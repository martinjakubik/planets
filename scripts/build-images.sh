#!/bin/bash

if [[ ! -d app ]] ; then
    mkdir app
fi

inkscape resources/planets-icon.svg -j -C -o resources/favicon.png
inkscape resources/planets-logo.svg -j -C -o resources/logo.png
inkscape resources/planets-phaser.svg -j -C -o resources/phaser.png
