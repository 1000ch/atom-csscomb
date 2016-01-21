'use babel';

import * as fs from 'fs';
import * as path from 'path';
import CSSComb from 'csscomb';
import postcss from 'postcss';
import perfectionist from 'perfectionist';
import { find } from 'atom-linter';

export const config = {
  configureWithPreset: {
    title: 'Configure with preset',
    description: 'Configure with preset config.',
    type: 'string',
    default: 'csscomb',
    enum: ['csscomb', 'zen', 'yandex']
  },
  configureWithJSON: {
    title: 'Configure with JSON',
    description: 'Configure with JSON file in the current directory.',
    type: 'boolean',
    default: false
  },
  executeOnSave: {
    title: 'Execute on Save',
    description: 'Execute sorting CSS property on save.',
    type: 'boolean',
    default: false
  },
  formatType: {
    title: 'Format Type',
    description: 'Only facilitates simple whitespace compression around selectors & declarations.',
    type: 'string',
    default: 'expanded',
    enum: ['expanded', 'compact', 'compressed']
  },
  indentSize: {
    title: 'Indent Size',
    type: 'number',
    default: 2
  },
  maxAtRuleLength: {
    title: 'Max at Rule Length',
    description: 'This transform only applies to the expanded format.',
    type: 'number',
    default: 80
  },
  maxSelectorLength: {
    title: 'Max Selector Length',
    description: 'This transform only applies to the compressed format.',
    type: 'number',
    default: 80
  },
  maxValueLength: {
    title: 'Max Value Length',
    description: 'This transform only applies to the expanded format.',
    type: 'number',
    default: 80
  }
};

let editorObserver;
let projectConfig;
let configureWithPreset;
let configureWithJSON;
let executeOnSave;
let formatType;
let indentSize;
let maxAtRuleLength;
let maxSelectorLength;
let maxValueLength;

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

  configureWithPreset = atom.config.get('atom-csscomb.configureWithPreset');
  configureWithJSON = atom.config.get('atom-csscomb.configureWithJSON');
  executeOnSave = atom.config.get('atom-csscomb.executeOnSave');
  formatType = atom.config.get('atom-csscomb.formatType');
  indentSize = atom.config.get('atom-csscomb.indentSize');
  maxAtRuleLength = atom.config.get('atom-csscomb.maxAtRuleLength');
  maxSelectorLength = atom.config.get('atom-csscomb.maxSelectorLength');
  maxValueLength = atom.config.get('atom-csscomb.maxValueLength');

  atom.config.observe('atom-csscomb.configureWithPreset', value => configureWithPreset = value);
  atom.config.observe('atom-csscomb.configureWithJSON', value => configureWithJSON = value);
  atom.config.observe('atom-csscomb.executeOnSave', value => executeOnSave = value);
  atom.config.observe('atom-csscomb.formatType', value => formatType = value);
  atom.config.observe('atom-csscomb.indentSize', value => indentSize = value);
  atom.config.observe('atom-csscomb.maxAtRuleLength', value => maxAtRuleLength = value);
  atom.config.observe('atom-csscomb.maxSelectorLength', value => maxSelectorLength = value);
  atom.config.observe('atom-csscomb.maxValueLength', value => maxValueLength = value);
}

export function deactivate() {
  editorObserver.dispose();
}

function comb(css = '', syntax = 'css', config = {}) {
  let csscomb = new CSSComb(config);
  let combed = csscomb.processString(css, {
    syntax: syntax
  });

  return postcss([perfectionist({
    syntax: syntax,
    format: formatType,
    indentSize: indentSize,
    maxAtRuleLength: maxAtRuleLength,
    maxSelectorLength: maxSelectorLength,
    maxValueLength: maxValueLength
  })]).process(combed).css;
}

function execute() {
  const editor = atom.workspace.getActiveTextEditor();

  if (!editor) {
    return;
  }

  let position = editor.getCursorBufferPosition();
  let text = editor.getText();
  let filePath = editor.getPath();
  let selectedText = editor.getSelectedText();
  let grammer = editor.getGrammar().name.toLowerCase();

  let projectConfig = find(path.dirname(filePath), '.csscomb.json');
  let config;
  if (configureWithJSON && projectConfig) {
    config = require(projectConfig);
  } else {
    config = CSSComb.getConfig(configureWithPreset);
  }

  try {
    if (selectedText.length !== 0) {
      let range = editor.getSelectedBufferRange();
      let css = comb(selectedText, grammer, config);
      editor.setTextInBufferRange(range, css);
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
