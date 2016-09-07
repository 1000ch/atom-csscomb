'use babel';

import { CompositeDisposable } from 'atom';
import * as path from 'path';
import CSSComb from 'csscomb';
import { find } from 'atom-linter';

let subscriptions;
let editorObserver;
let projectConfig;
let presetConfig;
let extendPreset;
let executeOnSave;

export function activate(state) {
  subscriptions = new CompositeDisposable();

  subscriptions.add(atom.config.observe('atom-csscomb.presetConfig', value => {
    if (value === 'recommend') {
      presetConfig = require(`${__dirname}/recommend.json`);
    } else {
      presetConfig = CSSComb.getConfig(value);
    }
  }));

  subscriptions.add(atom.config.observe('atom-csscomb.extendPreset', value => {
    extendPreset = value;
  }));

  subscriptions.add(atom.config.observe('atom-csscomb.executeOnSave', value => {
    executeOnSave = value;
  }));

  atom.commands.add('atom-workspace', 'atom-csscomb:execute', () => {
    execute();
  });

  editorObserver = atom.workspace.observeTextEditors(editor => {
    editor.getBuffer().onWillSave(() => {
      if (executeOnSave) {
        execute();
      }
    });
  });
}

export function deactivate() {
  subscriptions.dispose();
  editorObserver.dispose();
}

function getConfig(filePath) {
  let configFile = find(path.dirname(filePath), '.csscomb.json');
  let projectConfig = configFile ? require(configFile) : null;

  if (extendPreset) {
    return Object.assign(config, projectConfig);
  }

  return projectConfig || presetConfig;
}

function comb(css = '', syntax = 'css', config = {}) {
  const csscomb = new CSSComb(config);

  return csscomb.processString(css, {
    syntax: syntax
  });
}

function execute() {
  const editor = atom.workspace.getActiveTextEditor();

  if (!editor) {
    return;
  }

  let position = editor.getCursorBufferPosition();
  let text = editor.getText();
  let selectedText = editor.getSelectedText();
  let grammer = editor.getGrammar().name.toLowerCase();
  let config = getConfig(editor.getPath());

  try {
    if (selectedText.length !== 0) {
      let css = comb(selectedText, grammer, config);
      let range = editor.getSelectedBufferRange();
      editor.setTextInBufferRange(range, result.css);
      editor.setCursorBufferPosition(position);
    } else {
      let css = comb(text, grammer, config);
      editor.setText(css);
      editor.setCursorBufferPosition(position);
    }
  } catch (e) {
    console.error(e);
  }
}
