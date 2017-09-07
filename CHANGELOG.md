# 1.2.0

- Previously your newly generated model would only be keyframed for the action that was active
when you ran `blender-iks-to-fks`. Now we loop through each action and bake all of your keyframes
onto your newly generated FK armature. This allows you to export all actions, not just to
one that you ran this script on

## 1.1.0

- Previously we would introduce new keyframes in between your existing ones
while baking keyframes. We now delete all newly generated keyframes before the
script ends, so that you're left with only your original keyframes.

## 1.0.0

- Initial release!
