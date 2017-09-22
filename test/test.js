var test = require('tape')
var cp = require('child_process')
var path = require('path')
var fs = require('fs')

// A leg with IKs
var legBlendFile = path.resolve(__dirname, './leg.blend')
// A file with an unselected mesh and parent armature
var unselectedBlendFile = path.resolve(__dirname, './unselected.blend')

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
    `blender ${legBlendFile} --background --python ${runAddon} --python ${printNumObjectsScript}`,
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
  // TODO: Combine these two arrays into an object {legBlendFile: 10}
  var filesToTest = [
    legBlendFile
  ]
  var framesToRender = [
    10
  ]

  t.plan(filesToTest.length)

  // An index for each of our test files on whether or not the before and after have been rendered
  // i.e. bothImagesRendered[2] = true means the third test file has had its before and after rendered
  var bothImagesRendered = {}

  filesToTest.forEach(function (testFile, testFileNum) {
    var beforeFile = path.resolve(__dirname, `./before_${testFileNum}_`)
    var afterFile = path.resolve(__dirname, `./after_${testFileNum}_`)

    // Render our model without converting it into FK
    cp.exec(
      `blender -b ${testFile} --render-output ${beforeFile} --render-frame ${framesToRender[testFileNum]} --render-format PNG -noaudio`,
      function (err, stdout, stderr) {
        if (err) { throw err }

        compareBeforeAndAfter(testFileNum)
        bothImagesRendered[testFileNum] = true
      }
    )

    // Render our model after converting it into FK
    cp.exec(
      `blender -b ${testFile} --python ${runAddon} --render-output ${afterFile} --render-frame ${framesToRender[testFileNum]} --render-format PNG -noaudio`,
      function (err, stdout, stderr) {
        if (err) { throw err }

        compareBeforeAndAfter(testFileNum)
        bothImagesRendered[testFileNum] = true
      }
    )
  })

  /**
   * Compare the rendering with and without our converted FK armature and make sure that they are exactly the same.
   *
   * We use the root square mean error between the two images and make sure that it is extremely low
   *  (aka there is no detectable difference between the FK armature and the IK armature)
   */
  function compareBeforeAndAfter (testFileNum) {
    var beforeFile = path.resolve(__dirname, `./before_${testFileNum}_`)
    var afterFile = path.resolve(__dirname, `./after_${testFileNum}_`)

    if (bothImagesRendered[testFileNum]) {
      cp.exec(`compare -metric RMSE ${beforeFile}00${framesToRender[testFileNum]}.png ${afterFile}00${framesToRender[testFileNum]}.png /dev/null`, function (_, stdout, stderr) {
        // Compare will write the comparison to stderr. We parse their
        // It looks like this:
        //  7.31518 (0.000111623)
        // And we grab this
        //   0.000111623
        var rootSquareMeanError = Number(stderr.split('(')[1].split(')')[0])

        // Delete our test renderings
        fs.unlinkSync(`${beforeFile}00${framesToRender[testFileNum]}.png`)
        fs.unlinkSync(`${afterFile}00${framesToRender[testFileNum]}.png`)

        t.ok(rootSquareMeanError < 0.0002, 'New mesh and armature have the same animations as the old mesh and armature')
      })
    }
  }
})

// If you have not selected a mesh that has an armature we will use the first mesh that we find that has an armature
// This makes everything work right out of the box for blender files that only have one armature and mesh.
// TODO: We'll still need to figure out how to best handle files with multiple mesh's / armatures
test('Automatically selects mesh if none selected', function (t) {
  t.plan(1)

  var printNumObjectsScript = path.resolve(__dirname, './helper-python-scripts/print-num-objects-to-stdout.py')

  // Run our addon and then verify that the number of objects went from 3 -> 5 because a new armature
  // and mesh were created
  cp.exec(
    `blender ${unselectedBlendFile} --background --python ${runAddon} --python ${printNumObjectsScript}`,
    function (err, stdout, stderr) {
      if (err) { throw err }

      t.ok(
        stdout.indexOf('The number of objects is: 5') > -1, 'Mesh and armature were automatically detected'
      )
      t.end()
    }
  )
})
