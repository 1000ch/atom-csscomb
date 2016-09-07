# [atom-csscomb](https://atom.io/packages/atom-csscomb) [![Dependency Status](https://david-dm.org/1000ch/atom-csscomb.svg)](https://david-dm.org/1000ch/atom-csscomb)

Sort CSS properties with [CSSComb](https://github.com/csscomb/csscomb.js).

![demo](https://raw.githubusercontent.com/1000ch/atom-csscomb/master/demo.gif)

## Installation

```bash
$ apm install atom-csscomb
```

## Usage

- Press `ctrl + alt + c`
- `Packages` > `CSSComb` > `Sort properties`
- Right Click > `Sort properties`

Selected text will be sorted if there is selection.

## Configuration

To configure with [`.csscomb.json`](https://github.com/csscomb/csscomb.js/blob/master/doc/options.md), just put it to workspace.

### Preset config

To configure with presets (`recommend`, `csscomb`, `zen`, `yandex`), check this. [`recommend`](./recommend.json) is created originally by me.

### Extend preset

Extend selected preset config with project config if exists.

### Execute on Save

If you want to apply sort when you save, check it on.

## License

MIT: http://1000ch.mit-license.org
