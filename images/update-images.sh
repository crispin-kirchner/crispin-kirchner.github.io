#!/bin/bash

mkdir -p preview full

for i in orig/*; do
  base=$(basename "$i")
  if [ ! -e "$base" ] ; then
    convert "$i" -auto-orient -scale 800 "$base"
    convert "$i" -auto-orient -scale 200 "preview/$base"
  fi
  
  if [ ! -e "preview/$base" ] ; then
    convert "$i" -auto-orient -scale 200 "preview/$base"
  fi
  
  if [ ! -e "full/$base" ] ; then
    cp "$i" "full/$base" && jhead -autorot "full/$base" 
  fi
done
