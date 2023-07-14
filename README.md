# bio

My personal bio page

## Feature

* Generate html from information defined in `config.toml`.
* Support to hide sensitive information and load by Javascript.
* Material design like.
* Generate single html file.

## Build

Clone this repo, run follow command, and generated html will locationed at `dist/index.html`.

```
yarn                # install dependencies
yarn r --generate --config config-example.toml
```

## Develop

Clone this repo, run follow command, it will generate html and reload page realtime when you modify source code. Note this is implemented simply by polling a http path every second, so it will create a lot log under "Network" tag of browser's developer tools.

```
cp config-example.toml config.toml
yarn watch
```
