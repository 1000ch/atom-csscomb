'use strict';

fs          = require('fs')
path        = require('path')

CSSBeautify = require('cssbeautify')
CSSComb     = require('csscomb')

userConfigPath = atom.project.getDirectories()[0]?.resolve('.csscomb.json')
atomConfigPath = path.join(__dirname, '../csscomb.json')

module.exports =

  config:
    executeOnSave:
      title: 'Execute on save'
      description: 'Execute sorting CSS property on save.'
      type: 'boolean'
      default: false
    indentType:
      title: 'Indent Type'
      type: 'string'
      default: 'space'
      enum: ['space', 'tab']
    indentSize:
      title: 'Indent Size'
      type: 'number'
      default: 2

  activate: (state) ->
    atom.commands.add 'atom-workspace', 'csscomb:execute', () => @execute()
    @editorObserver = atom.workspace.observeTextEditors (editor) =>
      editor.getBuffer().onWillSave () =>
        if (@isExecuteOnSave())
          @execute()

  deactivate: ->
    @editorObserver.dispose()

  isExecuteOnSave: ->
    atom.config.get('atom-csscomb.executeOnSave')

  indentType: ->
    atom.config.get('atom-csscomb.indentType')

  indentSize: ->
    atom.config.get('atom-csscomb.indentSize')

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
    isSass = grammarName is 'sass'
    isLess = grammarName is 'less'
    isHTML = grammarName is 'html'

    syntax = 'css'
    if isCSS  then syntax = 'css'
    if isScss then syntax = 'scss'
    if isSass then syntax = 'sass'
    if isLess then syntax = 'less'
    if isHTML then syntax = 'css'

    text = editor.getText()
    selected = editor.getSelectedText()
    indent = ''
    if indentType is 'space' then indent = Array(indentSize + 1).join(' ')
    if indentType is 'tab'   then indent = '\t'

    if selected.length isnt 0
      try
        sorted = csscomb.processString(selected, { syntax: syntax })

        if isCSS then sorted = CSSBeautify(sorted, { indent: indent })

        editor.setTextInBufferRange(editor.getSelectedBufferRange(), sorted)
      catch e
        console.log(e)
    else
      try
        sorted = csscomb.processString(text, { syntax: syntax })

        if isCSS then sorted = CSSBeautify(sorted, { indent: indent })

        editor.setText(sorted)
      catch e
        console.log(e)
