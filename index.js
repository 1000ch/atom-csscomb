'use babel';

import * as path from 'path';
import CSSComb from 'csscomb';
import { find } from 'atom-linter';

export const config = {
  presetConfig: {
    title: 'Configure with preset',
    description: 'Select preset config bundled with CSSComb.',
    type: 'string',
    default: 'csscomb',
    enum: ['recommend', 'csscomb', 'zen', 'yandex']
  },
  extendPreset: {
    title: 'Extend preset',
    description: 'Extend selected preset config with project config if exists.',
    type: 'boolean',
    default: false
  },
  executeOnSave: {
    title: 'Execute on Save',
    description: 'Execute sorting CSS property on save.',
    type: 'boolean',
    default: false
  }
};

let editorObserver;
let projectConfig;
let presetConfig;
let extendPreset;
let executeOnSave;

export function activate(state) {
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

  presetConfig = atom.config.get('atom-csscomb.presetConfig');
  extendPreset = atom.config.get('atom-csscomb.extendPreset');
  executeOnSave = atom.config.get('atom-csscomb.executeOnSave');

  atom.config.observe('atom-csscomb.presetConfig', value => presetConfig = value);
  atom.config.observe('atom-csscomb.extendPreset', value => extendPreset = value);
  atom.config.observe('atom-csscomb.executeOnSave', value => executeOnSave = value);
}

export function deactivate() {
  editorObserver.dispose();
}

function getConfig(filePath) {
  let configFile = find(path.dirname(filePath), '.csscomb.json');
  let projectConfig = configFile ? require(configFile) : null;
  let config = presetConfig === 'recommend' ? require(`${__dirname}/recommend.json`) : CSSComb.getConfig(presetConfig);

  if (extendPreset) {
    return Object.assign(config, projectConfig);
  }

  return projectConfig || config;
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
