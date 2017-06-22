blender-iks-to-fks [![npm version](https://badge.fury.io/js/blender-iks-to-fks.svg)](http://badge.fury.io/js/blender-iks-to-fks) [![Build Status](https://travis-ci.org/chinedufn/blender-iks-to-fks.svg?branch=master)](https://travis-ci.org/chinedufn/blender-iks-to-fks)
===========

> A Blender script that takes a mesh and armature that use IKs and other non-deformation bones and
creates a new mesh and armature that uses only FK bones.

## Background / Initial motivation

I wrote a post a few months ago about [converting IKs and constraints into FKs in Blender](http://chinedufn.com/blender-export-iks-constraints/).
The process was manual, tedious and very error prone. To the point where I would push of and procrastinate rigging because I dreaded the IK -> FK conversion.

This script automates the IK / Constraint bones -> FK bones conversion process.

## TODO

- [x] Plan out the implementation and look up all of the Blender APIs that we'll need
- [ ] Unit test by using `blender` CLI to run our script then save a photo of a rendering. Make sure photo matches our expected results that we've manually verified once.
- [ ] Write the script
- [ ] Write installation instructions
- [ ] Write usage instructions
- [ ] Add screenshot to README that illustrates what this solves

## Install

## Usage

## License

(c) 2017 Chinedu Francis Nwafili. MIT License
