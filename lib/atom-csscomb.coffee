'use strict';

CSSComb = require('csscomb')
csscomb = new CSSComb('csscomb')

module.exports =

  activate: (state) ->
    atom.workspaceView.command 'atom-csscomb:execute', => @execute()

  getExecPath: ->
    "ATOM_SHELL_INTERNAL_RUN_AS_NODE=1 '#{process.execPath}'"

  getNodePath: ->
    atom.config.get('atom-csscomb.nodepath')

  execute: ->
    editor = atom.workspace.getActiveEditor()

    return unless editor isnt no

    isCSSFile = editor.getGrammar().name is 'CSS'
    cssText = editor.getText()
    selectedText = editor.getSelectedText()

    if selectedText.length isnt 0
      try
        sortedText = csscomb.processString(selectedText, 'css')
        editor.setTextInBufferRange(editor.getSelectedBufferRange(), sortedText)
      catch e
        console.log(e)
    else
      try
        sortedText = csscomb.processString(cssText, 'css')
        editor.setText(sortedText)
      catch e
        console.log(e)

    return unless isCSSFile is yes
