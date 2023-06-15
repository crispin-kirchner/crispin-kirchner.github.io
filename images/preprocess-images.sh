#!/bin/bash

# TODO Ordner anlegen wenn es sie noch nicht gibt
# TODO progressives encoding

function doConvert {
  local targetFolder="$3"
  local args="$2"
  local sourceFilePath="$1"
  local sourceFilename="$(basename "$sourceFilePath")"
  local target="$targetFolder/$sourceFilename"
  if [ -e "$target" ]; then
    return 0
  fi
  echo "$target"
  convert "$sourceFilePath" $args -interlace line "$target"
}

mkdir -p bg
mkdir -p thumbs
mkdir -p 720w
mkdir -p 1280w
mkdir -p 1920w
mkdir -p 2560w
mkdir -p 4096w

for i in ~/storage/shared/Imaging\ Edge\ Mobile/blog/*.JPG ; do
  doConvert "$i" "-scale 360" "bg"
  doConvert "$i" "-scale 64x64^ -gravity center -crop 64x64+0+0" "thumbs"
  doConvert "$i" "-scale 720" "720w"
  doConvert "$i" "-scale 1280" "1280w"
  doConvert "$i" "-scale 1920" "1920w"
  doConvert "$i" "-scale 2560" "2560w"
  doConvert "$i" "-scale 4096" "4096w"
done

