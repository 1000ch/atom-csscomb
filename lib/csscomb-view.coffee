{View} = require 'atom'

module.exports =
class AtomCsscombView extends View
  @content: ->
    @div class: 'atom-csscomb overlay from-top', =>
      @div "The AtomCsscomb package is Alive! It's ALIVE!", class: "message"

  initialize: (serializeState) ->
    atom.workspaceView.command "csscomb:execute", => @execute()

  # Returns an object that can be retrieved when package is activated
  serialize: ->

  # Tear down any state and detach
  destroy: ->
    @detach()

  execute: ->
    if @hasParent()
      @detach()
    else
      atom.workspaceView.append(this)
