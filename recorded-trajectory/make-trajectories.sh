#!/bin/bash

RAW="00_raw"
SIMPLIFIED="01_simplified"
DOWNSAMPLED="02_downsampled"

# newer_than <target file> <source files>
function newer_than {
  local target_file="$1"
  
  if [ ! -e "$target_file" ] ; then
    return 1
  fi
  
  for source_file in "${@:2}" ; do
    if [ "$source_file" -nt "$target_file" ] ; then
      return 1
    fi
  done
  
  return 0
}

# make_part <source file> <target file> <gpsbabel options>
function make_part {
  local source_file="$1"
  local target_file="$2"
  local gpsbabel_options="$3"
  
  if newer_than "$target_file" "$source_file" ; then
    return
  fi
  
  local command="gpsbabel -i gpx -f $source_file $gpsbabel_options -o gpx -F $target_file"
  echo "$command"
  $command
}

# make_parts <source folder> <target folder> <gpsbabel options>
function make_parts {
  local source_folder="$1"
  local target_folder="$2"
  local gpsbabel_options="$3"
  
  mkdir -p "$target_folder"
  for source in "$source_folder"/*.gpx ; do
    local target="$target_folder/$(basename "$source")"
    
    make_part "$source" "$target" "$gpsbabel_options"
  done
}

# make_trajectory <source folder> <target file>
function make_trajectory {
  local source_folder="$1"
  local target_file="$2"
  
  if newer_than "$target_file" "$source_folder"/*.gpx ; then
    return
  fi
  
  local command="gpsbabel"
  
  for source_file in "$source_folder"/*.gpx; do
    command+=" -i gpx -f $source_file"
  done
  
  local intermediate_file="${target_file:0:-4}gpx"
  
  command+=" -o gpx -F $intermediate_file"
  
  echo $command
  $command
  
  command="ogr2ogr -f GeoJSON $target_file $intermediate_file tracks"
  echo $command
  $command
  
  rm "$intermediate_file"
}

function make_simplified_parts {
  make_parts "$RAW" "$SIMPLIFIED" "-x position,distance=10m"
}

function make_simplified_trajectory {
  make_trajectory "$SIMPLIFIED" simplified-trajectory.json
}

function make_downsampled_parts {
  make_parts "$SIMPLIFIED" "$DOWNSAMPLED" "-x simplify,count=50"
}

function make_downsampled_trajectory {
  make_trajectory "$DOWNSAMPLED" downsampled-trajectory.json
}

function make_statistics {
  local path=$1
  
  local target=$path/statistics.json
  local source=$path/simplified-trajectory.json
  
  if newer_than $target $source ; then
    return
  fi
  
  local command="nodejs statistics.js $source $path/$RAW $target"
  echo $command
  $command
}

function make_means {
  if [ ! -e "means/$1/$RAW" ]; then
    echo "Error making mean '$1': directory '$RAW' not found"
    return 1
  fi
  
  cd means/$1
  
  make_simplified_parts
  make_downsampled_parts
  make_downsampled_trajectory
  
  if [ "$1" == "bicycle" ]; then
    make_simplified_trajectory
  fi
  
  cd ../..
  
  if [ "$1" == "bicycle" ]; then
    make_statistics means/$1
  fi
}

function make_all_means {
  for directory in means/*; do
    if [ ! -d "$directory" ]; then
      continue;
    fi
    
    make_means $(basename $directory)
  done
}

make_all_means
