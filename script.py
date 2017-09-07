import bpy
import math

originalArmature = None
originalMesh = None

# Make sure that we have two objects selected
bpy.ops.object.mode_set(mode = 'OBJECT')
if (len(list(bpy.context.selected_objects)) != 2):
    print('You must select one armature and one mesh.')

# Make sure that our two objects are one mesh and one armature
for obj in list(bpy.context.selected_objects):
    if obj.type == 'ARMATURE':
        originalArmature = obj
    elif obj.type == 'MESH':
        originalMesh = obj

if originalArmature == None:
    print('You must select one armature and one mesh. You\'re missing an armature')

if originalMesh == None:
    print('You must select one mesh and one armature. You\'re missing a mesh')

bpy.context.scene.objects.active = originalArmature

# TODO: Check here that mesh is parented to armature

# Duplicate the selected armature and mesh
# From now on we'll be working with our copies so that
# we don't modify the user's original armature.
# Once we've FK'd the copy they can export it and then
# delete it, all the while their original model is unchanged
bpy.ops.object.duplicate()
# The newly created mesh and armature are now selected
fkArmature = None
# fkMesh = None
for obj in list(bpy.context.selected_objects):
    if obj.type == 'ARMATURE':
        # our duplicates will be turned into FK by the time we finish our
        # function so we name them accordingly
        fkArmature = obj
    # elif obj.type == 'MESH':
        # fkMesh = obj

# Loop through all pose bones and make sure they are selected. Some of our commands require that the bones be selected
for poseBone in fkArmature.pose.bones:
    poseBone.bone.select = True

# We iterate through the bones in the FK armature and remove all existing bone constraints
bpy.ops.object.mode_set(mode = 'POSE')
for bone in fkArmature.pose.bones:
    for constraint in bone.constraints:
        bone.constraints.remove(constraint)

# Now we remove all non deform bones from our FK armature,
# leaving only our FK bones
bpy.context.scene.objects.active = fkArmature
bpy.ops.object.mode_set(mode = 'EDIT')
fkArmature.select = True
for fkEditBone in bpy.data.armatures[fkArmature.name].edit_bones:
    if fkEditBone.use_deform == False:
        bpy.data.armatures[fkArmature.name].edit_bones.remove(fkEditBone)

# Iterate through every action so that we can bake all keyframes across all actions
actionsList = list(bpy.data.actions)
for actionInfo in actionsList:
    # Next we make our FK bones copy the transforms of their IK rig counterparts
    # So bone1 in FK rig would copy transforms of bone1 in IK rig, and so on
    # We do this for every action since we clear our transforms while baking
    # visual keys below
    bpy.ops.object.mode_set(mode = 'POSE')
    for fkBone in bpy.context.selected_pose_bones:
        copyTransforms = fkBone.constraints.new('COPY_TRANSFORMS')
        copyTransforms.target = originalArmature
        # the name of the bone in our original armature is the same as the name of our
        # fkArmature bone the armature was duplicated. Therefore we us `fkBone.name`
        copyTransforms.subtarget = fkBone.name
    # Now that our FK rig is copying our IK rigs transforms, we insert visual keyframes
    # for every keyframe. This gives our FK rigs the IK rigs transforms, after
    # which we can then delete the IK rig
    bpy.ops.object.mode_set(mode = 'OBJECT')
    originalArmature.animation_data.action = bpy.data.actions.get(actionInfo.name)
    fkArmature.animation_data.action = bpy.data.actions.get(actionInfo.name)
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
    # If this action has no keyframes we skip it
    if keyframes == []:
         continue
    # Now we bake all of our keyframes and remove our constraints
    bpy.ops.nla.bake(frame_start=keyframes[0], frame_end=keyframes[-1], only_selected=True, visual_keying=True, clear_constraints=True, use_current_action=True, bake_types={'POSE'})
    # Bake adds extra keyframes, so we delete any keyframes that did not previously exist
    bpy.ops.object.mode_set(mode = 'POSE')
    # Delete generated keyframes that did not exist before this script
    for frame in range(keyframes[0], keyframes[-1]):
        if frame not in keyframes:
            bpy.context.scene.frame_set(frame)
            bpy.ops.anim.keyframe_delete(type='LocRotScale')

# Go to Object mode so that they can export their new model
bpy.ops.object.mode_set(mode = 'OBJECT')
