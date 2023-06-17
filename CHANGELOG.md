## 1.5.5 (2023-06-17)


### Build System and Dependencies

* update dependencies 7539510

## 1.5.4 (2023-05-12)


### Build System and Dependencies

* bump dependencies + node + yarn 628de8e

## 1.5.3 (2023-04-30)


### Build System and Dependencies

* update dependencies 034f67f

## 1.5.2 (2023-01-09)


### Build System and Dependencies

* update dependencies 19161d4

## 1.5.1 (2023-01-09)


### Build System and Dependencies

* migrate to yarn 3 6b469e8

## 1.5.0 (2022-08-01)


### Features

* moar patternz 8d90650


### Bug Fixes

* importing to center did not work 04c8f9b
* reset checkbox did not work when using manual import ee689dc
* starting game by pressing "s" didn't work anymore b4b0093

## 1.4.0 (2022-07-26)


### Features

* new "misc" folder for other patterns 977e7ed

## 1.3.3 (2022-07-21)


### Build System and Dependencies

* update dependencies 274f004

### 1.3.2 (2022-02-20)

### Build System and Dependencies

- update dependencies 149c79c

### 1.3.1 (2022-02-15)

### Build System and Dependencies

- rename docs folder to public 6cd07ee

## 1.3.0 (2022-02-15)

### Features

- if interval time is zero, use requestAnimationFrame instead bdf32f3

### Bug Fixes

- don't start game after changing interval time if it wasn't running before 9ea4126

### Performance Improvements

- reduce complexity of Cell class by determining neighbors outside (slightly improves performance) 514c939

### Documentation

- typehint ALL the things b887b84

### Build System and Dependencies

- update dependencies e3c3ee5

### Code Refactoring

- convert class methods to arrow functions, remove autoBind b6e10ef

## 1.2.0 (2022-02-12)

### Features

- major performance improvement by using draw paths 89eb0a5

### 1.1.2 (2022-02-04)

### Bug Fixes

- build must happen after version bump, but before release creation to have the correct version everywhere 0ee9c1d

### 1.1.1 (2022-02-04)

### Build System and Dependencies

- build in pipeline instead of locally 14aeb63

## 1.1.0 (2022-02-04)

### Features

- show version on page 8b91da1

## 1.0.0 (2022-02-03)

### Build System and Dependencies

- update dependencies 9f4adf9
