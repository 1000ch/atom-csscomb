'use strict';

fs          = require('fs')
path        = require('path')
CSSBeautify = require('cssbeautify')
CSSComb     = require('csscomb')

userConfigPath = atom.project.getDirectories()[0]?.resolve('.csscomb.json')
atomConfigPath = path.join(__dirname, '../csscomb.json')

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

    csscomb = new CSSComb('csscomb')
    if fs.existsSync(userConfigPath)
      csscomb.configure(require(userConfigPath))
    else if fs.existsSync(atomConfigPath)
      csscomb.configure(require(atomConfigPath))

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
    selected = editor.getSelectedText()

    if selected.length isnt 0
      try
        sorted = csscomb.processString(selected, {
          syntax: syntax
        })
        if isCSS
          sorted = CSSBeautify(sorted, {
            indent: '  '
          })
        editor.setTextInBufferRange(editor.getSelectedBufferRange(), sorted)
      catch e
        console.log(e)
    else
      try
        sorted = csscomb.processString(text, {
          syntax: syntax
        })
        if isCSS
          sorted = CSSBeautify(sorted, {
            indent: '  '
          })
        editor.setText(sorted)
      catch e
        console.log(e)
