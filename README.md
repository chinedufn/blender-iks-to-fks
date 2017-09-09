blender-iks-to-fks [![npm version](https://badge.fury.io/js/blender-iks-to-fks.svg)](http://badge.fury.io/js/blender-iks-to-fks) [![Build Status](https://travis-ci.org/chinedufn/blender-iks-to-fks.svg?branch=master)](https://travis-ci.org/chinedufn/blender-iks-to-fks)
===========

> A Blender Addon that takes a mesh and armature that use IKs and other non-deformation bones and
creates a new mesh and armature that uses only FK bones.

![example gif](screenshots/iks-to-fks.gif)

## Background / Initial motivation

I wrote a post a few months ago about [converting IKs and constraints into FKs in Blender](http://chinedufn.com/blender-export-iks-constraints/).
The process was manual, tedious and very error prone. To the point where I would push of and procrastinate rigging because I dreaded the IK -> FK conversion.

This script automates the IK / Constraint bones -> FK bones conversion process.

It does this by generating a new mesh and FK rig that copy the animations of your original mesh and rig.

---

I wrote a [reddit comment attempting to explain IK vs FK at a five year old level](https://www.reddit.com/r/blender/comments/6k4dou/open_source_blender_addon_to_automatically/djjaqcc/).

---

This Blender Addon is donationware, so please [donate via PayPal](https://paypal.me/chinedufn) if you've found this helpful!

## Benefits

- Unlike `Bake Action`, `blender-iks-to-fks` **does not create any additional keyframes**
- Your original mesh remains unmodified, preventing you from accidentally losing / overwriting your work

## Install

There are two ways to install the addon. By running a script, or by manually downloading and adding it into Blender

### Install via script

This method requires that Blender is added to your $PATH

```sh
npm install -g blender-iks-to-fks && ik2fk --install-blender
```

### Manual Download Instructions

[Manual installation instructions](manual-installation-instructions.md)

## Usage

### In Blender Window:

1. Select your mesh and it's armature in Object Mode
2. Press Space
3. Search for 'Convert IKs to FKs' and select it
4. You should now have a new mesh and armature that use FKs

### Via Blender CLI

You can run this addon via the Blender CLI as part of an automated conversion process. Here's how:

```sh
blender my-blender-file.blend --python `ik2fk`
```

## Have an idea? Confused?

Open an issue and lets sort it out!

## Was this helpful?

Were you lost trying to find a way to convert your bones, but now you're found?

[![Support](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.me/chinedufn)

## License

(c) 2017 Chinedu Francis Nwafili. MIT License
