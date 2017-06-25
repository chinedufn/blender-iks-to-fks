blender-iks-to-fks [![Build Status](https://travis-ci.org/chinedufn/blender-iks-to-fks.svg?branch=master)](https://travis-ci.org/chinedufn/blender-iks-to-fks)
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

This Blender Addon is donationware, so please [donate via PayPal](https://paypal.me/chinedufn) if you've found this helpful!

## Benefits

- Unlike `Bake Action`, `blender-iks-to-fks` **does not create any additional keyframes**
- Your original mesh remains unmodified, preventing you from accidentally losing / overwriting your work

## Install

[Download the Addon file](https://github.com/chinedufn/blender-iks-to-fks/releases/download/1.1.0/convert-ik-to-fk.py)

Go to your user preferences in Blender

![user preferences](screenshots/user-preferences.png)

Install the Blender Addon file that you just downloaded

![install addon](screenshots/install-addon.png)

Save the Addon so that it is enabled the next time you use Blender

![save settings](screenshots/save-settings.png)

## Usage

1. Select your mesh and it's armature in Object Mode
2. Press Space
3. Search for 'Convert IKs to FKs' and select it
4. You should now have a new mesh and armature that use FKs

## Was this helpful?

Were you lost trying to find a way to convert your bones, but now you're found?

[![Support](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.me/chinedufn)

## TODO

- [x] Plan out the implementation and look up all of the Blender APIs that we'll need
- [ ] Unit test by using `blender` CLI to run our script then save a photo of a rendering. Make sure photo matches our expected results that we've manually verified once.
- [z] Write the script
- [z] Write installation instructions
- [z] Write usage instructions
- [z] Add screenshot to README that illustrates what this solves

## License

(c) 2017 Chinedu Francis Nwafili. MIT License
