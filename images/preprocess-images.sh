#!/bin/bash

function imInstruction {
  echo "( mpr:XY $1 -interlace line -quality 92 +write $2 )"
}

mkdir -p bg
mkdir -p 32w
mkdir -p 64w
mkdir -p 96w
mkdir -p 720w
mkdir -p 1280w
mkdir -p 1920w
mkdir -p 2560w
mkdir -p 4096w

for i in ~/storage/external-1/blog/*.JPG ; do
  sourceFilename="$(basename "$i")"
  sizes=""
  command=""
  if [ ! -e bg/$sourceFilename ] ; then
    sizes="$sizes bg"
    command="$command $(imInstruction "-scale 360" bg/$sourceFilename)"
  fi
  for size in 32 64 96 ; do
    if [ ! -e ${size}w/$sourceFilename ] ; then
      sizes="$sizes ${size}w"
      command="$command $(imInstruction "-scale ${size}x${size}^ -gravity center -crop ${size}x${size}+0+0" ${size}w/$sourceFilename)"
    fi
  done
  for size in 720 1280 1920 2560 4096 ; do
    if [ ! -e "${size}w/$sourceFilename" ] ; then
      sizes="$sizes ${size}w"
      command="$command $(imInstruction "-scale $size" ${size}w/$sourceFilename)"
    fi
  done
  if [ "$command" = "" ] ; then
    continue
  fi
  echo "$sourceFilename$sizes"
  convert "$i" -write mpr:XY +delete -respect-parentheses $command null:
  # FIXME fix this im behavior
  sourceBase=${sourceFilename:0:-4}
  for size in $sizes ; do
    mv $size/$sourceBase-0.JPG $size/$sourceFilename
    rm $size/$sourceBase-1.JPG
  done
done

