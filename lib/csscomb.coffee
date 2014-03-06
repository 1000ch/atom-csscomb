'use strict';

fs = require('fs')
path = require('path')

CSSComb = require('csscomb')
csscomb = new CSSComb('csscomb')
userConfigPath = atom.project.resolve('.csscomb.json')
atomConfigPath = path.join(__dirname, '../csscomb.json')

if fs.existsSync(userConfigPath)
  userConfigJson = require(userConfigPath)
  csscomb.configure(userConfigJson)
else if fs.existsSync(atomConfigPath)
  atomConfigJson = require(atomConfigPath)
  csscomb.configure(atomConfigJson)
  
module.exports =

  activate: (state) ->
    atom.workspaceView.command 'csscomb:execute', => @execute()

  getExecPath: ->
    "ATOM_SHELL_INTERNAL_RUN_AS_NODE=1 '#{process.execPath}'"

  getNodePath: ->
    atom.config.get('csscomb.nodepath')

  execute: ->
    editor = atom.workspace.getActiveEditor()

    return unless editor isnt no

    grammarName = editor.getGrammar().name.toLowerCase()
    isCSS = grammarName is 'css'
    isScss = grammarName is 'scss'
    isLess = grammarName is 'less'
    isHTML = grammarName is 'html'

    syntax = 'css'
    if isCSS then syntax = 'css'
    if isScss then syntax = 'scss'
    if isLess then syntax = 'less'
    if isHTML then syntax = 'css'

    text = editor.getText()
    selectedText = editor.getSelectedText()

    if selectedText.length isnt 0
      try
        sortedText = csscomb.processString(selectedText, syntax)
        editor.setTextInBufferRange(editor.getSelectedBufferRange(), sortedText)
      catch e
        console.log(e)
    else
      try
        sortedText = csscomb.processString(text, syntax)
        editor.setText(sortedText)
      catch e
        console.log(e)