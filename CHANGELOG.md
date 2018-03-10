# Change Log

All notable changes to this project will be documented in this file.  
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [0.3.0] - 2018-03-10

quotes count: 312

### Changed

- Change command `build` to `make` #16

## [0.2.0] - 2017-10-28

quotes count: 267

### Added

- Add new CLI commands.
  - `match <query>` : Search quotes.
  - `tag <name>` : Retrieve quotes by tag name.
  - `db:refresh --feed feedfile.json` : Refresh database.

### Changed

- Change database structure: remove auto increment primary key, instead use `rowid`.

## [0.1.3] - 2017-07-02

quotes count: 213

## [0.1.2] - 2017-04-12

quotes count: 105

### Added

- Add command line interface. #7
- Add SqlitePromiseDriver #9
- Add a new config "language" #8

### Changed

- Refactoring source codes for using SqlitePromiseDriver. #9

## [0.1.1] - 2017-04-08

quotes count: 60

### Added

- Add npm-scripts. #4
- Add config.json file. #5
- Make test environment. #3
- Add "backup to json file" #2

### Changed

- Modify asynchronous methods based "Promise". #1
- Source codes will use "async await" expression. #6

## 0.1.0 - 2017-04-03

quotes count: 10  
First Release.

[Unreleased]: https://github.com/archco/wise-quotes/compare/v0.3.0...master
[0.3.0]: https://github.com/archco/wise-quotes/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/archco/wise-quotes/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/archco/wise-quotes/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/archco/wise-quotes/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/archco/wise-quotes/compare/v0.1.0...v0.1.1
