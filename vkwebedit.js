/* global $ */
/* global FileReader */

var vkwebedit = (function () {
  // All the outputs detected at application load time
  var outputs = []

  /**
   * Build the application area, including controls.
   */
  var buildApp = function () {
    if (navigator.requestMIDIAccess) {
      // Try to connect to the MIDI interface.
      navigator.requestMIDIAccess().then(onSuccess, onFailure)
    } else {
      console.log('Web MIDI API not supported!')
      var helpText = "Could not connect to the MIDI interface. Please <a href='http://caniuse.com/#feat=midi'>check if your browser supports MIDI</a>"
      $('<p>', {
        'class': 'alert alert-warning',
        html: helpText
      }).appendTo('#apparea')
    }
  }

  /**
   * Get the current output from the user interface.
   */
  function getOutputFromInterface () {
    var outputIndex = $('#midiOutputs').val()
    return outputs[outputIndex]
  }

  /**
   * Send a test note to a MIDI output device.
   *
   * @param output the output device to be used. If null, the selected device will be used
   */
  var sendTestNote = function (output) {
    if (output == null) {
      output = getOutputFromInterface()
    }

    if (output.send == null) {
      console.log('Cannot send to output ' + output.name)
      return
    }

    // Craft 'note on' and 'note off' messages (channel 1, note number 60 [C3], max velocity)
    var noteon = [0x90, 60, 127]
    var noteoff = [0x80, 60, 127]

    // Send the 'note on' and schedule the 'note off' for 1 second later
    output.send(noteon)
    setTimeout(
      function () {
        output.send(noteoff)
      },
      1000
    )
  }

  /**
   * Send a patch to a MIDI output device.
   * The CC codes and the values are taken from the interface.
   */
  var sendPatch = function () {
    var output = getOutputFromInterface()

    $('input.cc-control').each(function (i) {
      var ccid = parseInt($(this).attr('data-id'))
      var ccvalue = parseInt($(this).val())

      // Adapt the value of the Octave parameter.
      // 32': 0-21. 16': 22-43. 8': 44-65. 4': 66-87. 2': 88-109. 1': 110-127.
      if (ccid === 41) {
        ccvalue *= 22
      }

      var message = [0xB0, ccid, ccvalue]

      output.send(message)
    })
  }

  /**
   * Get the current patch data from the user interface.
   */
  function getCurrentPatchData () {
    var messagesList = []
    $('input.cc-control').each(function (i) {
      var ccid = $(this).attr('data-id')
      var ccname = $(this).attr('data-name')
      var ccvalue = $(this).val()

      messagesList.push({
        'id': ccid,
        'name': ccname,
        'value': ccvalue
      })
    })

    return { messagesList }
  }

  /**
   * Save current patch in json format.
   */
  var savePatch = function () {
    var patchData = getCurrentPatchData()
    var data = 'data:application/octet-stream;charset=utf-8;filename=patch.json,' + encodeURIComponent(JSON.stringify(patchData))
    var filename = $('#patchname').val()
    $('#savepatch').attr('download', filename)
    $('#savepatch').attr('href', data)
  }

  /**
   * Load a patch in json format.
   */
  var loadPatch = function (files) {
    console.log('Calling loadPatch')
    if (!files) { return }
    var f = files[0]

    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      if (f) {
        var r = new FileReader()
        r.onload = function (e) {
          var contents = e.target.result
          var obj = JSON.parse(contents)
          if (!obj.messagesList) {
            console.log('Illegal file format')
            return
          }
          for (var i = 0; i < obj.messagesList.length; i++) {
            var controlObject = obj.messagesList[i]
            var ccid = controlObject.id
            var ccvalue = controlObject.value
            console.log('ID: ' + ccid + '. Value: ' + ccvalue)
            $('#cc' + ccid).val(ccvalue)
            // Update the knobs values too
            $('.dial').trigger('change')
          }
        }
        r.readAsText(f)
      } else {
        console.log('Failed to load file')
      }
    } else {
      console.log('The File APIs are not fully supported by your browser.')
    }
  }

  /**
   * Function executed on successful MIDI connection.
   */
  function onSuccess (interf) {
    var midiOutputs = []

    // Grab an array of all available devices
    var iter = interf.outputs.values()
    var numDevice = 0
    for (var i = iter.next(); i && !i.done; i = iter.next()) {
      outputs.push(i.value)
      midiOutputs.push("<option value='" + numDevice + "'>" + i.value.name + '</option>')
      numDevice++
    }

    $('#midiOutputs').append(midiOutputs.join(''))
  }

  /**
   * Function executed on failed MIDI connection.
   */
  function onFailure (error) {
    console.log('Could not connect to the MIDI interface')
  }

  // Public interface.
  return {
    'buildApp': buildApp,
    'sendTestNote': sendTestNote,
    'sendPatch': sendPatch,
    'savePatch': savePatch,
    'loadPatch': loadPatch
  }
}())
