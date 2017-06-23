# The goal of this script is to convert an IK rig into an FK rig
#
# We do this by first duplicating our original rig and removing
# all of the IKs and constraints from our duplicate.
#
# We then bake the visual location and rotation into our FK rig

import bpy
import math

scene = bpy.context.scene

originalArmature = None
originalMesh = None

# Make sure that we have two objects selected
bpy.ops.object.mode_set(mode = 'OBJECT')
if (len(list(bpy.context.selected_objects)) != 2):
    print('TODO: Handle error of not selecting two objects')

# Make sure that our two objects are one mesh and one armature
for obj in list(bpy.context.selected_objects):
    if obj.type == 'ARMATURE':
        originalArmature = obj
    elif obj.type == 'MESH':
        originalMesh = obj

if originalArmature == None:
    print('TODO: Handle Error, you must select one armature')

if originalMesh == None:
    print('TODO: Handle Error, you must select one mesh')

# TODO: Check here that mesh is parented to armature

# Duplicate the selected armature and mesh
# From now on we'll be working with our copies so that
# we don't modify the user's original armature.
# Once we've FK'd the copy they can export it and then
# delete it, all the while their original model is unchanged
bpy.ops.object.duplicate()
# The newly created mesh and armature are now selected
fkArmature = None
fkMesh = None
for obj in list(bpy.context.selected_objects):
    if obj.type == 'ARMATURE':
        # our duplicates will be turned into FK by the time we finish our
        # function so we name them accordingly
        fkArmature = obj
    elif obj.type == 'MESH':
        fkMesh = obj

# Next we duplicate our fkArmature into an ikArmature. Our FK
# armature will later track the transforms of our IK armature using
# visual keyframes that we'll insert

# Deselected the mesh so that only the fkArmature is selected
fkMesh.select = False
# Duplicate the selected objects. There is only one, the fkArmature
bpy.ops.object.duplicate()
# Now our duplicated fkArmature is selected. This will be our ikArmature
ikArmature = bpy.context.selected_objects[0]

# We iterate through the bones in the FK armature and remove all existing bone constraints
bpy.ops.object.mode_set(mode = 'POSE')
for bone in fkArmature.pose.bones:
    for constraint in bone.constraints:
        bone.constraints.remove(constraint)

# Now we remove all non deform bones from our FK armature,
# leaving only our FK bones
scene.objects.active = fkArmature
bpy.ops.object.mode_set(mode = 'EDIT')
ikArmature.select = False
fkArmature.select = True
for fkEditBone in bpy.data.armatures[fkArmature.name].edit_bones:
    if fkEditBone.use_deform == False:
        print(fkEditBone.name)
        bpy.data.armatures[fkArmature.name].edit_bones.remove(fkEditBone)

# Next we make our FK bones copy the transforms of their IK rig counterparts
# So bone1 in FK rig would copy transforms of bone1 in IK rig, and so on
bpy.ops.object.mode_set(mode = 'POSE')
for fkBone in bpy.context.selected_pose_bones:
    copyTransforms = fkBone.constraints.new('COPY_TRANSFORMS')
    copyTransforms.target = originalArmature
    # the name of the bone in our ikArmature is the same as the name of our
    # fkArmature bone the armature was duplicated. Therefore we us `fkBone.name`
    copyTransforms.subtarget = fkBone.name


# Now that our FK rig is copying our IK rigs transforms, we insert visual keyframes
# for every keyframe. This gives our FK rigs the IK rigs transforms, after
# which we can then delete the IK rig
bpy.ops.object.mode_set(mode = 'OBJECT')

# Get all of the keyframes that are set for the rigs
keyframes = []
for fcurve in bpy.context.active_object.animation_data.action.fcurves:
    for keyframe in fcurve.keyframe_points:
        x, y = keyframe.co
        # Don't know why yet, but we encounter each keyframes a
        # bunch of times. so need to make sure we only add them once
        if x not in keyframes:
          # convert from float to int and insert into our keyframe list
          keyframes.append((math.ceil(x)))

# Now we bake all of our keyframes and remove our constraints
bpy.ops.nla.bake(frame_start=keyframes[0], frame_end=keyframes[-1], only_selected=True, visual_keying=True, clear_constraints=True, use_current_action=True, bake_types={'POSE'})

# Delete the IK armature now that our FK armature is all set up
bpy.ops.object.mode_set(mode = 'OBJECT')
scene.objects.unlink(ikArmature)
ikArmature.user_clear()
bpy.data.objects.remove(ikArmature)
