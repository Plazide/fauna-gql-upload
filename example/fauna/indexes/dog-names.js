// eslint-disable-next-line @typescript-eslint/no-var-requires
const { query } = require('faunadb');

const { Collection } = query;

module.exports = {
  name: 'dog_names',
  unique: false,
  serialized: true,
  source: Collection('Dog'),
  terms: [
    {
      field: ['data', 'name'],
    },
  ],
};
