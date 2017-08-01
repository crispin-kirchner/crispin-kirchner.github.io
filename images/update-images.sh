#!/bin/bash

mkdir -p preview full 1080

for i in ../_orig_images/*; do
  base=$(basename "$i")
  
  if [ ! -e "$base" ] ; then
    convert "$i" -auto-orient -scale 800x600 "$base"
    convert "$i" -auto-orient -scale 200 "preview/$base"
  fi
  
  if [ ! -e "preview/$base" ] ; then
    convert "$i" -auto-orient -scale 200 "preview/$base"
  fi
  
  #if [ ! -e "full/$base" ] ; then
  #  cp "$i" "full/$base" && jhead -autorot "full/$base" 
  #fi
  
  if [ ! -e "1080/$base" ] ; then
    convert "$i" -auto-orient -scale x1080 "1080/$base"
  fi
done
