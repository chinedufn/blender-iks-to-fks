const test = require('tape')
const cp = require('child_process')
const path = require('path')
const fs = require('fs')

// A leg with IKs
const legBlendFile = path.resolve(__dirname, './leg.blend')
// A file with an unselected mesh and parent armature
const unselectedBlendFile = path.resolve(__dirname, './unselected.blend')
// We noticed that if there are bone hooks on a bezier curve that is being used to control a spline IK modifier
// the ik-to-fk process would only work if those bone hooks had `Deform` set to true in Blender.
//
// However, these aren't actually deformation bones - so this file ensures that we've fixed this and that
// things work when `Deform` is false.
const bezierCurveBoneHooksDeformOff = path.resolve(__dirname, './bone-hooks.blend')

const runAddon = path.resolve(__dirname, '../run-addon.py')

test('Blender Ik to FK tests', t => {
  t.test('Creates a second armature', testCreatesSecondArmature)
  t.test('Old and new armature have same animations', testSameAnimations)
  t.test('Automatically selects mesh if none selected', testAutomaticSelection)
  t.test('No new actions created', testNoNewActionsCreated)
})

// Our test blender file has 3 objects - a camera, mesh and armature
// Here we ensure that after we run the script there are 5 objects,
// since our script generates a new mesh and armature
function testCreatesSecondArmature (t) {
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
}

// We render a frame of our mesh's animation from before and then after we've run our FK generation script
// We then compare these two frames and make sure that they are the same. If they
// are then we know that our second mesh is in the same position as our first mesh at the keyframe that we rendered.
// Which means that the two meshes share the same animation.
function testSameAnimations (t) {
  const filesToTest = [
      // In blender 2.79 this was <0.0002 .. In 2.80 we moved it up to <0.0036 ..
      // After looking at a few more complicated models the before and after still seem to be nearly identical.
      {file: legBlendFile, frameToRender: 10, maxError: 0.0036},
      // Need to look into why there is so much error here
      {file: bezierCurveBoneHooksDeformOff, frameToRender: 19, maxError: 0.0179}
  ]

  t.plan(filesToTest.length)

  // An index for each of our test files on whether or not the before and after have been rendered
  // i.e. bothImagesRendered[2] = true means the third test file has had its before and after rendered
  var bothImagesRendered = {}

  filesToTest.forEach(function (testCase, testFileNum) {
    const testFile = testCase.file

    const beforeFile = path.resolve(__dirname, `./before_${testFileNum}_`)
    const afterFile = path.resolve(__dirname, `./after_${testFileNum}_`)

    // Render our model without converting it into FK
    cp.exec(
      `blender -b ${testFile} --render-output ${beforeFile} --render-frame ${testCase.frameToRender} --render-format PNG -noaudio`,
      function (err, stdout, stderr) {
        if (err) { throw err }

        compareBeforeAndAfter(testCase, testFileNum)
        bothImagesRendered[testFileNum] = true
      }
    )

    // Render our model after converting it into FK
    cp.exec(
      `blender -b ${testFile} --python ${runAddon} --render-output ${afterFile} --render-frame ${testCase.frameToRender} --render-format PNG -noaudio`,
      function (err, stdout, stderr) {
        if (err) { throw err }

        compareBeforeAndAfter(testCase, testFileNum)
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
  function compareBeforeAndAfter (testCase, testFileNum) {
    var beforeFile = path.resolve(__dirname, `./before_${testFileNum}_`)
    var afterFile = path.resolve(__dirname, `./after_${testFileNum}_`)

    if (bothImagesRendered[testFileNum]) {
      cp.exec(`compare -metric RMSE ${beforeFile}00${testCase.frameToRender}.png ${afterFile}00${testCase.frameToRender}.png /dev/null`, function (_, stdout, stderr) {
        // Compare will write the comparison to stderr. We parse their
        // It looks like this:
        //  7.31518 (0.000111623)
        // And we grab this
        //   0.000111623
        var rootSquareMeanError = Number(stderr.split('(')[1].split(')')[0])

        // Delete our test renderings
        fs.unlinkSync(`${beforeFile}00${testCase.frameToRender}.png`)
        fs.unlinkSync(`${afterFile}00${testCase.frameToRender}.png`)

        t.ok(rootSquareMeanError < testCase.maxError, `Root square mean error between old and new armature ${rootSquareMeanError}. ${testCase.file}`)
      })
    }
  }
}

// If you have not selected a mesh that has an armature we will use the first mesh that we find that has an armature
// This makes everything work right out of the box for blender files that only have one armature and mesh.
function testAutomaticSelection (t) {
  t.plan(1)

  var printNumObjectsScript = path.resolve(__dirname, './helper-python-scripts/print-num-objects-to-stdout.py')

  // Run our addon and then verify that the number of objects went from 3 -> 5 because a new armature
  // and mesh were created
  cp.exec(
    `blender ${unselectedBlendFile} --background --python ${runAddon} --python ${printNumObjectsScript}`,
    function (err, stdout, stderr) {
      if (err) { throw err }

      t.ok(
        // Original mesh and armature, new mesh and armature, camera = 5 objects total
        stdout.indexOf('The number of objects is: 5') > -1, 'Mesh and armature were automatically detected'
      )
      t.end()
    }
  )
}

// Make sure that all of the actions that get created when we duplicate our armature and mesh end up getting removed.
function testNoNewActionsCreated (t) {
  const printActionsScript = path.resolve(__dirname, './helper-python-scripts/print-actions-to-stdout.py')
  let command = `blender ${legBlendFile} --background --python ${runAddon} --python ${printActionsScript}`

  cp.exec(
        command,
        function (err, stdout, stderr) {
          if (err) { throw err }

          console.log(stdout)
          console.log(stderr)

          t.ok(
                stdout.indexOf('The number of actions is: 1') > -1, 'No new actions were persisted'
            )
          t.end()
        }
    )
}
