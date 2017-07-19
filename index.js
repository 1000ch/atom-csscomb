'use babel';

import { CompositeDisposable } from 'atom';
import * as path from 'path';
import Comb from 'csscomb';
import { find } from 'atom-linter';

let subscriptions;
let projectConfig;
let presetConfig;
let extendPreset;

export function activate(state) {
  subscriptions = new CompositeDisposable();

  subscriptions.add(atom.config.observe('atom-csscomb.presetConfig', value => {
    presetConfig = Comb.getConfig(value);
  }));

  subscriptions.add(atom.config.observe('atom-csscomb.extendPreset', value => {
    extendPreset = value;
  }));

  atom.commands.add('atom-workspace', 'atom-csscomb:comb', () => {
    comb(atom.workspace.getActiveTextEditor());
  });
}

export function deactivate() {
  subscriptions.dispose();
}

function getConfig(filePath) {
  const configFile = find(path.dirname(filePath), '.csscomb.json');
  const projectConfig = configFile ? require(configFile) : null;

  if (extendPreset) {
    return Object.assign(presetConfig, projectConfig);
  }

  return projectConfig || presetConfig;
}

async function comb(editor) {
  if (!editor) {
    return;
  }

  const position = editor.getCursorBufferPosition();
  const config = getConfig(editor.getPath());

  try {
    const comb = new Comb(config);
    const css = await comb.processString(editor.getText(), {
      syntax: editor.getGrammar().name.toLowerCase()
    });

    editor.setText(css);
    editor.setCursorBufferPosition(position);
  } catch (e) {
    console.error(e);
  }
}
