#!/bin/bash

function imInstruction {
  echo "( mpr:XY $1 -interlace line -quality 92 +write $2 )"
}

mkdir -p bg
mkdir -p thumbs
mkdir -p 720w
mkdir -p 1280w
mkdir -p 1920w
mkdir -p 2560w
mkdir -p 4096w

for i in ~/storage/external-1/blog/*.JPG ; do
  sourceFilename="$(basename "$i")"
  if [ -e "4096w/$sourceFilename" ] ; then
    continue
  fi
  command=""
  command="$command $(imInstruction "-scale 360" bg/$sourceFilename)"
  command="$command $(imInstruction "-scale 64x64^ -gravity center -crop 64x64+0+0" thumbs/$sourceFilename)"
  command="$command $(imInstruction "-scale 720" 720w/$sourceFilename)"
  command="$command $(imInstruction "-scale 1280" 1280w/$sourceFilename)"
  command="$command $(imInstruction "-scale 1920" 1920w/$sourceFilename)"
  command="$command $(imInstruction "-scale 2560" 2560w/$sourceFilename)"
  command="$command $(imInstruction "-scale 4096" 4096w/$sourceFilename)"
  echo $sourceFilename
  convert "$i" -write mpr:XY +delete -respect-parentheses $command null:
  # FIXME fix this im behavior
  sourceBase=${sourceFilename:0:8}
  for size in bg thumbs 720w 1280w 1920w 2560w 4096w ; do
    mv $size/$sourceBase-0.JPG $size/$sourceFilename
    rm $size/$sourceBase-1.JPG
  done
done

