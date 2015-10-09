'use babel';

import fs from 'fs';
import path from 'path';
import CSSComb from 'csscomb';
import postcss from 'postcss';
import perfectionist from 'perfectionist';

const directory = atom.project.getDirectories().shift();
const configPath = directory ? directory.resolve('.csscomb.json') : '';

export let config = {
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

const configureWithPreset = () => atom.config.get('atom-csscomb.configureWithPreset');
const configureWithJSON   = () => atom.config.get('atom-csscomb.configureWithJSON');
const executeOnSave       = () => atom.config.get('atom-csscomb.executeOnSave');
const formatType          = () => atom.config.get('atom-csscomb.formatType');
const indentSize          = () => atom.config.get('atom-csscomb.indentSize');
const maxAtRuleLength     = () => atom.config.get('atom-csscomb.maxAtRuleLength');
const maxSelectorLength   = () => atom.config.get('atom-csscomb.maxSelectorLength');
const maxValueLength      = () => atom.config.get('atom-csscomb.maxValueLength');

const getCombConfig = () => {

  let config;

  if (configureWithJSON()) {
    if (fs.existsSync(configPath)) {
      config = require(configPath);
    }
  }

  if (!config) {
    config = CSSComb.getConfig(configureWithPreset());
  }

  return config;
};

const comb = (css = '', syntax = 'css') => {

  let csscomb = new CSSComb(getCombConfig());
  let combed = csscomb.processString(css, {
    syntax: syntax
  });

  return postcss([perfectionist({
    syntax: syntax,
    format: formatType(),
    indentSize: indentSize(),
    maxAtRuleLength: maxAtRuleLength(),
    maxSelectorLength: maxSelectorLength(),
    maxValueLength: maxValueLength()
  })]).process(combed).css;
};

const execute = () => {

  const editor = atom.workspace.getActiveTextEditor();

  if (!editor) {
    return;
  }

  let position = editor.getCursorBufferPosition();
  let text = editor.getText();
  let selectedText = editor.getSelectedText();
  let grammer = editor.getGrammar().name.toLowerCase();

  try {
    if (selectedText.length !== 0) {
      editor.setTextInBufferRange(
        editor.getSelectedBufferRange(),
        comb(selectedText, grammer)
      );
    } else {
      editor.setText(comb(text, grammer));
    }
  } catch (e) {
    console.error(e);
  }

  editor.setCursorBufferPosition(position);
};

let editorObserver = null;

export const activate = (state) => {

  atom.commands.add('atom-workspace', 'atom-csscomb:execute', () => {
    execute();
  });

  editorObserver = atom.workspace.observeTextEditors((editor) => {
    editor.getBuffer().onWillSave(() => {
      if (executeOnSave()) {
        execute();
      }
    });
  });
};

export const deactivate = () => {
  editorObserver.dispose();
};
