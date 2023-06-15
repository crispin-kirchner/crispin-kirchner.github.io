#!/bin/bash

# TODO nur Bilder converten die es noch nicht gibt
# TODO Ordner anlegen wenn es sie noch nicht gibt
# TODO Bildgrössen so abspeichern dass ich sie aus JS und in SH-Script einlesen kann
# TODO progressives encoding

for i in orig/*.JPG ; do
  convert "$i" -scale 360 "bg/${i:5}"
  convert "$i" -scale 64x64^ -gravity center -crop 64x64+0+0 "thumbs/${i:5}"
  convert "$i" -scale 720 "720w/${i:5}"
  convert "$i" -scale 1280 "1280w/${i:5}"
  convert "$i" -scale 1920 "1920w/${i:5}"
  convert "$i" -scale 2560 "2560w/${i:5}"
  convert "$i" -scale 4096 "4096w/${i:5}"
done