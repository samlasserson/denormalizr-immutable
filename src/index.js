import pickBy from 'lodash/pickBy';
import forIn from 'lodash/forIn';
import isObject from 'lodash/isObject';
import { Iterable } from 'immutable';
import ArraySchema from 'normalizr/lib/IterableSchema';
import EntitySchema from 'normalizr/lib/EntitySchema';

export function denormalize(object, entities, schema) {

  if (!Iterable.isIterable(entities)) {
    throw new Error('Denormalizr-immutable accepts an immutable object as its entities.');
  }

  if (!isObject(schema) || Array.isArray(schema)) {
    throw new Error('Denormalizr-immutable accepts an object for schema.');
  }

  if (!(schema instanceof EntitySchema || schema instanceof ArraySchema)) {
    throw new Error('Denormalizr-immutable accepts an EntitySchema or ArraySchema for schema.');
  }

  if (!object) {
    return object;
  }

  if (schema instanceof ArraySchema) {
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
    key instanceof EntitySchema || key instanceof ArraySchema
  );

  let denormalized = object;
  forIn(associations, (_schema, key) => {

    const isArray = _schema instanceof ArraySchema;

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
