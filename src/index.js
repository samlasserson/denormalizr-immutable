import pickBy from 'lodash/pickBy';
import forIn from 'lodash/forIn';
import isObject from 'lodash/isObject';
import { Iterable } from 'immutable';

export function denormalize(object, entities, schema) {

  if (!Iterable.isIterable(entities)) {
    throw new Error('Denormalize accepts an immutable object as its entities.');
  }

  if (!isObject(schema) || Array.isArray(schema)) {
    throw new Error('Denormalize accepts an object for schema.');
  }

  if (['EntitySchema', 'ArraySchema'].indexOf(schema.constructor.name) === -1) {
    throw new Error('Denormalize accepts an EntitySchema or ArraySchema for schema.');
  }

  if (!object) {
    return object;
  }

  if (schema.constructor.name === 'ArraySchema') {
    return denormalizeArray(object, entities, schema);
  }

  return denormalizeEntity(object, entities, schema);
}

function getEntity(id, entities, schema) {

  const entity = entities.getIn([schema.getKey(), `${id}`]);
  return entity && denormalize(entity, entities, schema);
}

function denormalizeArray(object, entities, schema) {

  return object.map(entity =>
    denormalize(entity, entities, schema.getItemSchema())
  );
}

function denormalizeEntity(object, entities, schema) {

  const associations = pickBy(schema, key =>
    ['EntitySchema', 'ArraySchema'].indexOf(key.constructor.name) > -1
  );

  let denormalized = object;
  forIn(associations, (_schema, key) => {

    const isArray = _schema.constructor.name === 'ArraySchema';

    if (isArray) {
      denormalized = denormalized.update(key, ids =>
        ids && ids.map(id => getEntity(id, entities, _schema.getItemSchema()))
      );
    }
    else {
      denormalized = denormalized.update(key, id => getEntity(id, entities, _schema));
    }
  });

  return denormalized;
}
