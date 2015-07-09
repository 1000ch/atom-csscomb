'use strict';

fs          = require('fs')
path        = require('path')
CSSBeautify = require('cssbeautify')
CSSComb     = require('csscomb')

csscomb        = new CSSComb('csscomb')
userConfigPath = atom.project.getDirectories()[0]?.resolve('.csscomb.json')
atomConfigPath = path.join(__dirname, '../csscomb.json')

if fs.existsSync(userConfigPath)
  userConfigJson = require(userConfigPath)
  csscomb.configure(userConfigJson)
else if fs.existsSync(atomConfigPath)
  atomConfigJson = require(atomConfigPath)
  csscomb.configure(atomConfigJson)

module.exports =

  activate: (state) ->
    atom.commands.add 'atom-workspace', 'csscomb:execute', => @execute()

  deactivate: ->

  getExecPath: ->
    "ATOM_SHELL_INTERNAL_RUN_AS_NODE=1 '#{process.execPath}'"

  getNodePath: ->
    atom.config.get('csscomb.nodepath')

  execute: ->
    editor = atom.workspace.getActiveTextEditor()

    return unless editor isnt no

    grammarName = editor.getGrammar().name.toLowerCase()
    isCSS  = grammarName is 'css'
    isScss = grammarName is 'scss'
    isLess = grammarName is 'less'
    isHTML = grammarName is 'html'

    syntax = 'css'
    if isCSS  then syntax = 'css'
    if isScss then syntax = 'scss'
    if isLess then syntax = 'less'
    if isHTML then syntax = 'css'

    text = editor.getText()
    selectedText = editor.getSelectedText()

    if selectedText.length isnt 0
      try
        sorted     = csscomb.processString(selectedText, syntax)
        beautified = CSSBeautify(sorted, {
          indent: '  '
        })
        editor.setTextInBufferRange(editor.getSelectedBufferRange(), beautified)
      catch e
        console.log(e)
    else
      try
        sorted = csscomb.processString(text, syntax)
        beautified = CSSBeautify(sorted, {
          indent: '  '
        })
        editor.setText(beautified)
      catch e
        console.log(e)
