# [atom-csscomb](https://atom.io/packages/atom-csscomb)

## About

Sort your CSS with [CSSComb](https://github.com/csscomb/csscomb.js).

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

![settings](https://raw.githubusercontent.com/1000ch/atom-csscomb/master/settings.png)

### Configure with JSON

To configure with JSON file, check this.
There are 2 ways to apply from JSON file for sort order.

1. Put `.csscomb.json` to workspace of atom.
2. Edit `~/.atom/packages/atom-csscomb/csscomb.json`.

If there is `.csscomb.json`, it will be applied primary. 
(Even though you edit `~/.atom/packages/atom-csscomb/csscomb.json`.)

### Configure with preset

To configure with presets (`csscomb`, `zen`, `yandex`), check this.

### Execute on Save

If you want to apply sort when you save, check it on.

### Indent Type

Choose the indent type from **space** (default) or **tab**.

### Indent Size

Set the indent size (default is **2**). This value is used when you are choosing **space** for indent type.

## License

MIT: http://1000ch.mit-license.org
