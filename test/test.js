var test = require('tape')
var cp = require('child_process')
var path = require('path')

var runAddon = path.resolve(__dirname, '../run-addon.py')

// compare -metric RMSE before.png0005.png after.png0005.png

// Our test blender file has 3 objects - a camera, mesh and armature
// Here we ensure that after we run the script there are 5 objects,
// since our script generates a new mesh and armature
test('Create a second armature', function (t) {
  t.plan(1)

  var testBlendFile = path.resolve(__dirname, './leg.blend')
  var printNumObjectsScript = path.resolve(__dirname, './helper-python-scripts/print-num-objects-to-stdout.py')

  // Run our addon and then verify that the number of objects went from 3 -> 5 because a new armature
  // and mesh were created
  cp.exec(
    `blender ${testBlendFile} --background --python ${runAddon} --python ${printNumObjectsScript}`,
    function (err, stdout, stderr) {
      if (err) { throw err }

      t.ok(
        stdout.indexOf('This number of objects is: 5') > -1
      )
      t.end()
    }
  )
})
