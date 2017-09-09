var test = require('tape')
var cp = require('child_process')
var path = require('path')
var fs = require('fs')

var testBlendFile = path.resolve(__dirname, './leg.blend')
var runAddon = path.resolve(__dirname, '../run-addon.py')

// Our test blender file has 3 objects - a camera, mesh and armature
// Here we ensure that after we run the script there are 5 objects,
// since our script generates a new mesh and armature
test('Create a second armature', function (t) {
  t.plan(1)

  var printNumObjectsScript = path.resolve(__dirname, './helper-python-scripts/print-num-objects-to-stdout.py')

  // Run our addon and then verify that the number of objects went from 3 -> 5 because a new armature
  // and mesh were created
  cp.exec(
    `blender ${testBlendFile} --background --python ${runAddon} --python ${printNumObjectsScript}`,
    function (err, stdout, stderr) {
      if (err) { throw err }

      t.ok(
        stdout.indexOf('The number of objects is: 5') > -1, 'New mesh and armature were created'
      )
      t.end()
    }
  )
})

// We render a frame of our mesh's animation from before and then after we've run our FK generation script
// We then compare these two frames and make sure that they are the same. If they
// are then we know that our second mesh is in the same position as our first mesh at the keyframe that we rendered.
// Which means that the two meshes share the same animation.
test('Old and new armature have same animations', function (t) {
  t.plan(1)

  var bothImagesRendered
  var beforeFile = path.resolve(__dirname, './before')
  var afterFile = path.resolve(__dirname, './after')

  // Render our model without converting it into FK
  cp.exec(
    `blender -b ${testBlendFile} --render-output ${beforeFile} --render-frame 10 --render-format PNG -noaudio`,
    function (err, stdout, stderr) {
      if (err) { throw err }

      compareBeforeAndAfter()
      bothImagesRendered = true
    }
  )

  // Render our model after converting it into FK
  cp.exec(
    `blender -b ${testBlendFile} --python ${runAddon} --render-output ${afterFile} --render-frame 10 --render-format PNG -noaudio`,
    function (err, stdout, stderr) {
      if (err) { throw err }

      compareBeforeAndAfter()
      bothImagesRendered = true
    }
  )

  /**
   * Compare the rendering with and without our converted FK armature and make sure that they are exactly the same.
   *
   * We use the root square mean error between the two images and make sure that it is extremely low
   *  (aka there is no detectable difference between the FK armature and the IK armature)
   */
  function compareBeforeAndAfter () {
    t.plan(1)

    if (bothImagesRendered) {
      cp.exec(`compare -metric RMSE ${beforeFile}0010.png ${afterFile}0010.png /dev/null`, function (_, stdout, stderr) {
        // Compare will write the comparison to stderr. We parse their
        // It looks like this:
        //  7.31518 (0.000111623)
        // And we grab this
        //   0.000111623
        var rootSquareMeanError = Number(stderr.split('(')[1].split(')')[0])

        // Delete our test renderings
        fs.unlinkSync(`${beforeFile}0010.png`)
        fs.unlinkSync(`${afterFile}0010.png`)

        t.ok(rootSquareMeanError < 0.0002, 'New mesh and armature have the same animations as the old mesh and armature')
        t.end()
      })
    }
  }
})
