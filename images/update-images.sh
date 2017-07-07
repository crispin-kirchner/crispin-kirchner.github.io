#!/bin/bash

mkdir -p preview

for i in orig/*; do
  base=$(basename "$i")
  if [ ! -e "$base" ] ; then
    convert "$i" -auto-orient -scale 800 "$base"
    convert "$i" -auto-orient -scale 200 "preview/$base"
  fi
done
