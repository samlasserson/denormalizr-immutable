# denormalizr-immutable [![build status](https://img.shields.io/travis/dehbmarques/denormalizr-immutable/master.svg)](https://travis-ci.org/dehbmarques/denormalizr-immutable)
Denormalizer for [normalizr](https://github.com/gaearon/normalizr) using immutable data.
# Installation
```
npm install --save denormalizr-immutable
```
# Usage
```
import { denormalize } from 'denormalizr-immutable';

const denormalized = denormalize(entity, entities, entitySchema);
```
